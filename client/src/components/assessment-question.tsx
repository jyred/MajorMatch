import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AssessmentQuestion } from "@/data/questions";

interface AssessmentQuestionProps {
  question: AssessmentQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer?: number;
  onAnswerChange: (value: number) => void;
}

const answerOptions = [
  { value: 5, label: "매우 그렇다" },
  { value: 4, label: "그렇다" },
  { value: 3, label: "보통이다" },
  { value: 2, label: "그렇지 않다" },
  { value: 1, label: "전혀 그렇지 않다" }
];

export default function AssessmentQuestion({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswerChange
}: AssessmentQuestionProps) {
  return (
    <Card className="animate-slide-up">
      <CardContent className="p-8">
        <div className="mb-6">
          <Badge variant="secondary" className="bg-primary/10 text-primary mb-4">
            질문 {questionNumber} / {totalQuestions}
          </Badge>
          <h2 className="text-xl font-semibold text-neutral-900 mb-3">
            {question.text}
          </h2>
          <p className="text-neutral-600">
            자신의 성향과 가장 가까운 답변을 선택해주세요.
          </p>
        </div>

        <RadioGroup 
          value={selectedAnswer?.toString() || ""} 
          onValueChange={(value) => onAnswerChange(parseInt(value))}
          className="space-y-3"
        >
          {answerOptions.map((option) => (
            <div 
              key={option.value} 
              className="flex items-center space-x-3 p-4 bg-neutral-50 rounded-xl border border-neutral-200 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
            >
              <RadioGroupItem 
                value={option.value.toString()} 
                id={`option-${option.value}`}
                className="text-primary"
              />
              <Label 
                htmlFor={`option-${option.value}`} 
                className="flex-1 cursor-pointer text-neutral-800 font-medium"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
