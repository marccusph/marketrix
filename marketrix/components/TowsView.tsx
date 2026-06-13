"use client";

import { useState } from "react";
import {
  TrendingUp,
  Zap,
  Activity,
  ChevronRight,
  ArrowRightCircle,
  Rocket,
  CalendarClock,
  BadgeCheck,
} from "lucide-react";
import type { TowsData, CrossingInsight, Quadrant, Risk } from "@/lib/types";

interface TowsViewProps {
  company: string;
  data: TowsData;
  onLead: () => void;
}

const QUADRANT_META: Record<Quadrant, { label: string; cross: string; accent: string }> = {
  SO: { label: "SO", cross: "Forças × Oportunidades", accent: "bg-blue-500" },
  WO: { label: "WO", cross: "Fraquezas × Oportunidades", accent: "bg-orange-500" },
  ST: { label: "ST", cross: "Forças × Ameaças", accent: "bg-indigo-500" },
  WT: { label: "WT", cross: "Fraquezas × Ameaças", accent: "bg-red-500" },
};

const RISK_STYLES: Record<Risk, string> = {
  Baixo: "text-emerald-500 bg-emerald-50 border-emerald-100",
  Médio: "text-orange-500 bg-orange-50 border-orange-100",
  Alto: "text-red-500 bg-red-50 border-red-100",
};

const ORDER: Quadrant[] = ["SO", "WO", "ST", "WT"];

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "fonte";
  }
}

function ScoreBar({ label, value, colorClass }: { label: string; value: number; colorClass: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-[10px] uppercase text-gray-400 font-black tracking-widest">{label}</span>
        <span className="text-[10px] font-black text-gray-500">{value}/5</span>
      </div>
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${(value / 5) * 100}%` }} />
      </div>
    </div>
  );
}

function InsightCard({ c }: { c: CrossingInsight }) {
  const meta = QUADRANT_META[c.quadrant] ?? QUADRANT_META.SO;
  const riskStyle = RISK_STYLES[c.risk] ?? "text-gray-500 bg-gray-50 border-gray-100";

  return (
    <div className="ios-card p-7 ios-shadow relative overflow-hidden flex flex-col h-full">
      <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${meta.accent}`} />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-2.5 py-1 rounded-full text-white font-black tracking-widest ${meta.accent}`}>
            {meta.label}
          </span>
          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{meta.cross}</span>
        </div>
        <div className={`text-[9px] px-2 py-1 rounded-full border font-black uppercase tracking-[0.15em] ${riskStyle}`}>
          {c.risk}
        </div>
      </div>

      <h4 className="font-bold text-gray-900 text-lg leading-tight mb-3">{c.title}</h4>
      <p className="text-sm text-gray-600 mb-5 font-medium leading-relaxed flex-grow">{c.insight}</p>

      <div className="bg-gray-50 rounded-2xl p-4 mb-4 space-y-2">
        <div className="flex gap-2 text-xs">
          <span className="font-black text-gray-400 uppercase tracking-wider shrink-0">Interno:</span>
          <span className="text-gray-600 font-medium">{c.internalFactor}</span>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="font-black text-gray-400 uppercase tracking-wider shrink-0">Externo:</span>
          <span className="text-gray-600 font-medium">{c.externalFactor}</span>
        </div>
      </div>

      {c.evidence && (
        <div className="flex items-start gap-2 mb-5 bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4">
          <BadgeCheck className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
          <div>
            <span className="text-[9px] uppercase font-black text-emerald-500/80 tracking-widest block mb-0.5">
              Evidência
            </span>
            <p className="text-xs text-gray-600 font-medium leading-relaxed">
              {c.evidence}
              {c.evidenceSource ? (
                <a
                  href={c.evidenceSource}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1.5 text-orange-500 font-bold hover:underline whitespace-nowrap"
                >
                  {hostOf(c.evidenceSource)} ↗
                </a>
              ) : null}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6 mb-5">
        <ScoreBar label="Impacto" value={c.impact} colorClass="bg-orange-500" />
        <ScoreBar label="Esforço" value={c.effort} colorClass="bg-gray-400" />
      </div>

      <div className="pt-4 border-t border-gray-100 flex items-start gap-2">
        <ArrowRightCircle className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
        <div>
          <span className="text-[9px] uppercase font-black text-gray-300 tracking-widest block mb-0.5">
            Primeiro passo
          </span>
          <p className="text-xs text-gray-600 font-medium leading-relaxed">{c.firstStep}</p>
        </div>
      </div>
    </div>
  );
}

export function TowsView({ data, onLead }: TowsViewProps) {
  const [showPlan, setShowPlan] = useState(false);

  // Defensivo: nunca quebrar a UI se a TOWS vier parcial.
  const exec = data.executiveSummary ?? { overview: "", coreInsight: "", direction: "" };
  const prio = data.prioritization ?? {
    pursueNow: [],
    watch: [],
    avoid: { title: "", reason: "" },
  };
  const pursueNow = prio.pursueNow ?? [];
  const watch = prio.watch ?? [];
  const avoid = prio.avoid ?? { title: "", reason: "" };

  const crossings = [...(data.crossings ?? [])].sort(
    (a, b) => ORDER.indexOf(a.quadrant) - ORDER.indexOf(b.quadrant)
  );

  const plan = data.actionPlan;
  const phases = [
    { label: "Primeiros 30 dias", items: plan?.days30 ?? [], accent: "text-emerald-500" },
    { label: "31 – 60 dias", items: plan?.days60 ?? [], accent: "text-blue-500" },
    { label: "61 – 90 dias", items: plan?.days90 ?? [], accent: "text-purple-500" },
  ];

  return (
    <div className="animate-fade-in space-y-12 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 pt-4">
        <Activity className="text-orange-500 w-7 h-7" />
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Roteiro estratégico (TOWS)</h2>
          <p className="text-gray-500 font-medium">1 insight de marketing por cruzamento.</p>
        </div>
      </div>

      {/* Sumário executivo + priorização */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="ios-card p-10 relative overflow-hidden h-full flex flex-col justify-center">
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] rotate-12">
              <Zap className="w-64 h-64" />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 mb-6">
              Sumário executivo
            </h3>
            <p className="text-2xl text-gray-900 font-bold leading-snug mb-10">
              {exec.overview}
            </p>
            <div className="grid md:grid-cols-2 gap-12 pt-8 border-t border-gray-50">
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                  Insight central
                </h4>
                <p className="text-gray-600 font-bold leading-relaxed italic text-lg">
                  “{exec.coreInsight}”
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                  Direção estratégica
                </h4>
                <p className="text-3xl font-black text-transparent bg-clip-text gradient-bg">
                  {exec.direction}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="ios-card p-8 h-full flex flex-col">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 mb-8 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-500" /> Priorização
            </h3>

            <div className="space-y-8 flex-grow">
              <div className="space-y-4">
                <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                  Executar agora
                </div>
                <div className="space-y-3">
                  {pursueNow.map((title, i) => (
                    <div key={i} className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
                      <span className="w-6 h-6 rounded-full gradient-bg text-white text-[10px] font-black flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-sm font-bold text-gray-800">{title}</span>
                    </div>
                  ))}
                </div>
              </div>

              {watch.length > 0 && (
                <div className="space-y-4">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Observar
                  </div>
                  <div className="space-y-3">
                    {watch.map((title, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 bg-white border border-gray-50 p-4 rounded-2xl"
                      >
                        <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 text-[10px] font-black flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-sm font-bold text-gray-500">{title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-gray-50 mt-auto">
                <div className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-4">
                  Evitar
                </div>
                <div className="bg-red-50 p-5 rounded-2xl border border-red-100">
                  <div className="text-sm font-black text-red-600 mb-2 uppercase tracking-wide">
                    {avoid.title}
                  </div>
                  <p className="text-xs text-red-400 font-medium leading-relaxed">
                    {avoid.reason}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Os 4 cruzamentos */}
      <div className="space-y-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl gradient-blue flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ChevronRight className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-3xl font-black text-gray-900 tracking-tight">Os 4 cruzamentos</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {crossings.map((c, i) => (
            <InsightCard key={`${c.quadrant}-${i}`} c={c} />
          ))}
        </div>
      </div>

      {/* Plano de ação — atrás de um botão */}
      {plan && (
        <div className="space-y-8">
          {!showPlan ? (
            <div className="ios-card p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center shadow-lg shadow-orange-500/30 shrink-0">
                  <CalendarClock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-gray-900">Plano de ação 30 / 60 / 90 dias</h4>
                  <p className="text-gray-500 font-medium text-sm">
                    Transforme os insights num roteiro de execução de marketing.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPlan(true)}
                className="px-8 py-4 rounded-2xl gradient-bg text-white font-bold flex items-center gap-2 shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all shrink-0"
              >
                <CalendarClock className="w-5 h-5" /> Gerar plano de ação
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl gradient-bg flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <CalendarClock className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">Plano de ação</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {phases.map((ph, i) => (
                  <div key={i} className="ios-card p-6 ios-shadow flex flex-col">
                    <h4 className={`text-sm font-black uppercase tracking-widest mb-5 ${ph.accent}`}>
                      {ph.label}
                    </h4>
                    <ul className="space-y-5 flex-grow">
                      {ph.items.map((a, j) => (
                        <li key={j} className="flex gap-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0" />
                          <div>
                            <p className="text-sm font-bold text-gray-800 leading-snug">{a.action}</p>
                            <p className="text-xs text-gray-400 font-medium mt-1">Métrica: {a.metric}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* CTA final */}
      <div className="ios-card p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 border border-orange-100">
        <div>
          <h4 className="text-2xl font-black text-gray-900 mb-1">Gostou da estratégia?</h4>
          <p className="text-gray-500 font-medium">
            Receba esta análise e dê o próximo passo para colocá-la em prática.
          </p>
        </div>
        <button
          onClick={onLead}
          className="px-8 py-5 rounded-2xl gradient-bg text-white font-bold text-lg flex items-center gap-3 shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all shrink-0"
        >
          <Rocket className="w-5 h-5" /> Quero implementar
        </button>
      </div>
    </div>
  );
}
