import { NextResponse } from "next/server";
import { Resend } from "resend";
import type { ServiceIdea, Persona, FirstStep } from "../../lib/types";
import { isRateLimited, getClientIp, isValidEmail } from "../../lib/rateLimit";

type SendResultBody = {
  email: string;
  persona?: Persona;
  ideas: ServiceIdea[];
  first_step?: FirstStep;
};

function getDisplayName(email: string): string {
  return email.split("@")[0] || "회원";
}

function buildEmailHtml(
  email: string,
  persona: Persona | undefined,
  ideas: ServiceIdea[],
  firstStep: FirstStep | undefined,
): string {
  const name = getDisplayName(email);

  const personaHtml = persona
    ? `<div style="background:#E8FAF2;border:1px solid #00C471;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
        <h3 style="margin:0 0 8px;font-size:18px;font-weight:700;color:#111827;">${persona.title}</h3>
        <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">${persona.summary}</p>
        <p style="margin:0 0 4px;font-size:13px;color:#6B7280;">💪 강점: ${persona.strength}</p>
        <p style="margin:0;font-size:13px;color:#6B7280;">🎯 핵심 니즈: ${persona.painpoint}</p>
      </div>`
    : "";

  const ideasHtml = ideas
    .map(
      (idea, i) => {
        const isFirst = (idea.rank ?? i + 1) === 1;
        const borderStyle = isFirst ? "border:2px solid #00C471;" : "border:1px solid #E5E7EB;";
        const rankNum = idea.rank ?? i + 1;
        return `<div style="margin-bottom:16px;padding:20px;${borderStyle}border-radius:12px;background:#FFFFFF;">
          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;"><tr>
            <td style="width:36px;height:36px;background-color:#00C471;border-radius:50%;text-align:center;vertical-align:middle;font-size:16px;font-weight:bold;color:#ffffff;line-height:36px;padding:0;mso-line-height-rule:exactly;">${rankNum}</td>
            <td style="padding-left:12px;vertical-align:middle;"><span style="display:inline-block;padding:3px 10px;border-radius:999px;background:${isFirst ? "#00C471" : "#E8FAF2"};color:${isFirst ? "#fff" : "#00C471"};font-size:12px;font-weight:700;">추천 ${rankNum}순위</span></td>
          </tr></table>
          <strong style="font-size:16px;color:#111827;display:block;margin-bottom:4px;">${idea.name}</strong>
          <p style="margin:0 0 12px;color:#6B7280;font-size:14px;line-height:1.6;">${idea.oneline}</p>
          <div style="padding:12px 16px;border-radius:8px;background:${isFirst ? "#E8FAF2" : "#F8F9FA"};margin-bottom:6px;text-align:left;vertical-align:middle;">
            <p style="margin:0;font-size:12px;font-weight:700;color:#00C471;">추천 이유</p>
            <p style="margin:4px 0 0;font-size:13px;color:#6B7280;line-height:1.5;">${idea.reason}</p>
          </div>
          <div style="padding:12px 16px;border-radius:8px;background:#F8F9FA;margin-bottom:6px;text-align:left;vertical-align:middle;">
            <p style="margin:0;font-size:12px;font-weight:700;color:#00C471;">핵심 기능</p>
            <p style="margin:4px 0 0;font-size:13px;color:#6B7280;line-height:1.5;">${idea.core_feature}</p>
          </div>
          <div style="padding:12px 16px;border-radius:8px;background:#F8F9FA;margin-bottom:8px;text-align:left;vertical-align:middle;">
            <p style="margin:0;font-size:12px;font-weight:700;color:#00C471;">작동 방식</p>
            <p style="margin:4px 0 0;font-size:13px;color:#6B7280;line-height:1.5;">${idea.how_it_works}</p>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;">
            <span style="padding:4px 10px;border-radius:999px;background:#F3F4F6;font-size:12px;color:#6B7280;">🎯 ${idea.difficulty}</span>
            <span style="padding:4px 10px;border-radius:999px;background:#F3F4F6;font-size:12px;color:#6B7280;">⏱ ${idea.period}</span>
            <span style="padding:4px 10px;border-radius:999px;background:#F3F4F6;font-size:12px;color:#6B7280;">🛠 ${idea.tool}</span>
          </div>
          <div style="text-align:center;padding:12px;border-radius:8px;background:#F8F9FA;">
            <p style="margin:0 0 8px;font-size:13px;color:#6B7280;">이 아이디어로 직접 만들어보고 싶다면?</p>
            <a href="https://metacognition-r6lc.vercel.app/nadocoding"
               style="display:inline-block;padding:8px 20px;background:#00C471;color:#FFFFFF;text-decoration:none;border-radius:6px;font-weight:600;font-size:13px;">
              나도 코딩 1기 자세히 보기
            </a>
          </div>
        </div>`;
      },
    )
    .join("");

  const firstStepHtml = firstStep
    ? `<div style="background:#FFFFFF;border:1px solid #E5E7EB;border-radius:12px;padding:24px;margin-top:24px;">
        <h3 style="margin:0 0 8px;font-size:18px;font-weight:700;color:#111827;">✅ 지금 바로 시작해보세요</h3>
        <p style="margin:0 0 4px;font-size:14px;color:#111827;">가장 추천: <strong style="color:#00C471;">${firstStep.idea_name}</strong></p>
        <p style="margin:0 0 16px;font-size:13px;color:#6B7280;line-height:1.5;">${firstStep.reason}</p>
        ${firstStep.steps.map((s, i) => `<div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:10px;">
          <span style="display:inline-flex;align-items:center;justify-content:center;min-width:24px;height:24px;border-radius:50%;background:#E8FAF2;color:#00C471;font-weight:800;font-size:12px;">${i + 1}</span>
          <span style="font-size:13px;color:#374151;line-height:1.5;">${s.replace(/^\d+단계:\s*/, "")}</span>
        </div>`).join("")}
        <div style="background:#E8FAF2;border-radius:8px;padding:14px 18px;margin-top:12px;">
          <p style="margin:0;font-size:14px;color:#111827;line-height:1.6;">${firstStep.encouragement}</p>
        </div>
      </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F8F9FA;">
  <div style="max-width:600px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">

    <div style="background:#00C471;padding:32px 24px;text-align:center;">
      <h1 style="font-size:22px;color:#FFFFFF;margin:0;font-weight:800;">
        나도코딩 AI 서비스 아이디어 진단 결과
      </h1>
    </div>

    <div style="padding:32px 20px;">
      <p style="font-size:18px;font-weight:700;color:#111827;margin:0 0 4px;">
        안녕하세요 ${name}님 👋
      </p>
      <p style="font-size:15px;color:#6B7280;margin:0 0 24px;line-height:1.5;">
        진단 결과를 알려드릴게요
      </p>

      ${personaHtml}
      ${ideasHtml}
      ${firstStepHtml}

      <hr style="border:none;border-top:1px solid #E5E7EB;margin:32px 0;">

      <div style="text-align:center;padding:36px 28px;background:#00C471;border-radius:16px;">
        <p style="margin:0 0 12px;font-size:18px;font-weight:700;color:#FFFFFF;line-height:1.6;">
          5가지 아이디어 중 마음에 드는 게 있으신가요?
        </p>
        <p style="margin:0 0 24px;font-size:15px;color:rgba(255,255,255,0.9);line-height:1.7;">
          코딩 몰라도 괜찮아요.<br>
          나도 코딩 1기에서 2주 안에 직접 만들어드려요.
        </p>
        <a href="https://metacognition-r6lc.vercel.app/nadocoding"
           style="display:inline-block;padding:16px 36px;background:#FFFFFF;color:#00C471;text-decoration:none;border-radius:8px;font-weight:700;font-size:16px;">
          지금 얼리버드 신청하기 (무료)
        </a>
      </div>

      <div style="text-align:center;margin-top:32px;padding-top:20px;border-top:1px solid #E5E7EB;">
        <p style="margin:0 0 4px;font-size:12px;color:#9CA3AF;">© 나도코딩</p>
        <p style="margin:0;font-size:12px;color:#9CA3AF;">본 메일은 발신 전용이에요</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
      { status: 429 },
    );
  }

  let body: SendResultBody;
  try {
    body = (await req.json()) as SendResultBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "잘못된 요청입니다." },
      { status: 400 },
    );
  }

  const { email, persona, ideas, first_step } = body;

  if (!email || !ideas?.length) {
    return NextResponse.json(
      { ok: false, error: "이메일 또는 결과 데이터가 누락되었습니다." },
      { status: 400 },
    );
  }

  const trimmedEmail = email.trim();
  if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    console.error("[send-result] 이메일 유효성 검사 실패:", trimmedEmail);
    return NextResponse.json(
      { ok: false, error: "올바른 이메일 형식이 아닙니다." },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  console.log("[send-result] RESEND_API_KEY 존재:", !!apiKey);

  if (!apiKey) {
    console.log("[send-result] RESEND_API_KEY 미설정 — 이메일 발송 건너뜀");
    return NextResponse.json({ ok: true, skipped: true });
  }

  const resend = new Resend(apiKey);
  const displayName = getDisplayName(trimmedEmail);

  const html = buildEmailHtml(trimmedEmail, persona, ideas, first_step);

  async function sendEmailOnce() {
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: trimmedEmail,
      subject: `[나도코딩] ${displayName}님의 AI 서비스 아이디어 진단 결과가 도착했어요`,
      html,
    });
    if (error) {
      throw error;
    }
    return data;
  }

  try {
    const data = await sendEmailOnce();
    console.log("[send-result] 이메일 발송 성공:", JSON.stringify(data));
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    console.error("1차 발송 실패, 재시도:", error);
    await new Promise((r) => setTimeout(r, 2000));
    try {
      const data = await sendEmailOnce();
      console.log("2차 발송 성공");
      return NextResponse.json({ ok: true, data });
    } catch (error2) {
      console.error("2차 발송도 실패:", error2);
      const errMessage =
        error2 instanceof Error ? error2.message : String(error2);
      const statusCode = (error2 as { statusCode?: number }).statusCode;
      if (statusCode === 429) {
        return NextResponse.json(
          {
            ok: false,
            error: "일일 발송 한도를 초과했습니다. 잠시 후 다시 시도해주세요.",
            errorDetail: "rate_limit",
          },
          { status: 429 },
        );
      }
      return NextResponse.json(
        {
          ok: false,
          error: "이메일 발송에 실패했습니다.",
          errorDetail: errMessage,
        },
        { status: 500 },
      );
    }
  }
}
