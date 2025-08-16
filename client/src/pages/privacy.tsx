import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Shield, Database, Lock, UserCheck, AlertTriangle, Phone } from "lucide-react";

export default function Privacy() {
  const lastUpdated = "2025년 1월 4일";

  return (
    <div className="min-h-screen py-16 bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              홈으로 돌아가기
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">개인정보 처리방침</h1>
          <p className="text-lg text-neutral-600">
            전공 알래말래는 개인정보보호법에 따라 이용자의 개인정보 보호 및 권익을 보호하고자 
            다음과 같이 개인정보 처리방침을 명시합니다.
          </p>
          <p className="text-sm text-neutral-500 mt-2">최종 수정일: {lastUpdated}</p>
        </div>

        {/* 1. 개인정보 수집 항목 */}
        <Card className="mb-6">
          <CardContent className="p-8">
            <div className="flex items-center mb-4">
              <Database className="h-6 w-6 text-primary mr-3" />
              <h2 className="text-xl font-bold text-neutral-900">1. 수집하는 개인정보 항목</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-neutral-800 mb-2">필수 수집 항목</h3>
                <ul className="list-disc list-inside text-neutral-700 space-y-1 ml-4">
                  <li>RIASEC 성향 진단 응답 데이터</li>
                  <li>서비스 이용 기록 (진단 결과, 추천 전공 정보)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg text-neutral-800 mb-2">자동 수집 항목</h3>
                <ul className="list-disc list-inside text-neutral-700 space-y-1 ml-4">
                  <li>IP 주소, 쿠키, 방문 기록</li>
                  <li>기기 정보 (브라우저 종류, OS 정보)</li>
                  <li>서비스 이용 시간 및 접속 로그</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-neutral-800 mb-2">선택 수집 항목</h3>
                <ul className="list-disc list-inside text-neutral-700 space-y-1 ml-4">
                  <li>AI 상담 채팅 내용 (서비스 개선 목적)</li>
                  <li>사용자 피드백 및 만족도 조사 응답</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. 개인정보 수집 및 이용 목적 */}
        <Card className="mb-6">
          <CardContent className="p-8">
            <div className="flex items-center mb-4">
              <UserCheck className="h-6 w-6 text-primary mr-3" />
              <h2 className="text-xl font-bold text-neutral-900">2. 개인정보 수집 및 이용 목적</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">서비스 제공</h3>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• RIASEC 성향 진단 서비스</li>
                  <li>• AI 기반 전공 추천</li>
                  <li>• 개인화된 상담 서비스</li>
                  <li>• 유사 사례 매칭 서비스</li>
                </ul>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">서비스 개선</h3>
                <ul className="text-green-700 text-sm space-y-1">
                  <li>• 서비스 품질 향상</li>
                  <li>• 추천 알고리즘 개선</li>
                  <li>• 신규 서비스 개발</li>
                  <li>• 통계 분석 및 연구</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. 개인정보 보유 및 이용 기간 */}
        <Card className="mb-6">
          <CardContent className="p-8">
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-primary mr-3" />
              <h2 className="text-xl font-bold text-neutral-900">3. 개인정보 보유 및 이용 기간</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-neutral-100 p-4 rounded-lg">
                <h3 className="font-semibold text-neutral-800 mb-2">진단 결과 데이터</h3>
                <p className="text-neutral-700 text-sm">
                  서비스 제공 완료 후 <strong>1년간 보관</strong> 후 자동 삭제
                </p>
              </div>
              
              <div className="bg-neutral-100 p-4 rounded-lg">
                <h3 className="font-semibold text-neutral-800 mb-2">서비스 이용 기록</h3>
                <p className="text-neutral-700 text-sm">
                  통신비밀보호법에 따라 <strong>3개월간 보관</strong> 후 삭제
                </p>
              </div>
              
              <div className="bg-neutral-100 p-4 rounded-lg">
                <h3 className="font-semibold text-neutral-800 mb-2">쿠키 및 로그 데이터</h3>
                <p className="text-neutral-700 text-sm">
                  수집일로부터 <strong>1년 이내</strong> 자동 삭제
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. 개인정보 제3자 제공 */}
        <Card className="mb-6">
          <CardContent className="p-8">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-orange-500 mr-3" />
              <h2 className="text-xl font-bold text-neutral-900">4. 개인정보의 제3자 제공</h2>
            </div>
            
            <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
              <p className="text-orange-800 font-semibold mb-2">
                원칙적으로 개인정보를 제3자에게 제공하지 않습니다.
              </p>
              <p className="text-orange-700 text-sm">
                다만, 다음의 경우에는 예외로 합니다:
              </p>
              <ul className="list-disc list-inside text-orange-700 text-sm mt-2 space-y-1 ml-4">
                <li>이용자가 사전에 동의한 경우</li>
                <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 5. 개인정보 처리 위탁 */}
        <Card className="mb-6">
          <CardContent className="p-8">
            <div className="flex items-center mb-4">
              <Database className="h-6 w-6 text-primary mr-3" />
              <h2 className="text-xl font-bold text-neutral-900">5. 개인정보 처리 위탁</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-neutral-300">
                <thead>
                  <tr className="bg-neutral-100">
                    <th className="border border-neutral-300 px-4 py-2 text-left">수탁업체</th>
                    <th className="border border-neutral-300 px-4 py-2 text-left">위탁업무</th>
                    <th className="border border-neutral-300 px-4 py-2 text-left">보유기간</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-neutral-300 px-4 py-2">OpenAI</td>
                    <td className="border border-neutral-300 px-4 py-2">AI 기반 성향 분석 및 전공 추천</td>
                    <td className="border border-neutral-300 px-4 py-2">처리 완료 즉시 삭제</td>
                  </tr>
                  <tr>
                    <td className="border border-neutral-300 px-4 py-2">Pinecone</td>
                    <td className="border border-neutral-300 px-4 py-2">벡터 데이터베이스 및 유사성 검색</td>
                    <td className="border border-neutral-300 px-4 py-2">서비스 종료시까지</td>
                  </tr>
                  <tr>
                    <td className="border border-neutral-300 px-4 py-2">Neon Database</td>
                    <td className="border border-neutral-300 px-4 py-2">데이터 저장 및 관리</td>
                    <td className="border border-neutral-300 px-4 py-2">개인정보 보유기간과 동일</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* 6. 정보주체의 권리 */}
        <Card className="mb-6">
          <CardContent className="p-8">
            <div className="flex items-center mb-4">
              <UserCheck className="h-6 w-6 text-primary mr-3" />
              <h2 className="text-xl font-bold text-neutral-900">6. 정보주체의 권리 및 행사 방법</h2>
            </div>
            
            <p className="text-neutral-700 mb-4">
              이용자는 언제든지 다음과 같은 권리를 행사할 수 있습니다:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">개인정보 열람권</h3>
                <p className="text-blue-700 text-sm">
                  자신의 개인정보 처리 현황을 확인할 수 있습니다.
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">정정·삭제권</h3>
                <p className="text-green-700 text-sm">
                  잘못된 정보의 수정이나 삭제를 요구할 수 있습니다.
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-2">처리정지권</h3>
                <p className="text-purple-700 text-sm">
                  개인정보 처리 중단을 요구할 수 있습니다.
                </p>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold text-orange-800 mb-2">손해배상청구권</h3>
                <p className="text-orange-700 text-sm">
                  개인정보 침해로 인한 피해 배상을 청구할 수 있습니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 7. 개인정보의 안전성 확보 조치 */}
        <Card className="mb-6">
          <CardContent className="p-8">
            <div className="flex items-center mb-4">
              <Lock className="h-6 w-6 text-primary mr-3" />
              <h2 className="text-xl font-bold text-neutral-900">7. 개인정보의 안전성 확보 조치</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg text-neutral-800 mb-3">기술적 조치</h3>
                <ul className="list-disc list-inside text-neutral-700 space-y-1 ml-4">
                  <li>개인정보 암호화 저장</li>
                  <li>해킹 등에 대비한 기술적 대책</li>
                  <li>백신 프로그램 설치 및 갱신</li>
                  <li>접근통제시스템 설치</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg text-neutral-800 mb-3">관리적 조치</h3>
                <ul className="list-disc list-inside text-neutral-700 space-y-1 ml-4">
                  <li>개인정보 보호책임자 지정</li>
                  <li>정기적인 직원 교육</li>
                  <li>내부관리계획 수립 및 시행</li>
                  <li>개인정보 취급자 최소화</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 8. 개인정보 보호책임자 */}
        <Card className="mb-6">
          <CardContent className="p-8">
            <div className="flex items-center mb-4">
              <Phone className="h-6 w-6 text-primary mr-3" />
              <h2 className="text-xl font-bold text-neutral-900">8. 개인정보 보호책임자</h2>
            </div>
            
            <div className="bg-neutral-100 p-6 rounded-lg">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg text-neutral-800 mb-2">개인정보 보호책임자</h3>
                  <ul className="text-neutral-700 space-y-1">
                    <li><strong>성명:</strong> 김철수</li>
                    <li><strong>직책:</strong> 개발팀장</li>
                    <li><strong>연락처:</strong> privacy@major-guide.kr</li>
                    <li><strong>전화:</strong> 02-1234-5678</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg text-neutral-800 mb-2">개인정보 보호담당자</h3>
                  <ul className="text-neutral-700 space-y-1">
                    <li><strong>성명:</strong> 이영희</li>
                    <li><strong>부서:</strong> 기획팀</li>
                    <li><strong>연락처:</strong> support@major-guide.kr</li>
                    <li><strong>전화:</strong> 02-1234-5679</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-neutral-300">
                <p className="text-neutral-600 text-sm">
                  개인정보와 관련한 문의사항이 있으시면 위 연락처로 연락주시기 바랍니다. 
                  신속하고 성실하게 답변드리겠습니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 9. 기타 */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">9. 기타</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-neutral-800 mb-2">만 14세 미만 아동의 개인정보 보호</h3>
                <p className="text-neutral-700 text-sm">
                  만 14세 미만 아동의 개인정보를 수집하는 경우에는 법정대리인의 동의를 받습니다.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg text-neutral-800 mb-2">개인정보 처리방침 변경</h3>
                <p className="text-neutral-700 text-sm">
                  이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 
                  추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg text-neutral-800 mb-2">개인정보 침해신고</h3>
                <p className="text-neutral-700 text-sm">
                  개인정보 침해신고센터 (privacy.go.kr, 국번없이 182) 또는 
                  대검찰청 사이버범죄수사단 (www.spo.go.kr, 국번없이 1301)에 신고할 수 있습니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center">
          <Link href="/">
            <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-3">
              홈으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}