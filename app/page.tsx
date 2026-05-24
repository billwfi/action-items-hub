"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LayoutDashboard, Mail, MessageSquare, Sparkles, Loader2 } from "lucide-react";

export default function SignInPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.accessToken) router.push("/dashboard");
  }, [session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="text-blue-400 animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 mb-5">
            <LayoutDashboard className="text-blue-400" size={28} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Action Items Hub
          </h1>
          <p className="text-slate-400 mt-2 text-sm leading-relaxed">
            AI-powered analysis of your emails and Teams chats to surface action items and next steps
          </p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 space-y-6">
          <div className="space-y-3">
            {[
              { icon: Mail, text: "Reads emails from 5 configured domains", color: "text-blue-400" },
              { icon: MessageSquare, text: "Scans Microsoft Teams chats", color: "text-purple-400" },
              { icon: Sparkles, text: "Claude AI extracts action items & next steps", color: "text-yellow-400" },
            ].map(({ icon: Icon, text, color }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-slate-300">
                <Icon size={16} className={color} />
                {text}
              </div>
            ))}
          </div>

          <button
            onClick={() => signIn("azure-ad", { callbackUrl: "/dashboard" })}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-4 rounded-xl transition-colors"
          >
            <svg viewBox="0 0 23 23" width="18" height="18" fill="none">
              <path d="M1 1h10v10H1z" fill="#f25022" />
              <path d="M12 1h10v10H12z" fill="#7fba00" />
              <path d="M1 12h10v10H1z" fill="#00a4ef" />
              <path d="M12 12h10v10H12z" fill="#ffb900" />
            </svg>
            Sign in with Microsoft
          </button>

          <p className="text-xs text-slate-500 text-center">
            Requires Mail.Read and Chat.Read permissions
          </p>
        </div>
      </div>
    </div>
  );
}
