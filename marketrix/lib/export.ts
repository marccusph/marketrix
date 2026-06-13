import type { SwotData, Source, TowsData } from "./types";

export interface AnalysisBundle {
  company: string;
  swot: SwotData;
  sources: Source[];
  tows: TowsData | null;
}

const QUAD_LABEL: Record<string, string> = {
  SO: "SO — Forças × Oportunidades",
  WO: "WO — Fraquezas × Oportunidades",
  ST: "ST — Forças × Ameaças",
  WT: "WT — Fraquezas × Ameaças",
};

// Constrói o relatório completo em Markdown (puro — seguro no servidor e no cliente).
export function buildMarkdown(data: AnalysisBundle): string {
  const { company, swot, sources, tows } = data;
  const lines: string[] = [];
  const date = new Date().toLocaleDateString("pt-BR");

  lines.push(`# Marketrix — Análise estratégica`);
  lines.push(``);
  lines.push(`**Empresa:** ${company}  `);
  lines.push(`**Data:** ${date}`);
  lines.push(``);
  lines.push(`## Matriz SWOT`);
  const block = (title: string, items: string[]) => {
    lines.push(``);
    lines.push(`### ${title}`);
    if (items.length === 0) lines.push(`- —`);
    items.forEach((i) => lines.push(`- ${i}`));
  };
  block("Forças", swot.strengths);
  block("Fraquezas", swot.weaknesses);
  block("Oportunidades", swot.opportunities);
  block("Ameaças", swot.threats);

  if (sources.length) {
    lines.push(``);
    lines.push(`### Fontes verificadas`);
    sources.forEach((s) => lines.push(`- ${s.title ? s.title + " — " : ""}${s.url}`));
  }

  if (tows) {
    lines.push(``);
    lines.push(`## Roteiro estratégico (TOWS)`);
    lines.push(``);
    lines.push(`### Sumário executivo`);
    lines.push(tows.executiveSummary.overview);
    lines.push(``);
    lines.push(`> **Insight central:** ${tows.executiveSummary.coreInsight}`);
    lines.push(``);
    lines.push(`**Direção estratégica:** ${tows.executiveSummary.direction}`);

    lines.push(``);
    lines.push(`### Os 4 cruzamentos`);
    const order = ["SO", "WO", "ST", "WT"];
    [...tows.crossings]
      .sort((a, b) => order.indexOf(a.quadrant) - order.indexOf(b.quadrant))
      .forEach((c) => {
        lines.push(``);
        lines.push(`#### [${QUAD_LABEL[c.quadrant] || c.quadrant}] ${c.title}`);
        lines.push(c.insight);
        lines.push(``);
        lines.push(`- **Interno:** ${c.internalFactor}`);
        lines.push(`- **Externo:** ${c.externalFactor}`);
        lines.push(`- **Evidência:** ${c.evidence}${c.evidenceSource ? ` (${c.evidenceSource})` : ""}`);
        lines.push(`- **Impacto:** ${c.impact}/5 · **Esforço:** ${c.effort}/5 · **Risco:** ${c.risk}`);
        lines.push(`- **Primeiro passo:** ${c.firstStep}`);
      });

    if (tows.actionPlan) {
      lines.push(``);
      lines.push(`### Plano de ação 30 / 60 / 90 dias`);
      const phase = (title: string, items: { action: string; metric: string }[]) => {
        lines.push(``);
        lines.push(`**${title}**`);
        (items || []).forEach((a) => lines.push(`- ${a.action} — _métrica:_ ${a.metric}`));
      };
      phase("Primeiros 30 dias", tows.actionPlan.days30);
      phase("31–60 dias", tows.actionPlan.days60);
      phase("61–90 dias", tows.actionPlan.days90);
    }

    lines.push(``);
    lines.push(`### Priorização`);
    lines.push(`- **Executar agora:** ${tows.prioritization.pursueNow.join("; ")}`);
    if (tows.prioritization.watch?.length)
      lines.push(`- **Observar:** ${tows.prioritization.watch.join("; ")}`);
    lines.push(
      `- **Evitar:** ${tows.prioritization.avoid.title} — ${tows.prioritization.avoid.reason}`
    );
  }

  lines.push(``);
  lines.push(`---`);
  lines.push(`_Gerado por Marketrix · Inteligência por Claude_`);
  return lines.join("\n");
}

// Faz o download de um texto como arquivo (somente no cliente).
export function downloadTextFile(filename: string, content: string, mime = "text/markdown") {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function slugify(s: string): string {
  const base = (s || "empresa")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 40);
  return base || "empresa";
}
