// System prompts e definições de ferramentas (tool-use) para saída estruturada.

export const SWOT_SYSTEM = `Você é um estrategista sênior de MARKETING e GROWTH (não um analista financeiro). Você assessora líderes de marketing, founders e consultores.

Sua tarefa: uma SWOT da empresa-alvo focada EXCLUSIVAMENTE em marketing, marca, posicionamento, comunicação, aquisição, canais, conversão, retenção e crescimento — considerando os concorrentes informados.

Use a ferramenta web_search para pesquisar: proposta de valor e posicionamento, mensagem e tom de marca, público-alvo, canais de aquisição (SEO/orgânico, mídia paga, social, conteúdo, e-mail, parcerias, influência, PR), presença e percepção de marca, reputação/reviews, estratégia de conteúdo, pricing como percepção de valor, jornada e funil, e como os concorrentes se posicionam e se comunicam.

FOCO (inegociável): tudo deve ser acionável por um time de MARKETING. EVITE métricas puramente financeiras (lucro, ROE, M&A, funding, balanço, valuation) — só mencione finanças se forem diretamente úteis para uma decisão de marketing (ex.: budget, CAC, LTV, ticket médio).

Regras de qualidade:
1. SEM clichês ("boa marca", "marketing forte" sem evidência).
2. ESPECÍFICO: ângulos de posicionamento, lacunas de mensagem, canais subexplorados, ativos de marca, vantagens de aquisição/retenção.
3. HONESTO sobre fraquezas de marca, percepção e dependência de canal.
4. Cada item é uma frase informativa, não uma palavra solta.
5. Entre 4 e 6 itens por categoria.

Escreva TODO o conteúdo em português do Brasil.
Depois de pesquisar o suficiente, chame a ferramenta submit_swot. Não responda em texto livre — use a ferramenta.`;

export const TOWS_SYSTEM = `Você é um Chief Marketing Officer. A partir de uma SWOT de marketing, você constrói uma matriz TOWS com jogadas de MARKETING, MARCA, POSICIONAMENTO, VENDAS e GROWTH.

Gere EXATAMENTE 1 insight valioso para cada um dos 4 cruzamentos:
- SO (Forças × Oportunidades) — Maxi-Maxi: usar forças de marca/canal para capturar oportunidades.
- WO (Fraquezas × Oportunidades) — Mini-Maxi: corrigir fraquezas de marketing aproveitando oportunidades.
- ST (Forças × Ameaças) — Maxi-Mini: usar forças para defender posição e participação.
- WT (Fraquezas × Ameaças) — Mini-Mini: reduzir vulnerabilidades de marca e de aquisição.

Regras (inegociáveis):
1. Cada insight cruza fatores ESPECÍFICOS da SWOT (diga quais no internalFactor e externalFactor).
2. Cada insight é um MOVIMENTO DE MARKETING concreto: campanha, reposicionamento, jogada de canal, narrativa/mensagem, conteúdo, parceria, programa de growth, oferta. Proibido conselho vago ("invista em marketing", "use redes sociais"). Exija ângulos criativos e específicos.
3. Cada insight tem um primeiro passo (firstStep) real e executável por um time de marketing.
4. Avalie impact (1-5), effort (1-5) e risk (Baixo/Médio/Alto) com critério.
5. No sumário executivo: o insight central (coreInsight) e a direção estratégica de marketing (direction).
6. Priorização: títulos a executar agora (pursueNow), a observar (watch) e UM a evitar (avoid) com o motivo.
7. Para CADA cruzamento, preencha "evidence" com o dado/sinal de marketing (com número quando houver) que sustenta o insight, e "evidenceSource" com a URL mais relevante da lista de FONTES (ou "" se nenhuma se aplicar). Não invente URLs — use apenas as fornecidas.
8. Monte um "actionPlan" 30/60/90 dias de EXECUÇÃO DE MARKETING: 2 a 3 ações concisas por fase (testes de canal, calendário de conteúdo, campanhas, experimentos), sequenciadas, cada uma com métrica mensurável (ex.: CAC, CTR, share of search, leads, taxa de conversão, CPL).

Escreva TODO o conteúdo em português do Brasil, com tom decisivo.
Chame a ferramenta submit_tows. Não responda em texto livre.`;

export const swotTool = {
  name: "submit_swot",
  description: "Registra a análise SWOT estruturada (conteúdo em português do Brasil).",
  input_schema: {
    type: "object" as const,
    properties: {
      strengths: {
        type: "array",
        items: { type: "string" },
        description: "Forças internas específicas e baseadas em evidências (4 a 6).",
      },
      weaknesses: {
        type: "array",
        items: { type: "string" },
        description: "Fraquezas internas honestas e concretas (4 a 6).",
      },
      opportunities: {
        type: "array",
        items: { type: "string" },
        description: "Oportunidades externas reais do mercado (4 a 6).",
      },
      threats: {
        type: "array",
        items: { type: "string" },
        description: "Ameaças externas concretas (4 a 6).",
      },
    },
    required: ["strengths", "weaknesses", "opportunities", "threats"],
  },
};

export const towsTool = {
  name: "submit_tows",
  description:
    "Registra a matriz TOWS com 1 insight valioso por cruzamento, sumário executivo e priorização (em português do Brasil).",
  input_schema: {
    type: "object" as const,
    properties: {
      executiveSummary: {
        type: "object",
        properties: {
          overview: { type: "string", description: "Panorama estratégico em 4 a 6 linhas." },
          coreInsight: { type: "string", description: "O insight central mais importante." },
          direction: { type: "string", description: "Direção estratégica recomendada, curta e marcante." },
        },
        required: ["overview", "coreInsight", "direction"],
      },
      crossings: {
        type: "array",
        description: "Exatamente 4 cruzamentos, na ordem SO, WO, ST, WT — 1 insight cada.",
        items: {
          type: "object",
          properties: {
            quadrant: { type: "string", enum: ["SO", "WO", "ST", "WT"] },
            title: { type: "string", description: "Título curto e marcante do insight." },
            insight: {
              type: "string",
              description: "O insight valioso e acionável, em 2 a 4 frases.",
            },
            internalFactor: {
              type: "string",
              description: "A força ou fraqueza específica da SWOT usada neste cruzamento.",
            },
            externalFactor: {
              type: "string",
              description: "A oportunidade ou ameaça específica da SWOT usada neste cruzamento.",
            },
            impact: { type: "integer", minimum: 1, maximum: 5 },
            effort: { type: "integer", minimum: 1, maximum: 5 },
            risk: { type: "string", enum: ["Baixo", "Médio", "Alto"] },
            firstStep: { type: "string", description: "Primeiro passo concreto para começar a executar." },
            evidence: {
              type: "string",
              description: "Dado ou fato concreto (com número quando houver) que sustenta este insight.",
            },
            evidenceSource: {
              type: "string",
              description: "URL da fonte mais relevante (escolhida da lista fornecida) que embasa o insight; ou string vazia.",
            },
          },
          required: [
            "quadrant",
            "title",
            "insight",
            "internalFactor",
            "externalFactor",
            "impact",
            "effort",
            "risk",
            "firstStep",
            "evidence",
          ],
        },
      },
      prioritization: {
        type: "object",
        properties: {
          pursueNow: {
            type: "array",
            items: { type: "string" },
            description: "Títulos dos insights a executar agora.",
          },
          watch: {
            type: "array",
            items: { type: "string" },
            description: "Títulos dos insights a observar / adiar.",
          },
          avoid: {
            type: "object",
            properties: {
              title: { type: "string" },
              reason: { type: "string" },
            },
            required: ["title", "reason"],
          },
        },
        required: ["pursueNow", "watch", "avoid"],
      },
      actionPlan: {
        type: "object",
        description: "Plano de ação 30/60/90 dias, com ações concretas e métrica de sucesso.",
        properties: {
          days30: {
            type: "array",
            description: "Ações para os primeiros 30 dias.",
            items: {
              type: "object",
              properties: {
                action: { type: "string", description: "Ação concreta a executar." },
                metric: { type: "string", description: "Métrica de sucesso mensurável." },
              },
              required: ["action", "metric"],
            },
          },
          days60: {
            type: "array",
            description: "Ações para 31 a 60 dias.",
            items: {
              type: "object",
              properties: {
                action: { type: "string", description: "Ação concreta a executar." },
                metric: { type: "string", description: "Métrica de sucesso mensurável." },
              },
              required: ["action", "metric"],
            },
          },
          days90: {
            type: "array",
            description: "Ações para 61 a 90 dias.",
            items: {
              type: "object",
              properties: {
                action: { type: "string", description: "Ação concreta a executar." },
                metric: { type: "string", description: "Métrica de sucesso mensurável." },
              },
              required: ["action", "metric"],
            },
          },
        },
        required: ["days30", "days60", "days90"],
      },
    },
    required: ["executiveSummary", "crossings", "actionPlan", "prioritization"],
  },
};
