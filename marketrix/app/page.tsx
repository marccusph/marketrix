"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Header } from "@/components/Header";
import { InputForm } from "@/components/InputForm";
import { SwotView } from "@/components/SwotView";
import { TowsView } from "@/components/TowsView";
import { LeadForm } from "@/components/LeadForm";
import { PrintReport } from "@/components/PrintReport";
import { buildMarkdown, downloadTextFile, slugify } from "@/lib/export";
import type { SwotData, Source, TowsData } from "@/lib/types";

type Step = "input" | "swot" | "tows";

export default function Home() {
  const [step, setStep] = useState<Step>("input");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [, setWebsite] = useState("");
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [company, setCompany] = useState("");
  const [swot, setSwot] = useState<SwotData | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [tows, setTows] = useState<TowsData | null>(null);
  const [showLead, setShowLead] = useState(false);

  async function handleAnalyze(site: string, comps: string[]) {
    setIsLoading(true);
    setError(null);
    setWebsite(site);
    setCompetitors(comps);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ website: site, competitors: comps }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Falha na análise.");
      setSwot(data.swot);
      setSources(data.sources || []);
      setCompany(data.company || site);
      setStep("swot");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro inesperado.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStrategize() {
    if (!swot) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/strategize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ swot, company, competitors, sources }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Falha ao gerar estratégias.");
      setTows(data.tows);
      setStep("tows");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro inesperado.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    setStep("input");
    setError(null);
    setSwot(null);
    setSources([]);
    setTows(null);
    setCompany("");
    setWebsite("");
    setCompetitors([]);
    setShowLead(false);
  }

  function handleExportMd() {
    if (!swot) return;
    const md = buildMarkdown({ company, swot, sources, tows });
    downloadTextFile(`marketrix-${slugify(company)}.md`, md);
  }

  function handlePrint() {
    if (typeof window !== "undefined") window.print();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="no-print flex flex-col min-h-screen">
        <Header />

        <main className="flex-grow p-4 md:p-10 w-full">
          {error && (
            <div className="max-w-4xl mx-auto mb-6 bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-3xl flex items-center justify-between shadow-sm animate-shake">
              <span className="font-medium">{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600 p-2"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === "input" && <InputForm onSubmit={handleAnalyze} isLoading={isLoading} />}

          {step === "swot" && swot && (
            <SwotView
              company={company}
              data={swot}
              sources={sources}
              onConfirm={handleStrategize}
              onReset={handleReset}
              isLoading={isLoading}
            />
          )}

          {step === "tows" && tows && (
            <TowsView
              company={company}
              data={tows}
              onReset={handleReset}
              onExportMd={handleExportMd}
              onPrint={handlePrint}
              onLead={() => setShowLead(true)}
            />
          )}
        </main>

        <footer className="p-10 text-center text-gray-400 text-xs font-medium tracking-wide">
          © {new Date().getFullYear()} Marketrix · Co-piloto de Estratégia · Inteligência por Claude
        </footer>
      </div>

      {/* Relatório completo, visível apenas na impressão / exportação em PDF */}
      {tows && swot && (
        <div className="print-only">
          <PrintReport company={company} swot={swot} sources={sources} tows={tows} />
        </div>
      )}

      {swot && (
        <LeadForm
          open={showLead}
          onClose={() => setShowLead(false)}
          company={company}
          swot={swot}
          tows={tows}
          sources={sources}
        />
      )}
    </div>
  );
}
