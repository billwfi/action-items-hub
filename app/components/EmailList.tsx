"use client";

import { Email, AnalysisResult } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { Mail, Loader2, Sparkles, ChevronRight } from "lucide-react";
import { getDomainConfigs } from "./DomainFilter";

interface EmailListProps {
  emails: Email[];
  selectedDomains: string[];
  allDomains: string[];
  analyzing: Record<string, boolean>;
  analyzed: Record<string, AnalysisResult>;
  onAnalyze: (email: Email) => void;
  onSelect: (result: AnalysisResult) => void;
}

export default function EmailList({
  emails,
  selectedDomains,
  allDomains,
  analyzing,
  analyzed,
  onAnalyze,
  onSelect,
}: EmailListProps) {
  const domainConfigs = getDomainConfigs(allDomains);
  const colorMap = Object.fromEntries(domainConfigs.map((d) => [d.domain, d.color]));

  const filtered = emails.filter(
    (e) => selectedDomains.length === 0 || selectedDomains.includes(e.domain)
  );

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Mail size={40} className="mb-3 opacity-30" />
        <p className="text-sm">No emails from selected domains</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-700/50">
      {filtered.map((email) => {
        const isAnalyzing = analyzing[email.id];
        const result = analyzed[email.id];
        const dotColor = colorMap[email.domain] ?? "bg-slate-500";

        return (
          <div key={email.id} className="px-5 py-4 hover:bg-slate-800/50 transition-colors group">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${dotColor}`} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-sm font-medium truncate ${
                        !email.isRead ? "text-white" : "text-slate-300"
                      }`}
                    >
                      {email.subject}
                    </p>
                    {!email.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {email.from.name || email.from.address}
                    {" · "}
                    <span className="text-slate-500">
                      {email.receivedDateTime
                        ? formatDistanceToNow(new Date(email.receivedDateTime), {
                            addSuffix: true,
                          })
                        : ""}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                    {email.bodyPreview}
                  </p>

                  {result && (
                    <button
                      onClick={() => onSelect(result)}
                      className="mt-2 flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Sparkles size={11} />
                      {result.actionItems.length} action item
                      {result.actionItems.length !== 1 ? "s" : ""},{" "}
                      {result.nextSteps.length} next step
                      {result.nextSteps.length !== 1 ? "s" : ""}
                      <ChevronRight size={11} />
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={() => (result ? onSelect(result) : onAnalyze(email))}
                disabled={isAnalyzing}
                className={`flex-shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all ${
                  result
                    ? "bg-blue-600/20 text-blue-400 hover:bg-blue-600/30"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600 opacity-0 group-hover:opacity-100"
                } disabled:opacity-50`}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    Analyzing
                  </>
                ) : result ? (
                  <>
                    <Sparkles size={12} />
                    View
                  </>
                ) : (
                  <>
                    <Sparkles size={12} />
                    Analyze
                  </>
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
