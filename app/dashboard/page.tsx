"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import DomainFilter from "@/app/components/DomainFilter";
import EmailList from "@/app/components/EmailList";
import TeamsChatList from "@/app/components/TeamsChatList";
import ActionItemsPanel from "@/app/components/ActionItemsPanel";
import { Email, TeamsMessage, AnalysisResult } from "@/types";
import { Mail, MessageSquare, Loader2 } from "lucide-react";

type Tab = "email" | "teams";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("email");
  const [emails, setEmails] = useState<Email[]>([]);
  const [teamsMessages, setTeamsMessages] = useState<TeamsMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analyzing, setAnalyzing] = useState<Record<string, boolean>>({});
  const [analyzed, setAnalyzed] = useState<Record<string, AnalysisResult>>({});
  const [activeResult, setActiveResult] = useState<AnalysisResult | null>(null);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);

  const allDomains = (process.env.NEXT_PUBLIC_DOMAINS || "")
    .split(",")
    .map((d) => d.trim())
    .filter(Boolean);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  useEffect(() => {
    if (allDomains.length > 0 && selectedDomains.length === 0) {
      setSelectedDomains(allDomains);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDomains.join(",")]);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [emailRes, teamsRes] = await Promise.all([
        fetch("/api/emails"),
        fetch("/api/teams"),
      ]);

      if (emailRes.ok) {
        const data = await emailRes.json();
        setEmails(data.emails ?? []);
      }
      if (teamsRes.ok) {
        const data = await teamsRes.json();
        setTeamsMessages(data.messages ?? []);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (session?.accessToken) fetchData();
  }, [session, fetchData]);

  const handleToggleDomain = (domain: string) => {
    setSelectedDomains((prev) =>
      prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain]
    );
  };

  const handleAnalyzeEmail = async (email: Email) => {
    setAnalyzing((p) => ({ ...p, [email.id]: true }));
    try {
      const content = `Subject: ${email.subject}\nFrom: ${email.from.name} <${email.from.address}>\n\n${email.body || email.bodyPreview}`;
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          sourceType: "email",
          sourceId: email.id,
          sourceSubject: email.subject,
        }),
      });
      if (res.ok) {
        const result: AnalysisResult = await res.json();
        setAnalyzed((p) => ({ ...p, [email.id]: result }));
        setActiveResult(result);
      }
    } finally {
      setAnalyzing((p) => ({ ...p, [email.id]: false }));
    }
  };

  const handleAnalyzeChat = async (
    chatId: string,
    chatName: string,
    messages: TeamsMessage[]
  ) => {
    setAnalyzing((p) => ({ ...p, [chatId]: true }));
    try {
      const content = messages
        .map((m) => `[${m.from}]: ${m.body}`)
        .join("\n");
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          sourceType: "teams",
          sourceId: chatId,
          sourceSubject: chatName,
        }),
      });
      if (res.ok) {
        const result: AnalysisResult = await res.json();
        setAnalyzed((p) => ({ ...p, [chatId]: result }));
        setActiveResult(result);
      }
    } finally {
      setAnalyzing((p) => ({ ...p, [chatId]: false }));
    }
  };

  const emailCounts = emails.reduce<Record<string, number>>((acc, e) => {
    acc[e.domain] = (acc[e.domain] ?? 0) + 1;
    return acc;
  }, {});

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="text-blue-400 animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Navbar
        onRefresh={() => fetchData(true)}
        isRefreshing={refreshing}
      />

      <div className="flex flex-1 overflow-hidden">
        <DomainFilter
          domains={allDomains}
          selectedDomains={selectedDomains}
          emailCounts={emailCounts}
          onToggle={handleToggleDomain}
        />

        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-700 bg-slate-850 px-5">
            <button
              onClick={() => setActiveTab("email")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "email"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-300"
              }`}
            >
              <Mail size={15} />
              Emails
              <span className="text-xs text-slate-500">({emails.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("teams")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "teams"
                  ? "border-purple-500 text-purple-400"
                  : "border-transparent text-slate-400 hover:text-slate-300"
              }`}
            >
              <MessageSquare size={15} />
              Teams
              <span className="text-xs text-slate-500">
                ({new Set(teamsMessages.map((m) => m.chatId)).size} chats)
              </span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeTab === "email" ? (
              <EmailList
                emails={emails}
                selectedDomains={selectedDomains}
                allDomains={allDomains}
                analyzing={analyzing}
                analyzed={analyzed}
                onAnalyze={handleAnalyzeEmail}
                onSelect={setActiveResult}
              />
            ) : (
              <TeamsChatList
                messages={teamsMessages}
                analyzing={analyzing}
                analyzed={analyzed}
                onAnalyze={handleAnalyzeChat}
                onSelect={setActiveResult}
              />
            )}
          </div>
        </main>

        <ActionItemsPanel
          result={activeResult}
          onClose={() => setActiveResult(null)}
        />
      </div>
    </div>
  );
}
