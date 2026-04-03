import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      name: string;
      phone: string;
      timestamp: string;
    };
    const { name, phone, timestamp } = body;

    // TODO: Google Sheets 또는 Notion API 연동 시 여기에 추가
    console.log("[나도코딩 1기 사전신청]", { name, phone, timestamp });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request" },
      { status: 400 },
    );
  }
}
