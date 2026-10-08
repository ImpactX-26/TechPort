import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Sparkles,
  Check
} from 'lucide-react';
import { JourneyStep } from '../types';

interface JourneyTimelineProps {
  steps: JourneyStep[];
}

export const JourneyTimeline: React.FC<JourneyTimelineProps> = ({ steps }) => {
  return (
    <div className="glass-card rounded-2xl border border-slate-800 p-5 shadow-xl text-slate-100 w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <div>
          <h3 className="text-base font-black text-white tracking-tight">Your 4-Stage Germany Roadmap</h3>
          <p className="text-xs text-slate-400">Clear, step-by-step guidance from start to Germany visa readiness</p>
        </div>
        <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-400">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Completed</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Current Step</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-slate-600" />
            <span>Upcoming</span>
          </span>
        </div>
      </div>

      {/* Responsive step grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        {steps.slice(0, 4).map((step, idx) => {
          const isDone = step.status === 'completed';
          const isCurrent = step.status === 'current';

          return (
            <div 
              key={step.id || idx} 
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                isCurrent 
                  ? 'bg-amber-500/10 border-amber-400/50 ring-1 ring-amber-400/30' 
                  : isDone
                  ? 'bg-slate-900/80 border-emerald-500/30'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                    Stage {idx + 1}
                  </span>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                    isDone 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                      : isCurrent
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}>
                    {isDone ? <Check className="w-3 h-3" /> : isCurrent ? <Sparkles className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  </div>
                </div>

                <div className={`text-xs font-bold leading-tight mb-1 ${
                  isCurrent ? 'text-amber-300' : isDone ? 'text-white' : 'text-slate-400'
                }`}>
                  {step.name}
                </div>
              </div>

              <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                {step.description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
