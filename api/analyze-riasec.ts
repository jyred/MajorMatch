import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { RIASECScores } from '../server/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { responses } = req.body;
    
    if (!responses || typeof responses !== 'object') {
      return res.status(400).json({ message: "응답 데이터가 필요합니다." });
    }

    // Import OpenAI dynamically
    const OpenAI = (await import('openai')).default;
    const { storage } = await import('../server/storage');
    const { pineconeService } = await import('../server/pinecone');
    
    const openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY 
    });

    // Calculate RIASEC scores from responses
    const riasecMapping: { [key: number]: keyof RIASECScores } = {
      1: "realistic", 2: "realistic", 3: "realistic",
      4: "investigative", 5: "investigative", 6: "investigative",
      7: "artistic", 8: "artistic", 9: "artistic",
      10: "social", 11: "social", 12: "social",
      13: "enterprising", 14: "enterprising", 15: "enterprising",
      16: "conventional", 17: "conventional", 18: "conventional"
    };

    const rawScores: RIASECScores = {
      realistic: 0,
      investigative: 0, 
      artistic: 0,
      social: 0,
      enterprising: 0,
      conventional: 0
    };

    Object.entries(responses).forEach(([questionId, score]) => {
      const questionNum = parseInt(questionId);
      const riasecType = riasecMapping[questionNum];
      if (riasecType && typeof score === 'number') {
        rawScores[riasecType] += score;
      }
    });

    const riasecScores: RIASECScores = {
      realistic: Math.round((rawScores.realistic / 15) * 100),
      investigative: Math.round((rawScores.investigative / 15) * 100),
      artistic: Math.round((rawScores.artistic / 15) * 100),
      social: Math.round((rawScores.social / 15) * 100),
      enterprising: Math.round((rawScores.enterprising / 15) * 100),
      conventional: Math.round((rawScores.conventional / 15) * 100)
    };

    // Get major recommendations
    const majorPrompt = `다음 RIASEC 성향 분석 결과를 바탕으로 창의융합학부의 전공을 추천해주세요.

RIASEC 점수: ${JSON.stringify(riasecScores)}

창의융합학부 전공 목록:
- 컴퓨터공학과
- 소프트웨어학과  
- 정보통계학과
- 디지털미디어학과
- 산업공학과
- 건축학과
- 도시계획학과
- 환경공학과
- 신소재공학과
- 화학공학과

각 전공에 대해 다음 정보를 포함하여 JSON으로 응답해주세요:
{
  "recommendations": [
    {
      "major": "전공명",
      "matchRate": 0-100,
      "reason": "추천 이유 (2-3문장)"
    }
  ],
  "explanation": "전체적인 성향 분석 및 전공 추천 근거 (4-5문장)"
}

상위 3개 전공만 추천해주세요.`;

    const majorCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "당신은 대학 전공 상담 전문가입니다. RIASEC 성향에 맞는 전공을 추천해주세요."
        },
        {
          role: "user",
          content: majorPrompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5
    });

    const majorResult = JSON.parse(majorCompletion.choices[0].message.content || "{}");
    
    // Initialize services and save assessment
    let similarCasesFeedback = "";
    try {
      await pineconeService.initialize();
      similarCasesFeedback = await pineconeService.generateFeedbackFromSimilarCases(
        riasecScores,
        majorResult.recommendations?.map((r: any) => r.major) || []
      );
    } catch (error) {
      console.error("Pinecone service error:", error);
    }

    // Save assessment (require user ID for this to work properly)
    const userId = req.headers['x-user-id'] as string;
    if (userId) {
      const assessment = await storage.createAssessment({
        userId,
        responses,
        riasecScores,
        recommendedMajors: majorResult.recommendations?.map((r: any) => r.major) || [],
        explanation: majorResult.explanation || "추천 전공을 확인하시고 상담을 받아보세요.",
        similarCasesFeedback: similarCasesFeedback || null
      });

      return res.json({
        assessmentId: assessment.id,
        riasecScores,
        recommendations: majorResult.recommendations || [],
        explanation: majorResult.explanation || "추천 전공을 확인하시고 상담을 받아보세요.",
        similarCasesFeedback
      });
    } else {
      // Return without saving if no user ID
      return res.json({
        riasecScores,
        recommendations: majorResult.recommendations || [],
        explanation: majorResult.explanation || "추천 전공을 확인하시고 상담을 받아보세요.",
        similarCasesFeedback
      });
    }

  } catch (error) {
    console.error("RIASEC analysis error:", error);
    return res.status(500).json({ message: "성향 분석 중 오류가 발생했습니다." });
  }
}
