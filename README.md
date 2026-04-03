# 나만의 AI 서비스 아이디어 진단

12문항 설문을 통해 사용자에게 딱 맞는 AI 서비스 아이디어 5개를 추천하는 웹 서비스입니다.

## Vercel 배포 시 환경변수 설정

Vercel > Project Settings > Environment Variables에 아래 값을 추가하세요.

| 변수 이름 | 설명 | 필수 |
|---|---|---|
| `OPENAI_API_KEY` | OpenAI API 키 (GPT-4o 사용) | ✅ |
| `SUPABASE_URL` | Supabase 프로젝트 URL | ✅ |
| `SUPABASE_KEY` | Supabase API 키 | ✅ |

> ⚠️ 위 값들은 `.env.local` 파일에 저장되며, `.gitignore`에 의해 Git에 커밋되지 않습니다.

## Supabase 테이블 설정

아래 두 테이블을 Supabase 대시보드에서 생성하세요.

### survey_responses

| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | uuid (auto) | PK |
| created_at | timestamptz | default: now() |
| job | text | 직업 |
| keywords | jsonb | 관심사 키워드 배열 |
| answers | jsonb | Q1~Q12 응답 |
| gpt_result | text | GPT 추천 결과 JSON |

### waitlist

| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | uuid (auto) | PK |
| created_at | timestamptz | default: now() |
| name | text | 이름 |
| phone | text | 휴대폰 번호 |
| survey_id | uuid (nullable) | survey_responses.id 참조 |

## 로컬 개발

```bash
npm install
npm run dev
```

GPT API 키 없이도 결정론적 추천 엔진이 동작하여 테스트 가능합니다.
