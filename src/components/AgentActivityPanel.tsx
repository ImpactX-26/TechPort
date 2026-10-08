import React, { useState } from 'react';
import { 
  Bot, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  ArrowRight, 
  Compass, 
  FileSearch, 
  UserCheck, 
  ShieldAlert, 
  Terminal, 
  ChevronDown, 
  ChevronUp,
  Layers,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { AgentActivityLog } from '../types';

interface AgentActivityPanelProps {
  logs: AgentActivityLog[];
  onTriggerReEvaluate?: () => void;
  isProcessing?: boolean;
}

export const AgentActivityPanel: React.FC<AgentActivityPanelProps> = ({
  logs,
  onTriggerReEvaluate,
  isProcessing
}) => {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const getAgentBadge = (name: AgentActivityLog['agentName']) => {
    switch (name) {
      case 'Document Agent':
        return {
          icon: FileSearch,
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500'
        };
      case 'Profile Agent':
        return {
          icon: UserCheck,
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500'
        };
      case 'Qualification Agent':
        return {
          icon: CheckCircle2,
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          dot: 'bg-indigo-500'
        };
      case 'Gap Agent':
        return {
          icon: AlertTriangle,
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500'
        };
      case 'Routing Agent':
        return {
          icon: Sparkles,
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500'
        };
      case 'Orchestrator':
      default:
        return {
          icon: Layers,
          bg: 'bg-slate-900 text-slate-100 border-slate-700',
          dot: 'bg-amber-400'
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Panel Header */}
      <div className="p-5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-extrabold text-base tracking-tight text-white">AI Multi-Agent Activity Hub</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Live Orchestration
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Autonomous reasoning cycle across 6 specialized agents coordinated by the Orchestrator
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onTriggerReEvaluate && (
            <button
              onClick={onTriggerReEvaluate}
              disabled={isProcessing}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              title="Trigger agent reasoning cycle"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>Re-Evaluate</span>
            </button>
          )}
        </div>
      </div>

      {/* Orchestrator Loop Schema Visual Bar */}
      <div className="bg-slate-950 px-5 py-2.5 text-[11px] font-mono text-slate-300 border-b border-slate-800 flex items-center overflow-x-auto space-x-2">
        <span className="text-amber-400 font-bold uppercase shrink-0">Reasoning Loop:</span>
        <span className="text-slate-400">OBSERVE</span>
        <span className="text-slate-600">→</span>
        <span className="text-slate-400">REASON</span>
        <span className="text-slate-600">→</span>
        <span className="text-slate-400">SELECT AGENT</span>
        <span className="text-slate-600">→</span>
        <span className="text-slate-400">EXECUTE</span>
        <span className="text-slate-600">→</span>
        <span className="text-slate-400">VERIFY</span>
        <span className="text-slate-600">→</span>
        <span className="text-slate-400">UPDATE STATE</span>
        <span className="text-slate-600">→</span>
        <span className="text-amber-300 font-semibold">RE-PLAN</span>
      </div>

      {/* Agent Activity Stream */}
      <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No agent activities recorded yet. Trigger an action to start the pipeline.
          </div>
        ) : (
          logs.map((log) => {
            const badge = getAgentBadge(log.agentName);
            const Icon = badge.icon;
            const isExpanded = expandedLogId === log.id;
            const timeFormatted = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

            return (
              <div 
                key={log.id} 
                className={`p-4 transition-colors hover:bg-slate-50/80 ${
                  log.status === 'warning' ? 'bg-amber-50/30' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    {/* Agent Pill Badge */}
                    <div className={`shrink-0 px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center space-x-1.5 ${badge.bg}`}>
                      <Icon className="w-3.5 h-3.5" />
                      <span>{log.agentName}</span>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900 leading-snug">
                          {log.headline}
                        </span>
                        {log.status === 'warning' && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            Attention
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        {log.detail}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-[10px] font-mono text-slate-400">
                      {timeFormatted}
                    </span>
                    {log.metadata && (
                      <button
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
                        title="Inspect payload"
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Optional Expanded JSON Metadata */}
                {isExpanded && log.metadata && (
                  <div className="mt-3 p-3 bg-slate-900 text-slate-200 rounded-lg text-[11px] font-mono overflow-x-auto border border-slate-800">
                    <div className="text-[10px] text-amber-400 uppercase font-bold mb-1">
                      Agent Data Handoff Payload:
                    </div>
                    <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center space-x-2">
          <Terminal className="w-3.5 h-3.5 text-slate-400" />
          <span>Real-time handoffs recorded in database ready event log</span>
        </div>
        <div className="font-semibold text-slate-700">
          Total agent executions: {logs.length}
        </div>
      </div>
    </div>
  );
};
