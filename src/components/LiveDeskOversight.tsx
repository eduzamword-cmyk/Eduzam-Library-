import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  MessageSquare, 
  Users, 
  Activity, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Send, 
  Eye, 
  School,
  Lock
} from 'lucide-react';

export default function LiveDeskOversight() {
  const [activeTab, setActiveTab] = useState<'chats' | 'audits' | 'activity'>('chats');
  const [selectedChat, setSelectedChat] = useState<number | null>(1);
  const [replyText, setReplyText] = useState('');

  const liveChats = [
    {
      id: 1,
      school: 'Capital Boys Secondary School',
      sender: 'Teacher Mutale (Grade 11 Head)',
      time: 'Just now',
      message: 'Submitting finalized Markbook for Grade 12 Natural Sciences. Please confirm reception.',
      unread: true,
      status: 'Active',
      history: [
        { sender: 'Teacher Mutale', time: '10:42 AM', text: 'Good morning Super Admin. We have uploaded the 8 core subjects for 120 candidates.' },
        { sender: 'System Admin', time: '10:44 AM', text: 'Received. Validation algorithms are running automated integrity checks.' },
        { sender: 'Teacher Mutale', time: '10:45 AM', text: 'Submitting finalized Markbook for Grade 12 Natural Sciences. Please confirm reception.' }
      ]
    },
    {
      id: 2,
      school: 'Capital University',
      sender: 'Registrar Office',
      time: '4 mins ago',
      message: 'Verification requested for 45 incoming first-year Grade 12 result transcripts.',
      unread: false,
      status: 'In Progress',
      history: [
        { sender: 'Registrar Office', time: '10:20 AM', text: 'Verification requested for 45 incoming first-year Grade 12 result transcripts.' },
        { sender: 'System Admin', time: '10:25 AM', text: 'Transcripts verified against national repository.' }
      ]
    },
    {
      id: 3,
      school: 'Central Girls Secondary',
      sender: 'Head Teacher Banda',
      time: '12 mins ago',
      message: 'Teacher License renewal batch submitted for 28 staff members.',
      unread: false,
      status: 'Resolved',
      history: [
        { sender: 'Head Teacher Banda', time: '09:50 AM', text: 'Teacher License renewal batch submitted for 28 staff members.' }
      ]
    }
  ];

  const auditLogs = [
    { id: 'LOG-9081', user: 'chikwandab2@gmail.com', role: 'SUPER_ADMIN', action: 'EXPORT_MARKBOOK', target: 'Capital Province Grade 12', time: '2 mins ago', status: 'Success' },
    { id: 'LOG-9080', user: 'mutale.m@moe.edu', role: 'TEACHER', action: 'UPDATE_STUDENT_MARKS', target: 'Student: MWABA CHARLES (2026-0001)', time: '5 mins ago', status: 'Success' },
    { id: 'LOG-9079', user: 'banda.k@univ.edu', role: 'INSTITUTION_ADMIN', action: 'VERIFY_TRANSCRIPT', target: 'Transcript #88412', time: '14 mins ago', status: 'Success' },
    { id: 'LOG-9078', user: 'guest.user@external.edu', role: 'GUEST', action: 'UNAUTHORIZED_ACCESS_ATTEMPT', target: '/api/super-admin/audit', time: '32 mins ago', status: 'Blocked' }
  ];

  const handleSendMessage = () => {
    if (!replyText.trim()) return;
    const chat = liveChats.find(c => c.id === selectedChat);
    if (chat) {
      chat.history.push({
        sender: 'Super Admin',
        time: 'Just now',
        text: replyText
      });
      setReplyText('');
    }
  };

  const currentChatObj = liveChats.find(c => c.id === selectedChat);

  return (
    <div className="w-full space-y-8 pb-16 font-sans">
      {/* Header Banner */}
      <div className="w-full bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/20 backdrop-blur-md rounded-full text-xs font-black text-amber-100 border border-white/20">
              <ShieldCheck className="w-4 h-4 text-amber-200" />
              SUPER ADMIN PRIVILEGE LEVEL 5
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Live Desk & Super Admin Oversight
            </h1>
            <p className="text-amber-100 text-sm max-w-2xl font-medium">
              Observe platform-wide communications, monitor active school inquiries, and oversee national audit trails in real time.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
            <Activity className="w-6 h-6 text-emerald-300 animate-pulse" />
            <div>
              <p className="text-xs text-amber-100 font-bold uppercase">System Status</p>
              <p className="text-sm font-black text-white">100% Synchronized</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl max-w-md">
        <button
          onClick={() => setActiveTab('chats')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
            activeTab === 'chats' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Live Inquiries ({liveChats.length})
        </button>
        <button
          onClick={() => setActiveTab('audits')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
            activeTab === 'audits' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Lock className="w-4 h-4" />
          Security Audits
        </button>
      </div>

      {activeTab === 'chats' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Chat List */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 px-1">
              Active Conversations
            </h3>
            <div className="space-y-2">
              {liveChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all relative overflow-hidden ${
                    selectedChat === chat.id 
                      ? 'bg-amber-500/10 border-amber-400 text-slate-900 shadow-sm' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                      {chat.school}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">{chat.time}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-800">{chat.sender}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{chat.message}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Right Active Chat Console */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between min-h-[480px] shadow-xs">
            {currentChatObj ? (
              <>
                {/* Chat Header */}
                <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold">
                      <School className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">{currentChatObj.school}</h3>
                      <p className="text-xs font-semibold text-slate-500">{currentChatObj.sender}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {currentChatObj.status}
                  </span>
                </div>

                {/* Messages Body */}
                <div className="space-y-4 py-6 overflow-y-auto max-h-[320px]">
                  {currentChatObj.history.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${
                        msg.sender.includes('Super Admin') || msg.sender.includes('System')
                          ? 'items-end'
                          : 'items-start'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] text-slate-300">{msg.time}</span>
                      </div>
                      <div
                        className={`max-w-md p-3.5 rounded-2xl text-sm font-medium ${
                          msg.sender.includes('Super Admin')
                            ? 'bg-amber-500 text-white rounded-tr-none'
                            : msg.sender.includes('System')
                            ? 'bg-slate-900 text-white rounded-tr-none'
                            : 'bg-slate-100 text-slate-800 rounded-tl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply Bar */}
                <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type official super admin response..."
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold text-sm flex items-center gap-2 shadow-xs transition-all active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </button>
                </div>
              </>
            ) : (
              <div className="m-auto text-center text-slate-400 py-12">
                Select a live inquiry to view discussion log
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'audits' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">National Platform Security Logs</h3>
              <p className="text-xs text-slate-500">Immutable audit trails across all administrative actions</p>
            </div>
            <button className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors">
              <Filter className="w-3.5 h-3.5" />
              Filter Logs
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-black uppercase text-slate-400">
                  <th className="p-4">Log ID</th>
                  <th className="p-4">User Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Target Resource</th>
                  <th className="p-4">Time</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-mono text-slate-900 font-bold">{log.id}</td>
                    <td className="p-4 font-bold text-teal-800">{log.user}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-bold text-[10px]">
                        {log.role}
                      </span>
                    </td>
                    <td className="p-4 font-bold">{log.action}</td>
                    <td className="p-4 text-slate-600">{log.target}</td>
                    <td className="p-4 text-slate-400">{log.time}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                        log.status === 'Success' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
