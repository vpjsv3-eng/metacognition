import { NextResponse } from "next/server";
import { METACOGNITION_QUESTIONS, type Domain } from "../../../lib/questions";
import type { DiagnosisPayload } from "../../../lib/types";
import { buildAiReportFromResult } from "../../../lib/aiReport";

function avg(sum: number, count: number): number {
  if (count === 0) return 0;
  return sum / count;
}

type DomainAverages = Record<Domain, number>;

function computeResult(answers: number[]): { overallAverage: number; domainAverages: DomainAverages } {
  const sums: Record<Domain, { sum: number; count: number }> = {
    self_awareness: { sum: 0, count: 0 },
    resource_management: { sum: 0, count: 0 },
    monitoring_control: { sum: 0, count: 0 },
    cognitive_flexibility: { sum: 0, count: 0 },
  };

  answers.forEach((v, idx) => {
    const q = METACOGNITION_QUESTIONS[idx];
    if (!q) return;
    const bucket = sums[q.domain];
    bucket.sum += v;
    bucket.count += 1;
  });

  const overallSum = answers.reduce((acc, v) => acc + v, 0);
  const overallAverage = avg(overallSum, answers.length);

  const domainAverages: DomainAverages = {
    self_awareness: avg(sums.self_awareness.sum, sums.self_awareness.count),
    resource_management: avg(sums.resource_management.sum, sums.resource_management.count),
    monitoring_control: avg(sums.monitoring_control.sum, sums.monitoring_control.count),
    cognitive_flexibility: avg(sums.cognitive_flexibility.sum, sums.cognitive_flexibility.count),
  };

  return { overallAverage, domainAverages };
}

export async function POST(req: Request) {
  let payload: DiagnosisPayload;
  try {
    payload = (await req.json()) as DiagnosisPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "잘못된 요청입니다." }, { status: 400 });
  }

  const { profile, answers } = payload ?? ({} as DiagnosisPayload);
  
  // 데이터 검증
  if (!profile || !Array.isArray(answers) || answers.length !== 20) {
    return NextResponse.json({ ok: false, error: "데이터가 누락되었습니다." }, { status: 400 });
  }

  const result = computeResult(answers);

  const aiReport = buildAiReportFromResult({
    profile,
    overallAverage: result.overallAverage,
    domainAverages: result.domainAverages,
    answeredCount: 20,
  });

  return NextResponse.json({
    ok: true,
    result: {
      profile,
      overallAverage: result.overallAverage,
      domainAverages: result.domainAverages,
      answeredCount: 20,
      aiReport,
    },
  });
}