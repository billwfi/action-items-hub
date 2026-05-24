"use client";

import { signOut, useSession } from "next-auth/react";
import { LayoutDashboard, LogOut, RefreshCw } from "lucide-react";

interface NavbarProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function Navbar({ onRefresh, isRefreshing }: NavbarProps) {
  const { data: session } = useSession();

  return (
    <nav className="bg-slate-900 border-b border-slate-700 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <LayoutDashboard className="text-blue-400" size={22} />
        <span className="text-white font-semibold text-lg tracking-tight">
          Action Items Hub
        </span>
      </div>

      <div className="flex items-center gap-4">
        {session?.user?.name && (
          <span className="text-slate-400 text-sm">{session.user.name}</span>
        )}

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        )}

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 text-sm transition-colors"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </nav>
  );
}
