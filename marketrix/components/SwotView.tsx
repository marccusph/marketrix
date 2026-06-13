"use client";

import { Target, AlertTriangle, Zap, ShieldAlert, Globe } from "lucide-react";
import type { SwotData, Source } from "@/lib/types";

interface SwotViewProps {
  company: string;
  data: SwotData;
  sources: Source[];
}

function SwotCard({
  title,
  items,
  gradient,
  icon,
}: {
  title: string;
  items: string[];
  gradient: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="ios-card ios-shadow overflow-hidden flex flex-col h-full">
      <div className={`p-6 ${gradient} flex items-center gap-3`}>
        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">{icon}</div>
        <h3 className="font-black text-white text-sm uppercase tracking-widest">{title}</h3>
      </div>
      <div className="p-8 flex-grow">
        <ul className="space-y-5">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-4">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0" />
              <span className="text-gray-600 font-medium text-sm leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function SwotView({ company, data, sources }: SwotViewProps) {
  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-1">Matriz SWOT</h2>
        <p className="text-gray-500 font-medium">
          Diagnóstico de marketing de <span className="font-bold text-gray-700">{company}</span>.
        </p>
      </div>

      {sources.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2 items-center">
          <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mr-2">
            Verificado via
          </span>
          {sources.map((s, idx) => (
            <a
              key={idx}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-gray-400 hover:text-orange-500 bg-white px-4 py-2 rounded-full border border-gray-100 transition-all flex items-center gap-2 hover:shadow-md"
            >
              <Globe className="w-3 h-3" /> {hostOf(s.url)}
            </a>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <SwotCard
          title="Forças"
          items={data.strengths}
          gradient="gradient-blue"
          icon={<Zap className="w-4 h-4 text-white" />}
        />
        <SwotCard
          title="Fraquezas"
          items={data.weaknesses}
          gradient="bg-gray-400"
          icon={<ShieldAlert className="w-4 h-4 text-white" />}
        />
        <SwotCard
          title="Oportunidades"
          items={data.opportunities}
          gradient="gradient-bg"
          icon={<Target className="w-4 h-4 text-white" />}
        />
        <SwotCard
          title="Ameaças"
          items={data.threats}
          gradient="bg-red-500"
          icon={<AlertTriangle className="w-4 h-4 text-white" />}
        />
      </div>
    </div>
  );
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
