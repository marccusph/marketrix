import type { SwotData, Source, TowsData, Quadrant } from "@/lib/types";

interface PrintReportProps {
  company: string;
  swot: SwotData;
  sources: Source[];
  tows: TowsData | null;
}

const QUAD: Record<Quadrant, string> = {
  SO: "SO · Forças × Oportunidades",
  WO: "WO · Fraquezas × Oportunidades",
  ST: "ST · Forças × Ameaças",
  WT: "WT · Fraquezas × Ameaças",
};
const ORDER: Quadrant[] = ["SO", "WO", "ST", "WT"];

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <h3 style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, margin: "0 0 6px" }}>
        {title}
      </h3>
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {items.map((it, i) => (
          <li key={i} style={{ fontSize: 12.5, lineHeight: 1.5, marginBottom: 4 }}>
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Relatório completo, otimizado para impressão / PDF. Renderizado só no print.
export function PrintReport({ company, swot, sources, tows }: PrintReportProps) {
  const date = new Date().toLocaleDateString("pt-BR");
  return (
    <div style={{ color: "#111", fontFamily: "Inter, sans-serif", padding: "8px 4px", maxWidth: 720, margin: "0 auto" }}>
      <div style={{ borderBottom: "2px solid #ff6b3d", paddingBottom: 10, marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>
          Marke<span style={{ color: "#ff6b3d" }}>trix</span> — Análise estratégica
        </h1>
        <p style={{ fontSize: 12.5, color: "#555", margin: "4px 0 0" }}>
          Empresa: <strong>{company}</strong> · {date}
        </p>
      </div>

      <h2 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 10px" }}>Matriz SWOT</h2>
      <List title="Forças" items={swot.strengths} />
      <List title="Fraquezas" items={swot.weaknesses} />
      <List title="Oportunidades" items={swot.opportunities} />
      <List title="Ameaças" items={swot.threats} />

      {sources.length > 0 && (
        <p style={{ fontSize: 10.5, color: "#666", marginTop: 8 }}>
          Fontes: {sources.map((s) => hostOf(s.url)).join(" · ")}
        </p>
      )}

      {tows && (
        <div style={{ marginTop: 20, pageBreakBefore: "always" }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 10px" }}>Roteiro estratégico (TOWS)</h2>

          <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, marginBottom: 16 }}>
            <h3 style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: "#ff6b3d", margin: "0 0 6px" }}>
              Sumário executivo
            </h3>
            <p style={{ fontSize: 13, lineHeight: 1.5, margin: "0 0 8px" }}>{tows.executiveSummary?.overview}</p>
            <p style={{ fontSize: 12.5, fontStyle: "italic", margin: "0 0 4px" }}>
              <strong>Insight central:</strong> “{tows.executiveSummary?.coreInsight}”
            </p>
            <p style={{ fontSize: 12.5, margin: 0 }}>
              <strong>Direção:</strong> {tows.executiveSummary?.direction}
            </p>
          </div>

          <h3 style={{ fontSize: 14, fontWeight: 800, margin: "0 0 8px" }}>Os 4 cruzamentos</h3>
          {[...(tows.crossings ?? [])]
            .sort((a, b) => ORDER.indexOf(a.quadrant) - ORDER.indexOf(b.quadrant))
            .map((c, i) => (
              <div key={i} style={{ borderLeft: "3px solid #ff6b3d", paddingLeft: 10, marginBottom: 14, pageBreakInside: "avoid" }}>
                <p style={{ fontSize: 10.5, fontWeight: 800, color: "#888", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 2px" }}>
                  {QUAD[c.quadrant]}
                </p>
                <h4 style={{ fontSize: 13.5, fontWeight: 800, margin: "0 0 4px" }}>{c.title}</h4>
                <p style={{ fontSize: 12.5, lineHeight: 1.5, margin: "0 0 6px" }}>{c.insight}</p>
                <p style={{ fontSize: 11.5, margin: "0 0 3px" }}>
                  <strong>Evidência:</strong> {c.evidence}
                  {c.evidenceSource ? ` (${hostOf(c.evidenceSource)})` : ""}
                </p>
                <p style={{ fontSize: 11.5, color: "#555", margin: "0 0 3px" }}>
                  Impacto {c.impact}/5 · Esforço {c.effort}/5 · Risco {c.risk}
                </p>
                <p style={{ fontSize: 11.5, margin: 0 }}>
                  <strong>Primeiro passo:</strong> {c.firstStep}
                </p>
              </div>
            ))}

          {tows.actionPlan && (
            <div style={{ marginTop: 14 }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, margin: "0 0 8px" }}>Plano de ação 30 / 60 / 90 dias</h3>
              {[
                { label: "Primeiros 30 dias", items: tows.actionPlan.days30 },
                { label: "31–60 dias", items: tows.actionPlan.days60 },
                { label: "61–90 dias", items: tows.actionPlan.days90 },
              ].map((ph, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <p style={{ fontSize: 12, fontWeight: 800, margin: "0 0 3px" }}>{ph.label}</p>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {(ph.items || []).map((a, j) => (
                      <li key={j} style={{ fontSize: 11.5, lineHeight: 1.45, marginBottom: 3 }}>
                        {a.action} <em style={{ color: "#666" }}>— métrica: {a.metric}</em>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 12, fontSize: 11.5 }}>
            <p style={{ margin: "0 0 3px" }}>
              <strong>Executar agora:</strong> {(tows.prioritization?.pursueNow ?? []).join("; ")}
            </p>
            {(tows.prioritization?.watch?.length ?? 0) > 0 && (
              <p style={{ margin: "0 0 3px" }}>
                <strong>Observar:</strong> {(tows.prioritization?.watch ?? []).join("; ")}
              </p>
            )}
            <p style={{ margin: 0 }}>
              <strong>Evitar:</strong> {tows.prioritization?.avoid?.title} — {tows.prioritization?.avoid?.reason}
            </p>
          </div>
        </div>
      )}

      <p style={{ fontSize: 10, color: "#999", marginTop: 20, borderTop: "1px solid #eee", paddingTop: 8 }}>
        Gerado por Marketrix · Inteligência por Claude
      </p>
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
