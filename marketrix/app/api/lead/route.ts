import { NextRequest, NextResponse } from "next/server";
import { buildMarkdown } from "@/lib/export";
import type { SwotData, TowsData, Source } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: {
    nome?: unknown;
    email?: unknown;
    telefone?: unknown;
    company?: unknown;
    swot?: unknown;
    tows?: unknown;
    sources?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const nome = String(body?.nome ?? "").trim().slice(0, 120);
  const email = String(body?.email ?? "").trim().slice(0, 160);
  const telefone = String(body?.telefone ?? "").trim().slice(0, 40);
  const company = String(body?.company ?? "").trim().slice(0, 160);

  if (!nome || !email || !telefone) {
    return NextResponse.json(
      { error: "Preencha nome, email e telefone." },
      { status: 400 }
    );
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Email inválido." }, { status: 400 });
  }

  const swot = body?.swot as SwotData | undefined;
  const tows = (body?.tows as TowsData | null) ?? null;
  const sources = (Array.isArray(body?.sources) ? body.sources : []) as Source[];

  // Relatório em markdown para anexar ao corpo do email.
  let analysisMd = "(análise não disponível)";
  try {
    if (swot) {
      analysisMd = buildMarkdown({ company, swot, sources, tows });
    }
  } catch {
    // mantém o fallback
  }

  const leadEmail = process.env.LEAD_EMAIL || "marccusph@gmail.com";

  // Fallback: sempre registra o lead nos logs (visível em Runtime Logs da Vercel).
  console.log(
    "[lead] novo lead:",
    JSON.stringify({ nome, email, telefone, company, at: new Date().toISOString() })
  );

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Sem provedor de email configurado: não perde o lead (está nos logs), mas avisa.
    return NextResponse.json({
      ok: true,
      emailed: false,
      note: "Lead registrado nos logs. Configure RESEND_API_KEY para receber por email.",
    });
  }

  const text = `Novo lead capturado no Marketrix.

Nome: ${nome}
Email: ${email}
Telefone: ${telefone}
Empresa analisada: ${company}
Data: ${new Date().toLocaleString("pt-BR")}

================ ANÁLISE ================

${analysisMd}
`;

  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Marketrix <onboarding@resend.dev>",
        to: [leadEmail],
        reply_to: email,
        subject: `Novo lead Marketrix: ${nome}${company ? ` — ${company}` : ""}`,
        text,
      }),
    });

    if (!resp.ok) {
      const detail = await resp.text();
      console.error("[lead] falha no envio Resend:", resp.status, detail);
      // O lead já está nos logs; não falha pro usuário.
      return NextResponse.json({
        ok: true,
        emailed: false,
        note: "Lead registrado, mas o email falhou. Verifique a RESEND_API_KEY.",
      });
    }

    return NextResponse.json({ ok: true, emailed: true });
  } catch (e) {
    console.error("[lead] erro:", e);
    return NextResponse.json({ ok: true, emailed: false, note: "Lead registrado nos logs." });
  }
}
