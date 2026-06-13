# Marketrix — Co-piloto de Estratégia (SWOT → TOWS)

Você insere o **site da sua empresa** e **até 3 concorrentes**. A IA pesquisa o mercado, monta a **SWOT** e cruza tudo numa matriz **TOWS**, gerando **1 insight valioso para cada cruzamento** (SO, WO, ST, WT) — com impacto, esforço, risco e primeiro passo.

Construído com **Next.js + Claude (Anthropic)**. A chave da API fica **100% no servidor** — nunca é exposta no navegador.

---

## ✨ Como funciona

1. **Pesquisa real** — o Claude usa *web search* nativo pra analisar a empresa e os concorrentes com fontes citadas (substitui o grounding do Google).
2. **SWOT** — forças, fraquezas, oportunidades e ameaças, específicas e sem clichês.
3. **TOWS** — 1 insight acionável por cruzamento + sumário executivo + priorização (executar / observar / evitar).

URL sem burocracia: não precisa digitar `https://`. Pode começar com `www` (ou só `empresa.com`, `empresa.com.br`).

---

## 🔑 Pré-requisito: chave da Anthropic

1. Crie uma chave em https://console.anthropic.com/settings/keys
2. Copie o arquivo de exemplo e cole sua chave:

```bash
cp .env.example .env.local
# edite .env.local e preencha ANTHROPIC_API_KEY=sk-ant-...
```

> O `.env.local` está no `.gitignore` — sua chave **nunca** vai pro Git.

---

## 🚀 Rodar localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000

Build de produção:

```bash
npm run build
npm start
```

---

## ☁️ Deploy na Vercel

1. Suba o projeto pra um repositório no GitHub (veja abaixo).
2. Na Vercel: **New Project** → importe o repositório.
3. Em **Settings → Environment Variables**, adicione:
   - `ANTHROPIC_API_KEY` = sua chave
   - (opcional) `ANTHROPIC_MODEL` = `claude-sonnet-4-6` (padrão) ou `claude-opus-4-8`
4. Deploy. A Vercel detecta o Next.js automaticamente.

---

## 📁 Estrutura

```
marketrix/
├─ app/
│  ├─ page.tsx              # Fluxo: input → SWOT → TOWS (estado explícito, sem gambiarra)
│  ├─ layout.tsx
│  ├─ globals.css
│  └─ api/
│     ├─ analyze/route.ts   # SWOT (web search + tool-use). Chave só no servidor.
│     └─ strategize/route.ts# TOWS (tool-use forçado → JSON garantido)
├─ components/              # Header, InputForm, SwotView, TowsView
├─ lib/
│  ├─ anthropic.ts          # Cliente + helpers (sem chave hardcoded)
│  ├─ prompts.ts            # System prompts + schemas das ferramentas
│  ├─ types.ts              # Tipos compartilhados
│  └─ url.ts                # Normalização de URL (aceita "www", sem https)
└─ .env.example
```

---

## 🔒 Segurança & decisões

- **Chave no servidor**: as chamadas ao Claude acontecem em *API routes* (`runtime nodejs`). O navegador nunca vê a chave. (Erro corrigido do protótipo anterior, que embutia a chave no bundle.)
- **Saída estruturada confiável**: usamos *tool-use* (`tool_choice` forçado no TOWS) em vez de parsear texto solto.
- **Estado explícito**: sem detecção de "modo demo" por string mágica; sem regex frágil pra reconstruir inputs.
- **Versões alinhadas**: uma única fonte (`package.json`), sem *importmap* duplicado.

---

## ⚙️ Modelo

Padrão: `claude-sonnet-4-6`. Para análises mais profundas, defina `ANTHROPIC_MODEL=claude-opus-4-8`.

---

*Marketrix · Inteligência por Claude (Anthropic).*
