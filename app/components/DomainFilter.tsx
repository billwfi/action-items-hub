"use client";

import { DomainConfig } from "@/types";

const DOMAIN_COLORS = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-emerald-500",
  "bg-orange-500",
  "bg-rose-500",
];

interface DomainFilterProps {
  domains: string[];
  selectedDomains: string[];
  emailCounts: Record<string, number>;
  onToggle: (domain: string) => void;
}

export function getDomainConfigs(domains: string[]): DomainConfig[] {
  return domains.map((d, i) => ({
    domain: d,
    label: d,
    color: DOMAIN_COLORS[i % DOMAIN_COLORS.length],
  }));
}

export default function DomainFilter({
  domains,
  selectedDomains,
  emailCounts,
  onToggle,
}: DomainFilterProps) {
  const configs = getDomainConfigs(domains);

  return (
    <aside className="w-60 min-h-full bg-slate-800 border-r border-slate-700 p-4 flex flex-col gap-2">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
        Email Domains
      </p>

      <button
        onClick={() => domains.forEach((d) => !selectedDomains.includes(d) && onToggle(d))}
        className="text-xs text-blue-400 hover:text-blue-300 mb-1 text-left"
      >
        Select all
      </button>

      {configs.map((config) => {
        const active = selectedDomains.includes(config.domain);
        const count = emailCounts[config.domain] ?? 0;

        return (
          <button
            key={config.domain}
            onClick={() => onToggle(config.domain)}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
              active
                ? "bg-slate-700 text-white"
                : "text-slate-400 hover:bg-slate-700/50 hover:text-slate-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${config.color} ${
                  !active ? "opacity-40" : ""
                }`}
              />
              <span className="truncate">{config.domain}</span>
            </div>
            {count > 0 && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  active ? "bg-slate-600 text-slate-200" : "bg-slate-700 text-slate-500"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </aside>
  );
}
