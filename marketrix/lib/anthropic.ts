import Anthropic from "@anthropic-ai/sdk";

// Modelo padrão (sobrescrevível por env). Mantido no servidor.
export const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

// Modelo do passo de estratégia (TOWS). Usa um modelo mais rápido por padrão
// para caber no limite de 60s de função do plano Hobby da Vercel, já que a
// saída é grande (4 insights + evidências + plano 30/60/90). Em planos com
// duração estendida (Pro/Enterprise), pode trocar por claude-sonnet-4-6.
export const STRATEGIZE_MODEL =
  process.env.ANTHROPIC_STRATEGIZE_MODEL || "claude-haiku-4-5-20251001";

export function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY não configurada no servidor. Defina a variável de ambiente."
    );
  }
  return new Anthropic({ apiKey });
}

type Message = Anthropic.Messages.Message;

// Cria uma mensagem (cast solto para acomodar ferramentas de servidor como web_search).
export async function createMessage(
  client: Anthropic,
  params: Record<string, unknown>
): Promise<Message> {
  return (await client.messages.create(params as never)) as Message;
}

// Extrai o input de um tool_use específico da resposta.
export function extractToolInput<T = unknown>(
  message: Message,
  toolName: string
): T | null {
  for (const block of message.content) {
    if (block.type === "tool_use" && block.name === toolName) {
      return block.input as T;
    }
  }
  return null;
}

// Concatena os blocos de texto da resposta.
export function extractText(message: Message): string {
  return message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}

// Coleta fontes (web_search_result) de qualquer conteúdo retornado pelas buscas.
export function collectSources(
  content: unknown[],
  into: { url: string; title?: string }[],
  seen: Set<string>
): void {
  for (const block of content as Array<Record<string, unknown>>) {
    if (block?.type === "web_search_tool_result" && Array.isArray(block.content)) {
      for (const r of block.content as Array<Record<string, unknown>>) {
        const url = typeof r?.url === "string" ? r.url : null;
        if (r?.type === "web_search_result" && url && !seen.has(url)) {
          seen.add(url);
          into.push({ url, title: typeof r.title === "string" ? r.title : undefined });
        }
      }
    }
  }
}
