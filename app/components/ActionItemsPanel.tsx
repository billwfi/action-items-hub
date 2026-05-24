"use client";

import { AnalysisResult } from "@/types";
import { X, CheckSquare, ArrowRight, Clock, User, AlertCircle } from "lucide-react";

interface ActionItemsPanelProps {
  result: AnalysisResult | null;
  onClose: () => void;
}

const PRIORITY_STYLES = {
  high: "text-red-400 bg-red-400/10 border-red-400/20",
  medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  low: "text-slate-400 bg-slate-400/10 border-slate-400/20",
};

const PRIORITY_ICON = {
  high: <AlertCircle size={12} />,
  medium: <Clock size={12} />,
  low: null,
};

export default function ActionItemsPanel({ result, onClose }: ActionItemsPanelProps) {
  if (!result) return null;

  return (
    <aside className="w-96 flex-shrink-0 bg-slate-800 border-l border-slate-700 flex flex-col overflow-hidden">
      <div className="flex items-start justify-between px-5 py-4 border-b border-slate-700">
        <div className="min-w-0 pr-2">
          <h2 className="text-sm font-semibold text-white">Analysis Results</h2>
          <p className="text-xs text-slate-400 mt-0.5 truncate">{result.sourceSubject}</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-300 flex-shrink-0 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Summary */}
        <section>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Summary
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">{result.summary}</p>
        </section>

        {/* Action Items */}
        <section>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <CheckSquare size={12} />
            Action Items ({result.actionItems.length})
          </h3>

          {result.actionItems.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No action items found</p>
          ) : (
            <ul className="space-y-2">
              {result.actionItems.map((item) => (
                <li
                  key={item.id}
                  className={`p-3 rounded-lg border text-sm ${PRIORITY_STYLES[item.priority]}`}
                >
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 mt-0.5">{PRIORITY_ICON[item.priority]}</span>
                    <div className="min-w-0">
                      <p className="text-slate-200 leading-snug">{item.text}</p>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        {item.owner && (
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <User size={10} />
                            {item.owner}
                          </span>
                        )}
                        {item.dueDate && (
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Clock size={10} />
                            {item.dueDate}
                          </span>
                        )}
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded capitalize border ${PRIORITY_STYLES[item.priority]}`}
                        >
                          {item.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Next Steps */}
        <section>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <ArrowRight size={12} />
            Next Steps ({result.nextSteps.length})
          </h3>

          {result.nextSteps.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No next steps identified</p>
          ) : (
            <ul className="space-y-2">
              {result.nextSteps.map((step) => (
                <li
                  key={step.id}
                  className="flex items-start gap-2 p-3 bg-slate-700/50 rounded-lg border border-slate-600/50"
                >
                  <ArrowRight
                    size={12}
                    className="text-blue-400 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-sm text-slate-200">{step.text}</p>
                    {step.context && (
                      <p className="text-xs text-slate-500 mt-1">{step.context}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="px-5 py-3 border-t border-slate-700">
        <p className="text-xs text-slate-600">
          Analyzed {new Date(result.analyzedAt).toLocaleTimeString()}
        </p>
      </div>
    </aside>
  );
}
