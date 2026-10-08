import React, { useState, useEffect } from 'react';
import { 
  Database, 
  X, 
  Copy, 
  Check, 
  Table2, 
  Layers, 
  Server,
  FileCode
} from 'lucide-react';
import { fetchDbSchema } from '../api';

interface DbSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DbSchemaModal: React.FC<DbSchemaModalProps> = ({
  isOpen,
  onClose
}) => {
  const [schemaData, setSchemaData] = useState<{ schemaSql: string; tables: string[] } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && !schemaData) {
      fetchDbSchema()
        .then(data => setSchemaData(data))
        .catch(err => console.error(err));
    }
  }, [isOpen, schemaData]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (schemaData) {
      navigator.clipboard.writeText(schemaData.schemaSql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Database className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Data Architecture
              </span>
              <h2 className="text-lg font-extrabold text-slate-900">
                PostgreSQL Enterprise Relational Model
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 flex items-center space-x-1 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied DDL' : 'Copy SQL DDL'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-slate-600">
            <div className="font-bold text-slate-900 flex items-center space-x-1.5">
              <Server className="w-4 h-4 text-blue-600" />
              <span>Production-Ready Relational Layer</span>
            </div>
            <p>
              The application implements a clean database abstraction service layer. Each agent operates on normalized relational schemas with full foreign key constraints and JSONB attribute indexing.
            </p>
          </div>

          {/* Table List */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Relational Tables ({schemaData?.tables.length || 10})
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(schemaData?.tables || [
                'applicants',
                'applicant_profiles',
                'documents',
                'qualifications',
                'requirements',
                'gaps',
                'next_best_actions',
                'agent_activity_logs',
                'cvs',
                'journey_states'
              ]).map((t, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center space-x-2 font-mono text-[11px] text-slate-800">
                  <Table2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SQL DDL Code View */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center space-x-1">
              <FileCode className="w-3.5 h-3.5 text-slate-400" />
              <span>PostgreSQL Schema DDL (Exportable)</span>
            </div>
            <div className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto max-h-72 border border-slate-800">
              <pre>{schemaData?.schemaSql || '-- Loading PostgreSQL DDL...'}</pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 text-xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
