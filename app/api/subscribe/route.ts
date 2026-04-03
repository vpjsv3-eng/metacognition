import { NextResponse } from "next/server";
import { getSupabase } from "../../lib/supabase";
import { isRateLimited, getClientIp, isValidPhone, isValidEmail } from "../../lib/rateLimit";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
      { status: 429 },
    );
  }

  try {
    const body = (await req.json()) as {
      name: string;
      phone: string;
      email?: string;
      surveyId?: string;
      source?: string;
      timestamp: string;
    };
    const { name, phone, email, surveyId, source, timestamp } = body;

    if (!name?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { ok: false, error: "이름과 전화번호를 입력해 주세요." },
        { status: 400 },
      );
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { ok: false, error: "올바른 휴대폰 번호를 입력해 주세요. (010으로 시작하는 11자리)" },
        { status: 400 },
      );
    }

    if (email && !isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, error: "올바른 이메일 형식이 아닙니다." },
        { status: 400 },
      );
    }

    const sb = getSupabase();
    if (sb) {
      const insertData: Record<string, unknown> = {
        name: name.trim(),
        phone: phone.trim(),
        source: source || "nadocoding_page",
      };
      if (email?.trim()) {
        insertData.email = email.trim();
      }
      if (surveyId) {
        insertData.survey_id = surveyId;
      }

      const { error } = await sb.from("waitlist").insert(insertData);

      if (error) {
        console.error("[Supabase waitlist 저장 실패]", error);
      }
    } else {
      console.log("[나도코딩 1기 사전신청]", { name, phone, email, source, surveyId, timestamp });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request" },
      { status: 400 },
    );
  }
}
