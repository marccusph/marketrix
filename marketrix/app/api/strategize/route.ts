import { NextRequest, NextResponse } from "next/server";
import { getClient, STRATEGIZE_MODEL, createMessage, extractToolInput } from "@/lib/anthropic";
import { TOWS_SYSTEM, towsTool } from "@/lib/prompts";
import type { SwotData, TowsData } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isValidSwot(s: unknown): s is SwotData {
  if (!s || typeof s !== "object") return false;
  const o = s as Record<string, unknown>;
  return (
    Array.isArray(o.strengths) &&
    Array.isArray(o.weaknesses) &&
    Array.isArray(o.opportunities) &&
    Array.isArray(o.threats)
  );
}

// --- Normalização defensiva da saída do modelo (evita crash no cliente) ---
function asArray(x: unknown): unknown[] {
  return Array.isArray(x) ? x : [];
}
function str(x: unknown): string {
  return typeof x === "string" ? x : x == null ? "" : String(x);
}
function planItems(x: unknown): { action: string; metric: string }[] {
  return asArray(x)
    .map((i) => {
      const o = (i ?? {}) as Record<string, unknown>;
      return { action: str(o.action), metric: str(o.metric) };
    })
    .filter((i) => i.action);
}
function clamp(n: unknown): number {
  const v = Number(n);
  if (!Number.isFinite(v)) return 3;
  return Math.max(1, Math.min(5, Math.round(v)));
}
function normalizeTows(raw: unknown): TowsData {
  const t = (raw ?? {}) as Record<string, unknown>;
  const es = (t.executiveSummary ?? {}) as Record<string, unknown>;
  const pr = (t.prioritization ?? {}) as Record<string, unknown>;
  const av = (pr.avoid ?? {}) as Record<string, unknown>;
  const ap = (t.actionPlan ?? {}) as Record<string, unknown>;
  const RISKS = ["Baixo", "Médio", "Alto"];
  const QUADS = ["SO", "WO", "ST", "WT"];

  const crossings = asArray(t.crossings).map((c) => {
    const o = (c ?? {}) as Record<string, unknown>;
    const q = str(o.quadrant).toUpperCase();
    const r = str(o.risk);
    return {
      quadrant: (QUADS.includes(q) ? q : "SO") as TowsData["crossings"][number]["quadrant"],
      title: str(o.title),
      insight: str(o.insight),
      internalFactor: str(o.internalFactor),
      externalFactor: str(o.externalFactor),
      evidence: str(o.evidence),
      evidenceSource: typeof o.evidenceSource === "string" ? o.evidenceSource : "",
      impact: clamp(o.impact),
      effort: clamp(o.effort),
      risk: (RISKS.includes(r) ? r : "Médio") as TowsData["crossings"][number]["risk"],
      firstStep: str(o.firstStep),
    };
  });

  return {
    executiveSummary: {
      overview: str(es.overview),
      coreInsight: str(es.coreInsight),
      direction: str(es.direction),
    },
    crossings,
    actionPlan: {
      days30: planItems(ap.days30),
      days60: planItems(ap.days60),
      days90: planItems(ap.days90),
    },
    prioritization: {
      pursueNow: asArray(pr.pursueNow).map(str).filter(Boolean),
      watch: asArray(pr.watch).map(str).filter(Boolean),
      avoid: { title: str(av.title), reason: str(av.reason) },
    },
  };
}

export async function POST(req: NextRequest) {
  let body: {
    swot?: unknown;
    company?: unknown;
    competitors?: unknown;
    sources?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  if (!isValidSwot(body?.swot)) {
    return NextResponse.json({ error: "SWOT ausente ou inválida." }, { status: 400 });
  }

  const swot = body.swot;
  const company = String(body?.company ?? "").trim();
  const competitors: string[] = Array.isArray(body?.competitors)
    ? (body.competitors as unknown[]).map((c) => String(c).trim()).filter(Boolean).slice(0, 3)
    : [];

  const sources: string[] = Array.isArray(body?.sources)
    ? (body.sources as Array<Record<string, unknown>>)
        .map((s) => (typeof s?.url === "string" ? s.url : ""))
        .filter(Boolean)
        .slice(0, 12)
    : [];

  let client;
  try {
    client = getClient();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro de configuração." },
      { status: 500 }
    );
  }

  const userMsg = `Empresa: ${company || "(não informada)"}
Concorrentes: ${competitors.length ? competitors.join(", ") : "(não informados)"}

SWOT:
FORÇAS:
- ${swot.strengths.join("\n- ")}

FRAQUEZAS:
- ${swot.weaknesses.join("\n- ")}

OPORTUNIDADES:
- ${swot.opportunities.join("\n- ")}

AMEAÇAS:
- ${swot.threats.join("\n- ")}

FONTES disponíveis (use estas URLs em evidenceSource quando uma delas sustentar o insight):
- ${sources.length ? sources.join("\n- ") : "(nenhuma fornecida)"}

Gere a matriz TOWS com 1 insight valioso por cruzamento.`;

  try {
    const resp = await createMessage(client, {
      model: STRATEGIZE_MODEL,
      max_tokens: 4096,
      system: TOWS_SYSTEM,
      tools: [towsTool],
      tool_choice: { type: "tool", name: "submit_tows" },
      messages: [{ role: "user", content: userMsg }],
    });

    const tows = extractToolInput<TowsData>(resp, "submit_tows");
    if (!tows) {
      return NextResponse.json(
        { error: "Não foi possível gerar a matriz TOWS. Tente novamente." },
        { status: 502 }
      );
    }

    return NextResponse.json({ tows });
  } catch (e) {
    console.error("[strategize] erro:", e);
    return NextResponse.json(
      { error: "Falha ao gerar as estratégias. Tente novamente." },
      { status: 500 }
    );
  }
}
