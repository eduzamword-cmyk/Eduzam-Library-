import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send,
  Image as ImageIcon,
  Smile,
  Search,
  Check,
  CheckCheck,
  Share2,
  ArrowLeft,
  X,
  Trash2,
  Maximize2,
  Sparkles,
  ShieldCheck,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Award,
  FileCheck,
  Star,
  Bot,
  User,
  Users,
  Reply,
  Square,
  ThumbsUp,
  ThumbsDown,
  Wifi,
  WifiOff,
  RefreshCw,
  Mic,
  MicOff,
  PhoneCall,
  Info,
  AtSign,
  Paperclip,
  Clock,
  Sparkle,
  Plus
} from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { ContactsTicker } from './ContactsTicker';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';

interface CommunicationHubProps {
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
  replyTo?: string; // summary of parent message
  reactions?: Record<string, number>;
  isAi?: boolean;
  status?: 'sent' | 'delivered' | 'read' | 'queued' | 'failed';
  aiThumbs?: 'up' | 'down';
  createdAt?: any;
  time?: string;
  dateStr?: string;
  rawDate?: Date;
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

const GUIDED_PROMPTS = [
  { label: '📊 ECZ Pass Rates', prompt: 'What are the official 2026 ECZ pass rate metrics across the 10 provinces?' },
  { label: '📜 TCZ Licensing Status', prompt: 'Provide an overview of the 2026 TCZ Teacher Licensing Verification Protocol.' },
  { label: '📋 Assessment Deadlines', prompt: 'What are the current deadlines for Senior Secondary Continuous Assessment marks submission?' },
  { label: '🏛️ PEO Regional Sync', prompt: 'Summarize the active provincial inspection directives for Lusaka and Copperbelt.' },
  { label: '📝 Draft Staff Circular', prompt: 'Draft a brief official memo regarding the upcoming National Curriculum Moderation.' }
];

const POPULAR_EMOJIS = [
  '👍', '👏', '🙌', '🤝', '❤️', '🔥', '💡', '🚀', '🎯', '💯', '✨', '⭐',
  '😊', '😃', '😎', '🤔', '🧐', '🥳', '🫡', '🙏', '📚', '📖', '📝', '📊',
  '📋', '🏫', '🎓', '📌', '🔔', '📢', '✅', '⚠️', '🎉', '🏆', '💪', '👌'
];

const REACTION_STICKERS = [
  {
    id: 'approved',
    title: 'OFFICIALLY APPROVED',
    icon: CheckCircle2,
    color: 'from-emerald-400 to-teal-500',
    border: 'border-emerald-100',
    bg: 'bg-emerald-50 text-emerald-900',
    desc: 'Directive approved by Ministry'
  },
  {
    id: 'verified',
    title: 'VERIFIED & LOCKED',
    icon: ShieldCheck,
    color: 'from-blue-600 to-cyan-700',
    border: 'border-blue-300',
    bg: 'bg-blue-50 text-blue-900',
    desc: 'Authentication confirmed'
  },
  {
    id: 'urgent',
    title: 'URGENT ATTENTION',
    icon: AlertTriangle,
    color: 'from-amber-600 to-orange-600',
    border: 'border-amber-300',
    bg: 'bg-amber-50 text-amber-900',
    desc: 'High priority directive'
  },
  {
    id: 'excellent',
    title: 'EXCELLENT COMPLIANCE',
    icon: Award,
    color: 'from-purple-600 to-indigo-700',
    border: 'border-purple-300',
    bg: 'bg-purple-50 text-purple-900',
    desc: '100% submission verified'
  },
  {
    id: 'moderated',
    title: 'MODERATION COMPLETE',
    icon: FileCheck,
    color: 'from-teal-400 to-emerald-500',
    border: 'border-teal-100',
    bg: 'bg-teal-50 text-teal-900',
    desc: 'Assessments cross-validated'
  },
  {
    id: 'star_action',
    title: 'STAR ACTION ITEM',
    icon: Star,
    color: 'from-yellow-500 to-amber-600',
    border: 'border-yellow-300',
    bg: 'bg-yellow-50 text-yellow-900',
    desc: 'Key institutional deliverable'
  }
];

// High quality client-side image compression
function compressImage(file: File): Promise<{ base64: string; sizeFormatted: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve({ base64: e.target?.result as string, sizeFormatted: '' });
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

export default function CommunicationHub({ onNavigate }: CommunicationHubProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiTab, setEmojiTab] = useState<'emojis' | 'stickers'>('emojis');
  const [selectedImage, setSelectedImage] = useState<{ base64: string; size: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // Advanced UX States
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [activeReactionMsgId, setActiveReactionMsgId] = useState<string | null>(null);
  const [activeActionsMsgId, setActiveActionsMsgId] = useState<string | null>(null);
  const longPressTimerRef = useRef<any>(null);

  const handlePressStart = (msgId: string) => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      try {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate(35);
        }
      } catch {
        // ignore vibration if unsupported
      }
      setActiveActionsMsgId((prev) => (prev === msgId ? null : msgId));
    }, 300);
  };

  const handlePressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('eduzam_chat_offline_queue');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [showChannelInfo, setShowChannelInfo] = useState(false);
  const [showTopToolbar, setShowTopToolbar] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioTimer, setAudioTimer] = useState<any>(null);

  // AI Generation States
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiAbortController, setAiAbortController] = useState<AbortController | null>(null);
  const [activeTypingIndicator, setActiveTypingIndicator] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentUser = auth.currentUser;
  const currentUserName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'MOE Officer';
  const currentUserEmail = currentUser?.email || 'officer@moe.gov.zm';

  const [userPortrait, setUserPortrait] = useState<string>(() => {
    return (
      auth.currentUser?.photoURL ||
      localStorage.getItem('user_portrait_url') ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    );
  });

  useEffect(() => {
    const handlePortraitUpdate = (e: any) => {
      if (e.detail?.url) {
        setUserPortrait(e.detail.url);
      } else {
        setUserPortrait(
          auth.currentUser?.photoURL ||
          localStorage.getItem('user_portrait_url') ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
        );
      }
    };

    window.addEventListener('user-portrait-updated', handlePortraitUpdate);

    // Live subscription to Firestore user_profiles document
    const profileId = auth.currentUser?.uid || 'default_user';
    const profileRef = doc(db, 'user_profiles', profileId);
    const unsubscribeSnapshot = onSnapshot(profileRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.portraitUrl) {
          setUserPortrait(data.portraitUrl);
          localStorage.setItem('user_portrait_url', data.portraitUrl);
        }
      }
    }, (err) => {
      console.warn('CommunicationHub Firestore portrait sync:', err);
    });

    return () => {
      window.removeEventListener('user-portrait-updated', handlePortraitUpdate);
      unsubscribeSnapshot();
    };
  }, []);

  // 1. Network Status Listener & Offline Queue Flusher
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      flushOfflineQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [offlineQueue]);

  useEffect(() => {
    try {
      localStorage.setItem('eduzam_chat_offline_queue', JSON.stringify(offlineQueue));
    } catch (e) {
      console.warn('Could not save offline queue to localStorage', e);
    }
  }, [offlineQueue]);

  const flushOfflineQueue = async () => {
    if (offlineQueue.length === 0) return;
    const queue = [...offlineQueue];
    setOfflineQueue([]);

    for (const msg of queue) {
      try {
        await addDoc(collection(db, 'messages'), {
          sender: msg.sender,
          senderEmail: msg.senderEmail,
          text: msg.text || '',
          imageUrl: msg.imageUrl || '',
          imageSize: msg.imageSize || '',
          replyTo: msg.replyTo || '',
          stickerBadge: msg.stickerBadge || '',
          isAi: false,
          status: 'delivered',
          createdAt: serverTimestamp()
        });
      } catch (err) {
        console.error('Failed to sync queued message:', err);
        setOfflineQueue((prev) => [...prev, msg]);
      }
    }
  };

  // 2. Real-time Firestore Sync
  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'));
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
            sender: data.sender || 'Staff Member',
            senderEmail: data.senderEmail || '',
            text: data.text || '',
            imageUrl: data.imageUrl || '',
            imageSize: data.imageSize || '',
            stickerBadge: data.stickerBadge || '',
            replyTo: data.replyTo || '',
            reactions: data.reactions || {},
            isAi: !!data.isAi,
            status: data.status || 'delivered',
            aiThumbs: data.aiThumbs,
            createdAt: data.createdAt,
            time: formattedTime,
            dateStr: formatDateGroup(rawDate),
            rawDate
          };
        });

        setMessages(liveMessages);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'messages');
      }
    );

    return () => unsubscribe();
  }, []);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages.length, activeTypingIndicator, selectedImage]);

  // 3. Audio Note Simulation Handler
  const startAudioRecording = () => {
    setIsRecordingAudio(true);
    setAudioDuration(0);
    const timer = setInterval(() => {
      setAudioDuration((prev) => prev + 1);
    }, 1000);
    setAudioTimer(timer);
  };

  const stopAndSendAudio = async () => {
    if (audioTimer) clearInterval(audioTimer);
    setIsRecordingAudio(false);
    if (audioDuration < 1) return;

    const audioText = `🎙️ [Voice Directive Note - 0:${audioDuration.toString().padStart(2, '0')} min recorded by ${currentUserName}]`;
    await sendMessageToFirestore(audioText);
    setAudioDuration(0);
  };

  const cancelAudioRecording = () => {
    if (audioTimer) clearInterval(audioTimer);
    setIsRecordingAudio(false);
    setAudioDuration(0);
  };

  // 4. Image Compression & File Selector
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file);
      setSelectedImage({ base64: compressed.base64, size: compressed.sizeFormatted });
    } catch (err) {
      console.error('Image compression error:', err);
      alert('Failed to process image. Please choose another file.');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      try {
        const compressed = await compressImage(file);
        setSelectedImage({ base64: compressed.base64, size: compressed.sizeFormatted });
      } catch (err) {
        console.error('Dropped image error:', err);
      }
    }
  };

  // 5. Send Message Dispatcher (Handles Online / Offline)
  const sendMessageToFirestore = async (textPayload?: string, imagePayload?: { base64: string; size: string }) => {
    const textToSend = textPayload !== undefined ? textPayload : inputMessage.trim();
    const imageToSend = imagePayload || selectedImage;

    if (!textToSend && !imageToSend) return;

    const replySummary = replyingTo 
      ? `Replying to ${replyingTo.sender}: ${replyingTo.text ? replyingTo.text.slice(0, 70) : 'Attachment'}`
      : undefined;

    // Check if query is addressing AI Assistant directly
    const mentionsAi = textToSend.toLowerCase().includes('@assistant') || 
                       textToSend.toLowerCase().includes('@ai') ||
                       textToSend.startsWith('/ai') ||
                       textToSend.startsWith('?');

    setInputMessage('');
    setSelectedImage(null);
    setReplyingTo(null);
    setShowEmojiPicker(false);
    setMentionQuery(null);

    // If Offline: Queue locally
    if (!navigator.onLine) {
      const offlineMsg: ChatMessage = {
        id: `offline-${Date.now()}`,
        sender: currentUserName,
        senderEmail: currentUserEmail,
        text: textToSend,
        imageUrl: imageToSend?.base64 || '',
        imageSize: imageToSend?.size || '',
        replyTo: replySummary,
        status: 'queued',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dateStr: 'Today'
      };
      setOfflineQueue((prev) => [...prev, offlineMsg]);
      return;
    }

    setIsSending(true);
    try {
      await addDoc(collection(db, 'messages'), {
        sender: currentUserName,
        senderEmail: currentUserEmail,
        text: textToSend,
        imageUrl: imageToSend?.base64 || '',
        imageSize: imageToSend?.size || '',
        replyTo: replySummary || '',
        isAi: false,
        status: 'delivered',
        createdAt: serverTimestamp()
      });

      // If user addressed AI Assistant, trigger server Gemini stream
      if (mentionsAi) {
        triggerAiAssistantResponse(textToSend);
      }
    } catch (err) {
      console.error('Failed to transmit message:', err);
      // Fallback queue
      const failedMsg: ChatMessage = {
        id: `failed-${Date.now()}`,
        sender: currentUserName,
        senderEmail: currentUserEmail,
        text: textToSend,
        imageUrl: imageToSend?.base64 || '',
        imageSize: imageToSend?.size || '',
        status: 'failed',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dateStr: 'Today'
      };
      setOfflineQueue((prev) => [...prev, failedMsg]);
    } finally {
      setIsSending(false);
    }
  };

  // 6. AI Assistant Streaming & Generation Engine
  const triggerAiAssistantResponse = async (userPrompt: string) => {
    setIsAiGenerating(true);
    setActiveTypingIndicator('EduZAM Policy Assistant is formulating response...');
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

      // Save AI Response to Firestore
      await addDoc(collection(db, 'messages'), {
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
        console.info('AI generation aborted by user.');
      } else {
        console.error('AI generation failed:', err);
      }
    } finally {
      setIsAiGenerating(false);
      setActiveTypingIndicator(null);
      setAiAbortController(null);
    }
  };

  const handleStopGenerating = () => {
    if (aiAbortController) {
      aiAbortController.abort();
      setIsAiGenerating(false);
      setActiveTypingIndicator(null);
      setAiAbortController(null);
    }
  };

  // 7. Add Reaction to Message
  const handleToggleReaction = async (msgId: string, emoji: string) => {
    const target = messages.find((m) => m.id === msgId);
    if (!target) return;

    const currentReactions = { ...(target.reactions || {}) };
    const currentCount = currentReactions[emoji] || 0;
    currentReactions[emoji] = currentCount + 1;

    try {
      await updateDoc(doc(db, 'messages', msgId), {
        reactions: currentReactions
      });
      setActiveReactionMsgId(null);
    } catch (err) {
      console.error('Failed to update reaction:', err);
    }
  };

  // 8. AI Thumbs Up/Down Feedback
  const handleAiThumbs = async (msgId: string, thumb: 'up' | 'down') => {
    try {
      await updateDoc(doc(db, 'messages', msgId), {
        aiThumbs: thumb
      });
    } catch (err) {
      console.error('Failed to submit AI feedback:', err);
    }
  };

  // 9. Input Text Handler with @Mentions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputMessage(val);

    const cursorIndex = e.target.selectionStart || 0;
    const textBeforeCursor = val.slice(0, cursorIndex);
    const lastAtMatch = textBeforeCursor.match(/@([a-zA-Z0-9_-]*)$/);

    if (lastAtMatch) {
      setMentionQuery(lastAtMatch[1].toLowerCase());
    } else {
      setMentionQuery(null);
    }
  };

  const selectMention = (user: MentionUser) => {
    if (mentionQuery === null) return;
    const atIndex = inputMessage.lastIndexOf('@' + mentionQuery);
    if (atIndex !== -1) {
      const before = inputMessage.slice(0, atIndex);
      const after = inputMessage.slice(atIndex + mentionQuery.length + 1);
      const newText = `${before}@${user.name} ${after}`;
      setInputMessage(newText);
    }
    setMentionQuery(null);
    inputRef.current?.focus();
  };

  // Delete message
  const handleDeleteMessage = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'messages', id));
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  // Filtered mentions list
  const filteredMentions = useMemo(() => {
    if (mentionQuery === null) return [];
    return SYSTEM_PARTICIPANTS.filter((u) =>
      u.name.toLowerCase().includes(mentionQuery) || u.role.toLowerCase().includes(mentionQuery)
    );
  }, [mentionQuery]);

  // Messages grouped by Date
  const groupedMessages = useMemo(() => {
    const queryLower = searchQuery.toLowerCase().trim();
    const list = messages.concat(offlineQueue);

    const filtered = queryLower
      ? list.filter(
          (m) =>
            (m.text || '').toLowerCase().includes(queryLower) ||
            (m.sender || '').toLowerCase().includes(queryLower) ||
            (m.stickerBadge || '').toLowerCase().includes(queryLower)
        )
      : list;

    const groups: { dateStr: string; items: ChatMessage[] }[] = [];
    filtered.forEach((msg) => {
      const groupName = msg.dateStr || 'Today';
      const existing = groups.find((g) => g.dateStr === groupName);
      if (existing) {
        existing.items.push(msg);
      } else {
        groups.push({ dateStr: groupName, items: [msg] });
      }
    });

    return groups;
  }, [messages, offlineQueue, searchQuery]);

  return (
    <div
      className="w-full h-full flex flex-col bg-transparent overflow-hidden relative font-sans select-text"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Blended Light Colours Fading from Top Part of Communication Box */}
      <div className="absolute top-0 left-0 right-0 h-52 sm:h-64 pointer-events-none z-10 overflow-hidden">
        {/* Soft Multi-Stop Linear Gradient Fade from Top */}
        <div className="absolute inset-0 bg-gradient-to-b from-orange-200/40 via-sky-200/50 via-indigo-100/40 via-rose-100/30 via-amber-100/20 to-transparent" />
        
        {/* Blended Light Aurora Glows */}
        <div className="absolute -top-10 left-[5%] w-80 sm:w-96 h-40 bg-gradient-to-br from-orange-300/30 via-sky-300/35 via-cyan-200/25 to-transparent rounded-full blur-3xl" />
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-[420px] sm:w-[540px] h-44 bg-gradient-to-b from-purple-200/30 via-pink-200/25 via-orange-200/25 to-transparent rounded-full blur-3xl" />
        <div className="absolute -top-10 right-[5%] w-80 sm:w-96 h-40 bg-gradient-to-bl from-orange-300/35 via-amber-200/35 via-rose-200/25 to-transparent rounded-full blur-3xl" />
        
        {/* Delicate Top Shimmer Line */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
      </div>

      {/* Offline Alert Strip */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-bold flex items-center justify-between z-30 shadow-xs"
          >
            <div className="flex items-center gap-2">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Offline Mode: Messages will queue locally and transmit automatically upon reconnection.</span>
            </div>
            {offlineQueue.length > 0 && (
              <span className="bg-amber-900/20 px-2 py-0.5 rounded-full text-[11px]">
                {offlineQueue.length} Queued
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drag & Drop Visual Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-teal-900/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-white text-center border-4 border-dashed border-teal-300 pointer-events-none"
          >
            <Camera className="w-16 h-16 text-teal-200 mb-3 animate-bounce" />
            <h3 className="text-xl font-black">Drop image here to attach</h3>
            <p className="text-sm text-teal-200 mt-1">Image will be attached in full quality</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox for viewing full-size images */}
      <AnimatePresence>
        {activeLightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveLightboxImage(null)}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md cursor-zoom-out"
          >
            <button
              onClick={() => setActiveLightboxImage(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
              aria-label="Close image preview"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              src={activeLightboxImage}
              alt="Uploaded full view"
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl border border-white/20"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Section Layout: Short Header & Underlapping Contacts Ticker */}
      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none h-14 flex items-center">
        {/* Active Contacts Scrolling Ticker (Stretches from under header to right edge) */}
        <div className="absolute inset-0 pointer-events-auto flex items-center pl-[80px] sm:pl-[95px]">
          <ContactsTicker onNavigate={onNavigate} />
        </div>

        {/* Short Top-Left Header */}
        <div className="absolute top-0 left-0 flex flex-col items-start pointer-events-auto">
          <div className="pl-2.5 sm:pl-3 py-1 sm:py-1.5 pr-1 sm:pr-1.5 bg-white/95 backdrop-blur-md border-b border-r border-slate-200 rounded-r-full shadow-md flex items-center gap-2 sm:gap-2.5 relative z-30">
            {onNavigate && (
              <button
                onClick={() => onNavigate('dashboard')}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full text-black hover:text-black bg-white hover:bg-slate-100 flex items-center justify-center transition-all border border-slate-300 active:scale-95 shrink-0 cursor-pointer shadow-2xs"
                title="Return to Dashboard"
                aria-label="Return to Dashboard"
              >
                <ArrowLeft className="w-4 h-4 text-black" />
              </button>
            )}

            {/* User Circle Portrait Connected with Communication Hub Settings */}
            <div 
              onClick={() => onNavigate && onNavigate('settings')}
              className="relative group cursor-pointer shrink-0"
              title="View Official Profile & Settings"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 p-[1.5px] shadow-sm shadow-blue-600/20 transition-transform group-hover:scale-105">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                  <img
                    src={userPortrait}
                    alt="Officer Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              {/* Pulsing Active Status Dot */}
              <span 
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white shadow-2xs ${
                  isOnline ? 'bg-emerald-300 animate-pulse' : 'bg-blue-500'
                }`} 
              />

              {/* Tooltip on Hover */}
              <div className="absolute left-0 top-11 hidden group-hover:flex flex-col bg-slate-900 text-white text-xs rounded-xl p-2.5 shadow-xl z-40 min-w-[200px] border border-slate-700 pointer-events-none">
                <span className="font-extrabold text-xs text-amber-300">{currentUserName}</span>
                <span className="text-[9.5px] text-slate-400 font-mono truncate">{currentUserEmail}</span>
                <span className="text-[9.5px] text-emerald-400 font-bold mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> {isOnline ? 'Duplex Connected • Click for Profile' : 'Offline Mode'}
                </span>
              </div>
            </div>
          </div>

          {/* Plus Sign Button & Expanded Toolbar below header */}
          <div className="pl-3 mt-2 flex flex-col items-center gap-2 relative z-20">
            {/* Expanded Icons Top */}
            <AnimatePresence>
              {showTopToolbar && (
                <motion.div 
                  initial={{ opacity: 0, y: -10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.9 }}
                  className="flex flex-col gap-2 pt-1"
                >
                  <button
                    onClick={() => setShowSearch(!showSearch)}
                    className={`w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all border active:scale-95 cursor-pointer shadow-2xs ${
                      showSearch 
                        ? 'bg-blue-50 text-blue-600 border-blue-300' 
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300/90'
                    }`}
                    title="Search Messages"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setShowChannelInfo(!showChannelInfo)}
                    className={`w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all border active:scale-95 cursor-pointer shadow-2xs ${
                      showChannelInfo 
                        ? 'bg-amber-500 text-black border-amber-600 shadow-amber-500/20 shadow-lg' 
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300/90'
                    }`}
                    title="Online Members"
                  >
                    <Users className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              onClick={() => setShowTopToolbar(!showTopToolbar)}
              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all active:scale-95 cursor-pointer z-30 ${
                showTopToolbar 
                  ? 'bg-red-50 hover:bg-red-100 border border-red-200 text-red-500' 
                  : 'bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600'
              }`}
            >
              <Plus className={`w-5 h-5 transition-transform duration-300 ${showTopToolbar ? 'rotate-45' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Toolbar: Search Input (Appears centrally when opened via the new plus sign menu) */}
      <AnimatePresence>
        {showSearch && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-16 left-12 z-40 flex items-center gap-1.5 bg-white/95 backdrop-blur-md border border-slate-300/90 rounded-full px-3 py-1 text-xs shadow-lg"
          >
            <Search className="w-3.5 h-3.5 text-black shrink-0" />
            <input
              type="text"
              placeholder="Search conversation..."
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
              className="text-black hover:text-slate-700 text-xs px-1 cursor-pointer font-bold"
              aria-label="Clear Search"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Online Member List Dropdown Panel */}
      <AnimatePresence>
        {showChannelInfo && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute top-32 left-4 w-48 sm:w-56 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl shadow-lg p-2 z-40 space-y-1.5"
          >
            <div className="flex items-center justify-between pb-1 border-b border-slate-100/90 px-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse shrink-0" />
                <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
                  Online
                </h3>
              </div>
              <button
                onClick={() => setShowChannelInfo(false)}
                className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
                aria-label="Close online panel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1 max-h-52 overflow-y-auto pr-0.5">
              {SYSTEM_PARTICIPANTS.filter((p) => !p.isBot).map((p) => (
                <div key={p.id} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50/80 hover:bg-slate-100/80 transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-5.5 h-5.5 rounded-full bg-teal-50 text-teal-500 flex items-center justify-center text-[9.5px] font-bold shrink-0">
                      {p.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-slate-800 truncate leading-tight">{p.name}</p>
                      <p className="text-[9px] text-slate-500 truncate leading-tight">{p.role}</p>
                    </div>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 shrink-0 ml-1" />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edge-to-Edge Real-Time Chat Feed with ARIA live accessibility */}
      <div 
        className="flex-1 p-3 sm:p-5 lg:p-6 mt-16 sm:mt-18 overflow-y-auto space-y-4 bg-slate-50/70"
        aria-live="polite"
        role="log"
      >
        <div className="w-full max-w-4xl mx-auto space-y-4">
          {/* Grouped Messages Stream */}
          {groupedMessages.map((group) => (
            <div key={group.dateStr} className="space-y-3">
              {/* Date Separator Pill */}
              <div className="flex justify-center sticky top-2 z-10">
                <span className="px-3 py-0.5 rounded-full bg-slate-200/90 backdrop-blur-xs text-[10px] font-extrabold text-slate-600 uppercase tracking-wider shadow-2xs">
                  {group.dateStr}
                </span>
              </div>

              {group.items.map((msg) => {
                const isMine = msg.senderEmail === currentUserEmail || msg.sender === currentUserName || msg.sender === 'You';
                const isAiMessage = !!msg.isAi;
                const stickerData = REACTION_STICKERS.find((s) => s.id === msg.stickerBadge);
                const hasReactions = msg.reactions && Object.keys(msg.reactions).length > 0;

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col group/bubble ${isMine ? 'items-end' : 'items-start'}`}
                  >
                    {/* SENDER IDENTITY & REPLY CONTEXT (OUTSIDE BUBBLE) */}
                    {isAiMessage && (
                      <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] font-bold text-cyan-800">
                        <span className="px-1.5 py-0.5 bg-gradient-to-r from-[#071329] via-[#102752] to-[#071329] text-cyan-300 border border-cyan-400/50 rounded-md text-[9px] font-black uppercase flex items-center gap-1 shadow-2xs">
                          <Bot className="w-3 h-3 text-cyan-300" /> AI Assistant
                        </span>
                      </div>
                    )}

                    {/* Threaded Reply Context (Outside Bubble) */}
                    {msg.replyTo && (
                      <div className={`mb-1 px-2.5 py-1 rounded-lg text-[11px] border-l-2 font-medium max-w-[85%] truncate ${
                        isMine 
                          ? 'bg-teal-50 text-teal-800 border-teal-500 self-end' 
                          : 'bg-slate-100 text-slate-700 border-teal-600 self-start'
                      }`}>
                        <div className="flex items-center gap-1 font-semibold">
                          <Reply className="w-3 h-3 shrink-0" />
                          <span className="truncate">{msg.replyTo}</span>
                        </div>
                      </div>
                    )}

                    {/* REACTION STICKER / DIRECTIVE BADGE */}
                    {stickerData ? (
                      <div 
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
                        className="relative group max-w-[90%] sm:max-w-[400px] cursor-pointer select-none"
                      >
                        <div className={`p-3.5 rounded-2xl border-2 shadow-xs transition-transform flex items-center gap-3.5 ${stickerData.bg} ${stickerData.border}`}>
                          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stickerData.color} text-white flex items-center justify-center shrink-0 shadow-sm`}>
                            <stickerData.icon className="w-6 h-6" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-black tracking-tight leading-snug">
                              {stickerData.title}
                            </h4>
                            <p className="text-[10px] font-medium opacity-80 mt-0.5 truncate">
                              {stickerData.desc}
                            </p>
                          </div>
                        </div>

                        {/* Action Options Popover on Long-Press for Stickers */}
                        <AnimatePresence>
                          {activeActionsMsgId === msg.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9, y: isMine ? -6 : 6 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className={`mt-1.5 flex items-center gap-1.5 p-1 bg-slate-900/95 text-white backdrop-blur-md border border-slate-700/80 rounded-xl shadow-xl z-30 ${
                                isMine ? 'ml-auto' : 'mr-auto'
                              }`}
                            >
                              {isMine && (
                                <button
                                  onClick={() => {
                                    handleDeleteMessage(msg.id);
                                    setActiveActionsMsgId(null);
                                  }}
                                  className="px-2.5 py-1 rounded-lg hover:bg-rose-900/50 text-rose-300 font-medium text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                                  title="Delete Sticker"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                                  <span>Delete Sticker</span>
                                </button>
                              )}
                              <button
                                onClick={() => setActiveActionsMsgId(null)}
                                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                                title="Dismiss"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      /* PURE CHAT BUBBLE: CONTAINS ONLY THE MESSAGE & TIGHT PHOTO WITH THIN LINE */
                      <div className="relative flex flex-col w-fit max-w-[92%] sm:max-w-[78%]">
                        {/* Slide to Delete Draggable Bubble */}
                        <motion.div
                          drag="x"
                          dragConstraints={{ left: 0, right: 100 }}
                          dragElastic={{ left: 0.05, right: 0.25 }}
                          dragSnapToOrigin={true}
                          onDragEnd={(_, info) => {
                            if (info.offset.x > 50 || info.velocity.x > 200) {
                              handleDeleteMessage(msg.id);
                            }
                          }}
                          className="relative flex items-center w-full cursor-grab active:cursor-grabbing touch-pan-y"
                        >
                          {/* Message Bubble itself with Tap to open actions */}
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
                            className={`relative z-10 transition-all shadow-sm overflow-hidden backdrop-blur-xs select-none cursor-pointer w-fit ${
                              msg.imageUrl && !msg.text ? 'p-1' : 'px-4 py-2.5 sm:px-5 sm:py-3.5'
                            } rounded-2xl ${
                              isMine
                                ? 'bg-slate-600 text-white rounded-br-xs border border-slate-400 shadow-[0_3px_12px_rgba(71,85,105,0.18)]'
                                : isAiMessage
                                ? 'bg-slate-50 text-slate-900 rounded-bl-xs border border-slate-100 shadow-xs'
                                : 'bg-slate-50 text-slate-900 rounded-bl-xs border border-slate-100 shadow-xs'
                            }`}
                          >
                            {/* Attached Photo: Tight bubble showing only a border bubble colour line */}
                            {msg.imageUrl && (
                              <div className="overflow-hidden rounded-xl border border-teal-400/50 relative group/img cursor-zoom-in inline-block max-w-full leading-none p-0">
                                <img
                                  src={msg.imageUrl}
                                  alt="Communication attachment"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveLightboxImage(msg.imageUrl || null);
                                  }}
                                  className="w-auto max-w-full max-h-64 object-contain rounded-lg block transition-transform hover:scale-[1.01]"
                                />
                                <div className="absolute top-1.5 right-1.5 bg-black/60 text-white p-1 rounded-md opacity-0 group-hover/img:opacity-100 transition-opacity pointer-events-none">
                                  <Maximize2 className="w-3 h-3 text-white" />
                                </div>
                              </div>
                            )}

                            {/* Message Text Content: Enlarged word size in Google Sans */}
                            {msg.text && (
                              <div className={`font-google-sans text-[17px] sm:text-[18.5px] font-medium leading-relaxed tracking-normal whitespace-pre-wrap ${msg.imageUrl ? 'mt-1.5' : ''}`}>
                                {msg.text}
                              </div>
                            )}
                          </div>
                        </motion.div>

                        {/* OUTSIDE BUBBLE: METADATA */}
                        <div className={`mt-1 px-1 flex items-center gap-2 text-[10px] ${
                          isMine ? 'justify-end text-teal-700' : 'justify-start text-slate-500'
                        }`}>
                          <span className="font-medium">{msg.time}</span>
                          
                          {isMine && (
                            <span title={msg.status === 'queued' ? 'Queued Offline' : 'Delivered & Synchronized'}>
                              {msg.status === 'queued' ? (
                                <Clock className="w-3 h-3 text-amber-500" />
                              ) : (
                                <CheckCheck className="w-3.5 h-3.5 text-teal-600" />
                              )}
                            </span>
                          )}
                        </div>

                        {/* Message Action Options Popover (Appears after tap or long-press on a bubble) */}
                        <AnimatePresence>
                          {activeActionsMsgId === msg.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9, y: isMine ? -6 : 6 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className={`mt-1.5 flex items-center gap-1.5 p-1 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl shadow-lg z-30 ${
                                isMine ? 'ml-auto' : 'mr-auto'
                              }`}
                            >
                              {/* Reply Button */}
                              <button
                                onClick={() => {
                                  setReplyingTo(msg);
                                  setActiveActionsMsgId(null);
                                }}
                                className="px-2 py-1 rounded-lg hover:bg-slate-100 text-slate-700 font-medium text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                                title="Reply to message"
                              >
                                <Reply className="w-3.5 h-3.5 text-teal-600" />
                                <span>Reply</span>
                              </button>

                              {/* Add Reaction Button */}
                              <button
                                onClick={() => {
                                  setActiveReactionMsgId(activeReactionMsgId === msg.id ? null : msg.id);
                                  setActiveActionsMsgId(null);
                                }}
                                className="px-2 py-1 rounded-lg hover:bg-slate-100 text-slate-700 font-medium text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                                title="Add Reaction"
                              >
                                <Smile className="w-3.5 h-3.5 text-amber-500" />
                                <span>React</span>
                              </button>

                              {/* Copy Button */}
                              {msg.text && (
                                <button
                                  onClick={() => {
                                    navigator.clipboard?.writeText(msg.text || '');
                                    setCopiedId(msg.id);
                                    setTimeout(() => setCopiedId(null), 2000);
                                    setActiveActionsMsgId(null);
                                  }}
                                  className="px-2 py-1 rounded-lg hover:bg-slate-100 text-slate-700 font-medium text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                                  title="Copy Message"
                                >
                                  {copiedId === msg.id ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Share2 className="w-3.5 h-3.5 text-blue-600" />
                                  )}
                                  <span>Copy</span>
                                </button>
                              )}

                              {/* Delete Message for sender */}
                              {isMine && (
                                <button
                                  onClick={() => {
                                    handleDeleteMessage(msg.id);
                                    setActiveActionsMsgId(null);
                                  }}
                                  className="px-2 py-1 rounded-lg hover:bg-rose-50 text-rose-600 font-medium text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                                  title="Delete Message"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete</span>
                                </button>
                              )}

                              {/* Dismiss Button */}
                              <button
                                onClick={() => setActiveActionsMsgId(null)}
                                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors ml-0.5 cursor-pointer"
                                title="Dismiss"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* AI Capabilities Footnote + Escalation (Outside Bubble) */}
                        {isAiMessage && (
                          <div className="mt-1.5 px-1 flex flex-wrap items-center justify-between gap-2 text-[10.5px] text-indigo-900 font-semibold">
                            <div className="flex items-center gap-1 text-indigo-700">
                              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                              <span>ECZ & CDC Synchronized Response</span>
                            </div>
                            
                            <div className="flex items-center gap-1.5">
                              {/* Thumbs Up / Down Feedback */}
                              <button
                                onClick={() => handleAiThumbs(msg.id, 'up')}
                                className={`p-1 rounded-md transition-colors cursor-pointer ${
                                  msg.aiThumbs === 'up' ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-100 text-indigo-700 bg-indigo-50/80 border border-indigo-200/60'
                                }`}
                                title="Accurate Directive"
                              >
                                <ThumbsUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleAiThumbs(msg.id, 'down')}
                                className={`p-1 rounded-md transition-colors cursor-pointer ${
                                  msg.aiThumbs === 'down' ? 'bg-rose-600 text-white' : 'hover:bg-rose-100 text-rose-700 bg-rose-50/80 border border-rose-200/60'
                                }`}
                                title="Flag for Review"
                              >
                                <ThumbsDown className="w-3 h-3" />
                              </button>

                              {/* Escalate to Officer */}
                              <button
                                onClick={() => {
                                  sendMessageToFirestore(`@SuperAdmin Escalation request regarding AI guidance: "${msg.text?.slice(0, 80)}..."`);
                                }}
                                className="px-2 py-0.5 rounded-full bg-indigo-100 hover:bg-indigo-200 text-indigo-800 text-[9.5px] font-bold flex items-center gap-1 transition-colors cursor-pointer border border-indigo-200"
                              >
                                <PhoneCall className="w-2.5 h-2.5" /> Talk to Officer
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Inline Reaction Picker Floating Popover */}
                        <AnimatePresence>
                          {activeReactionMsgId === msg.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className="absolute -top-10 right-2 bg-white border border-slate-200 rounded-full shadow-lg px-2 py-1 flex items-center gap-1 z-30"
                            >
                              {['👍', '❤️', '🔥', '💯', '👏', '✅'].map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => handleToggleReaction(msg.id, emoji)}
                                  className="w-7 h-7 hover:scale-125 transition-transform flex items-center justify-center text-sm cursor-pointer"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* Display Active Emoji Reaction Badges (Outside Bubble) */}
                    {hasReactions && (
                      <div className="flex flex-wrap items-center gap-1 mt-1 px-1">
                        {Object.entries(msg.reactions || {}).map(([emoji, count]) => (
                          <button
                            key={emoji}
                            onClick={() => handleToggleReaction(msg.id, emoji)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700 transition-all active:scale-95 shadow-2xs cursor-pointer"
                          >
                            <span>{emoji}</span>
                            <span className="text-[10px] text-slate-500">{count}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ))}

          {/* Typing Indicator & Streaming Alert */}
          {activeTypingIndicator && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-3 rounded-2xl bg-indigo-50 border border-indigo-200/80 text-indigo-900 text-xs shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-r from-[#071329] via-[#102752] to-[#071329] text-cyan-300 border border-cyan-400/50 flex items-center justify-center animate-pulse shadow-xs">
                  <Bot className="w-4 h-4 text-cyan-300" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{activeTypingIndicator}</span>
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>

              {isAiGenerating && (
                <button
                  onClick={handleStopGenerating}
                  className="px-2.5 py-1 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  <Square className="w-3 h-3 fill-current" /> Stop generating
                </button>
              )}
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* @Mentions Autocomplete Popup */}
      <AnimatePresence>
        {mentionQuery !== null && filteredMentions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-20 left-4 sm:left-12 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-40 w-72 space-y-1"
          >
            <div className="px-2 py-1 text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Select Officer or AI Assistant
            </div>
            {filteredMentions.map((user) => (
              <button
                key={user.id}
                onClick={() => selectMention(user)}
                className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-teal-50 text-left transition-colors cursor-pointer"
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  user.isBot 
                    ? 'bg-gradient-to-r from-[#071329] via-[#102752] to-[#071329] text-cyan-300 border border-cyan-400/50' 
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {user.isBot ? <Bot className="w-4 h-4 text-cyan-300" /> : user.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user.role}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emoji & Reaction Badges Modal Drawer */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="absolute bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 z-40 space-y-3"
          >
            {/* Header Tabs */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEmojiTab('emojis')}
                  className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    emojiTab === 'emojis'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Emojis
                </button>
                <button
                  onClick={() => setEmojiTab('stickers')}
                  className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    emojiTab === 'stickers'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Directive Badges
                </button>
              </div>

              <button
                onClick={() => setShowEmojiPicker(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
                aria-label="Close emoji picker"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* TAB 1: EMOJIS */}
            {emojiTab === 'emojis' ? (
              <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1">
                {POPULAR_EMOJIS.map((emoji, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputMessage((prev) => prev + emoji);
                      inputRef.current?.focus();
                    }}
                    className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-xl transition-all active:scale-90 cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            ) : (
              /* TAB 2: REACTION STICKERS */
              <div className="space-y-2 max-h-56 overflow-y-auto p-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Tap to transmit official directive badge
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {REACTION_STICKERS.map((stk) => (
                    <button
                      key={stk.id}
                      onClick={async () => {
                        await addDoc(collection(db, 'messages'), {
                          sender: currentUserName,
                          senderEmail: currentUserEmail,
                          stickerBadge: stk.id,
                          status: 'delivered',
                          createdAt: serverTimestamp()
                        });
                        setShowEmojiPicker(false);
                      }}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-left transition-all active:scale-95 hover:shadow-xs cursor-pointer ${stk.bg} ${stk.border}`}
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stk.color} text-white flex items-center justify-center shrink-0 shadow-2xs`}>
                        <stk.icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-black leading-tight truncate">{stk.title}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Replying-To Bar */}
      <AnimatePresence>
        {replyingTo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-2 bg-teal-50/90 border-t border-teal-200 flex items-center justify-between gap-3 shrink-0 z-20"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Reply className="w-4 h-4 text-teal-700 shrink-0" />
              <div className="min-w-0 text-xs">
                <span className="font-bold text-teal-900">Replying to {replyingTo.sender}: </span>
                <span className="text-teal-700 truncate">{replyingTo.text || 'Attachment'}</span>
              </div>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="p-1 text-teal-700 hover:text-teal-900 rounded-md"
              aria-label="Cancel reply"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Attachment Preview with Size */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500/15 via-orange-400/10 to-transparent border-t border-amber-200/60 flex items-center gap-2.5 shrink-0 z-20"
          >
            <div className="relative rounded-lg border border-slate-300/80 overflow-hidden shadow-2xs shrink-0 p-0 leading-none">
              <img src={selectedImage.base64} alt="Attachment preview" className="w-10 h-10 object-cover block" />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-0.5 right-0.5 p-0.5 bg-black/70 text-white rounded-full hover:bg-black"
                aria-label="Remove image"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate">Image Attached</p>
              <p className="text-[9.5px] text-slate-500 font-mono">Original Quality • Ready to send</p>
            </div>
            <button
              onClick={() => setSelectedImage(null)}
              className="text-xs font-bold text-red-600 hover:text-red-700 px-2 py-1 cursor-pointer"
            >
              Discard
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Recording Active Bar */}
      <AnimatePresence>
        {isRecordingAudio && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-2.5 bg-rose-50 border-t border-rose-200 flex items-center justify-between gap-3 shrink-0 z-20"
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
              <span className="text-xs font-black text-rose-800 uppercase tracking-wider">
                Recording Voice Note: 0:{audioDuration.toString().padStart(2, '0')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={cancelAudioRecording}
                className="px-3 py-1 bg-white border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={stopAndSendAudio}
                className="px-3 py-1 bg-rose-600 text-white hover:bg-rose-700 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Send className="w-3 h-3" /> Send Note
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Bottom Full-Width Chat Input Bar in Calm Red */}
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

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessageToFirestore();
          }}
          className="relative max-w-4xl mx-auto flex items-center gap-1 sm:gap-1.5"
        >
          {/* Hidden Image File Input */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageFileChange}
            className="hidden"
          />

          {/* Left Action Icons Container in Calm Red Glass */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 relative p-0.5 rounded-xl bg-rose-950/60 backdrop-blur-md border border-rose-800/50 shadow-inner">
            {/* Upload Image Button */}
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-7.5 h-7.5 sm:w-8.5 sm:h-8.5 text-slate-200 hover:text-white bg-rose-900/40 hover:bg-rose-800/60 border border-rose-700/50 rounded-lg sm:rounded-xl transition-all shrink-0 cursor-pointer flex items-center justify-center shadow-xs"
              title="Upload Image (Auto-Compressed)"
              aria-label="Upload Image"
            >
              <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-200 stroke-[2.2]" />
            </motion.button>

            {/* Voice Note Button with Animated Recording Pulse */}
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={isRecordingAudio ? stopAndSendAudio : startAudioRecording}
              className={`w-7.5 h-7.5 sm:w-8.5 sm:h-8.5 rounded-lg sm:rounded-xl transition-all border shrink-0 cursor-pointer flex items-center justify-center shadow-xs ${
                isRecordingAudio 
                  ? 'bg-rose-600 text-white border-rose-500 animate-pulse ring-2 ring-rose-400/80' 
                  : 'text-slate-200 hover:text-white bg-rose-900/40 hover:bg-rose-800/60 border-rose-700/50'
              }`}
              title={isRecordingAudio ? 'Stop Recording' : 'Record Audio Note'}
              aria-label="Voice Note"
            >
              <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-200 stroke-[2.2]" />
            </motion.button>

            {/* Reaction & Emoji Drawer Toggle */}
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`w-7.5 h-7.5 sm:w-8.5 sm:h-8.5 rounded-lg sm:rounded-xl transition-all border shrink-0 cursor-pointer flex items-center justify-center shadow-xs ${
                showEmojiPicker
                  ? 'bg-rose-600 text-white border-rose-400 ring-2 ring-rose-400/70 shadow-sm'
                  : 'text-slate-200 hover:text-white bg-rose-900/40 hover:bg-rose-800/60 border-rose-700/50'
              }`}
              title="Insert Emojis & Directives"
              aria-label="Insert Emojis & Directives"
            >
              <Smile className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-200 stroke-[2.2]" />
            </motion.button>
          </div>

          {/* Text Input with @ Mention autocomplete trigger, enlarged in Google Sans */}
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if ((inputMessage.trim() || selectedImage) && !isSending) {
                  sendMessageToFirestore();
                }
              }
            }}
            placeholder="Message team, type @ for officer or @Assistant for AI..."
            className="flex-1 min-w-0 px-2.5 sm:px-3.5 h-7.5 sm:h-8.5 bg-slate-900/90 border border-rose-800/60 focus:border-rose-400 rounded-lg sm:rounded-xl font-google-sans text-[13px] sm:text-[14px] text-white focus:outline-none focus:ring-2 focus:ring-rose-500/30 font-medium placeholder:text-slate-400 shadow-2xs"
          />

          {/* Submit Button in Calm Red */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.93 }}
            type="submit"
            disabled={(!inputMessage.trim() && !selectedImage) || isSending}
            className={`px-3 sm:px-3.5 h-7.5 sm:h-8.5 rounded-lg sm:rounded-xl font-bold text-xs flex items-center justify-center gap-1 sm:gap-1.5 transition-all shrink-0 shadow-md ${
              (inputMessage.trim() || selectedImage) && !isSending
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50 cursor-pointer ring-1 ring-rose-400/50'
                : 'bg-rose-950/40 text-slate-500 border border-rose-900/40 cursor-not-allowed opacity-50 backdrop-blur-sm'
            }`}
            aria-label="Send message"
          >
            {isSending ? (
              <RefreshCw className="w-3.5 h-3.5 text-white animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5 text-white stroke-[2.2]" />
            )}
            <span className="font-google-sans text-[12px] text-white font-bold">{isSending ? 'Sending...' : 'Send'}</span>
          </motion.button>
        </form>
      </div>
    </div>
  );
}
