"use client";

import { useState } from "react";
import { X, Loader2, CheckCircle2, Rocket } from "lucide-react";
import type { SwotData, TowsData, Source } from "@/lib/types";

interface LeadFormProps {
  open: boolean;
  onClose: () => void;
  company: string;
  swot: SwotData;
  tows: TowsData | null;
  sources: Source[];
}

export function LeadForm({ open, onClose, company, swot, tows, sources }: LeadFormProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !email.trim() || !telefone.trim() || status === "sending") return;
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, telefone, company, swot, tows, sources }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Falha ao enviar.");
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Erro inesperado.");
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="ios-card w-full max-w-md p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-300 hover:text-gray-600 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {status === "done" ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-5 shadow-lg shadow-orange-500/30">
              <CheckCircle2 className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Recebido!</h3>
            <p className="text-gray-500 font-medium leading-relaxed">
              Sua análise foi enviada junto com seus dados. Em breve entramos em contato para
              colocar o plano em prática.
            </p>
            <button
              onClick={onClose}
              className="mt-7 w-full py-4 rounded-2xl gradient-bg text-white font-bold active:scale-[0.98] transition-all"
            >
              Fechar
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl gradient-bg flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">Quero implementar</h3>
            </div>
            <p className="text-gray-500 font-medium text-sm mb-6 leading-relaxed">
              Deixe seus dados e enviaremos esta análise para darmos o próximo passo na execução.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome"
                required
                disabled={status === "sending"}
                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-gray-900 placeholder-gray-300 focus:ring-2 focus:ring-orange-500 outline-none font-medium"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                disabled={status === "sending"}
                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-gray-900 placeholder-gray-300 focus:ring-2 focus:ring-orange-500 outline-none font-medium"
              />
              <input
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="Telefone"
                required
                disabled={status === "sending"}
                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-gray-900 placeholder-gray-300 focus:ring-2 focus:ring-orange-500 outline-none font-medium"
              />

              {status === "error" && (
                <p className="text-sm text-red-500 font-medium">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={status === "sending" || !nome.trim() || !email.trim() || !telefone.trim()}
                className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                  status === "sending" || !nome.trim() || !email.trim() || !telefone.trim()
                    ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                    : "gradient-bg text-white hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-orange-500/20"
                }`}
              >
                {status === "sending" ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" /> Enviando…
                  </>
                ) : (
                  "Enviar e implementar"
                )}
              </button>
              <p className="text-[11px] text-gray-400 text-center font-medium">
                Seus dados são usados apenas para contato sobre esta análise.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
