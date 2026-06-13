"use client";

import { useState } from "react";
import { Loader2, Globe, Users, ArrowRight } from "lucide-react";

interface InputFormProps {
  onSubmit: (website: string, competitors: string[]) => void;
  isLoading: boolean;
  loadingLabel?: string;
}

export function InputForm({ onSubmit, isLoading, loadingLabel = "Analisando o mercado…" }: InputFormProps) {
  const [website, setWebsite] = useState("");
  const [competitors, setCompetitors] = useState<string[]>(["", "", ""]);

  const handleCompetitorChange = (index: number, value: string) => {
    const next = [...competitors];
    next[index] = value;
    setCompetitors(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valid = competitors.map((c) => c.trim()).filter(Boolean);
    if (website.trim() && !isLoading) {
      onSubmit(website.trim(), valid);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-4 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
        <div className="text-left">
          <h2 className="text-6xl font-black text-gray-900 mb-6 tracking-tight leading-[1.1]">
            Estratégia <br />
            <span className="text-orange-500">acelerada.</span>
          </h2>
          <p className="text-xl text-gray-500 font-medium max-w-md">
            Informe o site da sua empresa e até 3 concorrentes. A IA pesquisa o
            mercado, monta a SWOT e cruza tudo numa matriz TOWS com 1 insight
            valioso por cruzamento.
          </p>

          <div className="mt-10 hidden lg:flex gap-4">
            {[
              { n: 1, label: "Pesquisa o mercado", bg: "bg-orange-50", text: "text-orange-500" },
              { n: 2, label: "Extrai a SWOT", bg: "bg-blue-50", text: "text-blue-500" },
              { n: 3, label: "Cruza em TOWS", bg: "bg-purple-50", text: "text-purple-500" },
            ].map((s) => (
              <div key={s.n} className="ios-card p-6 flex-1 text-center">
                <div
                  className={`w-10 h-10 rounded-full ${s.bg} flex items-center justify-center mx-auto mb-3`}
                >
                  <span className={`${s.text} font-bold`}>{s.n}</span>
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="ios-card p-10 ios-shadow border border-white">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label
                htmlFor="website"
                className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2"
              >
                <Globe className="w-4 h-4 text-orange-500" /> Site da empresa
              </label>
              <input
                type="text"
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl p-5 text-gray-900 placeholder-gray-300 focus:ring-2 focus:ring-orange-500 transition-all outline-none text-lg font-medium"
                placeholder="www.suaempresa.com"
                required
                disabled={isLoading}
                autoComplete="off"
              />
              <p className="text-xs text-gray-400 font-medium pl-1">
                Não precisa de “https://”. Pode começar com “www”.
              </p>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-500" /> Concorrentes (até 3)
              </label>
              <div className="grid grid-cols-1 gap-3">
                {competitors.map((comp, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={comp}
                    onChange={(e) => handleCompetitorChange(idx, e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-xl p-4 text-gray-900 placeholder-gray-300 focus:ring-2 focus:ring-gray-200 transition-all outline-none font-medium"
                    placeholder={`Concorrente ${idx + 1}`}
                    disabled={isLoading}
                    autoComplete="off"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!website.trim() || isLoading}
              className={`w-full py-5 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-xl ${
                !website.trim() || isLoading
                  ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                  : "gradient-bg text-white hover:scale-[1.02] active:scale-[0.98] shadow-orange-500/20"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" />
                  <span>{loadingLabel}</span>
                </>
              ) : (
                <>
                  Iniciar análise
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
