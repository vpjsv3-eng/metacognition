import { NextResponse } from "next/server";
import type { DiagnosisPayload } from "../../../lib/types";
import { generateIdeas } from "../../../lib/aiReport";

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

  if (!profile || !Array.isArray(answers) || answers.length !== 10) {
    return NextResponse.json(
      { ok: false, error: "데이터가 누락되었습니다." },
      { status: 400 },
    );
  }

  const ideas = generateIdeas(answers, profile);

  return NextResponse.json({
    ok: true,
    result: {
      profile,
      answers,
      ideas,
    },
  });
}
