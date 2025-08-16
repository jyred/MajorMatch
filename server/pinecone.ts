import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import type { RIASECScores } from '@shared/schema';

let pinecone: Pinecone | null = null;
let openai: OpenAI | null = null;

// Enhanced logging function
function pineconeLog(message: string, type: "info" | "success" | "error" | "warning" = "info") {
  const timestamp = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  
  const icons = {
    info: "ℹ️",
    success: "✅",
    error: "❌", 
    warning: "⚠️"
  };
  
  console.log(`[${timestamp}] ${icons[type]} ${message}`);
}

// Initialize only if API keys are available
if (process.env.PINECONE_API_KEY && process.env.PINECONE_API_KEY !== '') {
  pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY
  });
  pineconeLog('Pinecone client initialized', "success");
} else {
  pineconeLog('PINECONE_API_KEY not set. Pinecone features will be disabled.', "warning");
}

if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== '') {
  openai = new OpenAI({ 
    apiKey: process.env.OPENAI_API_KEY
  });
  pineconeLog('OpenAI client initialized for embeddings', "success");
} else {
  pineconeLog('OPENAI_API_KEY not set. Some features will be limited.', "warning");
}

const INDEX_NAME = 'riasec-cases';
const DIMENSION = 1536; // OpenAI text-embedding-ada-002 dimension

export interface CaseStudy {
  id: string;
  riasecScores: RIASECScores;
  selectedMajor: string;
  satisfactionRating: number;
  description: string;
  graduationYear?: number;
  careerPath?: string;
}

export class PineconeService {
  private index: any;
  
  async initialize() {
    if (!pinecone) {
      pineconeLog('Pinecone not configured. Skipping initialization.', "warning");
      return;
    }
    
    pineconeLog('🔄 Initializing Pinecone Vector Database...', "info");
    
    try {
      // Check if index exists, create if not
      const existingIndexes = await pinecone.listIndexes();
      const indexExists = existingIndexes.indexes?.some(index => index.name === INDEX_NAME);
      
      if (!indexExists) {
        pineconeLog(`Creating Pinecone index: ${INDEX_NAME}`, "info");
        await pinecone.createIndex({
          name: INDEX_NAME,
          dimension: DIMENSION,
          metric: 'cosine',
          spec: {
            serverless: {
              cloud: 'aws',
              region: 'us-east-1'
            }
          }
        });
        
        // Wait for index to be ready
        await new Promise(resolve => setTimeout(resolve, 5000));
        pineconeLog('✅ Pinecone index created successfully', "success");
      } else {
        pineconeLog('✅ Pinecone index already exists', "success");
      }
      
      this.index = pinecone.index(INDEX_NAME);
      pineconeLog('🎯 Vector Database ready for emotion analysis', "success");
      
      // Initialize with sample data if empty
      await this.seedSampleData();
      
    } catch (error) {
      pineconeLog(`Failed to initialize Pinecone: ${error}`, "error");
      throw error;
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (!openai) {
      throw new Error('OpenAI not configured');
    }
    
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
      });
      
      return response.data[0].embedding;
    } catch (error) {
      console.error('Failed to generate embedding:', error);
      throw error;
    }
  }

  async storeCaseStudy(caseStudy: CaseStudy): Promise<void> {
    try {
      // Create text representation for embedding
      const textData = `
        RIASEC 점수: 실용적 ${caseStudy.riasecScores.realistic}, 탐구적 ${caseStudy.riasecScores.investigative}, 
        예술적 ${caseStudy.riasecScores.artistic}, 사회적 ${caseStudy.riasecScores.social}, 
        진취적 ${caseStudy.riasecScores.enterprising}, 관습적 ${caseStudy.riasecScores.conventional}
        선택 전공: ${caseStudy.selectedMajor}
        만족도: ${caseStudy.satisfactionRating}
        설명: ${caseStudy.description}
      `;

      const embedding = await this.generateEmbedding(textData);

      await this.index.upsert([{
        id: caseStudy.id,
        values: embedding,
        metadata: {
          realistic: caseStudy.riasecScores.realistic,
          investigative: caseStudy.riasecScores.investigative,
          artistic: caseStudy.riasecScores.artistic,
          social: caseStudy.riasecScores.social,
          enterprising: caseStudy.riasecScores.enterprising,
          conventional: caseStudy.riasecScores.conventional,
          selectedMajor: caseStudy.selectedMajor,
          satisfactionRating: caseStudy.satisfactionRating,
          description: caseStudy.description,
          graduationYear: caseStudy.graduationYear || 0,
          careerPath: caseStudy.careerPath || "미정"
        }
      }]);

      console.log(`Stored case study: ${caseStudy.id}`);
    } catch (error) {
      pineconeLog(`Failed to store case study: ${error}`, "error");
      throw error;
    }
  }

  async findSimilarCases(riasecScores: RIASECScores, topK: number = 5): Promise<CaseStudy[]> {
    try {
      // Create query text
      const queryText = `
        RIASEC 점수: 실용적 ${riasecScores.realistic}, 탐구적 ${riasecScores.investigative}, 
        예술적 ${riasecScores.artistic}, 사회적 ${riasecScores.social}, 
        진취적 ${riasecScores.enterprising}, 관습적 ${riasecScores.conventional}
      `;

      const queryEmbedding = await this.generateEmbedding(queryText);

      const queryResponse = await this.index.query({
        vector: queryEmbedding,
        topK,
        includeMetadata: true,
        includeValues: false
      });

      const similarCases: CaseStudy[] = queryResponse.matches?.map((match: any) => ({
        id: match.id,
        riasecScores: {
          realistic: match.metadata.realistic,
          investigative: match.metadata.investigative,
          artistic: match.metadata.artistic,
          social: match.metadata.social,
          enterprising: match.metadata.enterprising,
          conventional: match.metadata.conventional
        },
        selectedMajor: match.metadata.selectedMajor,
        satisfactionRating: match.metadata.satisfactionRating,
        description: match.metadata.description,
        graduationYear: match.metadata.graduationYear || undefined,
        careerPath: match.metadata.careerPath !== "미정" ? match.metadata.careerPath : undefined,
        similarity: match.score
      })) || [];

      return similarCases;
    } catch (error) {
      pineconeLog(`Failed to find similar cases: ${error}`, "error");
      return [];
    }
  }

  async generateFeedbackFromSimilarCases(
    userRiasec: RIASECScores, 
    recommendedMajors: string[]
  ): Promise<string> {
    if (!openai) {
      return "OpenAI가 설정되지 않아 피드백을 생성할 수 없습니다.";
    }
    
    try {
      const similarCases = await this.findSimilarCases(userRiasec, 3);
      
      if (similarCases.length === 0) {
        return "아직 유사한 사례가 충분하지 않지만, 추천된 전공들이 당신의 성향에 잘 맞을 것으로 예상됩니다.";
      }

      const casesText = similarCases.map((case_, index) => 
        `사례 ${index + 1}: ${case_.selectedMajor} 선택, 만족도 ${case_.satisfactionRating}/5점
        성향: R:${case_.riasecScores.realistic.toFixed(2)} I:${case_.riasecScores.investigative.toFixed(2)} 
              A:${case_.riasecScores.artistic.toFixed(2)} S:${case_.riasecScores.social.toFixed(2)} 
              E:${case_.riasecScores.enterprising.toFixed(2)} C:${case_.riasecScores.conventional.toFixed(2)}
        후기: ${case_.description}
        ${case_.careerPath ? `진로: ${case_.careerPath}` : ''}`
      ).join('\n\n');

      const prompt = `
당신은 전공 상담 전문가입니다. 다음 정보를 바탕으로 피드백을 작성해주세요:

사용자 RIASEC 성향:
R: ${userRiasec.realistic.toFixed(2)}, I: ${userRiasec.investigative.toFixed(2)}, A: ${userRiasec.artistic.toFixed(2)}
S: ${userRiasec.social.toFixed(2)}, E: ${userRiasec.enterprising.toFixed(2)}, C: ${userRiasec.conventional.toFixed(2)}

추천 전공: ${recommendedMajors.join(', ')}

유사한 성향의 선배들 사례:
${casesText}

이 사례들을 참고하여 사용자에게 도움이 되는 조언을 3-4문장으로 작성해주세요. 
구체적인 만족도나 경험담을 언급하며 격려하는 톤으로 작성해주세요.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 300
      });

      return response.choices[0].message.content || "유사한 사례를 바탕으로 좋은 선택이 될 것으로 예상됩니다.";

    } catch (error) {
      pineconeLog(`Failed to generate feedback from similar cases: ${error}`, "error");
      return "사례 기반 피드백을 생성하는 중 오류가 발생했습니다.";
    }
  }

  private async seedSampleData(): Promise<void> {
    try {
      // Check if data already exists
      const stats = await this.index.describeIndexStats();
      if (stats.totalVectorCount && stats.totalVectorCount > 0) {
        pineconeLog(`Index already has ${stats.totalVectorCount} vectors`, "info");
        return;
      }

      pineconeLog('Seeding sample case studies...', "info");
      
      const sampleCases: CaseStudy[] = [
        {
          id: 'case-001',
          riasecScores: { realistic: 0.8, investigative: 0.9, artistic: 0.3, social: 0.4, enterprising: 0.2, conventional: 0.6 },
          selectedMajor: '컴퓨터공학과',
          satisfactionRating: 5,
          description: '논리적 사고와 문제해결을 좋아해서 컴퓨터공학과를 선택했습니다. 알고리즘 공부가 정말 재미있고, 프로젝트를 통해 실제 문제를 해결할 때 큰 보람을 느낍니다.',
          graduationYear: 2023,
          careerPath: '소프트웨어 엔지니어'
        },
        {
          id: 'case-002',
          riasecScores: { realistic: 0.4, investigative: 0.7, artistic: 0.8, social: 0.6, enterprising: 0.7, conventional: 0.3 },
          selectedMajor: '디지털미디어학과',
          satisfactionRating: 4,
          description: '창의적인 작업과 기술적 구현을 모두 할 수 있어서 선택했습니다. 게임 디자인과 영상 제작 프로젝트가 특히 만족스럽습니다.',
          graduationYear: 2022,
          careerPath: 'UX/UI 디자이너'
        },
        {
          id: 'case-003',
          riasecScores: { realistic: 0.3, investigative: 0.8, artistic: 0.2, social: 0.3, enterprising: 0.4, conventional: 0.9 },
          selectedMajor: '정보통계학과',
          satisfactionRating: 5,
          description: '데이터 분석과 통계적 사고를 통해 패턴을 찾는 것이 흥미롭습니다. 체계적인 접근법으로 문제를 해결하는 과정이 매우 만족스럽습니다.',
          graduationYear: 2023,
          careerPath: '데이터 사이언티스트'
        },
        {
          id: 'case-004',
          riasecScores: { realistic: 0.6, investigative: 0.5, artistic: 0.9, social: 0.4, enterprising: 0.6, conventional: 0.2 },
          selectedMajor: '건축학과',
          satisfactionRating: 4,
          description: '공간을 디자인하고 실제로 구현하는 과정이 매력적입니다. 창의성과 실용성을 모두 고려해야 하는 점이 도전적이면서도 재미있습니다.',
          graduationYear: 2021,
          careerPath: '건축 설계사'
        },
        {
          id: 'case-005',
          riasecScores: { realistic: 0.4, investigative: 0.7, artistic: 0.3, social: 0.8, enterprising: 0.8, conventional: 0.5 },
          selectedMajor: '도시계획학과',
          satisfactionRating: 4,
          description: '사람들의 삶을 개선하는 도시 환경을 만드는 일이 보람됩니다. 다양한 이해관계자와 소통하며 지속가능한 도시를 계획하는 과정이 의미있습니다.',
          graduationYear: 2022,
          careerPath: '도시계획 컨설턴트'
        },
        {
          id: 'case-006',
          riasecScores: { realistic: 0.7, investigative: 0.8, artistic: 0.2, social: 0.6, enterprising: 0.3, conventional: 0.7 },
          selectedMajor: '환경공학과',
          satisfactionRating: 5,
          description: '환경 문제 해결에 기여할 수 있다는 점이 큰 동기가 됩니다. 실험과 현장 조사를 통해 실질적인 해결책을 찾는 과정이 흥미롭습니다.',
          graduationYear: 2023,
          careerPath: '환경 컨설턴트'
        },
        {
          id: 'case-007',
          riasecScores: { realistic: 0.5, investigative: 0.6, artistic: 0.7, social: 0.4, enterprising: 0.8, conventional: 0.4 },
          selectedMajor: '소프트웨어학과',
          satisfactionRating: 4,
          description: '앱과 웹 서비스를 직접 만들어볼 수 있어서 좋습니다. 사용자 경험을 고려한 소프트웨어 개발이 특히 재미있고, 창업에도 관심이 생겼습니다.',
          graduationYear: 2022,
          careerPath: '스타트업 개발자'
        },
        {
          id: 'case-008',
          riasecScores: { realistic: 0.6, investigative: 0.7, artistic: 0.3, social: 0.5, enterprising: 0.9, conventional: 0.8 },
          selectedMajor: '산업공학과',
          satisfactionRating: 5,
          description: '시스템을 최적화하고 효율성을 개선하는 과정이 매우 흥미롭습니다. 경영과 공학을 모두 배울 수 있어서 진로 선택의 폭이 넓어졌습니다.',
          graduationYear: 2021,
          careerPath: '프로젝트 매니저'
        }
      ];

      // Store all sample cases
      for (const caseStudy of sampleCases) {
        await this.storeCaseStudy(caseStudy);
      }

      pineconeLog(`Seeded ${sampleCases.length} sample case studies`, "success");
    } catch (error) {
      pineconeLog(`Failed to seed sample data: ${error}`, "error");
    }
  }
}

export const pineconeService = new PineconeService();