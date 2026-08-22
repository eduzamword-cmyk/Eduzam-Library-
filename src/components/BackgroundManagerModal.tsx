import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  PhoneCall,
  PhoneOff,
  PhoneIncoming,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Wifi,
  RadioTower,
  MapPin,
  Compass,
  DownloadCloud,
  UploadCloud,
  Pause,
  Play,
  RotateCw,
  BatteryCharging,
  Battery,
  Moon,
  Clock,
  Database,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  Layers,
  FileText,
  AlertCircle,
  X,
  Trash2,
  ChevronRight
} from 'lucide-react';
import {
  backgroundService,
  BackgroundTransferItem,
  GeofenceZone,
  BackgroundSyncConfig,
  BackgroundVoIPCall,
} from '../lib/backgroundService';

interface BackgroundManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BackgroundManagerModal({ isOpen, onClose }: BackgroundManagerModalProps) {
  const [activeTab, setActiveTab] = useState<'silent_push' | 'voip' | 'location' | 'transfers' | 'power_cache'>('silent_push');
  const [config, setConfig] = useState<BackgroundSyncConfig>(backgroundService.getConfig());
  const [transfers, setTransfers] = useState<BackgroundTransferItem[]>(backgroundService.getTransfers());
  const [geofences, setGeofences] = useState<GeofenceZone[]>(backgroundService.getGeofences());
  const [voip, setVoip] = useState<BackgroundVoIPCall>(backgroundService.getVoIPState());
  const [power, setPower] = useState(backgroundService.getPowerStatus());
  const [silentLog, setSilentLog] = useState(backgroundService.getSilentPushLog());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshNotice, setRefreshNotice] = useState<string | null>(null);

  useEffect(() => {
    const unsub = backgroundService.subscribe(() => {
      setConfig(backgroundService.getConfig());
      setTransfers(backgroundService.getTransfers());
      setGeofences(backgroundService.getGeofences());
      setVoip(backgroundService.getVoIPState());
      setPower(backgroundService.getPowerStatus());
      setSilentLog(backgroundService.getSilentPushLog());
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  const handleTriggerSilentPush = async () => {
    setIsRefreshing(true);
    const res = await backgroundService.triggerSilentPushRefresh('Manual Trigger');
    setIsRefreshing(false);
    if (res.success) {
      setRefreshNotice(`Success! Prefetched ${res.itemsUpdated} updated syllabus & circular items silently in background.`);
      setTimeout(() => setRefreshNotice(null), 4000);
    }
  };

  const handleStartTestCall = () => {
    backgroundService.startIncomingCallSimulation('Hon. Dr. Kangwa Mwewa', 'Permanent Secretary, Ministry of Education');
  };

  const handleAddNewTransfer = () => {
    backgroundService.addTransfer({
      fileName: `Grade12_National_Exam_Exemplars_${Math.floor(Math.random() * 900 + 100)}.pdf`,
      fileSize: 58000000,
      transferredBytes: 4000000,
      type: 'download',
      status: 'active',
      speed: '2.5 MB/s',
      progress: 7,
      category: 'curriculum',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* MODAL HEADER */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 backdrop-blur-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Background Services Engine</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Silent Push, VoIP Audio, Geofence Tracking, Resumable Transfers & Power Cache
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NAVIGATION TABS */}
        <div className="px-6 pt-3 flex gap-2 border-b border-slate-800 bg-slate-950/40 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('silent_push')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'silent_push'
                ? 'border-indigo-400 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <RadioTower className="w-4 h-4" />
            1. Silent Push (Data Refresh)
          </button>
          <button
            onClick={() => setActiveTab('voip')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'voip'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            2. Background VoIP / Audio
          </button>
          <button
            onClick={() => setActiveTab('location')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'location'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            3. Location & Geofencing
          </button>
          <button
            onClick={() => setActiveTab('transfers')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'transfers'
                ? 'border-amber-400 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <DownloadCloud className="w-4 h-4" />
            4. Resumable Transfers
          </button>
          <button
            onClick={() => setActiveTab('power_cache')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'power_cache'
                ? 'border-purple-400 text-purple-400 bg-purple-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Battery className="w-4 h-4" />
            5. Power, Habit & Cache
          </button>
        </div>

        {/* CONTENT BODY */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)] space-y-6">
          {refreshNotice && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-emerald-200 text-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{refreshNotice}</span>
              </div>
              <button onClick={() => setRefreshNotice(null)} className="text-emerald-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}

          {/* TAB 1: SILENT PUSH (DATA REFRESH) */}
          {activeTab === 'silent_push' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">Silent Sync Engine</span>
                    <Radio className="w-4 h-4 text-indigo-400 animate-pulse" />
                  </div>
                  <div className="text-lg font-bold text-white">
                    {config.silentPushEnabled ? 'Enabled (Active)' : 'Paused'}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Pre-fetches new circulars & roster updates before user opens views.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">Last Silent Sync</span>
                    <Clock className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-lg font-bold text-white">
                    {new Date(config.lastSyncTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Stale data served immediately while background workers update.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">Local Cache Keys</span>
                    <Database className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-lg font-bold text-white">
                    {config.cachedEntriesCount} Datasets Cached
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Persistent cache prevents blank loading states on network drop.
                  </p>
                </div>
              </div>

              {/* ACTION ROW */}
              <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-white">Simulate Cloud Silent Push Trigger</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Instructs the applet to pre-fetch new content in the background without disturbing user workflow.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => backgroundService.updateConfig({ silentPushEnabled: !config.silentPushEnabled })}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      config.silentPushEnabled
                        ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                        : 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-500'
                    }`}
                  >
                    {config.silentPushEnabled ? 'Disable Engine' : 'Enable Engine'}
                  </button>

                  <button
                    disabled={isRefreshing}
                    onClick={handleTriggerSilentPush}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 to-cyan-500 text-white hover:opacity-90 transition-opacity flex items-center gap-2 shadow-md shadow-indigo-500/20 disabled:opacity-50"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>{isRefreshing ? 'Pre-fetching Data...' : 'Trigger Silent Push'}</span>
                  </button>
                </div>
              </div>

              {/* SILENT PUSH RECENT AUDIT LOG */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Recent Silent Background Prefetch Activity
                </h4>
                <div className="space-y-2">
                  {silentLog.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 text-center text-xs text-slate-400">
                      No silent pushes recorded yet. Click "Trigger Silent Push" to test background pre-fetching.
                    </div>
                  ) : (
                    silentLog.map((log) => (
                      <div
                        key={log.id}
                        className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="text-slate-200 font-medium">{log.title}</span>
                        </div>
                        <span className="text-slate-400 font-mono text-[11px]">
                          {new Date(log.time).toLocaleTimeString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BACKGROUND AUDIO / VoIP */}
          {activeTab === 'voip' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <PhoneCall className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-base font-bold text-white">Low-Energy VoIP & Background Audio</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl">
                    Maintains a lightweight background socket to receive incoming administrative calls, dispatch announcements, and push-to-talk staffroom walkie-talkie audio even while browsing other modules.
                  </p>
                </div>

                <button
                  onClick={handleStartTestCall}
                  className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/20 transition-all shrink-0"
                >
                  <PhoneIncoming className="w-4 h-4 animate-bounce" />
                  <span>Simulate Incoming VoIP Call</span>
                </button>
              </div>

              {/* LIVE CALL CONTROLLER (IF ACTIVE) */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 shadow-xl">
                <div className="flex items-center justify-between mb-4 border-b border-slate-700/60 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                      <Radio className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {voip.status === 'connected'
                          ? `In Call: ${voip.callerName}`
                          : voip.status === 'ringing'
                          ? `Incoming: ${voip.callerName}`
                          : 'VoIP Standby Grid (Listening for Incoming Traffic)'}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {voip.status === 'connected'
                          ? `Channel: ${voip.channel} • ${Math.floor(voip.durationSeconds / 60)}:${(voip.durationSeconds % 60).toString().padStart(2, '0')}`
                          : 'Background audio socket active with low battery consumption'}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                    voip.status === 'connected'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : voip.status === 'ringing'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                      : 'bg-slate-700/50 text-slate-300 border-slate-600'
                  }`}>
                    {voip.status === 'connected' ? 'Connected (VoIP)' : voip.status === 'ringing' ? 'Ringing...' : 'Standby'}
                  </span>
                </div>

                {voip.status === 'ringing' && (
                  <div className="flex items-center justify-between p-3 bg-amber-950/40 border border-amber-700/50 rounded-xl">
                    <div className="text-xs text-amber-200">
                      Incoming VoIP call from <span className="font-bold">{voip.callerName}</span> ({voip.callerRole})
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => backgroundService.endCall()}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => backgroundService.answerCall()}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 animate-pulse"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        Answer
                      </button>
                    </div>
                  </div>
                )}

                {voip.status === 'connected' && (
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => backgroundService.toggleMute()}
                        className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          voip.isMuted
                            ? 'bg-rose-600/20 text-rose-300 border-rose-500/40'
                            : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {voip.isMuted ? <MicOff className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4 text-emerald-400" />}
                        <span>{voip.isMuted ? 'Muted' : 'Mic Active'}</span>
                      </button>

                      <button
                        onClick={() => backgroundService.toggleSpeaker()}
                        className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          voip.isSpeakerOn
                            ? 'bg-cyan-600/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {voip.isSpeakerOn ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                        <span>{voip.isSpeakerOn ? 'Speaker HD' : 'Earpiece'}</span>
                      </button>
                    </div>

                    <button
                      onClick={() => backgroundService.endCall()}
                      className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30"
                    >
                      <PhoneOff className="w-4 h-4" />
                      <span>End VoIP Call</span>
                    </button>
                  </div>
                )}

                {/* WALKIE-TALKIE PUSH-TO-TALK MODE */}
                <div className="mt-4 pt-4 border-t border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-semibold text-slate-300">Staffroom Push-to-Talk (PTT) Intercom</span>
                  </div>
                  <button
                    onMouseDown={() => backgroundService.toggleWalkieTalkie(true)}
                    onMouseUp={() => backgroundService.toggleWalkieTalkie(false)}
                    onTouchStart={() => backgroundService.toggleWalkieTalkie(true)}
                    onTouchEnd={() => backgroundService.toggleWalkieTalkie(false)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold select-none border transition-all ${
                      voip.isWalkieTalkieActive
                        ? 'bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-500/40 animate-pulse'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 active:bg-emerald-600'
                    }`}
                  >
                    {voip.isWalkieTalkieActive ? 'Transmitting Audio...' : 'Hold to Transmit (PTT)'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LOCATION & GEOFENCING */}
          {activeTab === 'location' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Compass className="w-4 h-4 text-emerald-400" />
                    Significant Change & Visits Mode
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Conserves battery by updating coordinates only on major cell tower transitions or zone visits.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {(['significant_change', 'visits', 'high_precision'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => backgroundService.updateConfig({ locationMode: mode })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border capitalize transition-all ${
                        config.locationMode === mode
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {mode.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* GEOFENCE ZONES TABLE */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Active Educational Geofences & Automated Actions
                  </h4>
                  <span className="text-xs text-slate-400">
                    {geofences.filter(g => g.status === 'inside').length} of {geofences.length} Zones Active
                  </span>
                </div>

                <div className="space-y-3">
                  {geofences.map((zone) => {
                    const isInside = zone.status === 'inside';
                    return (
                      <div
                        key={zone.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isInside
                            ? 'bg-emerald-950/20 border-emerald-700/50 shadow-sm'
                            : 'bg-slate-800/30 border-slate-700/40'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-start gap-3">
                            <div className={`p-2.5 rounded-xl shrink-0 ${
                              isInside ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700/40 text-slate-400'
                            }`}>
                              <MapPin className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="text-sm font-bold text-white">{zone.name}</h5>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                                  isInside
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                    : 'bg-slate-700/40 text-slate-400 border-slate-600'
                                }`}>
                                  {isInside ? 'Inside Zone' : 'Outside Zone'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                <span>Action: {zone.autoAction}</span>
                              </p>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                Perimeter Radius: {zone.radiusMeters}m • Coordinates: {zone.latitude.toFixed(4)}, {zone.longitude.toFixed(4)}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => backgroundService.toggleGeofenceStatus(zone.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all shrink-0 self-start sm:self-center ${
                              isInside
                                ? 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
                                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                            }`}
                          >
                            {isInside ? 'Simulate Exit' : 'Simulate Entry'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RESUMABLE TRANSFERS */}
          {activeTab === 'transfers' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <DownloadCloud className="w-4 h-4 text-amber-400" />
                    URLSession & Resumable Background Transfers
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Large syllabus media, markbook archives, and exam papers continue transferring across device sleep or network drops.
                  </p>
                </div>

                <button
                  onClick={handleAddNewTransfer}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-600/20 transition-all shrink-0"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Queue Background Bundle</span>
                </button>
              </div>

              {/* TRANSFERS LIST */}
              <div className="space-y-3">
                {transfers.map((item) => {
                  const isCompleted = item.status === 'completed';
                  const isPaused = item.status === 'paused';
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-xl shrink-0 ${
                            item.type === 'upload' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-cyan-500/20 text-cyan-300'
                          }`}>
                            {item.type === 'upload' ? <UploadCloud className="w-4 h-4" /> : <DownloadCloud className="w-4 h-4" />}
                          </div>
                          <div>
                            <h5 className="text-sm font-bold text-white truncate max-w-md">{item.fileName}</h5>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mt-0.5 font-mono">
                              <span>{(item.transferredBytes / 1000000).toFixed(1)} MB / {(item.fileSize / 1000000).toFixed(1)} MB</span>
                              <span>•</span>
                              <span className="text-cyan-300 font-semibold">{item.speed}</span>
                              <span>•</span>
                              <span className="text-slate-500">Token: {item.resumableToken}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {!isCompleted && (
                            <button
                              onClick={() => backgroundService.toggleTransferPause(item.id)}
                              className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold"
                            >
                              {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
                            </button>
                          )}
                          <button
                            onClick={() => backgroundService.removeTransfer(item.id)}
                            className="p-2 rounded-xl bg-slate-700 hover:bg-rose-600/30 text-slate-400 hover:text-rose-300 text-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* PROGRESS BAR */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                          <span className="capitalize">{item.status}</span>
                          <span>{item.progress}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isCompleted
                                ? 'bg-emerald-500'
                                : isPaused
                                ? 'bg-amber-500'
                                : 'bg-gradient-to-r from-cyan-500 to-indigo-500'
                            }`}
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: POWER, HABIT & PERSISTENT CACHE */}
          {activeTab === 'power_cache' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* POWER & BATTERY STATUS */}
                <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <BatteryCharging className="w-4 h-4 text-emerald-400" />
                      Battery & Low-Power State
                    </h4>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {power.batteryLevel}% {power.isCharging ? '(Charging)' : ''}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Heavy background synchronization automatically throttles when battery drops below 20% to prevent unexpected power drains.
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
                    <span className="text-xs text-slate-300">Power Throttling Engine</span>
                    <button
                      onClick={() => backgroundService.updateConfig({ lowPowerModeThrottling: !config.lowPowerModeThrottling })}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                        config.lowPowerModeThrottling
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-700 text-slate-400 border-slate-600'
                      }`}
                    >
                      {config.lowPowerModeThrottling ? 'Active (Auto-Throttle)' : 'Disabled'}
                    </button>
                  </div>
                </div>

                {/* HABIT LEARNING */}
                <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      Habit-Based Pre-fetch (7 AM Routine)
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Learned
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Intelligently schedules daily syllabus digests and inspection schedules before morning staffroom roll-call.
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
                    <span className="text-xs text-slate-300">Intelligent Habit Scheduler</span>
                    <button
                      onClick={() => backgroundService.updateConfig({ intelligentHabitRefresh: !config.intelligentHabitRefresh })}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                        config.intelligentHabitRefresh
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                          : 'bg-slate-700 text-slate-400 border-slate-600'
                      }`}
                    >
                      {config.intelligentHabitRefresh ? 'Active' : 'Off'}
                    </button>
                  </div>
                </div>
              </div>

              {/* PERSISTENT CACHE & TASK EXPIRATION HANDLERS */}
              <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-purple-400" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Persistent Local Cache & Task Expiration Handlers</h4>
                      <p className="text-xs text-slate-400">
                        Uses Stale-While-Revalidate pattern with Page Lifecycle API to save checkpoints and resume without state loss.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                    <span className="text-slate-400 block mb-1">State Expiration Handler</span>
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      visibilitychange Active
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                    <span className="text-slate-400 block mb-1">Crash Recovery Hook</span>
                    <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      beforeunload Armed
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                    <span className="text-slate-400 block mb-1">Stale Data Tolerance</span>
                    <span className="font-bold text-purple-400 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      Instant Stale Display
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Background workers running seamlessly in sandboxed thread.</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-colors"
          >
            Close Manager
          </button>
        </div>
      </motion.div>
    </div>
  );
}
