import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";

interface ValidationAlertProps {
  warnings?: string[];
  note?: string;
  type?: "warning" | "info" | "success";
}

export function ValidationAlert({ warnings, note, type = "warning" }: ValidationAlertProps) {
  if (!warnings || warnings.length === 0) {
    return null;
  }

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4" />;
      case "info":
        return <Info className="h-4 w-4" />;
      case "warning":
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getVariant = () => {
    switch (type) {
      case "warning":
        return "destructive";
      case "info":
        return "default";
      case "success":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <Alert variant={getVariant()} className="mb-4">
      {getIcon()}
      <AlertTitle>
        {type === "warning" && "데이터 검증 알림"}
        {type === "info" && "정보"}
        {type === "success" && "검증 완료"}
      </AlertTitle>
      <AlertDescription>
        {note && (
          <p className="mb-2 font-medium">{note}</p>
        )}
        <ul className="list-disc list-inside space-y-1">
          {warnings.map((warning, index) => (
            <li key={index} className="text-sm">{warning}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}