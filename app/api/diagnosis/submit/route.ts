import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { DiagnosisPayload, ServiceIdea } from "../../../lib/types";
import { getSupabase } from "../../../lib/supabase";
import { generateIdeasFallback } from "../../../lib/aiReport";

// ⚠️ Vercel 배포 시 OPENAI_API_KEY를 환경변수에 추가하세요.
const SYSTEM_PROMPT = `당신은 AI 서비스 기획 전문가입니다.
사용자의 설문 응답을 바탕으로, 코딩 없이 Bolt 또는 Lovable 같은 바이브 코딩 툴로 만들 수 있는 간단한 AI 서비스 아이디어 5가지를 추천해주세요.

반드시 아래 JSON 형식으로만 응답하세요:
{
  "ideas": [
    {
      "name": "서비스 이름",
      "description": "한 줄 설명 (어떤 서비스인지)",
      "reason": "이 사람에게 맞는 이유 (설문 응답과 연결해서)",
      "coreFeature": "핵심 기능 1가지"
    }
  ],
  "comment": "당신은 [한 줄 성향 요약] 스타일이에요. 가장 먼저 만들어볼 서비스는 [1순위 추천 서비스 이름]을 추천해요."
}

추천 기준:
- 2주 안에 혼자 만들 수 있을 정도로 간단할 것
- 코딩 지식 없이 바이브 코딩 툴로 구현 가능할 것
- 사용자의 일상, 직무, 관심사와 직접 연결될 것
- 너무 거창하지 않고 핵심 기능 1~2개짜리 MVP 수준일 것`;

async function callGPT(
  profile: DiagnosisPayload["profile"],
  answers: DiagnosisPayload["answers"],
): Promise<{ ideas: ServiceIdea[]; comment: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "your_openai_api_key_here") {
    return generateIdeasFallback(profile, answers);
  }

  const openai = new OpenAI({ apiKey });

  const userMessage = `사용자 정보:
- 직업: ${profile.job}
- 관심사 키워드: ${profile.keywords.join(", ")}

설문 응답:
${answers.map((a) => `Q${a.questionId}. ${a.questionText}\n→ ${a.answer}`).join("\n\n")}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 2000,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("GPT 응답이 비어 있습니다.");

  return JSON.parse(content) as { ideas: ServiceIdea[]; comment: string };
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

  const { profile, answers } = payload ?? ({} as DiagnosisPayload);

  if (!profile || !Array.isArray(answers) || answers.length < 12) {
    return NextResponse.json(
      { ok: false, error: "데이터가 누락되었습니다." },
      { status: 400 },
    );
  }

  let gptResult: { ideas: ServiceIdea[]; comment: string };
  try {
    gptResult = await callGPT(profile, answers);
  } catch (e) {
    console.error("[GPT 호출 실패]", e);
    gptResult = generateIdeasFallback(profile, answers);
  }

  // Supabase 저장 (실패해도 결과는 반환)
  let surveyId: string | undefined;
  try {
    const sb = getSupabase();
    if (sb) {
      const { data, error } = await sb
        .from("survey_responses")
        .insert({
          job: profile.job,
          keywords: profile.keywords,
          answers,
          gpt_result: JSON.stringify(gptResult),
        })
        .select("id")
        .single();

      if (error) console.error("[Supabase survey_responses 저장 실패]", error);
      else surveyId = data?.id;
    }
  } catch (e) {
    console.error("[Supabase 연결 오류]", e);
  }

  return NextResponse.json({
    ok: true,
    result: {
      profile,
      answers,
      ideas: gptResult.ideas,
      comment: gptResult.comment,
      surveyId,
    },
  });
}
