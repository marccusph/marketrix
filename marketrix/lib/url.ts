// Normaliza a URL informada pelo usuário.
// Aceita "www.empresa.com", "empresa.com", "empresa.com.br" ou com https:// já incluso.
// O usuário NÃO precisa digitar o protocolo.

export interface NormalizedUrl {
  url: string; // origem completa, ex.: https://www.empresa.com
  host: string; // hostname sem "www.", ex.: empresa.com
}

export function normalizeUrl(raw: string): NormalizedUrl | null {
  if (!raw || typeof raw !== "string") return null;

  let s = raw.trim().toLowerCase().replace(/\s+/g, "");
  if (!s) return null;

  // Adiciona https:// se não houver protocolo.
  if (!/^https?:\/\//.test(s)) {
    s = "https://" + s;
  }

  try {
    const u = new URL(s);
    const hostname = u.hostname;

    // Validação básica de domínio: precisa de pelo menos um ponto e um TLD com 2+ letras.
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/.test(hostname)) {
      return null;
    }

    return {
      url: u.origin,
      host: hostname.replace(/^www\./, ""),
    };
  } catch {
    return null;
  }
}
