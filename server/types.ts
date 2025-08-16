// Vercel Request/Response types for standalone functions
export interface VercelRequest {
  query: { [key: string]: string | string[] };
  body: any;
  headers: { [key: string]: string };
  method?: string;
  url?: string;
}

export interface VercelResponse {
  status(code: number): VercelResponse;
  json(object: any): void;
  send(body: any): void;
  setHeader(name: string, value: string): void;
}

// RIASEC scores type
export type RIASECScores = {
  realistic: number;
  investigative: number;
  artistic: number;
  social: number;
  enterprising: number;
  conventional: number;
};

// Chat message type
export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};
