import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, VideoOff, Mic, MicOff, PhoneOff, Monitor, ShieldCheck, 
  MessageSquare, User, Brain, FileText, CheckCircle2, Clock, Camera, AlertCircle
} from 'lucide-react';

export default function TelehealthRoom({ theme, user, setActiveTab }) {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCallActive, setIsCallActive] = useState(true);
  const [hasMediaPermission, setHasMediaPermission] = useState(false);
  const [permissionError, setPermissionError] = useState('');
  const [seconds, setSeconds] = useState(252);

  const localVideoRef = useRef(null);
  const isPatientUser = user?.role === 'patient';
  // Signed consultation notes are kept in this browser (the backend has no notes endpoint).
  const [savedNotes, setSavedNotes] = useState(() => { try { return JSON.parse(localStorage.getItem('edras_consult_notes') || '[]'); } catch { return []; } });
  const saveConsultation = () => {
    const text = (clinicalNotes || '').trim();
    if (!text) return;
    const next = [{ at: new Date().toISOString(), by: user?.full_name || 'Clinician', text, duration: seconds }, ...savedNotes].slice(0, 50);
    setSavedNotes(next);
    try { localStorage.setItem('edras_consult_notes', JSON.stringify(next)); } catch { /* storage full */ }
  };
  const peer = isPatientUser ? { name: 'Dr. Alex Mercer, MD', role: 'Chief Neuro-Consultant', initial: 'D' } : { name: 'Eleanor Vance', role: 'Patient · 74 yrs', initial: 'E' };
  const mediaStreamRef = useRef(null);

  const [clinicalNotes, setClinicalNotes] = useState('Patient exhibits mild cognitive fatigue. MMSE 25/30. MRI indicates stable hippocampal volume. Recommend 6-month follow up.');

  // Timer
  useEffect(() => {
    let timer;
    if (isCallActive) {
      timer = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isCallActive]);

  // WebRTC UserMedia Access (Camera + Mic)
  const startCameraAndMic = async () => {
    try {
      setPermissionError('');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 1280 }, height: { ideal: 720 } }, 
        audio: true 
      });
      
      mediaStreamRef.current = stream;
      setHasMediaPermission(true);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera/Mic Access Note:', err.message);
      setPermissionError('Camera or Microphone access was restricted by browser. Click "Enable Camera & Mic" to authorize.');
    }
  };

  useEffect(() => {
    if (isCallActive) {
      startCameraAndMic();
    }

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCallActive]);

  // Attach the stream whenever the self-view <video> (re)mounts. Before, it was assigned
  // before the element existed, so the self-view stayed black.
  useEffect(() => {
    if (localVideoRef.current && mediaStreamRef.current) localVideoRef.current.srcObject = mediaStreamRef.current;
  }, [hasMediaPermission, isVideoOn, isCallActive]);

  // Toggle Video Track
  const toggleVideo = () => {
    if (mediaStreamRef.current) {
      const videoTrack = mediaStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoOn;
      }
    }
    setIsVideoOn(!isVideoOn);
  };

  // Toggle Mic Track
  const toggleMic = () => {
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isMicOn;
      }
    }
    setIsMicOn(!isMicOn);
  };

  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-3 py-1 text-xs font-extrabold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> HIPAA ENCRYPTED TELEHEALTH SESSION
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Live WebRTC Video & Voice Call Room</h1>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-800 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span className="text-sm font-black font-mono text-slate-900 dark:text-white">{formatTime(seconds)}</span>
          </div>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className="px-4 py-2 rounded-2xl btn-soft-secondary text-xs font-bold"
          >
            Subscription Credits
          </button>
        </div>
      </div>

      {permissionError && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{permissionError}</span>
          </div>
          <button
            onClick={startCameraAndMic}
            className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-extrabold cursor-pointer hover:bg-amber-700 transition-all shrink-0"
          >
            Authorize Camera & Mic Access
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Video Call Screen (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="med-panel rounded-3xl border border-sky-200/80 dark:border-slate-800 overflow-hidden relative min-h-[480px] bg-slate-950 flex flex-col justify-between p-6 shadow-2xl">
            
            {/* Top Bar Overlay inside Video */}
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center space-x-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-800">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-xs font-extrabold text-white">Live Call: Dr. Alex Mercer & {user?.full_name || 'Patient'}</span>
              </div>
              <span className="text-xs font-mono text-cyan-400 bg-slate-900/80 px-3 py-1.5 rounded-2xl border border-slate-800 font-bold">
                {hasMediaPermission ? 'WebRTC Live Stream' : 'Camera Ready'}
              </span>
            </div>

            {/* Main Video View Elements */}
            {isCallActive ? (
              <div className="absolute inset-0 overflow-hidden flex items-center justify-center bg-slate-950">
                {/* Remote participant: no peer stream exists in this build, so show their card
                    (previously this tile mirrored YOUR own camera as if it were the doctor). */}
                {(
                  <div className="text-center space-y-3">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-sky-500 to-cyan-500 flex items-center justify-center text-white text-3xl font-black mx-auto shadow-2xl animate-pulse">
                      {peer.initial}
                    </div>
                    <h3 className="text-lg font-black text-white">{peer.name}</h3>
                    <p className="text-xs text-cyan-400 font-mono font-extrabold uppercase">{peer.role} • Waiting for their video</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950 text-white">
                <p className="text-sm font-extrabold text-slate-400">Telehealth Session Ended.</p>
              </div>
            )}

            {/* PIP Local Camera Preview (Bottom-Right Overlay) */}
            {isCallActive && (
              <div className="absolute bottom-20 right-6 w-44 h-32 rounded-2xl bg-slate-900 border-2 border-cyan-500/80 overflow-hidden shadow-2xl z-20 flex items-center justify-center">
                {hasMediaPermission && isVideoOn ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                ) : (
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full bg-sky-500 text-white font-bold flex items-center justify-center text-xs mx-auto mb-1">
                      {user?.full_name ? user.full_name.charAt(0) : 'U'}
                    </div>
                    <span className="text-[10px] text-slate-300 font-bold">You (Self View)</span>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Call Controls Bar */}
            <div className="z-20 flex items-center justify-center space-x-4 bg-slate-900/90 backdrop-blur-md py-3 px-6 rounded-3xl border border-slate-800 max-w-md mx-auto">
              <button
                onClick={toggleMic}
                className={`p-3.5 rounded-2xl cursor-pointer transition-all ${
                  isMicOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-500/20 text-red-400 border border-red-500/40'
                }`}
                title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
              >
                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                onClick={toggleVideo}
                className={`p-3.5 rounded-2xl cursor-pointer transition-all ${
                  isVideoOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-500/20 text-red-400 border border-red-500/40'
                }`}
                title={isVideoOn ? 'Turn Off Camera' : 'Turn On Camera'}
              >
                {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              <button
                onClick={startCameraAndMic}
                className="p-3.5 rounded-2xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/40 hover:bg-cyan-600/30 cursor-pointer transition-all"
                title="Enable / Switch WebRTC Camera & Mic"
              >
                <Camera className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsCallActive(!isCallActive)}
                className="p-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white cursor-pointer transition-all shadow-lg shadow-red-600/30"
                title="End Telehealth Call"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>

        {/* Doctor Diagnostic Notes Drawer (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="med-panel p-6 rounded-3xl border border-sky-200/80 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> In-Call Clinical Diagnostic Notes
            </h3>

            <textarea
              rows="8"
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-800 rounded-2xl p-4 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-medium leading-relaxed"
            />

            <button
              onClick={saveConsultation}
              className="w-full py-3 rounded-2xl btn-soft-primary font-extrabold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save & Sign Consultation Record</span>
            </button>
            {savedNotes.length > 0 && (
              <div className="space-y-2" aria-live="polite">
                <p className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Signed records</p>
                {savedNotes.slice(0, 3).map((n) => (
                  <div key={n.at} className="p-3 rounded-2xl bg-sky-50/80 dark:bg-slate-900/80 border border-sky-200/60 dark:border-slate-800 text-[11px]">
                    <p className="font-bold text-slate-900 dark:text-white">{new Date(n.at).toLocaleString()} · {n.by}</p>
                    <p className="text-slate-600 dark:text-slate-400 line-clamp-2">{n.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
