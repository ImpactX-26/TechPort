import React, { useEffect, useRef } from 'react';
import { Sparkles, CheckCircle2, ShieldCheck, Award, ArrowRight, X } from 'lucide-react';

interface CelebrationEffectProps {
  show: boolean;
  title: string;
  subtitle: string;
  xpPoints?: number;
  securedTimestamp?: string;
  onClose: () => void;
}

export const CelebrationEffect: React.FC<CelebrationEffectProps> = ({
  show,
  title,
  subtitle,
  xpPoints = 150,
  securedTimestamp,
  onClose
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!show) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Germany-inspired prestige colors: Gold, Ruby, Imperial Indigo, Cobalt, Emerald
    const colors = ['#f59e0b', '#fbbf24', '#f43f5e', '#3b82f6', '#10b981', '#a855f7', '#38bdf8'];
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      rotation: number;
      rotationSpeed: number;
      opacity: number;
      decay: number;
    }> = [];

    // Spawn 120 particles from center-top
    for (let i = 0; i < 120; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      particles.push({
        x: canvas.width / 2,
        y: canvas.height * 0.38,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        decay: Math.random() * 0.012 + 0.008
      });
    }

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let alive = false;
      for (const p of particles) {
        if (p.opacity > 0) {
          alive = true;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.15; // gravity
          p.vx *= 0.98; // drag
          p.rotation += p.rotationSpeed;
          p.opacity -= p.decay;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillStyle = p.color;

          // Draw alternating confetti ribbons & stars
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          ctx.restore();
        }
      }

      if (alive) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    // Auto close after 4.5 seconds if user doesn't dismiss
    const timer = setTimeout(() => {
      onClose();
    }, 4500);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timer);
    };
  }, [show, onClose]);

  if (!show) return null;

  const dateStr = securedTimestamp || new Date().toLocaleString('en-DE', {
    dateStyle: 'medium',
    timeStyle: 'medium'
  });

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-4">
      {/* Canvas for Particle Confetti Burst */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />

      {/* Celebratory Luminous Card */}
      <div className="relative z-20 pointer-events-auto max-w-md w-full bg-slate-900/90 backdrop-blur-2xl border-2 border-amber-400/50 rounded-3xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.35)] text-center animate-in zoom-in-95 fade-in duration-300">
        
        {/* Glowing Ambient Halo */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-28 h-28 bg-linear-to-tr from-amber-500 via-rose-500 to-indigo-500 rounded-full blur-2xl opacity-60 -z-10" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close celebration dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge Icon with Pulsing Rings */}
        <div className="relative w-20 h-20 mx-auto mb-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-linear-to-r from-amber-400 via-rose-500 to-blue-500 animate-spin opacity-75 blur-xs" style={{ animationDuration: '4s' }} />
          <div className="relative w-16 h-16 rounded-full bg-slate-950 flex items-center justify-center shadow-inner">
            <Award className="w-8 h-8 text-amber-400 animate-bounce" />
          </div>
        </div>

        {/* Text Content */}
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Milestone Achieved +{xpPoints} Journey XP</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
          {title}
        </h3>

        <p className="text-sm text-slate-300 mt-2 font-medium">
          {subtitle}
        </p>

        {/* Secured Date Hash Badge */}
        <div className="mt-4 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-center space-x-2 text-[11px] text-slate-400 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Secured Timestamp: <span className="text-emerald-300">{dateStr}</span> (DSGVO Tamper-Proof)</span>
        </div>

        {/* Action Button */}
        <div className="mt-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <span>Continue Journey</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
