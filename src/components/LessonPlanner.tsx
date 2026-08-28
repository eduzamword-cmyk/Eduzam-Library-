import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Settings, FileText, Printer, Save, CheckCircle2, 
  RefreshCw, Clock, CheckSquare, FolderOpen, 
  Download, ArrowLeft, Lightbulb, LayoutGrid, Eye, X,
  FileCheck, Shield, Award, ChevronLeft, ChevronRight, ArrowRight, ChevronDown, Users, Sparkles
} from 'lucide-react';
import EduzamBotIcon from './EduzamBotIcon';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, onSnapshot, serverTimestamp, query, orderBy, doc } from 'firebase/firestore';
import { 
  generateSynthesizedCDCPlan, 
  getVariantTitle, 
  LessonNature, 
  calculateStageMinutes, 
  autoDetectLessonNature 
} from '../lib/curriculumEngine';

interface LessonPlannerProps {
  onNavigate?: (viewId: string) => void;
}

export default function LessonPlanner({ onNavigate }: LessonPlannerProps) {
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [windowMode, setWindowMode] = useState<'split' | 'canvas' | 'preview'>('split');
  const [docStyle, setDocStyle] = useState<'typed' | 'official'>('typed');
  const [configStep, setConfigStep] = useState<number>(1);
  const [outputPage, setOutputPage] = useState<1 | 2>(1);
  const [selectedVariant, setSelectedVariant] = useState<number>(1);
  const [customFocus, setCustomFocus] = useState<string>('');

  // Initializing Personal & Basic Details with active session values
  const [config, setConfig] = useState(() => {
    const initialSubject = 'Mathematics';
    const initialNature: LessonNature = autoDetectLessonNature(initialSubject, '');
    return {
      schoolName: localStorage.getItem('user_institution') || '',
      teacherName: localStorage.getItem('user_full_name') || localStorage.getItem('user_name') || '',
      date: new Date().toISOString().split('T')[0],
      time: '08:00 - 09:20',
      enrolmentBoys: '',
      enrolmentGirls: '',
      attendanceBoys: '',
      attendanceGirls: '',
      level: 'Grade 10 / Form 3',
      subject: initialSubject,
      duration: '80',
      lessonNature: initialNature,
      // Curriculum foundation
      topic: '',
      subTopic: '',
      generalCompetences: '',
      specificCompetences: '',
      rationale: '',
      priorKnowledge: '',
      references: '',
      learningEnvironment: '',
      resources: '',
      expectedStandards: '',
      homework: '',
      lessonEvaluation: ''
    };
  });

  // Stages of Lesson Progression
  const [stages, setStages] = useState(() => {
    const defaultMins = calculateStageMinutes('80', 'theory');
    return {
      introMin: defaultMins.introMin,
      introTeacher: '',
      introLearners: '',
      introFormation: '',
      introAssessment: '',

      devMin: defaultMins.devMin,
      devTeacher: '',
      devLearners: '',
      devFormation: '',
      devAssessment: '',

      appMin: defaultMins.appMin,
      appTeacher: '',
      appLearners: '',
      appFormation: '',
      appAssessment: '',

      concMin: defaultMins.concMin,
      concTeacher: '',
      concLearners: '',
      concFormation: '',
      concAssessment: ''
    };
  });

  const [isGeminiExtracting, setIsGeminiExtracting] = useState(false);
  const [extractSuccess, setExtractSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const isPE = /physical education|p\.e\.?|pe/i.test(config.subject);

  // Sync saved plans from Firestore / local storage cache
  useEffect(() => {
    try {
      const cached = localStorage.getItem('eduzam_saved_lesson_plans');
      if (cached) {
        setSavedPlans(JSON.parse(cached));
      }
    } catch (e) {
      console.warn(e);
    }

    const q = query(collection(db, 'lesson_plans'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const plans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSavedPlans(plans);
      try {
        localStorage.setItem('eduzam_saved_lesson_plans', JSON.stringify(plans));
      } catch (e) {
        console.warn(e);
      }
    }, (error) => {
      console.warn('Lesson plans database notice:', error?.message);
    });
    return () => unsubscribe();
  }, []);

  // Sync active user credentials
  useEffect(() => {
    const isGuest = !localStorage.getItem('user_role');
    if (isGuest) {
      setConfig(prev => ({
        ...prev,
        schoolName: localStorage.getItem('user_institution') || '',
        teacherName: localStorage.getItem('user_full_name') || localStorage.getItem('user_name') || ''
      }));
      return;
    }

    const storedInst = localStorage.getItem('user_institution');
    const storedName = localStorage.getItem('user_full_name') || localStorage.getItem('user_name');
    
    if (storedInst || storedName) {
      setConfig(prev => ({
        ...prev,
        schoolName: storedInst || prev.schoolName || '',
        teacherName: storedName || prev.teacherName || ''
      }));
    }

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const profileId = user.uid;
        const profileRef = doc(db, 'user_profiles', profileId);
        const unsubProfile = onSnapshot(profileRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            setConfig(prev => ({
              ...prev,
              schoolName: data.institution || prev.schoolName || '',
              teacherName: data.fullName || prev.teacherName || ''
            }));
          }
        }, (err) => {
          console.warn('LessonPlanner profile sync notice:', err);
        });
        return () => unsubProfile();
      }
    });

    return () => unsubscribe();
  }, []);

  // Check for imported resource from Digital Library
  useEffect(() => {
    const imported = localStorage.getItem('eduzam_imported_library_resource');
    if (imported) {
      try {
        const item = JSON.parse(imported);
        setConfig(prev => ({
          ...prev,
          subject: item.subject || prev.subject,
          level: item.level || prev.level,
          topic: item.title || prev.topic,
          references: `${item.publisher || 'MoE CDC'} - ${item.code || item.id}`,
          resources: `${item.fileFormat || 'PDF'} Digital Resource (${item.fileSize || '5 MB'}) - Official MoE Portal`
        }));
        localStorage.removeItem('eduzam_imported_library_resource');
      } catch (e) {
        console.warn(e);
      }
    }
  }, []);

  const handleDurationChange = (newDurationStr: string) => {
    setConfig(prev => {
      const updated = { ...prev, duration: newDurationStr };
      const newMinutes = calculateStageMinutes(newDurationStr, prev.lessonNature || 'theory');
      setStages(prevStages => ({
        ...prevStages,
        introMin: newMinutes.introMin,
        devMin: newMinutes.devMin,
        appMin: newMinutes.appMin,
        concMin: newMinutes.concMin
      }));
      return updated;
    });
  };

  const handleLessonNatureChange = (newNature: LessonNature) => {
    setConfig(prev => {
      const updated = { ...prev, lessonNature: newNature };
      const newMinutes = calculateStageMinutes(prev.duration || '80', newNature);
      setStages(prevStages => ({
        ...prevStages,
        introMin: newMinutes.introMin,
        devMin: newMinutes.devMin,
        appMin: newMinutes.appMin,
        concMin: newMinutes.concMin
      }));
      return updated;
    });
  };

  const handleSubjectChange = (newSubject: string) => {
    const detectedNature = autoDetectLessonNature(newSubject, config.topic);
    setConfig(prev => ({
      ...prev,
      subject: newSubject,
      lessonNature: detectedNature
    }));
    const newMinutes = calculateStageMinutes(config.duration || '80', detectedNature);
    setStages(prevStages => ({
      ...prevStages,
      introMin: newMinutes.introMin,
      devMin: newMinutes.devMin,
      appMin: newMinutes.appMin,
      concMin: newMinutes.concMin
    }));
  };

  const handleAdjustMinutes = (key: 'introMin' | 'devMin' | 'appMin' | 'concMin', delta: number) => {
    setStages(prev => {
      const current = parseInt(prev[key], 10) || 0;
      const next = Math.max(1, current + delta);
      return {
        ...prev,
        [key]: String(next)
      };
    });
  };

  const handleAutoBalanceStages = () => {
    const targetDuration = parseInt(config.duration, 10) || 80;
    const newMinutes = calculateStageMinutes(targetDuration, config.lessonNature || 'theory');
    setStages(prev => ({
      ...prev,
      introMin: newMinutes.introMin,
      devMin: newMinutes.devMin,
      appMin: newMinutes.appMin,
      concMin: newMinutes.concMin
    }));
  };

  const handleLoadSamplePlan = () => {
    handleLoadVariant(1);
  };

  const handleLoadVariant = (variantNum: number) => {
    setSelectedVariant(variantNum);
    const plan = generateSynthesizedCDCPlan(
      config.subject, 
      config.level, 
      config.topic, 
      variantNum, 
      config.duration, 
      config.lessonNature
    );
    
    setConfig(prev => ({
      ...prev,
      topic: plan.topic,
      subTopic: plan.subTopic,
      generalCompetences: plan.generalCompetences,
      specificCompetences: plan.specificCompetences,
      rationale: plan.rationale,
      priorKnowledge: plan.priorKnowledge,
      references: plan.references,
      learningEnvironment: plan.learningEnvironment,
      resources: plan.resources,
      expectedStandards: plan.expectedStandards,
      homework: plan.homework,
      lessonEvaluation: plan.lessonEvaluation
    }));

    setStages({
      introMin: plan.stages.introMin,
      introTeacher: plan.stages.introTeacher,
      introLearners: plan.stages.introLearners,
      introFormation: plan.stages.introFormation,
      introAssessment: plan.stages.introAssessment,

      devMin: plan.stages.devMin,
      devTeacher: plan.stages.devTeacher,
      devLearners: plan.stages.devLearners,
      devFormation: plan.stages.devFormation,
      devAssessment: plan.stages.devAssessment,

      appMin: plan.stages.appMin,
      appTeacher: plan.stages.appTeacher,
      appLearners: plan.stages.appLearners,
      appFormation: plan.stages.appFormation,
      appAssessment: plan.stages.appAssessment,

      concMin: plan.stages.concMin,
      concTeacher: plan.stages.concTeacher,
      concLearners: plan.stages.concLearners,
      concFormation: plan.stages.concFormation,
      concAssessment: plan.stages.concAssessment
    });
  };

  const handleApplySpecifics = () => {
    if (!customFocus.trim()) return;
    
    setConfig(prev => ({
      ...prev,
      rationale: prev.rationale 
        ? `${prev.rationale} | Specific Focus: ${customFocus}`
        : `Lesson Specifics: ${customFocus}. Tailored for ${prev.level} ${prev.subject} on ${prev.topic || 'the selected topic'}.`,
      learningEnvironment: prev.learningEnvironment 
        ? `${prev.learningEnvironment} (${customFocus})`
        : `Classroom setup: ${customFocus}`,
      expectedStandards: prev.expectedStandards
        ? `${prev.expectedStandards} Specific focus: ${customFocus}.`
        : `Specifics: ${customFocus}`
    }));

    setExtractSuccess(true);
    setTimeout(() => setExtractSuccess(false), 3000);
  };

  const handleGeminiExtract = async () => {
    setIsGeminiExtracting(true);
    try {
      const prompt = `You are a curriculum expert connected live to the Republic of Zambia Ministry of Education (MoE) Portal, Curriculum Development Centre (CDC), Examinations Council of Zambia (ECZ), and National e-Library.
Generate an authentic, complete, real-time Competence-Based Curriculum (CBC) and CDC lesson plan for:
Subject: "${config.subject || 'Mathematics'}"
Level/Class: "${config.level || 'Grade 10'}"
Topic: "${config.topic || ''}"
Lesson Duration: ${config.duration || '80'} minutes
Lesson Nature / Delivery Mode: "${config.lessonNature || 'theory'}" (Note: for practical/fieldwork lessons, allocate more time to the practical hands-on application stage).

Output strictly a single valid JSON object (no markdown wrappers, no backticks):
{
  "topic": "Official CDC Topic / Strand",
  "subTopic": "Official CDC Sub-topic",
  "generalCompetences": "Official general competence benchmark according to CDC/CBC framework",
  "specificCompetences": "1. Specific outcome 1\\n2. Specific outcome 2\\n3. Specific outcome 3",
  "rationale": "Educational purpose and civic/economic relevance of this topic in Zambia",
  "priorKnowledge": "Specific prerequisite knowledge mastered by learners",
  "references": "Official MoE CDC Syllabus Code & Zambia National e-Library Ref",
  "resources": "Teaching and learning aids, equipment, textbooks, and digital materials",
  "expectedStandards": "Specific quantifiable performance benchmarks expected from learners",
  "learningEnvironment": "Classroom/lab/field setup and safety arrangement",
  "homework": "Homework tasks and exercise questions from approved textbook",
  "lessonEvaluation": "Teacher pedagogical self-reflection and assessment notes",
  "stages": {
    "introMin": "${calculateStageMinutes(config.duration, config.lessonNature).introMin}",
    "introTeacher": "Teacher introductory activity and diagnostic hook",
    "introLearners": "Learner response and engagement in introductory phase",
    "introFormation": "Classroom/court spatial formation",
    "introAssessment": "Diagnostic questioning and entry assessment check",
    "devMin": "${calculateStageMinutes(config.duration, config.lessonNature).devMin}",
    "devTeacher": "Step-by-step instructional explanation and worked models",
    "devLearners": "Note-taking, guided practice, pair collaboration",
    "devFormation": "Paired clusters or lab teams",
    "devAssessment": "Circulating observation and check of student drafts",
    "appMin": "${calculateStageMinutes(config.duration, config.lessonNature).appMin}",
    "appTeacher": "Setting practice exercises and scaffolding",
    "appLearners": "Independent seatwork and problem-solving",
    "appFormation": "Individual seatwork layout",
    "appAssessment": "Marking learner workbook items against CDC criteria",
    "concMin": "${calculateStageMinutes(config.duration, config.lessonNature).concMin}",
    "concTeacher": "Consolidation of core concepts and exit prompt",
    "concLearners": "Synthesizing main takeaways and completing exit ticket",
    "concFormation": "Whole class plenary wrap-up",
    "concAssessment": "Quick exit ticket question"
  }
}`;

      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, mode: 'curriculum' })
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.text) {
          let text = data.text.trim();
          if (text.startsWith('```')) {
            text = text.replace(/^```(json)?\s*/i, '').replace(/\s*```$/i, '').trim();
          }
          
          try {
            const parsed = JSON.parse(text);
            const calculatedMins = calculateStageMinutes(config.duration || '80', config.lessonNature || 'theory');

            setConfig(prev => ({
              ...prev,
              topic: parsed.topic || prev.topic || 'Core Curriculum Principles',
              subTopic: parsed.subTopic || prev.subTopic || 'Practical Applications & Problem Solving',
              generalCompetences: parsed.generalCompetences || 'Demonstrate mastery of core syllabus competencies.',
              specificCompetences: parsed.specificCompetences || '1. Identify key concepts.\n2. Apply systematic procedures.\n3. Solve contextual problems.',
              rationale: parsed.rationale || 'Essential foundation for national curriculum progression.',
              priorKnowledge: parsed.priorKnowledge || 'Foundational understanding from prerequisite grade units.',
              references: parsed.references || `MoE CDC ${config.subject} Syllabus; National e-Library: ZAM-ELIB-CDC-${Date.now().toString().slice(-4)}.`,
              resources: parsed.resources || 'Prescribed textbooks, charts, instruments, pupil exercise books.',
              expectedStandards: parsed.expectedStandards || 'At least 80% of learners demonstrate accurate mastery.',
              learningEnvironment: parsed.learningEnvironment || 'Well-organized classroom with collaborative seating.',
              homework: parsed.homework || 'Complete review exercises in the approved textbook.',
              lessonEvaluation: parsed.lessonEvaluation || 'Objectives were effectively met with active student participation.'
            }));

            if (parsed.stages) {
              setStages({
                introMin: parsed.stages.introMin || calculatedMins.introMin,
                introTeacher: parsed.stages.introTeacher || 'Introduces the lesson with a real-world problem scenario.',
                introLearners: parsed.stages.introLearners || 'Analyze introductory prompt and formulate hypotheses.',
                introFormation: parsed.stages.introFormation || 'Whole class plenary setting.',
                introAssessment: parsed.stages.introAssessment || 'Oral questioning to assess prior knowledge.',

                devMin: parsed.stages.devMin || calculatedMins.devMin,
                devTeacher: parsed.stages.devTeacher || 'Demonstrates core concepts step-by-step and guides pair practice.',
                devLearners: parsed.stages.devLearners || 'Record notes and complete guided exercises in pairs.',
                devFormation: parsed.stages.devFormation || 'Paired desk pods.',
                devAssessment: parsed.stages.devAssessment || 'Direct observation and spot-checking student worksheets.',

                appMin: parsed.stages.appMin || calculatedMins.appMin,
                appTeacher: parsed.stages.appTeacher || 'Assigns practice tasks and provides individual guidance.',
                appLearners: parsed.stages.appLearners || 'Work independently on exercises in workbooks.',
                appFormation: parsed.stages.appFormation || 'Individual desk seatwork.',
                appAssessment: parsed.stages.appAssessment || 'Marking student solutions.',

                concMin: parsed.stages.concMin || calculatedMins.concMin,
                concTeacher: parsed.stages.concTeacher || 'Summarizes key principles and assigns homework.',
                concLearners: parsed.stages.concLearners || 'Synthesize key takeaways and complete exit ticket.',
                concFormation: parsed.stages.concFormation || 'Whole class plenary wrap-up.',
                concAssessment: parsed.stages.concAssessment || 'Exit ticket check on main objective.'
              });
            }
          } catch {
            const synthesized = generateSynthesizedCDCPlan(config.subject, config.level, config.topic, selectedVariant, config.duration, config.lessonNature);
            setConfig(prev => ({ ...prev, ...synthesized }));
            setStages(synthesized.stages);
          }
        } else {
          const synthesized = generateSynthesizedCDCPlan(config.subject, config.level, config.topic, selectedVariant, config.duration, config.lessonNature);
          setConfig(prev => ({ ...prev, ...synthesized }));
          setStages(synthesized.stages);
        }
      } else {
        const synthesized = generateSynthesizedCDCPlan(config.subject, config.level, config.topic, selectedVariant, config.duration, config.lessonNature);
        setConfig(prev => ({ ...prev, ...synthesized }));
        setStages(synthesized.stages);
      }
    } catch {
      const synthesized = generateSynthesizedCDCPlan(config.subject, config.level, config.topic, selectedVariant, config.duration, config.lessonNature);
      setConfig(prev => ({ ...prev, ...synthesized }));
      setStages(synthesized.stages);
    } finally {
      setIsGeminiExtracting(false);
      setExtractSuccess(true);
      setTimeout(() => setExtractSuccess(false), 3500);
    }
  };

  const handleSaveToCloud = async () => {
    setIsSaving(true);
    const newPlan = {
      id: `plan_${Date.now()}`,
      ...config,
      ...stages,
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'lesson_plans'), {
        ...config,
        ...stages,
        createdAt: serverTimestamp()
      });
      setIsSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.warn('Saving plan fallback:', err);
      setSavedPlans(prev => [newPlan, ...prev]);
      try {
        const cached = localStorage.getItem('eduzam_saved_lesson_plans');
        const list = cached ? JSON.parse(cached) : [];
        localStorage.setItem('eduzam_saved_lesson_plans', JSON.stringify([newPlan, ...list]));
      } catch (e) {
        console.warn(e);
      }
      setIsSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const handleDownload = () => {
    const fontFamily = "'Times New Roman', Times, serif";

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Lesson Plan - ${config.subject || 'Subject'} (${config.date || ''})</title>
  <style>
    @page { 
      size: A4 portrait; 
      margin: 10mm; 
    }
    * { box-sizing: border-box; }
    body { 
      font-family: ${fontFamily}; 
      color: #000; 
      line-height: 1.35; 
      font-size: 7.6pt; 
      margin: 0; 
      padding: 10px; 
      background: #f1f5f9; 
    }
    .a4-page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto 20px auto;
      background: #ffffff;
      padding: 10mm 12mm;
      border: 1px solid #cbd5e1;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
      position: relative;
    }
    .page-break-before {
      page-break-before: always;
      break-before: page;
    }
    .header-title {
      text-align: center;
      font-weight: bold;
      font-size: 10.4pt;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .top-fields {
      font-size: 7.6pt;
      margin-bottom: 10px;
      line-height: 1.5;
    }
    table.grid-table {
      width: 100%;
      table-layout: fixed;
      border-collapse: collapse;
      border: 1px solid #000;
      font-size: 7.2pt;
      word-break: break-word;
      overflow-wrap: break-word;
    }
    table.grid-table td, table.grid-table th {
      border: 1px solid #000;
      padding: 4px 6px;
      vertical-align: top;
      word-break: break-word;
      overflow-wrap: break-word;
    }
    .section-box {
      border: 1px solid #000;
      padding: 6px 8px;
      font-size: 7.6pt;
      background: #ffffff;
      line-height: 1.35;
      word-break: break-word;
    }
    .footer-page {
      text-align: right;
      font-size: 6.5pt;
      color: #64748b;
      margin-top: 10px;
    }

    @media print {
      body { background: #fff; padding: 0; }
      .a4-page { 
        margin: 0; 
        box-shadow: none; 
        border: none; 
        width: 210mm; 
        min-height: 297mm; 
        padding: 10mm 12mm; 
      }
    }
  </style>
</head>
<body>
  <!-- PAGE 1 OF 2 -->
  <div class="a4-page">
    <div class="header-title">MINISTRY OF EDUCATION</div>
    
    <div class="top-fields">
      <div>Name of School: ${config.schoolName ? `<u>${config.schoolName}</u>` : '..........................................................................................'}</div>
      <div style="margin-top: 6px;">
        Teacher's Name: ${config.teacherName ? `<u>${config.teacherName}</u>` : '............................................'}&nbsp;&nbsp;&nbsp;&nbsp;
        Date: ${config.date ? `<u>${config.date}</u>` : '...../...../..........'}&nbsp;&nbsp;&nbsp;&nbsp;
        Time: ${config.time ? `<u>${config.time}</u>` : '...........................'}
      </div>
    </div>

    <table class="grid-table">
      <tr>
        <td style="width: 26%;">
          Total Enrolment:<br/>
          Boys: ${config.enrolmentBoys || ''}
        </td>
        <td style="width: 24%;">
          Girls: ${config.enrolmentGirls || ''}
        </td>
        <td style="width: 20%;">
          Total: ${(Number(config.enrolmentBoys || 0) + Number(config.enrolmentGirls || 0)) || ''}
        </td>
        <td style="width: 30%;">
          Level: ${config.level || 'Form 1'}
        </td>
      </tr>

      <tr>
        <td>
          Total Attendance:<br/>
          Boys: ${config.attendanceBoys || ''}
        </td>
        <td>
          Girls: ${config.attendanceGirls || ''}
        </td>
        <td>
          Total: ${(Number(config.attendanceBoys || 0) + Number(config.attendanceGirls || 0)) || ''}
        </td>
        <td></td>
      </tr>

      <tr>
        <td colspan="3">
          Subject: ${config.subject || ''}
        </td>
        <td>
          Lesson Duration: ${config.duration || 'mins'} mins
        </td>
      </tr>

      <tr>
        <td colspan="4">
          Topic: ${config.topic || ''}
        </td>
      </tr>

      <tr>
        <td colspan="4">
          Sub Topic: ${config.subTopic || ''}
        </td>
      </tr>

      <tr>
        <td colspan="4">
          General Competences: ${config.generalCompetences || ''}
        </td>
      </tr>

      <tr>
        <td colspan="4">
          Specific Competences: ${config.specificCompetences || ''}
        </td>
      </tr>

      <tr>
        <td colspan="4">
          Rationale: ${config.rationale || ''}
        </td>
      </tr>

      <tr>
        <td colspan="4">
          Prior Knowledge: ${config.priorKnowledge || ''}
        </td>
      </tr>

      <tr>
        <td colspan="4">
          References: ${config.references || ''}
        </td>
      </tr>

      <tr>
        <td colspan="4">
          Learning Environment: ${config.learningEnvironment || ''}
        </td>
      </tr>

      <tr>
        <td colspan="4">
          Teaching and Learning Materials/Resources: ${config.resources || ''}
        </td>
      </tr>

      <tr>
        <td colspan="4">
          Expected Standards: ${config.expectedStandards || ''}
        </td>
      </tr>
    </table>

    <div style="border: 1px solid #000; border-top: none; padding: 4px 6px; font-size: 7.2pt;">
      Lesson Progression
    </div>

    <table class="grid-table" style="border-top: none;">
      <tr>
        <td style="width: 20%; font-weight: bold; text-align: center; vertical-align: middle;">Stage / Mins</td>
        <td style="width: 28%; font-weight: bold; text-align: left; vertical-align: middle;">Teacher Activity</td>
        <td style="width: 28%; font-weight: bold; text-align: left; vertical-align: middle;">Learners Activity</td>
        <td style="width: 24%; font-weight: bold; text-align: left; vertical-align: middle;">Assessment</td>
      </tr>

      <tr>
        <td style="min-height: 45px;">
          Introduction<br/><br/>
          ${stages.introMin || ''} mins
        </td>
        <td>${stages.introTeacher || ''}</td>
        <td>${stages.introLearners || ''}</td>
        <td>${stages.introAssessment || ''}</td>
      </tr>

      <tr>
        <td style="min-height: 70px;">
          Lesson<br/><br/>
          Development<br/><br/>
          ${stages.devMin || ''} mins
        </td>
        <td>${stages.devTeacher || ''}</td>
        <td>${stages.devLearners || ''}</td>
        <td>${stages.devAssessment || ''}</td>
      </tr>
    </table>

    <div class="footer-page">Page 1 of 2</div>
  </div>

  <!-- PAGE 2 OF 2 -->
  <div class="a4-page page-break-before">
    <table class="grid-table">
      <tr>
        <td style="width: 20%; min-height: 80px;">
          Exercise /<br/>
          Application<br/><br/><br/>
          ${stages.appMin || ''} mins:
        </td>
        <td style="width: 28%;">${stages.appTeacher || ''}</td>
        <td style="width: 28%;">${stages.appLearners || ''}</td>
        <td style="width: 24%;">${stages.appAssessment || ''}</td>
      </tr>

      <tr>
        <td style="width: 20%; min-height: 80px;">
          Conclusion<br/><br/><br/>
          ${stages.concMin || ''} Mins:
        </td>
        <td style="width: 28%;">${stages.concTeacher || ''}</td>
        <td style="width: 28%;">${stages.concLearners || ''}</td>
        <td style="width: 24%;">${stages.concAssessment || ''}</td>
      </tr>
    </table>

    <div class="section-box" style="margin-top: 12px; min-height: 70px;">
      <strong>Homework:</strong>
      <div style="margin-top: 3px; white-space: pre-wrap;">${config.homework || ''}</div>
    </div>

    <div class="section-box" style="margin-top: 12px; min-height: 85px;">
      <strong>Lesson Evaluation:</strong>
      <div style="margin-top: 3px; white-space: pre-wrap;">${config.lessonEvaluation || ''}</div>
    </div>

    <div style="margin-top: 18px; font-size: 7.6pt;">
      <div style="font-weight: bold; margin-bottom: 6px;">Head of Department Signing Space:</div>
      <div>
        Signature: ............................................ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date: ...../...../..........
      </div>
    </div>

    <div class="footer-page" style="margin-top: 18px;">Page 2 of 2</div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = url;
    downloadAnchor.download = `lesson_plan_${config.subject ? config.subject.toLowerCase().replace(/\s+/g, '_') : 'official'}_A4_${config.date || 'doc'}.html`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    URL.revokeObjectURL(url);
  };

  const handleLoadPlan = (plan: any) => {
    setConfig({
      schoolName: plan.schoolName || config.schoolName,
      teacherName: plan.teacherName || config.teacherName,
      date: plan.date || config.date,
      time: plan.time || config.time,
      enrolmentBoys: plan.enrolmentBoys || config.enrolmentBoys,
      enrolmentGirls: plan.enrolmentGirls || config.enrolmentGirls,
      attendanceBoys: plan.attendanceBoys || config.attendanceBoys,
      attendanceGirls: plan.attendanceGirls || config.attendanceGirls,
      level: plan.level || config.level,
      subject: plan.subject || config.subject,
      duration: plan.duration || config.duration,
      lessonNature: plan.lessonNature || autoDetectLessonNature(plan.subject || config.subject, plan.topic || ''),
      topic: plan.topic || '',
      subTopic: plan.subTopic || '',
      generalCompetences: plan.generalCompetences || '',
      specificCompetences: plan.specificCompetences || '',
      rationale: plan.rationale || '',
      priorKnowledge: plan.priorKnowledge || '',
      references: plan.references || '',
      learningEnvironment: plan.learningEnvironment || '',
      resources: plan.resources || '',
      expectedStandards: plan.expectedStandards || '',
      homework: plan.homework || '',
      lessonEvaluation: plan.lessonEvaluation || '',
    });
    setStages({
      introMin: plan.introMin || stages.introMin,
      introTeacher: plan.introTeacher || '',
      introLearners: plan.introLearners || '',
      introFormation: plan.introFormation || '',
      introAssessment: plan.introAssessment || '',
      devMin: plan.devMin || stages.devMin,
      devTeacher: plan.devTeacher || '',
      devLearners: plan.devLearners || '',
      devFormation: plan.devFormation || '',
      devAssessment: plan.devAssessment || '',
      appMin: plan.appMin || stages.appMin,
      appTeacher: plan.appTeacher || '',
      appLearners: plan.appLearners || '',
      appFormation: plan.appFormation || '',
      appAssessment: plan.appAssessment || '',
      concMin: plan.concMin || stages.concMin,
      concTeacher: plan.concTeacher || '',
      concLearners: plan.concLearners || '',
      concFormation: plan.concFormation || '',
      concAssessment: plan.concAssessment || '',
    });
    setShowPlansModal(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full min-h-screen pt-1 px-1 sm:px-3 space-y-2 pb-24 bg-slate-200 text-slate-900 font-google-sans">
      
      {/* CSS style rule enforcing physical A4 portrait layout (210 x 297 mm) */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0mm;
          }
          html, body {
            width: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }
          body * {
            visibility: hidden;
          }
          #print-a4-sheet, #print-a4-sheet * {
            visibility: visible;
          }
          #print-a4-sheet {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
          }
          .a4-print-page {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 10mm 12mm !important;
            width: 210mm !important;
            min-height: 297mm !important;
            page-break-after: always;
            break-after: page;
          }
        }
      `}</style>

      {/* HEADER & WINDOW MODE WORKSPACE CONTROLLER (COMPACT & STREAMLINED AT VERY TOP EDGE) */}
      <header className="w-full bg-slate-200/95 backdrop-blur-xs px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-[8px] border border-slate-300/80 shadow-2xs text-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Left: Navigation */}
          <div className="flex items-center gap-2">
            {onNavigate && (
              <button
                onClick={() => onNavigate(localStorage.getItem('user_role') ? 'dashboard' : 'front')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-[8px] text-sm font-bold transition-all active:scale-95 cursor-pointer"
                title={localStorage.getItem('user_role') ? 'Back to Dashboard' : 'Back to Cover'}
              >
                <ArrowLeft className="w-3.5 h-3.5 text-indigo-600" />
                <span>{localStorage.getItem('user_role') ? 'Dashboard' : 'Cover'}</span>
              </button>
            )}
            {!localStorage.getItem('user_role') && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 text-indigo-700 border border-indigo-300/40 rounded-[8px] text-[11px] font-black uppercase tracking-wider shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                Guest Educator
              </span>
            )}
          </div>

          {/* Right: View Modes, Style & Action Controls */}
          <div className="flex flex-wrap items-center gap-1.5">
            {/* View Mode Segmented Switcher */}
            <div className="flex bg-slate-100 p-0.5 rounded-[8px] border border-slate-200 items-center gap-0.5">
              <button
                onClick={() => setWindowMode('split')}
                className={`px-2.5 py-1 rounded-[8px] text-sm font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  windowMode === 'split' 
                    ? 'bg-white text-indigo-700 shadow-2xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Studio View: Form Editor + A4 Sheet Preview"
              >
                <LayoutGrid className="w-3 h-3" />
                <span>Studio Window</span>
              </button>
              <button
                onClick={() => setWindowMode('canvas')}
                className={`px-2.5 py-1 rounded-[8px] text-sm font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  windowMode === 'canvas' 
                    ? 'bg-white text-indigo-700 shadow-2xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="A4 Canvas: Direct Sheet Editing"
              >
                <FileText className="w-3 h-3" />
                <span>Canvas Window</span>
              </button>
              <button
                onClick={() => setWindowMode('preview')}
                className={`px-2.5 py-1 rounded-[8px] text-sm font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  windowMode === 'preview' 
                    ? 'bg-white text-indigo-700 shadow-2xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Print Preview Window"
              >
                <Eye className="w-3 h-3" />
                <span>Print Window</span>
              </button>
            </div>

            {/* Quick Actions */}
            {onNavigate && (
              <button
                onClick={() => onNavigate('curriculum')}
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-sm rounded-[8px] transition-all flex items-center gap-1 border border-emerald-200 cursor-pointer"
                title="Open Digital Library"
              >
                <BookOpen className="w-3 h-3" />
                <span className="hidden lg:inline">Library</span>
              </button>
            )}

            <button
              onClick={handleLoadSamplePlan}
              className="hidden px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-sm rounded-lg transition-all items-center gap-1 cursor-pointer"
              title="Load Sample Lesson Plan"
            >
              <Lightbulb className="w-3 h-3" />
              <span>Sample</span>
            </button>

            <button
              onClick={() => setShowPlansModal(true)}
              className="hidden px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-lg border border-slate-200 transition-all items-center gap-1 cursor-pointer"
              title="View Archived Plans"
            >
              <FolderOpen className="w-3 h-3 text-indigo-500" />
              <span>Archive ({savedPlans.length})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Feedbacks / Alerts */}
      {extractSuccess && (
        <div className="w-full p-4 bg-blue-50 border border-blue-200 text-blue-950 rounded-[8px] text-sm font-bold flex items-center gap-2.5 shadow-2xs">
          <RefreshCw className="w-5 h-5 text-blue-600 shrink-0 animate-spin" /> 
          <span>Lesson plan extractor successfully pre-filled parameters into your A4 portrait lesson sheet!</span>
        </div>
      )}

      {savedSuccess && (
        <div className="w-full p-4 bg-emerald-100 border border-emerald-300 text-emerald-950 rounded-[8px] text-sm font-bold flex items-center gap-2.5 shadow-2xs animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" /> 
          <span>Lesson Plan successfully archived in Cloud Firestore!</span>
        </div>
      )}

      {/* SAVED PLANS ARCHIVE MODAL (A4 PORTRAIT SPECIFIED WINDOW) */}
      {showPlansModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="bg-[#D1CCBD] rounded-[8px] shadow-2xl border-2 border-amber-300/40 w-full max-w-[640px] max-h-[85vh] overflow-hidden flex flex-col text-slate-900"
          >
            <div className="p-6 border-b border-amber-200/80 flex items-center justify-between bg-[#C2BAA6]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-lg text-slate-950">Archived Lesson Plans</h3>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-sm font-bold rounded uppercase border border-amber-200">A4 Portrait Standard</span>
                </div>
                <p className="text-sm text-slate-600">Select any previously stored lesson plan to load into your A4 workspace.</p>
              </div>
              <button 
                onClick={() => setShowPlansModal(false)} 
                className="p-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-[8px] text-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-3 flex-1">
              {savedPlans.length === 0 ? (
                <div className="text-center py-12 text-slate-500 space-y-2">
                  <FolderOpen className="w-10 h-10 text-amber-400 mx-auto" />
                  <p className="text-sm font-medium">No archived lesson plans found in cloud storage yet.</p>
                </div>
              ) : (
                savedPlans.map((plan) => (
                  <div key={plan.id} className="p-4 rounded-[8px] border border-amber-200 hover:border-amber-400 bg-white hover:bg-amber-50/40 transition-all flex items-center justify-between gap-4 shadow-2xs">
                    <div>
                      <span className="text-sm font-black uppercase tracking-wider text-amber-800 block">{plan.subject} • {plan.level}</span>
                      <h4 className="font-bold text-sm text-slate-950 mt-0.5">{plan.topic || 'Untitled Topic'}</h4>
                      <p className="text-sm text-slate-600 mt-1">{plan.schoolName ? `School: ${plan.schoolName} | ` : ''}Teacher: {plan.teacherName}</p>
                    </div>
                    <button
                      onClick={() => handleLoadPlan(plan)}
                      className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-[8px] text-sm font-black uppercase tracking-wider shadow-xs transition-all whitespace-nowrap cursor-pointer"
                    >
                      Load Plan
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* FULL-SCREEN A4 PORTRAIT PREVIEW OVERLAY MODAL */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-[210mm] min-h-[297mm] bg-white rounded-[8px] shadow-2xl p-[10mm] relative text-slate-900 my-auto"
          >
            <div className="absolute top-4 right-4 flex items-center gap-2 no-print">
              <button 
                onClick={handlePrint}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Print A4
              </button>
              <button 
                onClick={handleDownload}
                className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-lg text-sm font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" /> Download HTML
              </button>
              <button 
                onClick={() => setShowPreviewModal(false)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Render A4 Sheet Content */}
            <A4SheetContent config={config} stages={stages} isPE={isPE} />
          </motion.div>
        </div>
      )}

      {/* WINDOW MODE SWITCHING RENDER */}
      {windowMode === 'split' && (
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* COLUMN 1: PAGINATED FORM WORKSPACE EDITOR (60% Desktop) */}
          <div className="lg:col-span-7 bg-[#D1CCBD] rounded-[8px] border border-amber-200/80 p-4 sm:p-6 space-y-5 shadow-lg text-slate-900">
            
            {/* Header & Eduzam extractor */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-300 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-950 flex items-center gap-2">
                  <span>Template Configuration</span>
                </h2>
                <p className="text-sm text-slate-600">Use next-page arrow buttons below to navigate template configuration steps.</p>
              </div>
              
              <button
                onClick={handleGeminiExtract}
                disabled={isGeminiExtracting}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm uppercase tracking-wider rounded-[8px] shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isGeminiExtracting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FolderOpen className="w-4 h-4" />}
                <span>{isGeminiExtracting ? 'Extracting...' : 'Lesson Plan Extractor'}</span>
              </button>
            </div>

            {/* LESSON PLAN SPECIFICS WINDOW */}
            <div className="bg-blue-900 text-white p-3.5 rounded-[8px] shadow-md space-y-3 border border-blue-700">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[8px] bg-white/10 flex items-center justify-center shrink-0">
                  <FolderOpen className="w-4 h-4 text-slate-100" />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-wider text-white">Lesson Plan Specifics</h4>
                  <p className="text-sm text-slate-100/90">
                    Enter the main lesson information and focus areas to match the curriculum and your class needs.
                  </p>
                </div>
              </div>

              {/* Specifics Entry Field */}
              <div className="pt-2 border-t border-blue-800/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="grow">
                  <input
                    type="text"
                    value={customFocus}
                    onChange={(e) => setCustomFocus(e.target.value)}
                    placeholder="Enter lesson specifics (e.g., group work focus, hands-on algebra tiles, remedial support...)"
                    className="w-full px-3 py-2 bg-blue-950/90 border border-blue-700 rounded-[8px] text-sm text-white placeholder-slate-200/60 outline-none focus:ring-2 focus:ring-blue-400/50"
                  />
                </div>
                <button
                  onClick={handleApplySpecifics}
                  className="px-4 py-2 bg-white text-blue-950 hover:bg-blue-50 font-black text-sm uppercase tracking-wider rounded-[8px] shadow-xs transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 shrink-0"
                  title="Apply these specifics to your lesson plan"
                >
                  <CheckSquare className="w-4 h-4 text-blue-600" /> Apply Specifics
                </button>
              </div>
            </div>

            {/* TOP STEP ARROW NAVIGATION BAR */}
            <div className="bg-white p-2 rounded-[8px] border border-slate-300 flex items-center justify-between gap-2 shadow-2xs">
              <button
                onClick={() => setConfigStep(prev => Math.max(1, prev - 1))}
                disabled={configStep === 1}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 rounded-[8px] text-sm font-bold flex items-center gap-1 transition-all cursor-pointer disabled:cursor-not-allowed shrink-0"
              >
                <ChevronLeft className="w-4 h-4 text-blue-600" />
                <span className="hidden sm:inline">Previous Step</span>
              </button>

              <div className="flex items-center gap-1 overflow-x-auto py-0.5 px-1">
                {[
                  { id: 1, name: '1. Basic Details' },
                  { id: 2, name: '2. Foundations' },
                  { id: 3, name: '3. Progression' },
                  { id: 4, name: '4. Reflections' }
                ].map((step) => (
                  <button
                    key={step.id}
                    onClick={() => setConfigStep(step.id)}
                    className={`px-2.5 sm:px-3 py-1 rounded-[8px] text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                      configStep === step.id 
                        ? 'bg-blue-600 text-white shadow-xs' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {step.name}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setConfigStep(prev => Math.min(4, prev + 1))}
                disabled={configStep === 4}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-[8px] text-sm font-bold flex items-center gap-1 transition-all cursor-pointer disabled:cursor-not-allowed shrink-0 shadow-2xs"
              >
                <span className="hidden sm:inline">Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* PAGINATED STEP CONTENT VIEWER */}
            <AnimatePresence mode="wait">
              <motion.div
                key={configStep}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.18 }}
                className="space-y-6 min-h-[380px]"
              >
                {/* STEP 1: PERSONAL & INSTITUTION PROFILE */}
                {configStep === 1 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-300/80 pb-2">
                      <h3 className="text-sm font-black uppercase text-blue-700 tracking-wider flex items-center gap-1.5">
                        <Settings className="w-4 h-4" /> Step 1 of 4: Personal & Institution Profile
                      </h3>
                      <span className="text-sm font-extrabold text-slate-500">Page 1 / 4</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-black uppercase text-slate-950 mb-1.5">Name of Institution / School</label>
                        <input 
                          type="text" 
                          value={config.schoolName}
                          onChange={(e) => setConfig({ ...config, schoolName: e.target.value })}
                          placeholder="Enter school name"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-[8px] text-sm font-bold text-slate-950 outline-none focus:ring-2 focus:ring-indigo-500/30"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-black uppercase text-slate-950 mb-1.5">Teacher's Name / ID</label>
                        <input 
                          type="text" 
                          value={config.teacherName}
                          onChange={(e) => setConfig({ ...config, teacherName: e.target.value })}
                          placeholder="Enter teacher's name"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-[8px] text-sm font-bold text-slate-950 outline-none focus:ring-2 focus:ring-indigo-500/30"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-black uppercase text-slate-950 mb-1.5">Date</label>
                          <input 
                            type="date" 
                            value={config.date}
                            onChange={(e) => setConfig({ ...config, date: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-950 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-black uppercase text-slate-950 mb-1.5">Time Schedule</label>
                          <input 
                            type="text" 
                            value={config.time}
                            onChange={(e) => setConfig({ ...config, time: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-950 outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="block text-sm font-black uppercase text-slate-950 mb-1.5">Subject</label>
                          <input 
                            type="text" 
                            value={config.subject}
                            onChange={(e) => handleSubjectChange(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-950 outline-none focus:ring-2 focus:ring-indigo-500/30"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-black uppercase text-slate-950 mb-1.5">Level</label>
                          <input 
                            type="text" 
                            value={config.level}
                            onChange={(e) => setConfig({ ...config, level: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-950 outline-none focus:ring-2 focus:ring-indigo-500/30"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-sm font-black uppercase text-slate-950">Duration (Mins)</label>
                            <span className="text-[11px] font-extrabold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                              {config.duration || '80'}m
                            </span>
                          </div>
                          <input 
                            type="number" 
                            min="10"
                            max="300"
                            value={config.duration}
                            onChange={(e) => handleDurationChange(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-950 outline-none focus:ring-2 focus:ring-indigo-500/30"
                          />
                        </div>
                      </div>

                      {/* QUICK DURATION PRESETS */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black uppercase text-slate-500">Duration Presets:</span>
                          <span className="text-[11px] font-bold text-slate-400">Auto-calculates stage times</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { label: '40 min', val: '40' },
                            { label: '80 min', val: '80' },
                            { label: '1 hr 40 min', val: '100' }
                          ].map(preset => {
                            const isSelected = String(config.duration) === preset.val;
                            return (
                              <button
                                key={preset.val}
                                type="button"
                                onClick={() => handleDurationChange(preset.val)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                                  isSelected 
                                    ? 'bg-indigo-600 text-white shadow-xs scale-102 ring-2 ring-indigo-600/30'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                                }`}
                              >
                                {preset.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-100 p-3.5 rounded-[8px] border border-slate-300/80 grid grid-cols-4 gap-2">
                      <div>
                        <label className="block text-sm font-black uppercase text-slate-950 mb-1">Enrol Boys</label>
                        <input type="number" value={config.enrolmentBoys} onChange={(e) => setConfig({ ...config, enrolmentBoys: e.target.value })} className="w-full p-2 bg-white border border-slate-300 rounded-[8px] text-sm font-bold" />
                      </div>
                      <div>
                        <label className="block text-sm font-black uppercase text-slate-950 mb-1">Enrol Girls</label>
                        <input type="number" value={config.enrolmentGirls} onChange={(e) => setConfig({ ...config, enrolmentGirls: e.target.value })} className="w-full p-2 bg-white border border-slate-300 rounded-[8px] text-sm font-bold" />
                      </div>
                      <div>
                        <label className="block text-sm font-black uppercase text-slate-950 mb-1">Atten Boys</label>
                        <input type="number" value={config.attendanceBoys} onChange={(e) => setConfig({ ...config, attendanceBoys: e.target.value })} className="w-full p-2 bg-white border border-slate-300 rounded-[8px] text-sm font-bold" />
                      </div>
                      <div>
                        <label className="block text-sm font-black uppercase text-slate-950 mb-1">Atten Girls</label>
                        <input type="number" value={config.attendanceGirls} onChange={(e) => setConfig({ ...config, attendanceGirls: e.target.value })} className="w-full p-2 bg-white border border-slate-300 rounded-[8px] text-sm font-bold" />
                      </div>
                    </div>

                    {/* TOPIC AND SUB TOPIC ENTRY FIELDS IMMEDIATELY FOLLOWING THE ENROLMENT & ATTENDANCE WINDOW */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      <div>
                        <label className="block text-sm font-black uppercase text-slate-950 mb-1.5">Syllabus Topic</label>
                        <input 
                          type="text" 
                          placeholder="Enter strand or topic (e.g., Algebraic Systems)"
                          value={config.topic}
                          onChange={(e) => setConfig({ ...config, topic: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-[8px] text-sm font-medium text-slate-950 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-black uppercase text-slate-950 mb-1.5">Sub Topic</label>
                        <input 
                          type="text" 
                          placeholder="Enter lesson sub-topic"
                          value={config.subTopic}
                          onChange={(e) => setConfig({ ...config, subTopic: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-[8px] text-sm font-medium text-slate-950 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: CURRICULUM FOUNDATIONS */}
                {configStep === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-300/80 pb-2">
                      <h3 className="text-sm font-black uppercase text-blue-700 tracking-wider flex items-center">
                        Step 2 of 4: CDC Curriculum Foundations
                      </h3>
                      <span className="text-sm font-extrabold text-slate-500">Page 2 / 4</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-black uppercase text-slate-950 mb-1.5">General Competences</label>
                        <textarea 
                          rows={2} 
                          placeholder="Define broad outcomes or learning capabilities"
                          value={config.generalCompetences}
                          onChange={(e) => setConfig({ ...config, generalCompetences: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-[8px] text-sm font-medium text-slate-950 outline-none resize-none"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-black uppercase text-slate-950 mb-1.5">Specific Competences (one outcome per line)</label>
                        <textarea 
                          rows={3} 
                          placeholder="1. Compute coefficient factors&#10;2. Plot coordinates on graph"
                          value={config.specificCompetences}
                          onChange={(e) => setConfig({ ...config, specificCompetences: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-[8px] text-sm font-medium text-slate-950 outline-none resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-black uppercase text-slate-950 mb-1.5">Rationale / Lesson Purpose</label>
                        <input 
                          type="text" 
                          placeholder="Why are students learning this?"
                          value={config.rationale}
                          onChange={(e) => setConfig({ ...config, rationale: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-[8px] text-sm font-medium text-slate-950 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-black uppercase text-slate-950 mb-1.5">Prior Knowledge / Assumed Entry</label>
                        <input 
                          type="text" 
                          placeholder="What do they already understand?"
                          value={config.priorKnowledge}
                          onChange={(e) => setConfig({ ...config, priorKnowledge: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-[8px] text-sm font-medium text-slate-950 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-black uppercase text-slate-950 mb-1.5">Teaching References</label>
                        <input 
                          type="text" 
                          placeholder="Syllabus references, textbooks, booklets"
                          value={config.references}
                          onChange={(e) => setConfig({ ...config, references: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-[8px] text-sm font-medium text-slate-950 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-black uppercase text-slate-950 mb-1.5">Resources & Learning Materials</label>
                        <input 
                          type="text" 
                          placeholder="Calculators, whiteboards, markers, counters"
                          value={config.resources}
                          onChange={(e) => setConfig({ ...config, resources: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-[8px] text-sm font-medium text-slate-950 outline-none"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-black uppercase text-slate-950 mb-1.5">Learning Environment & Classroom Setup</label>
                        <input 
                          type="text" 
                          placeholder="Group desks, outdoors space, computer lab arrangement"
                          value={config.learningEnvironment}
                          onChange={(e) => setConfig({ ...config, learningEnvironment: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-[8px] text-sm font-medium text-slate-950 outline-none"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-black uppercase text-slate-700 mb-1.5">Expected Standards</label>
                        <input 
                          type="text" 
                          placeholder="Minimum performance benchmarks expected"
                          value={config.expectedStandards}
                          onChange={(e) => setConfig({ ...config, expectedStandards: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-[8px] text-sm font-medium text-slate-950 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: LESSON PROGRESSION STAGES */}
                {configStep === 3 && (() => {
                  const targetMins = parseInt(config.duration, 10) || 80;
                  const totalAllocatedMins = (parseInt(stages.introMin, 10) || 0) + 
                    (parseInt(stages.devMin, 10) || 0) + 
                    (parseInt(stages.appMin, 10) || 0) + 
                    (parseInt(stages.concMin, 10) || 0);
                  const isBalanced = totalAllocatedMins === targetMins;
                  const diffMins = totalAllocatedMins - targetMins;

                  const introPct = Math.min(100, Math.round(((parseInt(stages.introMin, 10) || 0) / Math.max(1, totalAllocatedMins)) * 100));
                  const devPct = Math.min(100, Math.round(((parseInt(stages.devMin, 10) || 0) / Math.max(1, totalAllocatedMins)) * 100));
                  const appPct = Math.min(100, Math.round(((parseInt(stages.appMin, 10) || 0) / Math.max(1, totalAllocatedMins)) * 100));
                  const concPct = Math.min(100, Math.max(0, 100 - introPct - devPct - appPct));

                  const isPracticalMode = config.lessonNature === 'practical' || config.lessonNature === 'fieldwork';

                  return (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between border-b border-slate-300/80 pb-2 gap-2">
                        <div>
                          <h3 className="text-sm font-black uppercase text-blue-700 tracking-wider flex items-center gap-1.5">
                            <Clock className="w-4 h-4" /> Step 3 of 4: Progression Stages Matrix
                          </h3>
                          <p className="text-xs text-slate-500 font-medium">
                            Adjust stage minutes manually or award time based on lesson nature.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                            {isPE ? '5-Column PE Matrix' : '4-Column Standard Matrix'}
                          </span>
                          <span className={`text-xs font-black px-2.5 py-1 rounded-md border ${
                            config.lessonNature === 'practical' 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                              : config.lessonNature === 'fieldwork'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                          }`}>
                            {config.lessonNature === 'practical' ? '🧪 Practical / Lab Mode' : config.lessonNature === 'fieldwork' ? '🏃 PE / Fieldwork Mode' : config.lessonNature === 'revision' ? '📝 Revision Mode' : '🎓 Theory Mode'}
                          </span>
                        </div>
                      </div>

                      {/* LIVE STAGE TIME ALLOCATOR & BALANCE GAUGE */}
                      <div className="bg-slate-50 border border-slate-300 rounded-xl p-3.5 space-y-2.5 shadow-2xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-black uppercase text-slate-700">
                              Total Lesson Time: <strong className="text-indigo-900 text-sm">{targetMins} mins</strong>
                            </span>
                            <span className="text-slate-300">|</span>
                            <span className="text-xs font-black uppercase text-slate-700">
                              Stage Allocation Sum: <strong className={`text-sm ${isBalanced ? 'text-emerald-700' : 'text-amber-700'}`}>{totalAllocatedMins} mins</strong>
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {isBalanced ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-black">
                                ✓ Perfectly Balanced ({totalAllocatedMins}/{targetMins}m)
                              </span>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black border ${
                                  diffMins > 0 ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-rose-100 text-rose-900 border-rose-300'
                                }`}>
                                  ⚠️ {diffMins > 0 ? `Over by ${diffMins}m` : `Under by ${Math.abs(diffMins)}m`}
                                </span>
                                <button
                                  type="button"
                                  onClick={handleAutoBalanceStages}
                                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-black cursor-pointer transition-all shadow-2xs flex items-center gap-1"
                                >
                                  <Sparkles className="w-3 h-3" />
                                  Auto-Balance to {targetMins}m
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* VISUAL PROPORTIONAL TIME BAR */}
                        <div className="w-full bg-slate-200 rounded-full h-3 flex overflow-hidden shadow-inner">
                          <div 
                            style={{ width: `${introPct}%` }} 
                            className="bg-violet-500 h-full transition-all" 
                            title={`Intro: ${stages.introMin}m (${introPct}%)`} 
                          />
                          <div 
                            style={{ width: `${devPct}%` }} 
                            className="bg-blue-500 h-full transition-all" 
                            title={`Dev: ${stages.devMin}m (${devPct}%)`} 
                          />
                          <div 
                            style={{ width: `${appPct}%` }} 
                            className="bg-emerald-500 h-full transition-all" 
                            title={`App/Practical: ${stages.appMin}m (${appPct}%)`} 
                          />
                          <div 
                            style={{ width: `${concPct}%` }} 
                            className="bg-amber-500 h-full transition-all" 
                            title={`Conc: ${stages.concMin}m (${concPct}%)`} 
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 px-1">
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-500 inline-block" /> Intro ({stages.introMin}m)</span>
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Dev ({stages.devMin}m)</span>
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> {isPracticalMode ? 'Practical / Lab' : 'App / Seatwork'} ({stages.appMin}m)</span>
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Plenary ({stages.concMin}m)</span>
                        </div>

                        {isPracticalMode && (
                          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 font-bold">
                              <span className="text-base">🧪</span>
                              <span>
                                <strong>Practical Award Active:</strong> Stage 3 (Hands-on Application) awarded <strong>{stages.appMin} mins</strong> ({Math.round(((parseInt(stages.appMin, 10) || 0) / targetMins) * 100)}% of lesson) for student experiments, apparatus assembly, and practical verification.
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        {/* Stage 1: Intro */}
                        <div className="p-4 bg-white rounded-[8px] border border-slate-300 space-y-3">
                          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-2 gap-2">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                              <span className="text-sm font-extrabold text-slate-800">Stage 1: Lesson Introduction</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                              <span className="text-xs font-bold text-slate-500">Mins:</span>
                              <button 
                                type="button" 
                                onClick={() => handleAdjustMinutes('introMin', -5)}
                                className="px-1.5 py-0.5 bg-white hover:bg-slate-200 text-slate-700 rounded text-xs font-black border border-slate-300 cursor-pointer"
                                title="Subtract 5 mins"
                              >-5</button>
                              <button 
                                type="button" 
                                onClick={() => handleAdjustMinutes('introMin', -1)}
                                className="px-1.5 py-0.5 bg-white hover:bg-slate-200 text-slate-700 rounded text-xs font-black border border-slate-300 cursor-pointer"
                                title="Subtract 1 min"
                              >-1</button>
                              <input 
                                type="number" 
                                min="1"
                                max="120"
                                value={stages.introMin} 
                                onChange={(e) => setStages({...stages, introMin: e.target.value})} 
                                className="w-12 p-1 bg-white border border-slate-300 rounded text-center text-sm font-black text-slate-900" 
                              />
                              <button 
                                type="button" 
                                onClick={() => handleAdjustMinutes('introMin', 1)}
                                className="px-1.5 py-0.5 bg-white hover:bg-slate-200 text-slate-700 rounded text-xs font-black border border-slate-300 cursor-pointer"
                                title="Add 1 min"
                              >+1</button>
                              <button 
                                type="button" 
                                onClick={() => handleAdjustMinutes('introMin', 5)}
                                className="px-1.5 py-0.5 bg-white hover:bg-slate-200 text-slate-700 rounded text-xs font-black border border-slate-300 cursor-pointer"
                                title="Add 5 mins"
                              >+5</button>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <label className="block text-sm font-black text-slate-950 uppercase mb-1">Teacher Activity</label>
                              <textarea rows={2} value={stages.introTeacher} onChange={(e) => setStages({...stages, introTeacher: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                            </div>
                            <div>
                              <label className="block text-sm font-black text-slate-950 uppercase mb-1">Learners Activity</label>
                              <textarea rows={2} value={stages.introLearners} onChange={(e) => setStages({...stages, introLearners: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                            </div>
                            {isPE && (
                              <div>
                                <label className="block text-sm font-black text-slate-950 uppercase mb-1">Formation</label>
                                <input type="text" value={stages.introFormation} onChange={(e) => setStages({...stages, introFormation: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                              </div>
                            )}
                            <div>
                              <label className="block text-sm font-black text-slate-950 uppercase mb-1">Assessment Outcome</label>
                              <textarea rows={2} value={stages.introAssessment} onChange={(e) => setStages({...stages, introAssessment: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                            </div>
                          </div>
                        </div>

                        {/* Stage 2: Dev */}
                        <div className="p-4 bg-white rounded-[8px] border border-slate-300 space-y-3">
                          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-2 gap-2">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                              <span className="text-sm font-extrabold text-slate-800">Stage 2: Lesson Development</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                              <span className="text-xs font-bold text-slate-500">Mins:</span>
                              <button 
                                type="button" 
                                onClick={() => handleAdjustMinutes('devMin', -5)}
                                className="px-1.5 py-0.5 bg-white hover:bg-slate-200 text-slate-700 rounded text-xs font-black border border-slate-300 cursor-pointer"
                              >-5</button>
                              <button 
                                type="button" 
                                onClick={() => handleAdjustMinutes('devMin', -1)}
                                className="px-1.5 py-0.5 bg-white hover:bg-slate-200 text-slate-700 rounded text-xs font-black border border-slate-300 cursor-pointer"
                              >-1</button>
                              <input 
                                type="number" 
                                min="1"
                                max="180"
                                value={stages.devMin} 
                                onChange={(e) => setStages({...stages, devMin: e.target.value})} 
                                className="w-12 p-1 bg-white border border-slate-300 rounded text-center text-sm font-black text-slate-900" 
                              />
                              <button 
                                type="button" 
                                onClick={() => handleAdjustMinutes('devMin', 1)}
                                className="px-1.5 py-0.5 bg-white hover:bg-slate-200 text-slate-700 rounded text-xs font-black border border-slate-300 cursor-pointer"
                              >+1</button>
                              <button 
                                type="button" 
                                onClick={() => handleAdjustMinutes('devMin', 5)}
                                className="px-1.5 py-0.5 bg-white hover:bg-slate-200 text-slate-700 rounded text-xs font-black border border-slate-300 cursor-pointer"
                              >+5</button>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <label className="block text-sm font-black text-slate-950 uppercase mb-1">Teacher Activity</label>
                              <textarea rows={2} value={stages.devTeacher} onChange={(e) => setStages({...stages, devTeacher: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                            </div>
                            <div>
                              <label className="block text-sm font-black text-slate-950 uppercase mb-1">Learners Activity</label>
                              <textarea rows={2} value={stages.devLearners} onChange={(e) => setStages({...stages, devLearners: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                            </div>
                            {isPE && (
                              <div>
                                <label className="block text-sm font-black text-slate-950 uppercase mb-1">Formation</label>
                                <input type="text" value={stages.devFormation} onChange={(e) => setStages({...stages, devFormation: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                              </div>
                            )}
                            <div>
                              <label className="block text-sm font-black text-slate-950 uppercase mb-1">Assessment Outcome</label>
                              <textarea rows={2} value={stages.devAssessment} onChange={(e) => setStages({...stages, devAssessment: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                            </div>
                          </div>
                        </div>

                        {/* Stage 3: App / Practical */}
                        <div className={`p-4 bg-white rounded-[8px] border space-y-3 ${
                          isPracticalMode ? 'border-emerald-400 ring-2 ring-emerald-500/10' : 'border-slate-300'
                        }`}>
                          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-2 gap-2">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                              <span className="text-sm font-extrabold text-slate-800">
                                {isPracticalMode 
                                  ? 'Stage 3: Hands-on Practical Investigation & Lab Work' 
                                  : 'Stage 3: Application / Seatwork'}
                              </span>
                              {isPracticalMode && (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-black border border-emerald-300">
                                  ⚡ Awarded Extended Time ({stages.appMin}m)
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                              <span className="text-xs font-bold text-slate-500">Mins:</span>
                              <button 
                                type="button" 
                                onClick={() => handleAdjustMinutes('appMin', -5)}
                                className="px-1.5 py-0.5 bg-white hover:bg-slate-200 text-slate-700 rounded text-xs font-black border border-slate-300 cursor-pointer"
                              >-5</button>
                              <button 
                                type="button" 
                                onClick={() => handleAdjustMinutes('appMin', -1)}
                                className="px-1.5 py-0.5 bg-white hover:bg-slate-200 text-slate-700 rounded text-xs font-black border border-slate-300 cursor-pointer"
                              >-1</button>
                              <input 
                                type="number" 
                                min="1"
                                max="240"
                                value={stages.appMin} 
                                onChange={(e) => setStages({...stages, appMin: e.target.value})} 
                                className="w-12 p-1 bg-white border border-slate-300 rounded text-center text-sm font-black text-slate-900" 
                              />
                              <button 
                                type="button" 
                                onClick={() => handleAdjustMinutes('appMin', 1)}
                                className="px-1.5 py-0.5 bg-white hover:bg-slate-200 text-slate-700 rounded text-xs font-black border border-slate-300 cursor-pointer"
                              >+1</button>
                              <button 
                                type="button" 
                                onClick={() => handleAdjustMinutes('appMin', 5)}
                                className="px-1.5 py-0.5 bg-white hover:bg-slate-200 text-slate-700 rounded text-xs font-black border border-slate-300 cursor-pointer"
                              >+5</button>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <label className="block text-sm font-black text-slate-950 uppercase mb-1">Teacher Activity</label>
                              <textarea rows={2} value={stages.appTeacher} onChange={(e) => setStages({...stages, appTeacher: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                            </div>
                            <div>
                              <label className="block text-sm font-black text-slate-950 uppercase mb-1">Learners Activity</label>
                              <textarea rows={2} value={stages.appLearners} onChange={(e) => setStages({...stages, appLearners: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                            </div>
                            {isPE && (
                              <div>
                                <label className="block text-sm font-black text-slate-950 uppercase mb-1">Formation</label>
                                <input type="text" value={stages.appFormation} onChange={(e) => setStages({...stages, appFormation: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                              </div>
                            )}
                            <div>
                              <label className="block text-sm font-black text-slate-950 uppercase mb-1">Assessment Outcome</label>
                              <textarea rows={2} value={stages.appAssessment} onChange={(e) => setStages({...stages, appAssessment: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                            </div>
                          </div>
                        </div>

                        {/* Stage 4: Conc */}
                        <div className="p-4 bg-white rounded-[8px] border border-slate-300 space-y-3">
                          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-2 gap-2">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                              <span className="text-sm font-extrabold text-slate-800">Stage 4: Plenary / Conclusion</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                              <span className="text-xs font-bold text-slate-500">Mins:</span>
                              <button 
                                type="button" 
                                onClick={() => handleAdjustMinutes('concMin', -5)}
                                className="px-1.5 py-0.5 bg-white hover:bg-slate-200 text-slate-700 rounded text-xs font-black border border-slate-300 cursor-pointer"
                              >-5</button>
                              <button 
                                type="button" 
                                onClick={() => handleAdjustMinutes('concMin', -1)}
                                className="px-1.5 py-0.5 bg-white hover:bg-slate-200 text-slate-700 rounded text-xs font-black border border-slate-300 cursor-pointer"
                              >-1</button>
                              <input 
                                type="number" 
                                min="1"
                                max="120"
                                value={stages.concMin} 
                                onChange={(e) => setStages({...stages, concMin: e.target.value})} 
                                className="w-12 p-1 bg-white border border-slate-300 rounded text-center text-sm font-black text-slate-900" 
                              />
                              <button 
                                type="button" 
                                onClick={() => handleAdjustMinutes('concMin', 1)}
                                className="px-1.5 py-0.5 bg-white hover:bg-slate-200 text-slate-700 rounded text-xs font-black border border-slate-300 cursor-pointer"
                              >+1</button>
                              <button 
                                type="button" 
                                onClick={() => handleAdjustMinutes('concMin', 5)}
                                className="px-1.5 py-0.5 bg-white hover:bg-slate-200 text-slate-700 rounded text-xs font-black border border-slate-300 cursor-pointer"
                              >+5</button>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <label className="block text-sm font-black text-slate-950 uppercase mb-1">Teacher Activity</label>
                              <textarea rows={2} value={stages.concTeacher} onChange={(e) => setStages({...stages, concTeacher: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                            </div>
                            <div>
                              <label className="block text-sm font-black text-slate-950 uppercase mb-1">Learners Activity</label>
                              <textarea rows={2} value={stages.concLearners} onChange={(e) => setStages({...stages, concLearners: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                            </div>
                            {isPE && (
                              <div>
                                <label className="block text-sm font-black text-slate-950 uppercase mb-1">Formation</label>
                                <input type="text" value={stages.concFormation} onChange={(e) => setStages({...stages, concFormation: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                              </div>
                            )}
                            <div>
                              <label className="block text-sm font-black text-slate-950 uppercase mb-1">Assessment Outcome</label>
                              <textarea rows={2} value={stages.concAssessment} onChange={(e) => setStages({...stages, concAssessment: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })()}

                {/* STEP 4: REFLECTIONS & HOMEWORK */}
                {configStep === 4 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-300/80 pb-2">
                      <h3 className="text-sm font-black uppercase text-blue-700 tracking-wider flex items-center gap-1.5">
                        <CheckSquare className="w-4 h-4" /> Step 4 of 4: Assessment Reflection & Homework
                      </h3>
                      <span className="text-sm font-extrabold text-slate-500">Page 4 / 4</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-black uppercase text-slate-950 mb-1.5">Homework Assignment Details</label>
                        <textarea 
                          rows={4} 
                          placeholder="Enter homework exercise questions, book pages"
                          value={config.homework}
                          onChange={(e) => setConfig({ ...config, homework: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-[8px] text-sm font-medium text-slate-950 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-black uppercase text-slate-950 mb-1.5">Lesson Evaluation / Self Reflection</label>
                        <textarea 
                          rows={4} 
                          placeholder="Reflect on learner understanding and areas of reinforcement"
                          value={config.lessonEvaluation}
                          onChange={(e) => setConfig({ ...config, lessonEvaluation: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-[8px] text-sm font-medium text-slate-950 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* BOTTOM ARROW NAVIGATION FOOTER BAR */}
            <div className="pt-4 border-t border-slate-300 flex items-center justify-between gap-3">
              <button
                onClick={() => setConfigStep(prev => Math.max(1, prev - 1))}
                disabled={configStep === 1}
                className="px-4 py-2 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-800 border border-slate-300 rounded-[8px] text-sm font-extrabold flex items-center gap-1.5 transition-all cursor-pointer disabled:cursor-not-allowed shadow-2xs"
              >
                <ChevronLeft className="w-4 h-4 text-indigo-600" />
                <span>Previous Page</span>
              </button>

              <div className="flex items-center gap-1 text-sm font-extrabold text-slate-600">
                <span>Step {configStep} of 4</span>
              </div>

              {configStep < 4 ? (
                <button
                  onClick={() => setConfigStep(prev => Math.min(4, prev + 1))}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[8px] text-sm font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <span>Next Page</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setOutputPage(1)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[8px] text-sm font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <span>View Output</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>

          {/* COLUMN 2: REAL-TIME PHYSICAL A4 ALIGNED OUTPUT CANVAS (40% Desktop) */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-5">
            
            {/* Document control toolbar / Lesson Plan Extractor */}
            {configStep === 1 ? (
              <motion.div
                initial={{ y: -60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="bg-blue-950 p-4 rounded-[8px] border-2 border-blue-500 shadow-xl text-white space-y-4"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-900 text-slate-100 shrink-0 border border-blue-700">
                    <EduzamBotIcon className="w-6 h-6 text-slate-100 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-wider text-white">Eduzam lesson plan extractor</h4>
                    <p className="text-xs text-slate-100/90 mt-1 leading-relaxed">
                      Automatically get and organise the CDC syllabus information for your selected subject and grade.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-blue-900/60 flex items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-100/85 font-bold uppercase tracking-wider">Powered by Gemini Portal</span>
                    <span className="text-[9px] text-slate-100/80">Connected to CDC Database</span>
                  </div>
                  <button
                    onClick={handleGeminiExtract}
                    disabled={isGeminiExtracting}
                    className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-[8px] shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 transform active:scale-95"
                  >
                    {isGeminiExtracting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FolderOpen className="w-4 h-4" />}
                    <span>{isGeminiExtracting ? 'Extracting...' : 'Extract Lesson Plan'}</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="bg-[#D1CCBD] p-3 sm:p-4 rounded-[8px] border border-amber-200/80 shadow-lg text-slate-900">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={handlePrint}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm uppercase tracking-wider rounded-[8px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Printer className="w-4 h-4" /> Print A4 Sheet
                  </button>

                  <button
                    onClick={handleDownload}
                    className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm uppercase tracking-wider rounded-[8px] border border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <Download className="w-4 h-4 text-indigo-600" /> Download HTML
                  </button>

                  <button
                    onClick={handleSaveToCloud}
                    disabled={isSaving}
                    className="col-span-1 sm:col-span-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-wider rounded-[8px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" /> {isSaving ? 'Archiving...' : 'Save to Cloud / Archive'}
                  </button>
                </div>
              </div>
            )}

            {/* OUTPUT NEXT-PAGE ARROW NAVIGATION CONTROL */}
            <div className="bg-slate-300/90 p-2.5 rounded-[8px] border border-slate-400 flex items-center justify-between gap-2 shadow-2xs">
              <button
                onClick={() => setOutputPage(1)}
                disabled={outputPage === 1}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-900 border border-slate-300 rounded-[8px] text-sm font-bold flex items-center gap-1 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 text-indigo-600" />
                <span className="hidden sm:inline">Page 1</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setOutputPage(1)}
                  className={`px-3 py-1 rounded-[8px] text-sm font-extrabold transition-all cursor-pointer ${
                    outputPage === 1 ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-800 hover:bg-slate-100 border border-slate-300'
                  }`}
                >
                  Output Page 1
                </button>
                <button
                  onClick={() => setOutputPage(2)}
                  className={`px-3 py-1 rounded-[8px] text-sm font-extrabold transition-all cursor-pointer ${
                    outputPage === 2 ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-800 hover:bg-slate-100 border border-slate-300'
                  }`}
                >
                  Output Page 2
                </button>
              </div>

              <button
                onClick={() => setOutputPage(2)}
                disabled={outputPage === 2}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-900 border border-slate-300 rounded-[8px] text-sm font-bold flex items-center gap-1 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                <span className="hidden sm:inline">Page 2</span>
                <ChevronRight className="w-4 h-4 text-indigo-600" />
              </button>
            </div>

            {/* LIVE PHYSICAL A4 SHEET CANVAS PREVIEW */}
            <div className="overflow-x-auto w-full flex justify-center">
              <div id="print-a4-sheet" className="w-full">
                <A4SheetContent 
                  config={config} 
                  stages={stages} 
                  isPE={isPE} 
                  docStyle={docStyle} 
                  activePage={outputPage} 
                  onPageChange={setOutputPage} 
                />
              </div>
            </div>

          </div>

        </div>
      )}

      {/* WINDOW MODE: INTERACTIVE A4 PORTRAIT SHEET CANVAS (210 x 297 mm) */}
      {windowMode === 'canvas' && (
        <div className="w-full space-y-4">
          <div className="bg-slate-300/90 p-4 rounded-[8px] border border-slate-400 flex flex-wrap items-center justify-between gap-3 text-slate-900 shadow-sm">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="font-extrabold text-sm">Interactive A4 Portrait Page Window</h3>
                <p className="text-sm text-slate-600">Standard Page Scale: 210 × 297 mm (A4 Portrait). Edit parameters directly on sheet.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-[8px] flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Printer className="w-4 h-4" /> Print A4 Page
              </button>
              <button
                onClick={handleDownload}
                className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-sm font-bold rounded-[8px] flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Download className="w-4 h-4 text-indigo-600" /> Export File
              </button>
            </div>
          </div>

          <div className="w-full overflow-x-auto flex justify-center py-4 bg-slate-800/10 rounded-[8px] border border-slate-300/60">
            <div id="print-a4-sheet" className="w-full">
              <A4SheetContent config={config} stages={stages} isPE={isPE} docStyle={docStyle} editable={true} onConfigChange={setConfig} onStagesChange={setStages} />
            </div>
          </div>
        </div>
      )}

      {/* WINDOW MODE: FULL PRINT PREVIEW MODE */}
      {windowMode === 'preview' && (
        <div className="w-full space-y-4">
          <div className="bg-slate-900 text-white p-4 rounded-[8px] flex flex-wrap items-center justify-between gap-3 shadow-md">
            <div>
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <Eye className="w-5 h-5 text-indigo-400" />
                <span>Full A4 Portrait Layout Print Inspection</span>
              </h3>
              <p className="text-sm text-slate-300 mt-0.5">Physical Dimensions: 210 × 297 mm (Margin: 10mm). High-fidelity layout.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm uppercase tracking-wider rounded-[8px] transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Launch System Print
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm uppercase tracking-wider rounded-[8px] transition-all flex items-center gap-1.5 border border-slate-700 cursor-pointer"
              >
                <Download className="w-4 h-4 text-indigo-400" /> Download Document
              </button>
            </div>
          </div>

          <div className="w-full overflow-x-auto flex justify-center py-6 bg-slate-900/10 rounded-[8px] border border-slate-300/80">
            <div id="print-a4-sheet" className="w-full">
              <A4SheetContent config={config} stages={stages} isPE={isPE} docStyle={docStyle} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function CornerCropMarks() {
  return (
    <>
      <div className="absolute top-1.5 left-1.5 w-3.5 h-3.5 border-t-2 border-l-2 border-slate-400 pointer-events-none" />
      <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 border-t-2 border-r-2 border-slate-400 pointer-events-none" />
      <div className="absolute bottom-1.5 left-1.5 w-3.5 h-3.5 border-b-2 border-l-2 border-slate-400 pointer-events-none" />
      <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 border-b-2 border-r-2 border-slate-400 pointer-events-none" />
    </>
  );
}

// REUSABLE A4 PORTRAIT SHEET CONTENT COMPONENT
interface A4SheetContentProps {
  config: any;
  stages: any;
  isPE: boolean;
  docStyle?: 'typed' | 'official';
  editable?: boolean;
  onConfigChange?: (newConfig: any) => void;
  onStagesChange?: (newStages: any) => void;
  activePage?: 1 | 2;
  onPageChange?: (page: 1 | 2) => void;
}

function A4SheetContent({ config, stages, editable = false, onConfigChange, activePage = 1, onPageChange }: A4SheetContentProps) {
  return (
    <div 
      style={{ fontFamily: "'Times New Roman', Times, serif" }} 
      className="space-y-8 text-slate-950 text-[7.6pt] leading-snug w-full max-w-[210mm] mx-auto overflow-x-auto"
    >
      {/* PAGE 1 OF 2 (Rendered if activePage is 1 or when printing) */}
      <div className={`a4-print-page relative bg-white border border-slate-300 shadow-xl p-[7mm] sm:p-[10mm] min-h-[297mm] w-full flex flex-col justify-between box-border overflow-hidden ${
        activePage === 1 ? 'block' : 'hidden print:flex'
      }`}>
        <CornerCropMarks />
        <div className="space-y-2.5 w-full">
          {/* Header */}
          <div className="text-center font-bold text-sm sm:text-sm uppercase tracking-wide">
            MINISTRY OF EDUCATION
          </div>

          {/* Top Info Section with Dotted Underlines */}
          <div className="space-y-1 text-[7.6pt] pt-0.5 w-full">
            <div className="flex items-center gap-1 w-full">
              <span className="font-normal shrink-0">Name of School: </span>
              {editable && onConfigChange ? (
                <input
                  type="text"
                  value={config.schoolName || ''}
                  onChange={(e) => onConfigChange({ ...config, schoolName: e.target.value })}
                  placeholder="Enter school name"
                  className="flex-1 min-w-0 border-b border-dashed border-slate-400 bg-transparent px-1 focus:outline-none font-semibold"
                />
              ) : (
                <span className="font-semibold underline underline-offset-4 decoration-slate-400 flex-1 min-w-0 truncate">
                  {config.schoolName || '..........................................................................................'}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 w-full">
              <div className="flex items-center gap-1 flex-1 min-w-[160px]">
                <span className="font-normal shrink-0">Teacher's Name: </span>
                {editable && onConfigChange ? (
                  <input
                    type="text"
                    value={config.teacherName || ''}
                    onChange={(e) => onConfigChange({ ...config, teacherName: e.target.value })}
                    placeholder="Enter teacher's name"
                    className="flex-1 min-w-0 border-b border-dashed border-slate-400 bg-transparent px-1 focus:outline-none font-semibold"
                  />
                ) : (
                  <span className="font-semibold underline underline-offset-4 decoration-slate-400 flex-1 min-w-0 truncate">
                    {config.teacherName || '............................................'}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <span className="font-normal">Date: </span>
                {editable && onConfigChange ? (
                  <input
                    type="text"
                    value={config.date || ''}
                    onChange={(e) => onConfigChange({ ...config, date: e.target.value })}
                    className="w-24 border-b border-dashed border-slate-400 bg-transparent px-1 focus:outline-none font-semibold text-center"
                  />
                ) : (
                  <span className="font-semibold">{config.date || '...../...../..........'}</span>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <span className="font-normal">Time: </span>
                {editable && onConfigChange ? (
                  <input
                    type="text"
                    value={config.time || ''}
                    onChange={(e) => onConfigChange({ ...config, time: e.target.value })}
                    className="w-20 border-b border-dashed border-slate-400 bg-transparent px-1 focus:outline-none font-semibold text-center"
                  />
                ) : (
                  <span className="font-semibold">{config.time || '...........................'}</span>
                )}
              </div>
            </div>
          </div>

          {/* Main Form Metadata Table Page 1 */}
          <table className="w-full table-fixed border-collapse border border-slate-900 text-[7.2pt] mt-1.5">
            <tbody>
              <tr>
                <td className="border border-slate-900 p-1 sm:p-1.5 w-[26%] align-top break-words">
                  Total Enrolment:<br />
                  Boys: <span className="font-semibold">{config.enrolmentBoys || ''}</span>
                </td>
                <td className="border border-slate-900 p-1 sm:p-1.5 w-[24%] align-top break-words">
                  Girls: <span className="font-semibold">{config.enrolmentGirls || ''}</span>
                </td>
                <td className="border border-slate-900 p-1 sm:p-1.5 w-[20%] align-top break-words">
                  Total: <span className="font-semibold">{(Number(config.enrolmentBoys || 0) + Number(config.enrolmentGirls || 0)) || ''}</span>
                </td>
                <td className="border border-slate-900 p-1 sm:p-1.5 w-[30%] align-top break-words">
                  Level: <span className="font-semibold">{config.level || 'Form 1'}</span>
                </td>
              </tr>

              <tr>
                <td className="border border-slate-900 p-1 sm:p-1.5 align-top break-words">
                  Total Attendance:<br />
                  Boys: <span className="font-semibold">{config.attendanceBoys || ''}</span>
                </td>
                <td className="border border-slate-900 p-1 sm:p-1.5 align-top break-words">
                  Girls: <span className="font-semibold">{config.attendanceGirls || ''}</span>
                </td>
                <td className="border border-slate-900 p-1 sm:p-1.5 align-top break-words">
                  Total: <span className="font-semibold">{(Number(config.attendanceBoys || 0) + Number(config.attendanceGirls || 0)) || ''}</span>
                </td>
                <td className="border border-slate-900 p-1 sm:p-1.5 align-top break-words"></td>
              </tr>

              <tr>
                <td colSpan={3} className="border border-slate-900 p-1 sm:p-1.5 break-words">
                  Subject: <span className="font-semibold">{config.subject || ''}</span>
                </td>
                <td className="border border-slate-900 p-1 sm:p-1.5 break-words">
                  Lesson Duration: <span className="font-semibold">{config.duration || ''}</span> mins
                </td>
              </tr>

              <tr>
                <td colSpan={4} className="border border-slate-900 p-1 sm:p-1.5 break-words">
                  Topic: <span className="font-semibold">{config.topic || ''}</span>
                </td>
              </tr>

              <tr>
                <td colSpan={4} className="border border-slate-900 p-1 sm:p-1.5 break-words">
                  Sub Topic: <span className="font-semibold">{config.subTopic || ''}</span>
                </td>
              </tr>

              <tr>
                <td colSpan={4} className="border border-slate-900 p-1 sm:p-1.5 break-words">
                  General Competences: <span className="font-semibold">{config.generalCompetences || ''}</span>
                </td>
              </tr>

              <tr>
                <td colSpan={4} className="border border-slate-900 p-1 sm:p-1.5 break-words">
                  Specific Competences: <span className="font-semibold">{config.specificCompetences || ''}</span>
                </td>
              </tr>

              <tr>
                <td colSpan={4} className="border border-slate-900 p-1 sm:p-1.5 break-words">
                  Rationale: <span className="font-semibold">{config.rationale || ''}</span>
                </td>
              </tr>

              <tr>
                <td colSpan={4} className="border border-slate-900 p-1 sm:p-1.5 break-words">
                  Prior Knowledge: <span className="font-semibold">{config.priorKnowledge || ''}</span>
                </td>
              </tr>

              <tr>
                <td colSpan={4} className="border border-slate-900 p-1 sm:p-1.5 break-words">
                  References: <span className="font-semibold">{config.references || ''}</span>
                </td>
              </tr>

              <tr>
                <td colSpan={4} className="border border-slate-900 p-1 sm:p-1.5 break-words">
                  Learning Environment: <span className="font-semibold">{config.learningEnvironment || ''}</span>
                </td>
              </tr>

              <tr>
                <td colSpan={4} className="border border-slate-900 p-1 sm:p-1.5 break-words">
                  Teaching and Learning Materials/Resources: <span className="font-semibold">{config.resources || ''}</span>
                </td>
              </tr>

              <tr>
                <td colSpan={4} className="border border-slate-900 p-1 sm:p-1.5 break-words">
                  Expected Standards: <span className="font-semibold">{config.expectedStandards || ''}</span>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="border border-t-0 border-slate-900 p-1 sm:p-1.5 font-normal text-[7.2pt]">
            Lesson Progression
          </div>

          <table className="w-full table-fixed border-collapse border border-t-0 border-slate-900 text-[7.2pt]">
            <tbody>
              <tr>
                <td className="border border-slate-900 p-1 sm:p-1.5 w-[20%] font-semibold text-center align-middle">Stage / Mins</td>
                <td className="border border-slate-900 p-1 sm:p-1.5 w-[28%] font-semibold">Teacher Activity</td>
                <td className="border border-slate-900 p-1 sm:p-1.5 w-[28%] font-semibold">Learners Activity</td>
                <td className="border border-slate-900 p-1 sm:p-1.5 w-[24%] font-semibold">Assessment</td>
              </tr>

              <tr>
                <td className="border border-slate-900 p-1 sm:p-1.5 align-top min-h-[40px] break-words">
                  Introduction<br /><br />
                  <span className="font-semibold">{stages.introMin || ''}</span> mins
                </td>
                <td className="border border-slate-900 p-1 sm:p-1.5 align-top break-words">{stages.introTeacher || ''}</td>
                <td className="border border-slate-900 p-1 sm:p-1.5 align-top break-words">{stages.introLearners || ''}</td>
                <td className="border border-slate-900 p-1 sm:p-1.5 align-top break-words">{stages.introAssessment || ''}</td>
              </tr>

              <tr>
                <td className="border border-slate-900 p-1 sm:p-1.5 align-top min-h-[60px] break-words">
                  Lesson<br /><br />
                  Development<br /><br />
                  <span className="font-semibold">{stages.devMin || ''}</span> mins
                </td>
                <td className="border border-slate-900 p-1 sm:p-1.5 align-top break-words">{stages.devTeacher || ''}</td>
                <td className="border border-slate-900 p-1 sm:p-1.5 align-top break-words">{stages.devLearners || ''}</td>
                <td className="border border-slate-900 p-1 sm:p-1.5 align-top break-words">{stages.devAssessment || ''}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-[6.5pt] text-slate-500 tracking-wide pt-1.5 no-print font-sans">
          <span>Page 1 of 2</span>
          {onPageChange && (
            <button
              onClick={() => onPageChange(2)}
              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
            >
              <span>Next Page (Page 2)</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* PAGE 2 OF 2 (Rendered if activePage is 2 or when printing) */}
      <div className={`a4-print-page relative bg-white border border-slate-300 shadow-xl p-[7mm] sm:p-[10mm] min-h-[297mm] w-full flex flex-col justify-between box-border overflow-hidden ${
        activePage === 2 ? 'block' : 'hidden print:flex'
      }`}>
        <CornerCropMarks />
        <div className="space-y-3 w-full">
          <table className="w-full table-fixed border-collapse border border-slate-900 text-[7.2pt]">
            <tbody>
              <tr>
                <td className="border border-slate-900 p-1 sm:p-1.5 w-[20%] align-top min-h-[70px] break-words">
                  Exercise /<br />
                  Application<br /><br /><br />
                  <span className="font-semibold">{stages.appMin || ''}</span> mins:
                </td>
                <td className="border border-slate-900 p-1 sm:p-1.5 w-[28%] align-top break-words">{stages.appTeacher || ''}</td>
                <td className="border border-slate-900 p-1 sm:p-1.5 w-[28%] align-top break-words">{stages.appLearners || ''}</td>
                <td className="border border-slate-900 p-1 sm:p-1.5 w-[24%] align-top break-words">{stages.appAssessment || ''}</td>
              </tr>

              <tr>
                <td className="border border-slate-900 p-1 sm:p-1.5 w-[20%] align-top min-h-[70px] break-words">
                  Conclusion<br /><br /><br />
                  <span className="font-semibold">{stages.concMin || ''}</span> Mins:
                </td>
                <td className="border border-slate-900 p-1 sm:p-1.5 w-[28%] align-top break-words">{stages.concTeacher || ''}</td>
                <td className="border border-slate-900 p-1 sm:p-1.5 w-[28%] align-top break-words">{stages.concLearners || ''}</td>
                <td className="border border-slate-900 p-1 sm:p-1.5 w-[24%] align-top break-words">{stages.concAssessment || ''}</td>
              </tr>
            </tbody>
          </table>

          {/* Homework Box */}
          <div className="border border-slate-900 p-2 min-h-[65px] text-[7.6pt] break-words">
            <div className="font-bold">Homework:</div>
            <div className="mt-0.5 whitespace-pre-wrap">{config.homework || ''}</div>
          </div>

          {/* Lesson Evaluation Box */}
          <div className="border border-slate-900 p-2 min-h-[80px] text-[7.6pt] break-words">
            <div className="font-bold">Lesson Evaluation:</div>
            <div className="mt-0.5 whitespace-pre-wrap">{config.lessonEvaluation || ''}</div>
          </div>

          {/* Head of Department Signing Space */}
          <div className="pt-2.5 text-[7.6pt] space-y-1.5">
            <div className="font-bold">Head of Department Signing Space:</div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 pt-0.5">
              <div>Signature: ............................................</div>
              <div>Date: ...../...../..........</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[6.5pt] text-slate-500 tracking-wide pt-1.5 no-print font-sans">
          {onPageChange && (
            <button
              onClick={() => onPageChange(1)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg font-bold text-sm flex items-center gap-1 cursor-pointer transition-all"
            >
              <ChevronLeft className="w-3 h-3 text-indigo-600" />
              <span>Previous Page (Page 1)</span>
            </button>
          )}
          <span>Page 2 of 2</span>
        </div>
      </div>
    </div>
  );
}
