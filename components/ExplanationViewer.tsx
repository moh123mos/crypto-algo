import React from 'react';
import { Step } from '../types';
import { ChevronDown, Activity } from 'lucide-react';

interface Props {
  steps: Step[];
  title?: string;
}

const ExplanationViewer: React.FC<Props> = ({ steps, title = "Step-by-Step Explanation" }) => {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-slate-800/50 p-4 border-b border-slate-800 flex items-center gap-2">
        <Activity size={18} className="text-blue-400" />
        <h3 className="text-md font-semibold text-slate-200">{title}</h3>
      </div>
      
      <div className="p-4 max-h-96 overflow-y-auto custom-scrollbar">
        <div className="relative border-l-2 border-slate-700 ml-3 space-y-6">
          {steps.map((step, idx) => (
            <div key={idx} className="relative pl-6">
              {/* Timeline dot */}
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-slate-800 border-2 border-blue-500 box-content"></div>
              
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{step.label}</span>
                {step.isMath ? (
                  <div className="font-mono text-sm bg-slate-800/80 p-2 rounded border border-slate-700/50 text-blue-200 break-all">
                    {step.details}
                  </div>
                ) : (
                  <p className="text-sm text-slate-300">{step.details}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExplanationViewer;