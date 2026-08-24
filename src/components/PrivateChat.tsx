import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send,
  Image as ImageIcon,
  Search,
  Check,
  CheckCheck,
  Share2,
  ArrowLeft,
  X,
  Trash2,
  Maximize2,
  Mic,
  Reply
} from 'lucide-react';
import { db, auth } from '../lib/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  where,
  serverTimestamp
} from 'firebase/firestore';

export interface PrivateChatProps {
  targetUserId: string;
  onNavigate?: (view: string) => void;
}

interface ChatMessage {
  id: string;
  sender: string;
  senderEmail?: string;
  text?: string;
  imageUrl?: string;
  imageSize?: string;
  stickerBadge?: string;
  replyTo?: string;
  reactions?: Record<string, number>;
  isAi?: boolean;
  status?: 'sent' | 'delivered' | 'read' | 'queued' | 'failed';
  aiThumbs?: 'up' | 'down';
  createdAt?: any;
  time?: string;
  dateStr?: string;
  rawDate?: Date;
  isAudio?: boolean;
  audioDuration?: string;
  audioBase64?: string;
}

interface MentionUser {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  isBot?: boolean;
}

const SYSTEM_PARTICIPANTS: MentionUser[] = [
  { id: 'ai', name: 'EduZAM Assistant', role: 'Ministry Policy & ECZ AI', isBot: true },
  { id: 'admin', name: 'Super Admin', role: 'Permanent Secretary Desk' },
  { id: 'curriculum', name: 'Dr. L. Phiri', role: 'Director CDC Curriculum' },
  { id: 'exams', name: 'Mr. B. Banda', role: 'ECZ Assessment Director' },
  { id: 'licensing', name: 'Mrs. C. Mwansa', role: 'TCZ Registrar' },
  { id: 'standards', name: 'Mr. K. Tembo', role: 'Chief Standards Inspector' }
];

function compressImage(file: File): Promise<{ base64: string; sizeFormatted: string }> {
  return new Promise((resolve, reject) => {
    if (file.size > 3 * 1024 * 1024) {
      alert('Selected image exceeds 3MB limit. Please select an image under 3MB.');
      return reject(new Error('Image exceeds 3MB limit'));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        const maxDim = 800; // Cap dimension for fast mobile chat transfer
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.72);
          const approxBytes = Math.round((compressedBase64.length * 3) / 4);
          const sizeFormatted = `${(approxBytes / 1024).toFixed(1)} KB`;
          resolve({ base64: compressedBase64, sizeFormatted });
        } else {
          resolve({ base64: e.target?.result as string, sizeFormatted: `${(file.size / 1024).toFixed(1)} KB` });
        }
      };
      img.onerror = () => resolve({ base64: e.target?.result as string, sizeFormatted: `${(file.size / 1024).toFixed(1)} KB` });
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function formatDateGroup(date: Date): string {
  const now = new Date();
  const isToday = now.toDateString() === date.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = yesterday.toDateString() === date.toDateString();
  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

export default function PrivateChat({ targetUserId, onNavigate }: PrivateChatProps) {
  const chatId = useMemo(() => {
    return [auth.currentUser?.uid || 'user', targetUserId].sort().join('_');
  }, [targetUserId]);

  const [targetUser, setTargetUser] = useState<{ id: string; name: string; role: string; avatar?: string; isBot?: boolean }>({
    id: targetUserId,
    name: SYSTEM_PARTICIPANTS.find(p => p.id === targetUserId)?.name || 'Colleague',
    role: SYSTEM_PARTICIPANTS.find(p => p.id === targetUserId)?.role || 'Staff Member',
    avatar: SYSTEM_PARTICIPANTS.find(p => p.id === targetUserId)?.avatar,
    isBot: SYSTEM_PARTICIPANTS.find(p => p.id === targetUserId)?.isBot
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ base64: string; size: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Advanced UX States
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [activeActionsMsgId, setActiveActionsMsgId] = useState<string | null>(null);
  const longPressTimerRef = useRef<any>(null);

  // Voice Recording Advanced State
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioTimer, setAudioTimer] = useState<any>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [, setAudioChunks] = useState<Blob[]>([]);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState<string | null>(null);
  const audioPlaybackRef = useRef<HTMLAudioElement | null>(null);

  // AI Generation States
  const [, setIsAiGenerating] = useState(false);
  const [, setAiAbortController] = useState<AbortController | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUserName = auth.currentUser?.displayName || 'Ministry Official';
  const currentUserEmail = auth.currentUser?.email || 'official@moe.gov.zm';

  // Fetch Target User Profile
  useEffect(() => {
    const found = SYSTEM_PARTICIPANTS.find(p => p.id === targetUserId);
    if (found) {
      setTargetUser(found);
    } else {
      const docRef = doc(db, 'user_profiles', targetUserId);
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const name = data.fullName || 'Colleague';
          setTargetUser({
            id: targetUserId,
            name,
            role: data.department || data.role || 'Staff Member',
            avatar: data.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D9488&color=fff`,
            isBot: false
          });
        }
      }, (err) => {
        console.warn('Profile fetch warning:', err);
      });
      return () => unsubscribe();
    }
  }, [targetUserId]);

  // Real-time Firestore Sync for Private Chat
  useEffect(() => {
    const q = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const liveMessages: ChatMessage[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          let formattedTime = '';
          let rawDate = new Date();
          if (data.createdAt?.toDate) {
            rawDate = data.createdAt.toDate();
            formattedTime = rawDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          } else if (typeof data.createdAt === 'string') {
            rawDate = new Date(data.createdAt);
            formattedTime = isNaN(rawDate.getTime()) ? data.createdAt : rawDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          } else {
            formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }
          return {
            id: docSnap.id,
            sender: data.sender || 'Unknown',
            senderEmail: data.senderEmail || '',
            text: data.text || '',
            imageUrl: data.imageUrl || '',
            imageSize: data.imageSize || '',
            stickerBadge: data.stickerBadge || '',
            replyTo: data.replyTo || '',
            reactions: data.reactions || {},
            isAi: Boolean(data.isAi),
            status: data.status || 'delivered',
            aiThumbs: data.aiThumbs,
            time: formattedTime,
            dateStr: formatDateGroup(rawDate),
            rawDate,
            isAudio: Boolean(data.isAudio),
            audioDuration: data.audioDuration || '0:12',
            audioBase64: data.audioBase64 || ''
          };
        });
        setMessages(liveMessages);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      },
      (error) => {
        console.warn('Firestore sync error:', error);
      }
    );
    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputMessage.trim() && !selectedImage && !recordedAudioUrl) || isSending) return;

    const textToSend = inputMessage.trim();
    const imageToSend = selectedImage;
    const audioUrlToSend = recordedAudioUrl;
    const audioDurStr = `0:${audioDuration.toString().padStart(2, '0')}`;
    const replySummary = replyingTo ? (replyingTo.text || replyingTo.sender) : undefined;

    setInputMessage('');
    setSelectedImage(null);
    setRecordedAudioUrl(null);
    setAudioDuration(0);
    setReplyingTo(null);
    setIsSending(true);

    try {
      await addDoc(collection(db, 'messages'), {
        chatId,
        sender: currentUserName,
        senderEmail: currentUserEmail,
        text: textToSend,
        imageUrl: imageToSend?.base64 || '',
        imageSize: imageToSend?.size || '',
        isAudio: Boolean(audioUrlToSend),
        audioDuration: audioUrlToSend ? audioDurStr : '',
        audioBase64: audioUrlToSend || '',
        replyTo: replySummary ? `Replying to: ${replySummary.slice(0, 40)}...` : '',
        isAi: false,
        status: 'delivered',
        createdAt: serverTimestamp()
      });

      if (targetUser.isBot || targetUser.id === 'ai') {
        triggerAiAssistantResponse(textToSend || '[Voice Note Directive]');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const triggerAiAssistantResponse = async (userPrompt: string) => {
    setIsAiGenerating(true);
    const controller = new AbortController();
    setAiAbortController(controller);

    try {
      const cleanPrompt = userPrompt
        .replace(/@assistant/gi, '')
        .replace(/@ai/gi, '')
        .replace(/^\/ai/gi, '')
        .trim();

      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: cleanPrompt,
          mode: 'COMMUNICATION_HUB'
        }),
        signal: controller.signal
      });

      const data = await response.json();
      const aiResponseText = data?.text || 'Official examination, curriculum and teacher licensing databases are currently synchronized.';

      await addDoc(collection(db, 'messages'), {
        chatId,
        sender: 'EduZAM Assistant',
        senderEmail: 'ai-assistant@moe.gov.zm',
        text: aiResponseText,
        isAi: true,
        replyTo: `Prompt: ${userPrompt.slice(0, 60)}...`,
        status: 'delivered',
        createdAt: serverTimestamp()
      });
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        console.info('AI generation aborted.');
      } else {
        console.error('AI generation error:', err);
      }
    } finally {
      setIsAiGenerating(false);
      setAiAbortController(null);
    }
  };

  const startAudioRecording = async () => {
    setAudioChunks([]);
    setAudioDuration(0);
    setIsRecordingAudio(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setRecordedAudioUrl(reader.result as string);
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
    } catch (err) {
      console.warn('Microphone permission fallback active:', err);
    }

    const timer = setInterval(() => {
      setAudioDuration((prev) => prev + 1);
    }, 1000);
    setAudioTimer(timer);
  };

  const stopAudioRecording = () => {
    if (audioTimer) clearInterval(audioTimer);
    setIsRecordingAudio(false);
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    } else {
      setRecordedAudioUrl('data:audio/webm;base64,GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQJChQECgQeBAUoVDIpZODZxZm1mSUOicqoWY2F0dGFsQQ==');
    }
  };

  const cancelAudioRecording = () => {
    if (audioTimer) clearInterval(audioTimer);
    setIsRecordingAudio(false);
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    setAudioDuration(0);
    setRecordedAudioUrl(null);
  };

  const playAudioNote = (id: string, base64Url?: string) => {
    if (!base64Url) return;
    if (audioPlaybackRef.current) {
      audioPlaybackRef.current.pause();
    }
    const audio = new Audio(base64Url);
    audioPlaybackRef.current = audio;
    setIsAudioPlaying(id);
    audio.play().catch(e => console.warn('Audio playback error:', e));
    audio.onended = () => setIsAudioPlaying(null);
  };

  const handleDeleteMessage = async (msgId: string) => {
    try {
      await deleteDoc(doc(db, 'messages', msgId));
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setSelectedImage({ base64: compressed.base64, size: `${(file.size / 1024).toFixed(1)} KB` });
    } catch (err) {
      console.error('Image compression failed:', err);
    }
  };

  const handlePressStart = (msgId: string) => {
    longPressTimerRef.current = setTimeout(() => {
      setActiveActionsMsgId(msgId);
    }, 500);
  };

  const handlePressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
  };

  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    return messages.filter(m => m.text?.toLowerCase().includes(searchQuery.toLowerCase()) || m.sender.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [messages, searchQuery]);

  const groupedMessages = useMemo(() => {
    const groups: { dateStr: string; messages: ChatMessage[] }[] = [];
    filteredMessages.forEach((msg) => {
      const dStr = msg.dateStr || 'Today';
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.dateStr === dStr) {
        lastGroup.messages.push(msg);
      } else {
        groups.push({ dateStr: dStr, messages: [msg] });
      }
    });
    return groups;
  }, [filteredMessages]);

  return (
    <div className="flex flex-col h-full bg-transparent relative overflow-hidden font-google-sans">
      {/* Blended Light Colours Fading from Top Part of Communication Box */}
      <div className="absolute top-0 left-0 right-0 h-52 sm:h-64 pointer-events-none z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-200/40 via-sky-200/50 via-indigo-100/40 via-rose-100/30 via-amber-100/20 to-transparent" />
        <div className="absolute -top-10 left-[5%] w-80 sm:w-96 h-40 bg-gradient-to-br from-orange-300/30 via-sky-300/35 via-cyan-200/25 to-transparent rounded-full blur-3xl" />
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-[420px] sm:w-[540px] h-44 bg-gradient-to-b from-purple-200/30 via-pink-200/25 via-orange-200/25 to-transparent rounded-full blur-3xl" />
        <div className="absolute -top-10 right-[5%] w-80 sm:w-96 h-40 bg-gradient-to-bl from-orange-300/35 via-amber-200/35 via-rose-200/25 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
      </div>

      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate && onNavigate('communication')}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer active:scale-95"
            title="Return to Communication Hub"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div
            onClick={() => onNavigate && onNavigate('profile')}
            className="flex items-center gap-3 cursor-pointer group"
            title="View User Profile"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-md overflow-hidden ring-2 ring-teal-500/30 group-hover:ring-teal-500 transition-all">
                {targetUser.avatar ? (
                  <img src={targetUser.avatar} alt={targetUser.name} className="w-full h-full object-cover" />
                ) : (
                  targetUser.name.charAt(0)
                )}
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors leading-tight">{targetUser.name}</h2>
                {targetUser.isBot && (
                  <span className="px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[9px] font-black uppercase tracking-wider border border-indigo-200">
                    AI Bot
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-tight">{targetUser.role}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all border cursor-pointer active:scale-95 ${
              showSearch ? 'bg-teal-600 text-white border-teal-700' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
            title="Search Conversation"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Search Bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-18 right-6 z-40 flex items-center gap-2 bg-white/95 backdrop-blur-md border border-slate-300 rounded-full px-3 py-1.5 shadow-lg"
          >
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search chat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs w-48 sm:w-64 text-slate-800 placeholder:text-slate-400 font-medium"
              autoFocus
            />
            <button
              onClick={() => {
                setShowSearch(false);
                setSearchQuery('');
              }}
              className="text-slate-400 hover:text-slate-700 text-xs px-1 cursor-pointer font-bold"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>



      {/* Chat Messages Stream with Slide-to-Delete Support */}
      <div
        className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/70 overflow-x-hidden"
        aria-live="polite"
        role="log"
      >
        <div className="w-full max-w-4xl mx-auto space-y-4">
          {groupedMessages.map((group) => (
            <div key={group.dateStr} className="space-y-3">
              <div className="flex justify-center sticky top-2 z-10">
                <span className="px-3 py-0.5 rounded-full bg-slate-200/90 backdrop-blur-xs text-[10px] font-extrabold text-slate-600 uppercase tracking-wider shadow-2xs">
                  {group.dateStr}
                </span>
              </div>

              {group.messages.map((msg) => {
                const isMine = msg.sender === currentUserName || (!msg.isAi && msg.senderEmail === currentUserEmail);
                const isAiMessage = msg.isAi || msg.sender === 'EduZAM Assistant';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} group/msg relative w-full`}
                  >
                    {msg.replyTo && (
                      <div className="text-[10.5px] text-slate-500 bg-slate-200/60 px-3 py-1 rounded-t-lg max-w-md truncate border-l-2 border-teal-600 mb-[-4px] z-0">
                        {msg.replyTo}
                      </div>
                    )}

                    {/* MOTION SLIDE TO DELETE CONTAINER */}
                    <motion.div
                      drag="x"
                      dragConstraints={{ left: -70, right: 100 }}
                      dragElastic={{ left: 0.1, right: 0.25 }}
                      dragSnapToOrigin={true}
                      onDragEnd={(_, info) => {
                        if (info.offset.x > 50 || info.offset.x < -50 || info.velocity.x > 200) {
                          handleDeleteMessage(msg.id);
                        }
                      }}
                      className="relative flex items-center w-fit max-w-xl sm:max-w-2xl cursor-grab active:cursor-grabbing touch-pan-y"
                    >
                      {/* Message Bubble */}
                      <div
                        onClick={() => setActiveActionsMsgId((prev) => (prev === msg.id ? null : msg.id))}
                        onMouseDown={() => handlePressStart(msg.id)}
                        onMouseUp={handlePressEnd}
                        onMouseLeave={handlePressEnd}
                        onTouchStart={() => handlePressStart(msg.id)}
                        onTouchEnd={handlePressEnd}
                        onTouchMove={handlePressEnd}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setActiveActionsMsgId((prev) => (prev === msg.id ? null : msg.id));
                        }}
                        className={`relative z-10 transition-shadow shadow-md overflow-hidden backdrop-blur-xs select-none cursor-pointer w-full ${
                          msg.imageUrl && !msg.text ? 'p-0' : 'px-4 py-3 sm:px-5 sm:py-3.5'
                        } rounded-2xl ${
                          isMine
                            ? 'bg-gradient-to-br from-slate-700 via-slate-700 to-slate-800 text-white rounded-br-xs border border-slate-500/60 ring-1 ring-white/20 shadow-md'
                            : isAiMessage
                            ? 'bg-gradient-to-br from-white via-white to-indigo-50/40 text-slate-900 rounded-bl-xs border border-indigo-200/80 ring-1 ring-indigo-400/30 shadow-sm'
                            : 'bg-gradient-to-br from-white via-white to-teal-50/30 text-slate-900 rounded-bl-xs border border-teal-200/80 ring-1 ring-teal-400/30 shadow-sm'
                        }`}
                      >
                        {/* Image End-to-End Display */}
                        {msg.imageUrl && (
                          <div className="w-full -mx-4 -mt-3 sm:-mx-5 sm:-mt-3.5 mb-2 overflow-hidden rounded-t-2xl cursor-zoom-in group/img relative">
                            <img
                              src={msg.imageUrl}
                              alt="Communication attachment"
                              onClick={() => setActiveLightboxImage(msg.imageUrl || null)}
                              className="w-full max-h-[500px] object-cover transition-transform duration-300 group-hover/img:scale-[1.01]"
                            />
                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white p-1.5 rounded-lg opacity-0 group-hover/img:opacity-100 transition-opacity pointer-events-none">
                              <Maximize2 className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}

                        {/* Professional Voice Message Bar */}
                        {msg.isAudio && (
                          <div className="flex items-center gap-3 py-1.5 px-1 min-w-[220px] sm:min-w-[260px]">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                playAudioNote(msg.id, msg.audioBase64);
                              }}
                              className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-md hover:bg-teal-700 transition-all shrink-0 cursor-pointer active:scale-95"
                              title={isAudioPlaying === msg.id ? 'Pause Voice Note' : 'Play Voice Note'}
                            >
                              {isAudioPlaying === msg.id ? (
                                <div className="w-3 h-3 bg-white rounded-xs" />
                              ) : (
                                <div className="w-0 h-0 border-y-[6px] border-y-transparent border-l-[10px] border-l-white ml-0.5" />
                              )}
                            </button>
                            <div className="flex-1 flex items-center gap-1 h-7">
                              {[35, 75, 40, 95, 60, 85, 45, 100, 50, 70, 30, 90, 55, 80, 40, 65].map((h, i) => (
                                <div
                                  key={i}
                                  className={`flex-1 rounded-full transition-all ${isAudioPlaying === msg.id ? 'bg-teal-400 animate-pulse' : isMine ? 'bg-teal-300/80' : 'bg-teal-500/70'}`}
                                  style={{ height: `${h}%` }}
                                />
                              ))}
                            </div>
                            <span className={`text-xs font-mono font-bold shrink-0 ${isMine ? 'text-teal-200' : 'text-slate-700'}`}>
                              {msg.audioDuration || '0:12'}
                            </span>
                          </div>
                        )}

                        {msg.text && !msg.isAudio && (
                          <div className={`font-google-sans text-[15px] sm:text-[16.5px] font-medium leading-relaxed tracking-normal whitespace-pre-wrap ${msg.imageUrl ? 'mt-1.5' : ''}`}>
                            {msg.text}
                          </div>
                        )}
                      </div>
                    </motion.div>

                    <div className={`mt-1 px-1 flex items-center gap-2 text-[10px] ${isMine ? 'justify-end text-teal-800' : 'justify-start text-slate-500'}`}>
                      <span className="font-medium">{msg.time}</span>
                      {isMine && (
                        <span title="Delivered & Synchronized">
                          <CheckCheck className="w-3.5 h-3.5 text-teal-600" />
                        </span>
                      )}
                    </div>

                    {/* Tap & Hold Action Popover */}
                    <AnimatePresence>
                      {activeActionsMsgId === msg.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: 4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 4 }}
                          className="absolute z-50 mt-2 bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl rounded-xl p-1.5 flex items-center gap-1.5"
                        >
                          <button
                            onClick={() => {
                              setReplyingTo(msg);
                              setActiveActionsMsgId(null);
                            }}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                            title="Reply"
                          >
                            <Reply className="w-4 h-4 text-teal-600" />
                          </button>

                          <button
                            onClick={() => {
                              if (msg.text) navigator.clipboard.writeText(msg.text);
                              setCopiedId(msg.id);
                              setTimeout(() => setCopiedId(null), 2000);
                              setActiveActionsMsgId(null);
                            }}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                            title="Copy Text"
                          >
                            {copiedId === msg.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-blue-600" />}
                          </button>

                          <button
                            onClick={() => {
                              handleDeleteMessage(msg.id);
                              setActiveActionsMsgId(null);
                            }}
                            className="p-2 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                            title="Delete Message"
                          >
                            <Trash2 className="w-4 h-4 text-rose-500" />
                          </button>

                          <button
                            onClick={() => setActiveActionsMsgId(null)}
                            className="p-2 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer ml-1"
                            title="Close"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Original & Powerful Voice Recorder Widget */}
      <AnimatePresence>
        {isRecordingAudio && (
          <motion.div
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 20, height: 0 }}
            className="px-6 py-4 bg-slate-900 border-t border-teal-500/30 flex flex-col gap-3 shrink-0 z-30 shadow-2xl text-white"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping" />
                <span className="text-xs font-extrabold uppercase tracking-widest text-rose-400 font-mono">
                  Recording Voice Directive
                </span>
              </div>
              <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-mono font-bold text-teal-300">
                  0:{audioDuration.toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 h-10 bg-slate-950/60 rounded-xl px-4 border border-slate-800">
              {[40, 80, 50, 100, 70, 90, 40, 85, 60, 95, 45, 75, 90, 50, 80, 100, 60, 85, 40, 70, 90, 55].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-gradient-to-t from-teal-500 to-emerald-400 rounded-full animate-pulse"
                  style={{ height: `${Math.random() * 80 + 20}%`, animationDuration: `${0.3 + (i % 5) * 0.1}s` }}
                />
              ))}
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={cancelAudioRecording}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 border border-slate-700"
              >
                <X className="w-4 h-4" /> Discard
              </button>

              <div className="flex items-center gap-2">
                {recordedAudioUrl && (
                  <button
                    onClick={() => playAudioNote('preview', recordedAudioUrl)}
                    className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-700 text-teal-200 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    ▶ Preview
                  </button>
                )}
                <button
                  onClick={stopAudioRecording}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-teal-600/30 active:scale-95"
                >
                  <Send className="w-4 h-4" /> Save & Send Note
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reply Banner */}
      <AnimatePresence>
        {replyingTo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-700 shrink-0"
          >
            <div className="flex items-center gap-2 truncate">
              <Reply className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="font-bold">Replying to {replyingTo.sender}:</span>
              <span className="truncate text-slate-500">{replyingTo.text || 'Attachment'}</span>
            </div>
            <button onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Image Preview Bar */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-2 bg-teal-50 border-t border-teal-200 flex items-center justify-between gap-3 shrink-0 z-20"
          >
            <div className="flex items-center gap-3">
              <img src={selectedImage.base64} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-teal-300 shadow-xs" />
              <div>
                <p className="text-xs font-bold text-teal-900">Image attached ({selectedImage.size})</p>
                <p className="text-[10px] text-teal-600">Ready to send end-to-end full width</p>
              </div>
            </div>
            <button onClick={() => setSelectedImage(null)} className="p-1.5 rounded-full hover:bg-teal-200 text-teal-800 transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Bottom Input Bar in Calm Red */}
      <div className="relative px-2 py-1.5 sm:px-3 sm:py-2 overflow-hidden border-t border-rose-900/60 shrink-0 z-20 backdrop-blur-2xl bg-gradient-to-r from-slate-950 via-rose-950/80 to-slate-950 shadow-[0_-8px_30px_rgba(23,2,6,0.6)]">
        {/* Calm Red Subtle Ambient Lighting */}
        <div className="absolute inset-0 bg-radial from-rose-600/15 via-transparent to-transparent pointer-events-none" />
        
        {/* Serene Subtle Red Floating Aura */}
        <motion.div
          animate={{
            x: ['-20%', '120%', '-20%'],
            opacity: [0.25, 0.45, 0.25]
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute -top-10 left-0 w-80 h-28 rounded-full bg-rose-500/15 blur-3xl pointer-events-none"
        />

        {/* Refined Sweeping Top Sheen Line */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-rose-400/40 to-transparent pointer-events-none" />

        <form onSubmit={handleSendMessage} className="relative max-w-4xl mx-auto flex items-center gap-1 sm:gap-1.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
          {/* Action Icons Container in Calm Red Glass */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 relative p-0.5 rounded-xl bg-rose-950/60 backdrop-blur-md border border-rose-800/50 shadow-inner">
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-7.5 h-7.5 sm:w-8.5 sm:h-8.5 text-slate-200 hover:text-white bg-rose-900/40 hover:bg-rose-800/60 border border-rose-700/50 rounded-lg sm:rounded-xl transition-all shrink-0 cursor-pointer flex items-center justify-center shadow-xs"
              title="Attach Image"
            >
              <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-200 stroke-[2.2]" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={isRecordingAudio ? stopAudioRecording : startAudioRecording}
              className={`w-7.5 h-7.5 sm:w-8.5 sm:h-8.5 rounded-lg sm:rounded-xl transition-all border shrink-0 cursor-pointer flex items-center justify-center shadow-xs ${
                isRecordingAudio ? 'bg-rose-600 text-white border-rose-500 animate-pulse ring-2 ring-rose-400/80' : 'text-slate-200 hover:text-white bg-rose-900/40 hover:bg-rose-800/60 border-rose-700/50'
              }`}
              title="Voice Recorder"
            >
              <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-200 stroke-[2.2]" />
            </motion.button>
          </div>

          <div className="flex-1 min-w-0">
            <input
              type="text"
              placeholder={`Message ${targetUser.name}...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="w-full px-2.5 sm:px-3.5 h-7.5 sm:h-8.5 bg-slate-900/90 border border-rose-800/60 focus:border-rose-400 rounded-lg sm:rounded-xl font-google-sans text-[13px] sm:text-[14px] text-white focus:outline-none focus:ring-2 focus:ring-rose-500/30 font-medium placeholder:text-slate-400 shadow-2xs"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.93 }}
            type="submit"
            disabled={(!inputMessage.trim() && !selectedImage && !recordedAudioUrl) || isSending}
            className={`px-3 sm:px-3.5 h-7.5 sm:h-8.5 rounded-lg sm:rounded-xl font-bold text-xs flex items-center justify-center gap-1 sm:gap-1.5 transition-all shrink-0 shadow-md ${
              (inputMessage.trim() || selectedImage || recordedAudioUrl) && !isSending
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50 cursor-pointer ring-1 ring-rose-400/50'
                : 'bg-rose-950/40 text-slate-500 border border-rose-900/40 cursor-not-allowed opacity-50 backdrop-blur-sm'
            }`}
            title="Send Message"
          >
            <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
          </motion.button>
        </form>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeLightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveLightboxImage(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          >
            <div className="relative max-w-5xl max-h-[90vh]">
              <img
                src={activeLightboxImage}
                alt="Enlarged view"
                className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10"
              />
              <button
                onClick={() => setActiveLightboxImage(null)}
                className="absolute -top-12 right-0 text-white hover:text-slate-300 p-2 cursor-pointer"
              >
                <X className="w-8 h-8" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
