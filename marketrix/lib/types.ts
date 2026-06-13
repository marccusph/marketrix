// Tipos compartilhados entre servidor e cliente.

export interface SwotData {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface Source {
  url: string;
  title?: string;
}

export interface AnalyzeResponse {
  swot: SwotData;
  sources: Source[];
  company: string;
}

export type Quadrant = "SO" | "WO" | "ST" | "WT";
export type Risk = "Baixo" | "Médio" | "Alto";

// 1 insight valioso por cruzamento da matriz TOWS.
export interface CrossingInsight {
  quadrant: Quadrant;
  title: string;
  insight: string;
  internalFactor: string; // a força/fraqueza específica usada
  externalFactor: string; // a oportunidade/ameaça específica usada
  impact: number; // 1-5
  effort: number; // 1-5
  risk: Risk;
  firstStep: string;
}

export interface ExecutiveSummary {
  overview: string;
  coreInsight: string;
  direction: string;
}

export interface TowsData {
  executiveSummary: ExecutiveSummary;
  crossings: CrossingInsight[]; // exatamente 4: SO, WO, ST, WT
  prioritization: {
    pursueNow: string[];
    watch: string[];
    avoid: { title: string; reason: string };
  };
}

export interface StrategizeResponse {
  tows: TowsData;
}
