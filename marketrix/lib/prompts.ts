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
    },
    required: ["executiveSummary", "crossings", "prioritization"],
  },
};
