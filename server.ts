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

  // Helper for generating smart local fallback responses when API quotas are exceeded
  const getSmartFallbackResponse = (prompt: string = '', mode: string = '') => {
    const p = prompt.toLowerCase();
    
    if (p.includes('hello') || p.includes('hi') || p.includes('greeting') || p.length < 15) {
      return "Greetings! I am your EDUZAM Academic Assistant, ready to assist with Zambian Ministry of Education (MoE) curriculum frameworks, ECZ assessment guidelines, lesson plans, and school administration. How may I support you today?";
    }

    if (mode === "LESSON_PLANNER" || p.includes('lesson') || p.includes('plan')) {
      return `**EDUZAM Academic Lesson Plan Guide**\n\n### 1. Learning Objectives\n• Understand the core competencies defined under the Revised Zambian Curriculum Framework (CBC).\n• Apply key subject concepts through interactive learner-centered activities.\n\n### 2. Teaching & Learning Activities\n• **Introduction (10 mins):** Review prior knowledge with guided diagnostic questions.\n• **Main Body (25 mins):** Group discussions and practical problem-solving tasks.\n• **Conclusion (5 mins):** Summary synthesis and exit ticket activity.\n\n### 3. Continuous Assessment (SBA)\n• Evaluate student work against ECZ marking rubrics and outcome benchmarks.`;
    }

    if (p.includes('mark') || p.includes('score') || p.includes('grade') || p.includes('result')) {
      return `**EDUZAM Assessment & Grading Guidance**\n\nUnder the Examination Council of Zambia (ECZ) standards:\n• **Distinction (1-2):** 75% - 100%\n• **Merit (3-4):** 65% - 74%\n• **Credit (5-6):** 50% - 64%\n• **Pass (7-8):** 40% - 49%\n• **Unsatisfactory (9):** Below 40%\n\nEnsure continuous assessment (SBA) marks are recorded in the Official Markbook ledger prior to term-end synchronization.`;
    }

    return `**EDUZAM Ministry Academic Guidance**\n\nRegarding your request on "${prompt.slice(0, 100)}":\n\n• **Curriculum Standard:** Aligned with the Curriculum Development Centre (CDC) syllabus guidelines.\n• **Assessment Standard:** Synchronized with Examination Council of Zambia (ECZ) guidelines.\n• **Administrative Action:** All records, marks, and lesson sheets can be archived directly in your EDUZAM dashboard.`;
  };

  const getResourceExtractionFallback = (subject?: string, topic?: string, extractionType?: string) => {
    return `# CDC Official Curriculum Teaching Resource\n\n**Subject:** ${subject || 'General Studies'}\n**Topic:** ${topic || 'Core Curriculum Overview'}\n**Framework:** Zambia Curriculum Development Centre (CDC) / CBC\n\n---\n\n## 1. Executive Overview & Syllabus Alignment\nThis teaching resource module provides standard curriculum coverage for ${topic || 'the selected subject'}, structured for classroom delivery, lesson planning, and ECZ examination preparation.\n\n## 2. Core Concepts & Subtopics\n- **Concept A:** Foundational principles and terminology.\n- **Concept B:** Practical application and problem-solving examples.\n- **Concept C:** Review questions and continuous assessment guidelines.\n\n## 3. Recommended Classroom Activities\n1. Group investigation and data analysis.\n2. Guided teacher demonstration and Q&A.\n3. Formative assessment exercise mapped to national benchmarks.`;
  };

  // Helper to call Gemini with retry logic, 429/quota handling, and model fallback
  const generateWithFallback = async (ai: GoogleGenAI, params: { contents: any; config?: any }) => {
    // Model fallback sequence covering active Gemini models
    const candidateModels = [
      "gemini-3.6-flash",
      "gemini-3.5-flash-lite",
      "gemini-flash-latest",
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
          // Check if quota error or rate limit
          const isQuota = 
            status === 429 || 
            msg.includes("429") || 
            msg.includes("RESOURCE_EXHAUSTED") || 
            msg.includes("Quota exceeded") || 
            msg.includes("quota");

          if (!isQuota) {
            console.warn(`Gemini generation attempt ${attempt + 1} with model '${model}' (${status}): ${msg}`);
          } else {
            console.info(`Model '${model}' quota limit reached. Fast-switching to next candidate...`);
            break; // Skip retry attempts for quota exhausted model
          }

          // If 404 (model not found / deprecated), immediately break to next fallback model
          if (
            status === 404 || 
            msg.includes("404") || 
            msg.includes("NOT_FOUND") || 
            msg.includes("no longer available")
          ) {
            break;
          }

          // If 503 (temporarily unavailable / high demand), back off briefly before retrying or switching
          if (
            status === 503 || 
            msg.includes("503") || 
            msg.includes("UNAVAILABLE") || 
            msg.includes("high demand")
          ) {
            await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
          } else {
            await new Promise((resolve) => setTimeout(resolve, 300));
          }
        }
      }
    }
    throw lastError;
  };

  // API endpoint for AI chat & text generation with gemini models (and fallbacks)
  app.post("/api/gemini/generate", async (req, res) => {
    const { prompt, mode, systemInstruction, attachment } = req.body;
    try {
      if (!prompt && !attachment) {
        return res.status(400).json({ error: "Prompt or attachment is required" });
      }

      const ai = getAiClient();
      
      let defaultInstruction = "You are EDUZAM AI, an intelligent educational assistant built for the Republic of Zambia Ministry of Education. You assist teachers, school leaders, and administrators with lesson planning, curriculum alignment, ECZ examination guidance, performance analytics, and official directives. Respond naturally, professionally and helpfully to users. Do not generate system reports, telemetry reports, query-analysis reports, synchronization reports, or administrative status reports unless the user specifically asks for them.";

      if (mode === "COMMUNICATION_HUB") {
        defaultInstruction += " You are answering a query inside the EDUZAM Communication Hub.";
      } else if (mode === "LESSON_PLANNER") {
        defaultInstruction += " Format output as clear, structured lesson plan guidance with learning objectives, activities, and continuous assessment items.";
      }

      let finalPrompt = prompt || '';
      if (attachment) {
        finalPrompt = `[System Notification: The user has attached a file to this query. File details: Name: "${attachment.name}", Size: "${attachment.size}", Format/Type: "${attachment.type}". Analyze this file upload context intelligently.]\n\n` + finalPrompt;
      }

      const response = await generateWithFallback(ai, {
        contents: finalPrompt,
        config: {
          systemInstruction: systemInstruction || defaultInstruction,
        },
      });

      return res.json({ text: response.text || "" });
    } catch (error: any) {
      console.warn("Gemini API fallback triggered due to quota or availability:", error?.message || error);
      return res.json({ 
        text: getSmartFallbackResponse(prompt, mode)
      });
    }
  });

  // API endpoint for Resource Extractor
  app.post("/api/gemini/extract-resource", async (req, res) => {
    const { prompt, topic, subject, subtopic, extractionType, sourceAuthority, customNotes } = req.body;
    try {
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
      console.warn("Gemini resource extraction fallback triggered:", error?.message || error);
      return res.json({ 
        text: getResourceExtractionFallback(subject, topic, extractionType)
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
