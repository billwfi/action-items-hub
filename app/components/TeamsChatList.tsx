"use client";

import { TeamsMessage, AnalysisResult } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Loader2, Sparkles, ChevronRight } from "lucide-react";

interface TeamsChatListProps {
  messages: TeamsMessage[];
  analyzing: Record<string, boolean>;
  analyzed: Record<string, AnalysisResult>;
  onAnalyze: (chatId: string, chatName: string, messages: TeamsMessage[]) => void;
  onSelect: (result: AnalysisResult) => void;
}

function groupByChatId(messages: TeamsMessage[]): Record<string, TeamsMessage[]> {
  return messages.reduce<Record<string, TeamsMessage[]>>((acc, m) => {
    if (!acc[m.chatId]) acc[m.chatId] = [];
    acc[m.chatId].push(m);
    return acc;
  }, {});
}

export default function TeamsChatList({
  messages,
  analyzing,
  analyzed,
  onAnalyze,
  onSelect,
}: TeamsChatListProps) {
  const grouped = groupByChatId(messages);
  const chatIds = Object.keys(grouped);

  if (chatIds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <MessageSquare size={40} className="mb-3 opacity-30" />
        <p className="text-sm">No Teams chats loaded</p>
        <p className="text-xs mt-1 text-slate-600">
          Ensure Chat.Read permission is granted
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-700/50">
      {chatIds.map((chatId) => {
        const chatMessages = grouped[chatId];
        const latest = chatMessages[chatMessages.length - 1];
        const isAnalyzing = analyzing[chatId];
        const result = analyzed[chatId];

        return (
          <div
            key={chatId}
            className="px-5 py-4 hover:bg-slate-800/50 transition-colors group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <MessageSquare size={16} className="text-purple-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">
                    {latest.chatName}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {chatMessages.length} message{chatMessages.length !== 1 ? "s" : ""}
                    {latest.createdDateTime && (
                      <>
                        {" · "}
                        {formatDistanceToNow(new Date(latest.createdDateTime), {
                          addSuffix: true,
                        })}
                      </>
                    )}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                    <span className="text-slate-400">{latest.from}:</span> {latest.body}
                  </p>

                  {result && (
                    <button
                      onClick={() => onSelect(result)}
                      className="mt-2 flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
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
                onClick={() =>
                  result
                    ? onSelect(result)
                    : onAnalyze(chatId, latest.chatName, chatMessages)
                }
                disabled={isAnalyzing}
                className={`flex-shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all ${
                  result
                    ? "bg-purple-600/20 text-purple-400 hover:bg-purple-600/30"
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
