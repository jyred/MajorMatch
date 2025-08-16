import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, TrendingUp } from "lucide-react";

interface MajorRecommendation {
  major: string;
  matchRate: number;
  reason: string;
}

interface MajorRecommendationsProps {
  recommendations: MajorRecommendation[];
  explanation: string;
}

const majorInfo: Record<string, { icon: string; category: string }> = {
  "컴퓨터공학과": { icon: "💻", category: "공학" },
  "소프트웨어학과": { icon: "⚡", category: "공학" },
  "정보통계학과": { icon: "📊", category: "수리" },
  "디지털미디어학과": { icon: "🎨", category: "융합" },
  "산업공학과": { icon: "🏭", category: "공학" },
  "건축학과": { icon: "🏗️", category: "설계" },
  "도시계획학과": { icon: "🏙️", category: "계획" },
  "환경공학과": { icon: "🌱", category: "환경" },
  "신소재공학과": { icon: "🔬", category: "소재" },
  "화학공학과": { icon: "⚗️", category: "화학" }
};

export default function MajorRecommendations({ 
  recommendations, 
  explanation 
}: MajorRecommendationsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
            <GraduationCap className="mr-2 h-5 w-5 text-primary" />
            추천 전공
          </h3>
          <div className="space-y-3">
            {recommendations.map((rec, index) => {
              const info = majorInfo[rec.major] || { icon: "🎓", category: "기타" };
              return (
                <div 
                  key={index} 
                  className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{info.icon}</span>
                      <div>
                        <h4 className="font-semibold text-neutral-900">{rec.major}</h4>
                        <Badge variant="outline" className="text-xs">
                          {info.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                        {rec.matchRate}% 매칭
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    {rec.reason}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Explanation */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center">
            <span className="text-accent mr-2">💡</span>
            상세 분석
          </h3>
          <div className="prose prose-sm max-w-none">
            <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">
              {explanation}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
