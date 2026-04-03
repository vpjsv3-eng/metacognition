import { NextResponse } from "next/server";
import { Resend } from "resend";
import type { ServiceIdea } from "../../lib/types";

type SendResultBody = {
  email: string;
  ideas: ServiceIdea[];
  comment: string;
};

function getDisplayName(email: string): string {
  return email.split("@")[0] || "회원";
}

function buildEmailHtml(
  email: string,
  ideas: ServiceIdea[],
  comment: string,
): string {
  const name = getDisplayName(email);

  const ideasHtml = ideas
    .map(
      (idea, i) =>
        `<div style="margin-bottom:16px;padding:20px;border:1px solid #E5E7EB;border-radius:12px;background:#FFFFFF;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
            <span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:#E8FAF2;color:#00C471;font-weight:800;font-size:13px;">${i + 1}</span>
            <strong style="font-size:16px;color:#111827;">${idea.name}</strong>
          </div>
          <p style="margin:0 0 10px;color:#374151;font-size:14px;line-height:1.6;">${idea.description}</p>
          <div style="padding:12px;border-radius:8px;background:#F8F9FA;margin-bottom:6px;">
            <p style="margin:0;font-size:12px;font-weight:700;color:#00C471;text-transform:uppercase;letter-spacing:0.03em;">이 사람에게 맞는 이유</p>
            <p style="margin:4px 0 0;font-size:13px;color:#6B7280;line-height:1.5;">${idea.reason}</p>
          </div>
          <div style="padding:12px;border-radius:8px;background:#F8F9FA;">
            <p style="margin:0;font-size:12px;font-weight:700;color:#00C471;text-transform:uppercase;letter-spacing:0.03em;">핵심 기능</p>
            <p style="margin:4px 0 0;font-size:13px;color:#6B7280;line-height:1.5;">${idea.coreFeature}</p>
          </div>
        </div>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F8F9FA;">
  <div style="max-width:600px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">

    <!-- 헤더 -->
    <div style="background:#00C471;padding:32px 24px;text-align:center;">
      <h1 style="font-size:22px;color:#FFFFFF;margin:0;font-weight:800;">
        나도코딩 AI 서비스 아이디어 진단 결과
      </h1>
    </div>

    <div style="padding:32px 20px;">

      <!-- 인사 -->
      <p style="font-size:18px;font-weight:700;color:#111827;margin:0 0 4px;">
        안녕하세요 ${name}님 👋
      </p>
      <p style="font-size:15px;color:#6B7280;margin:0 0 24px;line-height:1.5;">
        진단 결과를 알려드릴게요
      </p>

      <!-- 한 줄 코멘트 -->
      <div style="background:#E8FAF2;border:1px solid #00C471;border-radius:12px;padding:18px 24px;margin-bottom:28px;text-align:center;">
        <p style="margin:0;font-size:15px;font-weight:600;color:#111827;line-height:1.6;">${comment}</p>
      </div>

      <!-- 아이디어 카드 -->
      ${ideasHtml}

      <!-- 구분선 -->
      <hr style="border:none;border-top:1px solid #E5E7EB;margin:32px 0;">

      <!-- CTA 섹션 -->
      <div style="text-align:center;padding:28px 24px;background:#FFFFFF;border-radius:16px;border:1px solid #E5E7EB;">
        <p style="margin:0 0 8px;font-size:16px;font-weight:600;color:#111827;">
          내 아이디어, 직접 만들어보고 싶다면?
        </p>
        <p style="margin:0 0 20px;font-size:14px;color:#6B7280;line-height:1.6;">
          코딩 몰라도 괜찮아요.<br>
          나도 코딩 1기에서 아이디어 발굴부터 배포까지 함께합니다.
        </p>
        <a href="https://metacognition-r6lc.vercel.app/nadocoding"
           style="display:inline-block;padding:14px 32px;background:#00C471;color:#FFFFFF;text-decoration:none;border-radius:8px;font-weight:700;font-size:16px;">
          나도 코딩 1기 얼리버드 신청하기
        </a>
      </div>

      <!-- 푸터 -->
      <div style="text-align:center;margin-top:32px;padding-top:20px;border-top:1px solid #E5E7EB;">
        <p style="margin:0 0 4px;font-size:12px;color:#9CA3AF;">
          © 나도코딩
        </p>
        <p style="margin:0;font-size:12px;color:#9CA3AF;">
          본 메일은 발신 전용이에요
        </p>
      </div>

    </div>
  </div>
</body>
</html>`;
}

export async function POST(req: Request) {
  let body: SendResultBody;
  try {
    body = (await req.json()) as SendResultBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "잘못된 요청입니다." },
      { status: 400 },
    );
  }

  const { email, ideas, comment } = body;

  if (!email || !ideas?.length) {
    return NextResponse.json(
      { ok: false, error: "이메일 또는 결과 데이터가 누락되었습니다." },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log("[send-result] RESEND_API_KEY 미설정 — 이메일 발송 건너뜀");
    return NextResponse.json({ ok: true, skipped: true });
  }

  const resend = new Resend(apiKey);
  const displayName = getDisplayName(email);

  try {
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: `[나도코딩] ${displayName}님의 AI 서비스 아이디어 진단 결과가 도착했어요`,
      html: buildEmailHtml(email, ideas, comment),
    });

    if (error) {
      console.error("[send-result] 이메일 발송 실패", error);
      return NextResponse.json(
        { ok: false, error: "이메일 발송에 실패했습니다." },
        { status: 500 },
      );
    }

    console.log("[send-result] 이메일 발송 성공", data);
    return NextResponse.json({ ok: true, data });
  } catch (e) {
    console.error("[send-result] Resend 오류", e);
    return NextResponse.json(
      { ok: false, error: "이메일 발송 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
