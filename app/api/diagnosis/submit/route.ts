import { NextResponse } from "next/server";
import OpenAI from "openai";
import { Resend } from "resend";
import type { DiagnosisPayload, ServiceIdea } from "../../../lib/types";
import { getSupabase } from "../../../lib/supabase";
import { generateIdeasFallback } from "../../../lib/aiReport";

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

async function sendResultEmail(
  email: string,
  ideas: ServiceIdea[],
  comment: string,
) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log("[Resend] API 키 미설정 — 이메일 발송 건너뜀");
    return;
  }

  const resend = new Resend(apiKey);

  const ideasHtml = ideas
    .map(
      (idea, i) =>
        `<div style="margin-bottom:16px;padding:16px;border:1px solid #E5E7EB;border-radius:12px;">
          <strong style="color:#00C471;">${i + 1}. ${idea.name}</strong>
          <p style="margin:8px 0 4px;color:#374151;">${idea.description}</p>
          <p style="margin:4px 0;font-size:13px;color:#6B7280;">💡 ${idea.reason}</p>
          <p style="margin:4px 0;font-size:13px;color:#6B7280;">🔧 핵심 기능: ${idea.coreFeature}</p>
        </div>`,
    )
    .join("");

  try {
    const { data, error } = await resend.emails.send({
      from: "나도코딩 <noreply@nadocoding.site>",
      to: email,
      subject: "🎯 나만의 AI 서비스 아이디어 진단 결과",
      html: `
        <div style="max-width:600px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
          <div style="text-align:center;padding:32px 0 24px;">
            <h1 style="font-size:24px;color:#111827;margin:0 0 8px;">AI 서비스 아이디어 진단 결과</h1>
            <p style="color:#6B7280;font-size:15px;margin:0;">바이브 코딩 툴로 2주 안에 만들 수 있는 서비스예요</p>
          </div>
          <div style="background:#E8FAF2;border:1px solid #00C471;border-radius:12px;padding:16px 20px;margin-bottom:24px;text-align:center;">
            <p style="margin:0;font-size:15px;font-weight:600;color:#111827;">${comment}</p>
          </div>
          ${ideasHtml}
          <div style="text-align:center;margin-top:32px;padding:24px;background:#F8F9FA;border-radius:12px;">
            <p style="margin:0 0 4px;font-size:13px;color:#9CA3AF;">
              <s>299,000원</s>
            </p>
            <p style="margin:0 0 8px;font-size:22px;font-weight:800;color:#00C471;">얼리버드 99,000원</p>
            <p style="margin:0 0 16px;font-size:14px;color:#6B7280;">코딩 몰라도 괜찮아요. 나도 코딩 1기에서 함께해요.</p>
            <a href="https://metacognition-r6lc.vercel.app/nadocoding"
               style="display:inline-block;padding:12px 28px;background:#00C471;color:white;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">
              나도 코딩 1기 자세히 보기
            </a>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("[Resend] 이메일 발송 실패", error);
    } else {
      console.log("[Resend] 이메일 발송 성공", data);
    }
  } catch (e) {
    console.error("[Resend] 이메일 발송 오류", e);
  }
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

  let gptResult: { ideas: ServiceIdea[]; comment: string };
  try {
    gptResult = await callGPT(profile, answers);
  } catch (e) {
    console.error("[GPT 호출 실패]", e);
    gptResult = generateIdeasFallback(profile, answers);
  }

  // Supabase 저장
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

  // Resend 이메일 발송 (비동기, 결과 반환을 블로킹하지 않음)
  if (profile.email) {
    sendResultEmail(profile.email, gptResult.ideas, gptResult.comment).catch(
      (e) => console.error("[Resend 비동기 오류]", e),
    );
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
