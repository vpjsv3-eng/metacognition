import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { DiagnosisPayload, GPTResult, AnswersMap } from "../../../lib/types";
import { getSupabase } from "../../../lib/supabase";
import { generateIdeasFallback } from "../../../lib/aiReport";
import { isRateLimited, getClientIp, isValidEmail } from "../../../lib/rateLimit";

const SYSTEM_PROMPT = `반드시 모든 응답을 한국어로 작성하세요.
영어 단어나 문장을 절대 사용하지 마세요.
JSON 키는 영어로, 값은 반드시 한국어로 작성하세요.

당신은 AI 서비스 기획 전문가이자 창업 컨설턴트입니다.
사용자의 설문 응답을 깊이 분석해서
그 사람만을 위한 맞춤형 진단 결과를 작성해주세요.

성향 분석에서는 선택지를 단순 나열하지 마세요.
선택지 조합이 의미하는 것을 해석해서
'왜 이런 사람인지', '어떤 욕구가 숨어있는지'를
분석적으로 서술하세요.

예시:
나쁜 예: '새로운 걸 배우는 걸 좋아하고 취업 준비 중인 분이에요'
좋은 예: '취업 준비 중이면서 콘텐츠 제작에 관심이 많다는 건,
단순 취업만이 목표가 아니라 자신만의 브랜드를 만들고 싶은
욕구가 있다는 신호예요. AI 툴을 활용하면 이 두 가지를
동시에 잡을 수 있어요.'

아이디어 추천에서는 반드시 사용자가 직접 입력한
주관식 답변(Q6_1, Q7_1, Q8_1, Q9_1)과
복수 선택 문항(Q6, Q7, Q9)의 맥락을
최우선으로 활용하세요.

각 아이디어에 대해 tool_flow 필드를 작성하세요.
실제 바이브 코딩으로 만드는 과정을
구체적인 툴 이름과 함께 3단계로 작성하세요.
반드시 화살표 문자 → 로 단계를 구분하세요. (예: 첫 단계 → 둘째 단계 → 셋째 단계)

tool_flow 예시:
- 뉴스 요약 앱:
  'Perplexity로 뉴스 수집 → Lovable로 UI 제작 → Vercel로 배포'
- 이메일 작성기:
  'ChatGPT 프롬프트 설계 → Bolt로 웹앱 구현 → Vercel로 배포'
- 챗봇:
  'Claude API 연동 → Lovable로 채팅 UI → Vercel로 배포'
- 대시보드:
  'ChatGPT 데이터 설계 → Cursor로 구현 → Vercel로 배포'
- 자동화 도구:
  'Zapier 자동화 설계 → Bolt로 인터페이스 → Vercel로 배포'

반드시 실제 존재하는 툴 이름을 사용하고
모르는 사람이 봐도 '전문적이다'라고
느낄 수 있는 수준으로 작성하세요.

결과는 반드시 아래 JSON 형식으로만 출력하세요.
다른 텍스트, 마크다운, 백틱 없이 JSON만 출력하세요.

{
  "persona": {
    "title": "분석적인 유형명 (선택지 조합을 해석한 이름)",
    "summary": "선택지를 해석한 분석적 서술 3~4문장. 왜 이런 선택을 했는지, 어떤 욕구가 있는지, AI로 어떻게 연결되는지 담을 것.",
    "strength": "이 사람이 AI 서비스 만들기에 유리한 점 1가지",
    "painpoint": "이 사람의 핵심 장벽 1가지"
  },
  "ideas": [
    {
      "rank": 1,
      "name": "서비스 이름",
      "oneline": "한 줄 설명",
      "reason": "이 사람의 구체적인 답변을 직접 언급하며 왜 이 아이디어가 맞는지 2~3문장",
      "core_feature": "핵심 기능 1가지 (구체적으로)",
      "how_it_works": "실제 사용 시나리오 1~2문장",
      "tool_flow": "툴A로 ○○ → 툴B로 △△ → Vercel로 배포",
      "impact": "이 서비스를 만들면 이 사람의 삶에 어떤 변화가 생기는지 1문장",
      "difficulty": "쉬움 / 보통",
      "period": "예상 제작 기간",
      "tool": "추천 툴"
    },
    { "rank": 2, "name": "...", "oneline": "...", "reason": "...", "core_feature": "...", "how_it_works": "...", "tool_flow": "...", "impact": "...", "difficulty": "...", "period": "...", "tool": "..." },
    { "rank": 3, "name": "...", "oneline": "...", "reason": "...", "core_feature": "...", "how_it_works": "...", "tool_flow": "...", "impact": "...", "difficulty": "...", "period": "...", "tool": "..." },
    { "rank": 4, "name": "...", "oneline": "...", "reason": "...", "core_feature": "...", "how_it_works": "...", "tool_flow": "...", "impact": "...", "difficulty": "...", "period": "...", "tool": "..." },
    { "rank": 5, "name": "...", "oneline": "...", "reason": "...", "core_feature": "...", "how_it_works": "...", "tool_flow": "...", "impact": "...", "difficulty": "...", "period": "...", "tool": "..." }
  ],
  "first_step": {
    "idea_name": "1순위 아이디어 이름",
    "reason": "왜 이걸 먼저 만들면 좋은지 2문장",
    "steps": [
      "1단계: 구체적인 첫 행동",
      "2단계: 구체적인 두 번째 행동",
      "3단계: 구체적인 세 번째 행동"
    ],
    "encouragement": "이 사람 답변을 반영한 개인화된 응원 메시지 2문장"
  }
}`;

function formatAnswer(val: string | string[] | undefined): string {
  if (!val) return "미입력";
  if (Array.isArray(val)) return val.length ? val.join(", ") : "미입력";
  return val || "미입력";
}

function subjectiveLine(answersMap: AnswersMap, key: string): string {
  const raw = formatAnswer(answersMap[key]);
  if (!raw || raw === "(건너뜀)" || raw === "미입력") return "미입력";
  return raw;
}

function buildUserMessage(
  profile: DiagnosisPayload["profile"],
  answersMap: AnswersMap,
): string {
  const a = (key: string) => formatAnswer(answersMap[key]);
  const jobDetail = formatAnswer(answersMap["job_detail"]);

  const q10 = a("Q10");
  const q10Detail =
    q10 === "아직 안 써봤어요" ? "미사용" : a("Q10_1");

  return `[기본 정보]
직업: ${profile.job}
직업 상세: ${jobDetail}
관심 키워드: ${profile.keywords.join(", ")}

[일상 행동]
자주 보는 유튜브: ${a("Q1")}
자주 쓰는 앱 카테고리: ${a("Q2")}
퇴근 후 활동: ${a("Q3")}
주변에서 자주 받는 질문: ${a("Q4")}

[불편함과 니즈]
반복 작업: ${a("Q6")}
반복 작업 상황: ${subjectiveLine(answersMap, "Q6_1")}
해결받고 싶은 불편함: ${a("Q7")}
불편함 상황: ${subjectiveLine(answersMap, "Q7_1")}
AI에게 원하는 도움: ${a("Q9")}
원하는 도움 상황: ${subjectiveLine(answersMap, "Q9_1")}
서비스 대상: ${a("Q5")}
주변의 불평/걱정: ${a("Q8")}

[AI 활용 현황]
AI 툴 사용 여부: ${q10}
AI 사용 용도: ${q10Detail}

[목표와 장벽]
지금 가장 원하는 것: ${a("Q11")}
AI 서비스 만들고 싶은 목적: ${a("Q12")}
시작 못하는 이유: ${a("Q13")}`;
}

async function callGPT(
  profile: DiagnosisPayload["profile"],
  answers: DiagnosisPayload["answers"],
  answersMap: AnswersMap,
): Promise<GPTResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "your_openai_api_key_here") {
    return generateIdeasFallback(profile, answers);
  }

  const openai = new OpenAI({ apiKey });
  const userMessage = buildUserMessage(profile, answersMap);

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 3000,
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("GPT 응답이 비어 있습니다.");

  const parsed = JSON.parse(content) as GPTResult;

  if (!parsed.persona || !Array.isArray(parsed.ideas) || !parsed.first_step) {
    throw new Error("GPT 응답 구조가 올바르지 않습니다.");
  }

  return parsed;
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
      { status: 429 },
    );
  }

  let payload: DiagnosisPayload;
  try {
    payload = (await req.json()) as DiagnosisPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "잘못된 요청입니다." },
      { status: 400 },
    );
  }

  const { profile, answers, answersMap, utm } = payload ?? ({} as DiagnosisPayload);

  if (!profile || !Array.isArray(answers) || answers.length < 10) {
    return NextResponse.json(
      { ok: false, error: "데이터가 누락되었습니다." },
      { status: 400 },
    );
  }

  if (profile.email && !isValidEmail(profile.email)) {
    return NextResponse.json(
      { ok: false, error: "올바른 이메일 형식이 아닙니다." },
      { status: 400 },
    );
  }

  let gptResult: GPTResult;
  try {
    gptResult = await callGPT(profile, answers, answersMap || {});
  } catch (e) {
    console.error("[GPT 호출/파싱 실패]", e);
    gptResult = generateIdeasFallback(profile, answers);
  }

  let surveyId: string | undefined;
  try {
    const sb = getSupabase();
    if (!sb) {
      console.warn(
        "[survey_responses] Supabase 클라이언트 null — insert 스킵, 환경변수 확인",
      );
    }
    if (sb) {
      const insertData: Record<string, unknown> = {
        email: profile.email || null,
        gpt_result: JSON.stringify(gptResult),
        utm_source: utm?.source ?? "direct",
        utm_medium: utm?.medium ?? "organic",
        utm_campaign: utm?.campaign ?? "",
      };

      const { data, error } = await sb
        .from("survey_responses")
        .insert(insertData)
        .select("id")
        .single();

      console.log("survey_responses insert 결과:", { data, error });
      if (error) {
        console.error("survey_responses 에러 코드:", error.code);
        console.error("survey_responses 에러 메시지:", error.message);
        console.error("survey_responses 에러 상세:", error.details);
        console.error("survey_responses 에러 힌트:", error.hint);
        console.error(
          "survey_responses 전체 error 객체:",
          JSON.stringify(error, null, 2),
        );
      } else {
        surveyId = data?.id;
        console.log("survey_responses 저장 성공", {
          id: data?.id,
          email: insertData.email,
          gpt_result_length: String(insertData.gpt_result).length,
        });
      }
    }
  } catch (e) {
    console.error("[Supabase 연결 오류]", e);
  }

  return NextResponse.json({
    ok: true,
    result: {
      profile,
      answers,
      persona: gptResult.persona,
      ideas: gptResult.ideas,
      first_step: gptResult.first_step,
      surveyId,
    },
  });
}
