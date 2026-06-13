"use client";

import { useState } from "react";
import { X, Download, Printer, Rocket, RotateCcw, Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { InputForm } from "@/components/InputForm";
import { SwotView } from "@/components/SwotView";
import { TowsView } from "@/components/TowsView";
import { LeadForm } from "@/components/LeadForm";
import { PrintReport } from "@/components/PrintReport";
import { buildMarkdown, downloadTextFile, slugify } from "@/lib/export";
import type { SwotData, Source, TowsData } from "@/lib/types";

type Step = "input" | "results";

export default function Home() {
  const [step, setStep] = useState<Step>("input");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("Pesquisando o mercado…");
  const [towsLoading, setTowsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [competitors, setCompetitors] = useState<string[]>([]);
  const [company, setCompany] = useState("");
  const [swot, setSwot] = useState<SwotData | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [tows, setTows] = useState<TowsData | null>(null);
  const [showLead, setShowLead] = useState(false);

  async function generateTows(swotData: SwotData, comp: string, comps: string[], srcs: Source[]) {
    setTowsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/strategize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ swot: swotData, company: comp, competitors: comps, sources: srcs }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Falha ao gerar estratégias.");
      setTows(data.tows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao cruzar a estratégia.");
    } finally {
      setTowsLoading(false);
    }
  }

  async function handleAnalyze(site: string, comps: string[]) {
    setIsLoading(true);
    setError(null);
    setLoadingLabel("Pesquisando o mercado…");
    setCompetitors(comps);
    setTows(null);

    let swotData: SwotData;
    let srcs: Source[] = [];
    let comp = site;
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ website: site, competitors: comps }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Falha na análise.");
      swotData = data.swot;
      srcs = data.sources || [];
      comp = data.company || site;
      setSwot(swotData);
      setSources(srcs);
      setCompany(comp);
      setStep("results");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro inesperado.");
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
    // TOWS automático, logo após a SWOT.
    await generateTows(swotData, comp, comps, srcs);
  }

  function handleReset() {
    setStep("input");
    setError(null);
    setSwot(null);
    setSources([]);
    setTows(null);
    setCompany("");
    setCompetitors([]);
    setShowLead(false);
    setTowsLoading(false);
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
            <div className="max-w-6xl mx-auto mb-6 bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-3xl flex items-center justify-between shadow-sm animate-shake">
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

          {step === "input" && (
            <InputForm onSubmit={handleAnalyze} isLoading={isLoading} loadingLabel={loadingLabel} />
          )}

          {step === "results" && swot && (
            <div className="max-w-6xl mx-auto space-y-12">
              {/* Barra de ações */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                    Análise · <span className="text-orange-500">{company}</span>
                  </h1>
                  <p className="text-gray-500 font-medium text-sm">SWOT + TOWS de marketing</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleExportMd}
                    className="px-5 py-3.5 rounded-2xl bg-white border border-gray-100 text-gray-500 hover:text-orange-500 font-bold text-sm flex items-center gap-2 transition-all hover:shadow-md active:scale-95"
                  >
                    <Download className="w-4 h-4" /> .md
                  </button>
                  <button
                    onClick={handlePrint}
                    className="px-5 py-3.5 rounded-2xl bg-white border border-gray-100 text-gray-500 hover:text-orange-500 font-bold text-sm flex items-center gap-2 transition-all hover:shadow-md active:scale-95"
                  >
                    <Printer className="w-4 h-4" /> PDF
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-5 py-3.5 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-gray-600 font-bold text-sm flex items-center gap-2 transition-all active:scale-95"
                  >
                    <RotateCcw className="w-4 h-4" /> Nova
                  </button>
                  <button
                    onClick={() => setShowLead(true)}
                    className="px-6 py-3.5 rounded-2xl gradient-bg text-white font-bold text-sm flex items-center gap-2 shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    <Rocket className="w-4 h-4" /> Quero implementar
                  </button>
                </div>
              </div>

              <SwotView company={company} data={swot} sources={sources} />

              {tows ? (
                <TowsView company={company} data={tows} onLead={() => setShowLead(true)} />
              ) : towsLoading ? (
                <div className="ios-card p-12 flex flex-col items-center justify-center text-center gap-4 max-w-6xl mx-auto">
                  <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                  <p className="text-gray-500 font-bold">Cruzando a estratégia (TOWS)…</p>
                  <p className="text-gray-400 text-sm font-medium">
                    Combinando forças, fraquezas, oportunidades e ameaças em insights de marketing.
                  </p>
                </div>
              ) : (
                <div className="ios-card p-10 flex flex-col items-center justify-center text-center gap-4">
                  <p className="text-gray-600 font-bold">Não foi possível gerar a matriz TOWS.</p>
                  <button
                    onClick={() => generateTows(swot, company, competitors, sources)}
                    className="px-8 py-4 rounded-2xl gradient-bg text-white font-bold active:scale-95 transition-all"
                  >
                    Tentar novamente
                  </button>
                </div>
              )}
            </div>
          )}
        </main>

        <footer className="p-10 text-center text-gray-400 text-xs font-medium tracking-wide">
          © {new Date().getFullYear()} Marketrix · Co-piloto de Estratégia · Inteligência por Claude
        </footer>
      </div>

      {/* Relatório completo, visível apenas na impressão / exportação em PDF */}
      {swot && (
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
