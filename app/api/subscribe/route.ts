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
      privacy_consent?: boolean;
      utm?: { source?: string; medium?: string; campaign?: string };
    };
    const {
      name,
      phone,
      email,
      surveyId,
      source,
      timestamp,
      privacy_consent,
      utm,
    } = body;

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

    if (privacy_consent !== true) {
      return NextResponse.json(
        { ok: false, error: "개인정보 수집 및 이용에 동의해 주세요." },
        { status: 400 },
      );
    }

    const consentAt = new Date().toISOString();

    const sb = getSupabase();
    if (!sb) {
      console.warn("[waitlist] Supabase 클라이언트 null — insert 스킵, 환경변수 확인");
    }
    if (sb) {
      const insertData: Record<string, unknown> = {
        name: name.trim(),
        phone: phone.trim(),
        source: source === "result_page" ? "result_page" : "nadocoding_page",
        privacy_consent: true,
        privacy_consent_at: consentAt,
      };
      if (email?.trim()) {
        insertData.email = email.trim();
      }
      if (surveyId) {
        insertData.survey_id = surveyId;
      }
      insertData.utm_source = utm?.source ?? "direct";
      insertData.utm_medium = utm?.medium ?? "organic";
      insertData.utm_campaign = utm?.campaign ?? "";

      const { data, error } = await sb
        .from("waitlist")
        .insert(insertData)
        .select(
          "id, name, phone, email, source, privacy_consent, privacy_consent_at, created_at, survey_id, utm_source, utm_medium, utm_campaign",
        )
        .single();

      console.log("waitlist insert 결과:", { data, error });
      if (error) {
        console.error("waitlist 에러 코드:", error.code);
        console.error("waitlist 에러 메시지:", error.message);
        console.error("waitlist 에러 상세:", error.details);
        console.error("waitlist 에러 힌트:", error.hint);
        console.error("waitlist 전체 error 객체:", JSON.stringify(error, null, 2));
        return NextResponse.json(
          { ok: false, error: "사전 신청 저장에 실패했습니다. 잠시 후 다시 시도해 주세요." },
          { status: 500 },
        );
      }

      console.log("waitlist 저장 성공", data);
      return NextResponse.json({ ok: true, saved: data });
    } else {
      console.log("[waitlist — Supabase 미설정, 로컬 로그만]", {
        name: name.trim(),
        phone: phone.trim(),
        email: email?.trim(),
        source: source === "result_page" ? "result_page" : "nadocoding_page",
        surveyId,
        privacy_consent: true,
        privacy_consent_at: consentAt,
        timestamp,
        utm_source: utm?.source ?? "direct",
        utm_medium: utm?.medium ?? "organic",
        utm_campaign: utm?.campaign ?? "",
      });
    }

    return NextResponse.json({ ok: true, saved: null });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request" },
      { status: 400 },
    );
  }
}
