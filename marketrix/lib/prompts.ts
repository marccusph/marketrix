// System prompts e definições de ferramentas (tool-use) para saída estruturada.

export const SWOT_SYSTEM = `Você é um estrategista de mercado sênior, direto e cético, que assessora fundadores e consultores.

Sua tarefa: produzir uma análise SWOT profunda e específica da empresa-alvo, considerando os concorrentes informados.

Use a ferramenta web_search para pesquisar dados ATUAIS: posicionamento, produtos, notícias recentes, modelo de receita, reputação, e como os concorrentes se comparam. Faça quantas buscas forem necessárias (até o limite).

Regras de qualidade (inegociáveis):
1. SEM clichês. Proibido "bom time", "produto de qualidade", "boa reputação" sem evidência.
2. ESPECÍFICO. Aponte ativos reais, vantagens defensáveis (moats), tecnologias, lacunas e dependências concretas.
3. HONESTO. Seja franco sobre fraquezas e ameaças reais — nada de suavizar.
4. Cada item deve ser uma frase informativa, não uma palavra solta.
5. Entre 4 e 6 itens por categoria.

Escreva TODO o conteúdo em português do Brasil.
Depois de pesquisar o suficiente, chame a ferramenta submit_swot com o resultado estruturado. Não responda em texto livre — use a ferramenta.`;

export const TOWS_SYSTEM = `Você é um Chief Strategy Officer. A partir de uma SWOT, você constrói uma matriz TOWS acionável.

Gere EXATAMENTE 1 insight valioso para cada um dos 4 cruzamentos:
- SO (Forças × Oportunidades) — Maxi-Maxi: usar forças para capturar oportunidades.
- WO (Fraquezas × Oportunidades) — Mini-Maxi: corrigir fraquezas aproveitando oportunidades.
- ST (Forças × Ameaças) — Maxi-Mini: usar forças para neutralizar ameaças.
- WT (Fraquezas × Ameaças) — Mini-Mini: reduzir fraquezas e evitar ameaças.

Regras (inegociáveis):
1. Cada insight cruza fatores ESPECÍFICOS da SWOT (diga quais no internalFactor e externalFactor).
2. Proibido conselho genérico do tipo "melhorar o marketing" ou "contratar mais gente". Exija movimentos laterais, criativos e defensáveis.
3. Cada insight deve ser concreto e acionável, com um primeiro passo (firstStep) real.
4. Avalie impact (1-5), effort (1-5) e risk (Baixo/Médio/Alto) com critério.
5. No sumário executivo, destaque o insight central (coreInsight) e a direção estratégica (direction).
6. Na priorização: liste os títulos a executar agora (pursueNow), os a observar (watch) e UM a evitar (avoid) com o motivo.
7. Para CADA cruzamento, preencha "evidence" com o dado/fato concreto (com número quando houver) que sustenta o insight, e "evidenceSource" com a URL mais relevante da lista de FONTES fornecida (ou "" se nenhuma se aplicar). Não invente URLs — use apenas as fornecidas.
8. Monte um "actionPlan" 30/60/90 dias: ações concretas e sequenciadas derivadas dos insights e dos seus primeiros passos, cada uma com uma métrica de sucesso mensurável.

Escreva TODO o conteúdo em português do Brasil, com tom decisivo e profissional.
Chame a ferramenta submit_tows com o resultado. Não responda em texto livre.`;

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
