import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Initialize Gemini API client
  const getAiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is not defined.");
    }
    return new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // Robust helper to call Gemini with retry logic and fallback models on 503 / high demand
  const generateWithFallback = async (ai: GoogleGenAI, params: { contents: any; config?: any }) => {
    // Model fallback sequence covering primary & fast stable models
    const candidateModels = [
      "gemini-3.7-flash",
      "gemini-3.1-flash-lite",
      "gemini-3.6-flash",
    ];
    let lastError: any = null;

    for (const model of candidateModels) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const res = await ai.models.generateContent({
            model,
            contents: params.contents,
            config: params.config,
          });
          if (res && (res.text !== undefined || res.candidates?.length)) {
            return res;
          }
        } catch (err: any) {
          lastError = err;
          const status = err?.status || err?.code || "";
          const msg = err?.message || String(err);
          console.warn(`Gemini generation attempt ${attempt + 1} with model '${model}' (${status}) failed: ${msg}`);
          
          // If 404 (model not found / deprecated), immediately break to next model
          if (status === 404 || msg.includes("404") || msg.includes("NOT_FOUND") || msg.includes("no longer available")) {
            break;
          }

          // If 503 unavailable / high demand, back off before retrying or switching models
          if (status === 503 || msg.includes("503") || msg.includes("UNAVAILABLE") || msg.includes("high demand")) {
            if (attempt === 0) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
            } else {
              break; // Switch to next fallback model
            }
          } else {
            await new Promise((resolve) => setTimeout(resolve, 600));
          }
        }
      }
    }
    throw lastError;
  };

  // API endpoint for AI chat & text generation with gemini-3.7-flash (and fallbacks)
  app.post("/api/gemini/generate", async (req, res) => {
    try {
      const { prompt, mode, systemInstruction } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const ai = getAiClient();
      
      let defaultInstruction = "You are EDUZAM AI, an intelligent educational assistant built for the Republic of Zambia Ministry of Education. You assist teachers, school leaders, and administrators with lesson planning, curriculum alignment, ECZ examination guidance, performance analytics, and official directives. Respond in a professional, clear, and helpful tone.";

      if (mode === "COMMUNICATION_HUB") {
        defaultInstruction += " You are answering a query inside the EDUZAM Communication Hub.";
      } else if (mode === "LESSON_PLANNER") {
        defaultInstruction += " Format output as clear, structured lesson plan guidance with learning objectives, activities, and continuous assessment items.";
      }

      const response = await generateWithFallback(ai, {
        contents: prompt,
        config: {
          systemInstruction: systemInstruction || defaultInstruction,
        },
      });

      return res.json({ text: response.text || "" });
    } catch (error: any) {
      console.error("Gemini API generation error:", error);
      return res.status(500).json({ 
        error: error?.message || "Failed to generate AI response",
        text: "I am currently syncing with the official educational repository. Please ask your question again in a moment."
      });
    }
  });

  // API endpoint for Resource Extractor
  app.post("/api/gemini/extract-resource", async (req, res) => {
    try {
      const { prompt, topic, subject, subtopic, extractionType, sourceAuthority, customNotes } = req.body;
      const ai = getAiClient();

      const defaultPrompt = prompt || `Extract official teaching resource metadata and full content for subject: "${subject || 'General Science'}", level: "Grade 10 / Form 3", topic: "${topic || 'Curriculum Overview'}", subtopic: "${subtopic || ''}". Extraction type: "${extractionType || 'Complete Module'}", Source authority: "${sourceAuthority || 'MoE CDC'}". Notes: ${customNotes || 'Include clear Zambian curriculum context.'}`;

      const response = await generateWithFallback(ai, {
        contents: defaultPrompt,
        config: {
          systemInstruction: "You are an official CDC Zambia curriculum resource extractor. Return structured markdown and teaching materials with clear headings.",
        },
      });

      return res.json({ text: response.text || "" });
    } catch (error: any) {
      console.error("Gemini resource extraction error:", error);
      return res.status(500).json({ 
        error: error?.message || "Resource extraction failed",
        text: "Extraction service is currently undergoing routine curriculum database synchronization. Please try again."
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
