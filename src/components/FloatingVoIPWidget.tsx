import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PhoneCall,
  PhoneOff,
  PhoneIncoming,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { backgroundService, BackgroundVoIPCall } from '../lib/backgroundService';

export default function FloatingVoIPWidget() {
  const [voip, setVoip] = useState<BackgroundVoIPCall>(backgroundService.getVoIPState());
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const unsub = backgroundService.subscribe(() => {
      setVoip(backgroundService.getVoIPState());
    });
    return unsub;
  }, []);

  if (voip.status === 'idle') return null;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 pointer-events-auto">
      <AnimatePresence>
        {voip.status === 'ringing' && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-80 sm:w-96 p-4 rounded-3xl bg-slate-900/95 border-2 border-cyan-500/80 text-white shadow-2xl backdrop-blur-md flex flex-col gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={voip.callerAvatar}
                  alt={voip.callerName}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-cyan-400"
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 animate-ping" />
              </div>
              <div className="overflow-hidden flex-1">
                <div className="text-xs uppercase font-extrabold tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <PhoneIncoming className="w-3.5 h-3.5 animate-bounce" />
                  <span>Incoming VoIP Call</span>
                </div>
                <div className="font-bold text-sm truncate text-white">{voip.callerName}</div>
                <div className="text-[11px] text-slate-400 truncate">{voip.callerRole}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => backgroundService.endCall()}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/30 transition-colors"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Decline</span>
              </button>

              <button
                onClick={() => backgroundService.answerCall()}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 transition-colors animate-pulse"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Answer</span>
              </button>
            </div>
          </motion.div>
        )}

        {voip.status === 'connected' && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`rounded-3xl bg-slate-900/95 border border-cyan-500/50 text-white shadow-2xl backdrop-blur-md transition-all ${
              isMinimized ? 'p-3 flex items-center gap-3 w-auto' : 'w-80 sm:w-96 p-4 flex flex-col gap-3'
            }`}
          >
            {isMinimized ? (
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-cyan-300">
                  VoIP Call ({Math.floor(voip.durationSeconds / 60)}:{(voip.durationSeconds % 60).toString().padStart(2, '0')})
                </span>
                <button
                  onClick={() => setIsMinimized(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-300"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => backgroundService.endCall()}
                  className="p-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white"
                >
                  <PhoneOff className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-cyan-300">Background VoIP Stream Active</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-xs text-slate-300 mr-2">
                      {Math.floor(voip.durationSeconds / 60)}:{(voip.durationSeconds % 60).toString().padStart(2, '0')}
                    </span>
                    <button
                      onClick={() => setIsMinimized(true)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white"
                    >
                      <Minimize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={voip.callerAvatar}
                    alt={voip.callerName}
                    className="w-10 h-10 rounded-xl object-cover border border-cyan-400/60"
                  />
                  <div className="overflow-hidden flex-1">
                    <div className="font-bold text-sm truncate text-white">{voip.callerName}</div>
                    <div className="text-[11px] text-slate-400 truncate">{voip.callerRole}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => backgroundService.toggleMute()}
                      className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                        voip.isMuted
                          ? 'bg-rose-600/30 text-rose-300 border border-rose-500/40'
                          : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {voip.isMuted ? <MicOff className="w-3.5 h-3.5 text-rose-400" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
                      <span className="text-[11px]">{voip.isMuted ? 'Muted' : 'Mic'}</span>
                    </button>

                    <button
                      onClick={() => backgroundService.toggleSpeaker()}
                      className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                        voip.isSpeakerOn
                          ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40'
                          : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {voip.isSpeakerOn ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
                      <span className="text-[11px]">{voip.isSpeakerOn ? 'Speaker' : 'Ear'}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => backgroundService.endCall()}
                    className="p-2 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30"
                  >
                    <PhoneOff className="w-3.5 h-3.5" />
                    <span>Hang Up</span>
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
