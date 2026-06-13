"use client";

import {
  ArrowRight,
  Loader2,
  CheckCircle2,
  Target,
  AlertTriangle,
  Zap,
  ShieldAlert,
  Globe,
} from "lucide-react";
import type { SwotData, Source } from "@/lib/types";

interface SwotViewProps {
  company: string;
  data: SwotData;
  sources: Source[];
  onConfirm: () => void;
  onReset: () => void;
  isLoading: boolean;
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

export function SwotView({
  company,
  data,
  sources,
  onConfirm,
  onReset,
  isLoading,
}: SwotViewProps) {
  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Matriz SWOT</h2>
          <p className="text-gray-500 font-medium">
            Inteligência extraída de <span className="font-bold text-gray-700">{company}</span>.
            Revise antes de cruzar.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
          <button
            onClick={onReset}
            disabled={isLoading}
            className="px-8 py-4 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-gray-600 font-bold transition-all text-sm shadow-sm disabled:opacity-50"
          >
            Recomeçar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-8 py-4 rounded-2xl gradient-bg text-white font-bold shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70"
          >
            {isLoading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              <span className="flex items-center gap-2">
                Gerar estratégias TOWS <ArrowRight className="w-5 h-5" />
              </span>
            )}
          </button>
        </div>
      </div>

      {sources.length > 0 && (
        <div className="mb-10 flex flex-wrap gap-2 items-center">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
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

      <div className="ios-card p-8 flex items-center gap-6 border border-orange-100">
        <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center shadow-lg shadow-orange-500/30 shrink-0">
          <CheckCircle2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h4 className="font-black text-gray-900 text-sm tracking-wider uppercase mb-1">
            Próximo passo: cruzamento TOWS
          </h4>
          <p className="text-gray-500 font-medium text-sm leading-relaxed max-w-2xl">
            Vamos cruzar forças, fraquezas, oportunidades e ameaças para gerar 1 insight
            estratégico valioso em cada um dos 4 quadrantes.
          </p>
        </div>
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
