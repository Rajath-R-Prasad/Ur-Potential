import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api';
import { CheckCircle, SkipForward, Play, ArrowLeft } from 'lucide-react';

export default function Focus() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const task = location.state?.task || { title: "Loading...", id };

  const [phase, setPhase] = useState('countdown'); // countdown, focus, complete
  const [timeLeft, setTimeLeft] = useState(3);
  const audioCtxRef = useRef(null);

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  const playBeep = (freq = 440, type = 'sine', duration = 0.2) => {
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.error(e);
    }
  };

  const playSuccess = () => {
    playBeep(440, 'triangle', 0.1);
    setTimeout(() => playBeep(660, 'triangle', 0.2), 150);
    setTimeout(() => playBeep(880, 'triangle', 0.4), 300);
  };

  useEffect(() => {
    let timer;
    if (phase === 'countdown') {
      if (timeLeft > 0) {
        timer = setTimeout(() => {
          playBeep(600, 'sine', 0.1);
          setTimeLeft(t => t - 1);
        }, 1000);
      } else if (timeLeft === 0) {
        playBeep(880, 'square', 0.3);
        setPhase('focus');
        setTimeLeft(120); // 2 minutes activation
      }
    } else if (phase === 'focus') {
      if (timeLeft > 0) {
        timer = setTimeout(() => {
          setTimeLeft(t => t - 1);
        }, 1000);
      } else if (timeLeft === 0) {
        playSuccess();
        setPhase('complete');
      }
    }
    return () => clearTimeout(timer);
  }, [phase, timeLeft]);

  const handleDone = async () => {
    await api.updateTask(task.id, { is_completed: true });
    await api.logSession(task.id, 120, true);
    navigate('/');
  };

  const handleContinue = async () => {
    await api.logSession(task.id, 120, true);
    setPhase('focus');
    setTimeLeft(600); // extension to 10 minutes
  };

  const handleSkip = () => {
    api.logSession(task.id, 120 - timeLeft, false);
    navigate('/');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black/80 pointer-events-none" />

      <button onClick={handleSkip} className="absolute top-8 left-8 text-slate-500 hover:text-white transition flex items-center gap-2 z-10">
        <ArrowLeft size={20} /> Back
      </button>

      <div className="z-10 w-full max-w-xl text-center">
        <motion.p 
          className="text-purple-400 font-medium tracking-widest uppercase mb-4 text-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {phase === 'countdown' ? 'Get Ready' : phase === 'focus' ? 'Focus Mode' : 'Great Job!'}
        </motion.p>
        
        <motion.h2 
          className="text-4xl md:text-5xl font-bold text-white mb-20 drop-shadow-lg"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        >
          {task.title}
        </motion.h2>

        <AnimatePresence mode="wait">
          {phase === 'countdown' && (
            <motion.div
              key={timeLeft}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-purple-400 drop-shadow-[0_0_30px_rgba(168,85,247,0.4)]"
            >
              {timeLeft > 0 ? timeLeft : 'GO!'}
            </motion.div>
          )}

          {phase === 'focus' && (
            <motion.div
              key="timer"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-64 h-64 mx-auto flex items-center justify-center"
            >
              <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
              <motion.svg 
                className="absolute inset-0 w-full h-full -rotate-90 z-10"
                viewBox="0 0 100 100"
              >
                <motion.circle
                  cx="50" cy="50" r="48"
                  fill="none"
                  strokeWidth="4"
                  stroke="url(#gradient)"
                  strokeLinecap="round"
                  initial={{ pathLength: 1 }}
                  animate={{ pathLength: timeLeft / (timeLeft > 120 ? 600 : 120) }}
                  transition={{ duration: 1, ease: 'linear' }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#c084fc" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </motion.svg>
              <div className="text-6xl font-black text-white mix-blend-screen drop-shadow-md z-20 font-mono">
                {formatTime(timeLeft)}
              </div>
            </motion.div>
          )}

          {phase === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-2xl text-slate-300 font-medium mb-12">
                2 minutes complete. You breached the wall. 🚀
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button onClick={handleDone} className="flex flex-col items-center justify-center gap-3 p-6 glass-card hover:bg-green-500/10 hover:border-green-500/50 transition-all text-green-400 group">
                  <CheckCircle size={32} className="group-hover:scale-110 transition-transform" />
                  <span className="font-semibold">Done</span>
                </button>
                
                <button onClick={handleContinue} className="flex flex-col items-center justify-center gap-3 p-6 glass-card hover:bg-blue-500/10 hover:border-blue-500/50 transition-all text-blue-400 group">
                  <Play size={32} className="group-hover:scale-110 transition-transform" />
                  <span className="font-semibold">+10 Min</span>
                </button>
                
                <button onClick={handleSkip} className="flex flex-col items-center justify-center gap-3 p-6 glass-card hover:bg-slate-500/10 hover:border-slate-500/50 transition-all text-slate-400 group">
                  <SkipForward size={32} className="group-hover:scale-110 transition-transform" />
                  <span className="font-semibold">Stop</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
