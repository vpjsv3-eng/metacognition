import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { DiagnosisPayload, GPTResult, AnswersMap } from "../../../lib/types";
import { getSupabase } from "../../../lib/supabase";
import { generateIdeasFallback } from "../../../lib/aiReport";

const SYSTEM_PROMPT = `당신은 AI 서비스 기획 전문가이자 창업 컨설턴트입니다.
사용자의 설문 응답을 깊이 분석해서
그 사람만을 위한 맞춤형 진단 결과를 작성해주세요.

절대 일반적이거나 뻔한 아이디어를 추천하지 마세요.
반드시 사용자가 직접 입력한 주관식 답변
(Q5_1, Q6_1, Q8_1, Q9_1)을 최우선으로 활용하세요.
주관식 답변이 없으면 객관식 답변의 조합을 깊이 해석하세요.

결과는 반드시 아래 JSON 형식으로만 출력하세요.
다른 텍스트, 마크다운, 백틱 없이 JSON만 출력하세요.

{
  "persona": {
    "title": "OO님의 유형 (예: 바쁜 직장인 자동화 탐색가)",
    "summary": "설문 답변을 기반으로 이 사람의 성향, 상황, 니즈를 3~4문장으로 구체적으로 요약. 일반적인 말 금지. 답변에서 읽히는 구체적인 맥락을 담을 것.",
    "strength": "이 사람이 AI 서비스를 만들기에 유리한 점 1~2가지",
    "painpoint": "이 사람이 가장 해결하고 싶어하는 것 1가지"
  },
  "ideas": [
    {
      "rank": 1,
      "name": "서비스 이름",
      "oneline": "한 줄 설명 (어떤 서비스인지)",
      "reason": "이 사람의 답변 중 구체적으로 어떤 내용 때문에 이 아이디어를 추천하는지 2~3문장으로 설명. 반드시 답변 내용을 직접 언급할 것.",
      "core_feature": "핵심 기능 1가지 (구체적으로)",
      "how_it_works": "실제로 어떻게 작동하는지 사용자 입장에서 1~2문장",
      "difficulty": "쉬움 / 보통",
      "period": "예상 제작 기간 (예: 3~5일)",
      "tool": "추천 툴 (예: Lovable, Bolt 등)"
    },
    { "rank": 2, "...": "..." },
    { "rank": 3, "...": "..." },
    { "rank": 4, "...": "..." },
    { "rank": 5, "...": "..." }
  ],
  "first_step": {
    "idea_name": "5개 중 가장 추천하는 아이디어 이름",
    "reason": "왜 이걸 가장 먼저 만들면 좋은지 2문장",
    "steps": [
      "1단계: 구체적인 첫 번째 행동",
      "2단계: 구체적인 두 번째 행동",
      "3단계: 구체적인 세 번째 행동"
    ],
    "encouragement": "이 사람에게 맞는 따뜻한 응원 메시지 2문장. 답변 내용을 반영해서 개인화할 것."
  }
}`;

function formatAnswer(val: string | string[] | undefined): string {
  if (!val) return "미입력";
  if (Array.isArray(val)) return val.length ? val.join(", ") : "미입력";
  return val || "미입력";
}

function buildUserMessage(
  profile: DiagnosisPayload["profile"],
  answersMap: AnswersMap,
): string {
  const a = (key: string) => formatAnswer(answersMap[key]);

  const q5 = a("Q5");
  const q5Detail =
    q5 === "있어요"
      ? a("Q5_1") || "있다고 했으나 구체적으로 미입력"
      : "없음";

  const q6 = a("Q6");
  const q6Detail =
    q6 === "있어요"
      ? a("Q6_1") || "있다고 했으나 구체적으로 미입력"
      : "없음";

  const q8 = a("Q8");
  const q8Detail =
    q8 === "있어요"
      ? a("Q8_1") || "있다고 했으나 구체적으로 미입력"
      : q8;

  const q9 = a("Q9");
  const q9Detail =
    q9 === "아직 안 써봤어요" ? "미사용" : a("Q9_1");

  return `[기본 정보]
직업: ${profile.job}
관심 키워드: ${profile.keywords.join(", ")}

[일상 행동]
자주 보는 유튜브: ${a("Q1")}
돈 쓰는 분야: ${a("Q2")}
퇴근 후 활동: ${a("Q3")}
주변에서 자주 받는 질문: ${a("Q4")}

[불편함과 니즈]
반복적으로 귀찮은 것: ${q5Detail}
찾았는데 없었던 서비스: ${q6Detail}
주변의 불평/걱정: ${a("Q7")}
머릿속 앱 아이디어: ${q8Detail}

[AI 활용 현황]
AI 툴 사용 여부: ${q9}
AI 사용 용도: ${q9Detail}
AI 트렌드에 대한 느낌: ${a("Q10")}

[목표와 장벽]
AI 서비스 만들고 싶은 목적: ${a("Q11")}
시작 못하는 이유: ${a("Q12")}`;
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
  let payload: DiagnosisPayload;
  try {
    payload = (await req.json()) as DiagnosisPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "잘못된 요청입니다." },
      { status: 400 },
    );
  }

  const { profile, answers, answersMap } = payload ?? ({} as DiagnosisPayload);

  if (!profile || !Array.isArray(answers) || answers.length < 10) {
    return NextResponse.json(
      { ok: false, error: "데이터가 누락되었습니다." },
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
    if (sb) {
      const insertData: Record<string, unknown> = {
        job: profile.job,
        keywords: profile.keywords,
        answers: answersMap || {},
        gpt_result: JSON.stringify(gptResult),
      };

      if (profile.email) {
        insertData.email = profile.email;
      }

      const { data, error } = await sb
        .from("survey_responses")
        .insert(insertData)
        .select("id")
        .single();

      if (error) {
        console.error("저장 실패", error);
      } else {
        console.log("저장 성공", data);
        surveyId = data?.id;
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
