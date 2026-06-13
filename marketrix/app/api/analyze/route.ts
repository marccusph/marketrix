import { NextRequest, NextResponse } from "next/server";
import {
  getClient,
  MODEL,
  createMessage,
  extractToolInput,
  extractText,
  collectSources,
} from "@/lib/anthropic";
import { normalizeUrl } from "@/lib/url";
import { SWOT_SYSTEM, swotTool } from "@/lib/prompts";
import type { SwotData, Source } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let body: { website?: unknown; competitors?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const norm = normalizeUrl(String(body?.website ?? ""));
  if (!norm) {
    return NextResponse.json(
      { error: "Informe um site válido. Ex.: www.suaempresa.com" },
      { status: 400 }
    );
  }

  const competitors: string[] = Array.isArray(body?.competitors)
    ? (body.competitors as unknown[])
        .map((c) => String(c).trim())
        .filter(Boolean)
        .slice(0, 3)
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

  const sources: Source[] = [];
  const seen = new Set<string>();

  const userMsg = `Empresa-alvo: ${norm.url} (${norm.host})
Concorrentes informados: ${
    competitors.length ? competitors.join(", ") : "nenhum — identifique os principais concorrentes"
  }.

Pesquise e produza a SWOT desta empresa.`;

  const params = {
    model: MODEL,
    max_tokens: 2800,
    system: SWOT_SYSTEM,
    tools: [
      { type: "web_search_20250305", name: "web_search", max_uses: 3 },
      swotTool,
    ],
    messages: [{ role: "user", content: userMsg }] as Array<Record<string, unknown>>,
  };

  try {
    let resp = await createMessage(client, params);
    collectSources(resp.content, sources, seen);

    // Continua o turno se o servidor pausou para executar buscas.
    let pauses = 0;
    const msgs = [...params.messages];
    while (resp.stop_reason === "pause_turn" && pauses < 4) {
      msgs.push({ role: "assistant", content: resp.content as unknown as Record<string, unknown> });
      resp = await createMessage(client, { ...params, messages: msgs });
      collectSources(resp.content, sources, seen);
      pauses++;
    }

    let swot = extractToolInput<SwotData>(resp, "submit_swot");

    // Fallback: força a estruturação a partir do texto pesquisado.
    if (!swot) {
      const text = extractText(resp);
      const resp2 = await createMessage(client, {
        model: MODEL,
        max_tokens: 2048,
        tools: [swotTool],
        tool_choice: { type: "tool", name: "submit_swot" },
        messages: [
          {
            role: "user",
            content: `Com base nesta pesquisa, retorne a SWOT estruturada em português do Brasil:\n\n${
              text || userMsg
            }`,
          },
        ],
      });
      swot = extractToolInput<SwotData>(resp2, "submit_swot");
    }

    if (!swot) {
      return NextResponse.json(
        { error: "Não foi possível gerar a SWOT. Tente novamente." },
        { status: 502 }
      );
    }

    const clean = (a: unknown): string[] =>
      Array.isArray(a) ? a.map((x) => String(x).trim()).filter(Boolean).slice(0, 6) : [];

    const swotClean: SwotData = {
      strengths: clean(swot.strengths),
      weaknesses: clean(swot.weaknesses),
      opportunities: clean(swot.opportunities),
      threats: clean(swot.threats),
    };

    return NextResponse.json({
      swot: swotClean,
      sources: sources.slice(0, 10),
      company: norm.host,
    });
  } catch (e) {
    console.error("[analyze] erro:", e);
    return NextResponse.json(
      { error: "Falha ao analisar. Verifique o site e tente novamente." },
      { status: 500 }
    );
  }
}
