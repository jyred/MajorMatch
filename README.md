# MajorMatch - 전공 추천 시스템

RIASEC 성향 분석을 통한 AI 기반 전공 추천 시스템입니다.

## 기술 스택

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express (서버리스 함수로 변환됨)
- **Database**: Supabase PostgreSQL
- **AI**: OpenAI GPT-4, Pinecone Vector DB
- **Deployment**: Vercel

## Vercel 배포 가이드

### 1. Vercel 계정 준비
1. [Vercel](https://vercel.com)에 가입
2. GitHub 계정과 연동

### 2. 프로젝트 배포
1. GitHub에 프로젝트 푸시
2. Vercel 대시보드에서 "New Project" 클릭
3. GitHub 저장소 선택
4. 프레임워크: "Other" 선택
5. Build Command: `npm run vercel-build`
6. Output Directory: `dist/public`

### 3. 환경 변수 설정
Vercel 프로젝트 설정 > Environment Variables에서 다음 변수들을 설정:

\`\`\`
DATABASE_URL=postgresql://postgres.umblyjvtzjsokvjyhzyb:Yf7OOTKTbTzMnTQF@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://umblyjvtzjsokvjyhzyb.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtYmx5anZ0empzb2t2anloenliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMjI1MTUsImV4cCI6MjA3MDg5ODUxNX0.hhYNko-4PF14iXMJpkReSWsLfW6JghN_Yf_4k0whu8w
OPENAI_API_KEY=your_openai_api_key_here
PINECONE_API_KEY=your_pinecone_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
SESSION_SECRET=your_session_secret_here
NODE_ENV=production
\`\`\`

### 4. 데이터베이스 설정
Supabase 데이터베이스는 이미 설정되어 있습니다:
- **URL**: https://umblyjvtzjsokvjyhzyb.supabase.co
- **비밀번호**: Yf7OOTKTbTzMnTQF
- 로컬에서 `npm run db:push`로 스키마 적용

### 5. 필요한 서비스 API 키 발급

#### OpenAI
1. [OpenAI Platform](https://platform.openai.com)에서 API 키 발급
2. 사용량에 따른 과금 정책 확인

#### Pinecone
1. [Pinecone](https://www.pinecone.io)에서 계정 생성
2. Index 생성 (dimension: 1536, metric: cosine)
3. API 키 발급

#### Anthropic (선택사항)
1. [Anthropic](https://www.anthropic.com)에서 API 키 발급

#### ElevenLabs (선택사항)
1. [ElevenLabs](https://elevenlabs.io)에서 API 키 발급

## 로컬 개발

### 설치
\`\`\`bash
npm install
\`\`\`

### 환경 변수 설정
\`.env.example\`을 \`.env\`로 복사하고 실제 값으로 수정

### 개발 서버 실행
\`\`\`bash
# 클라이언트 개발 서버
npm run dev:client

# API 서버 (별도 터미널)
npm run dev
\`\`\`

### 데이터베이스 스키마 적용
\`\`\`bash
npm run db:push
\`\`\`

## 프로젝트 구조

\`\`\`
MajorMatch/
├── client/                 # React 앱
│   ├── src/
│   │   ├── components/     # React 컴포넌트
│   │   ├── pages/         # 페이지 컴포넌트
│   │   ├── hooks/         # React 훅
│   │   └── lib/           # 유틸리티
│   └── index.html
├── server/                # 백엔드
│   ├── api/              # Vercel 서버리스 함수
│   ├── db.ts             # 데이터베이스 설정
│   ├── storage.ts        # 데이터 접근 레이어
│   ├── pinecone.ts       # Pinecone 벡터 DB
│   └── natural-chat.ts   # AI 채팅 서비스
├── shared/               # 공유 타입/스키마
└── vercel.json          # Vercel 배포 설정
\`\`\`

## API 엔드포인트

- `POST /api/register` - 회원가입
- `POST /api/login` - 로그인
- `POST /api/analyze-riasec` - RIASEC 성향 분석
- `POST /api/chat` - AI 채팅
- `GET /api/assessments` - 평가 결과 조회

## 주요 기능

1. **RIASEC 성향 검사**: 18개 문항으로 성향 분석
2. **AI 전공 추천**: GPT-4 기반 전공 추천
3. **유사 사례 분석**: Pinecone을 통한 벡터 검색
4. **AI 채팅 상담**: 자연어 기반 진로 상담
5. **사용자 인증**: 세션 기반 인증 시스템

## 배포 후 확인사항

1. 모든 API 엔드포인트가 정상 작동하는지 확인
2. 데이터베이스 연결 확인
3. AI 서비스(OpenAI, Pinecone) 연동 확인
4. 환경 변수가 올바르게 설정되었는지 확인

## 문제 해결

### 일반적인 오류
- **Database connection failed**: DATABASE_URL 확인
- **OpenAI API error**: API 키와 사용량 한도 확인
- **Pinecone connection failed**: API 키와 인덱스 설정 확인

### Vercel 관련
- 함수 실행 시간 제한: 최대 10초 (Pro 플랜에서 더 길게 가능)
- 메모리 제한: 1024MB (Pro 플랜에서 더 많이 가능)
- 콜드 스타트: 첫 번째 요청은 느릴 수 있음

## 라이선스

MIT License
