import { NextResponse } from "next/server";
import { METACOGNITION_QUESTIONS, type Domain } from "../../../lib/questions";
import type { DiagnosisPayload, Profile } from "../../../lib/types";

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
  if (!profile || typeof profile !== "object") {
    return NextResponse.json({ ok: false, error: "프로필이 누락되었습니다." }, { status: 400 });
  }
  if (!Array.isArray(answers) || answers.length !== 20 || answers.some((v) => !(v >= 1 && v <= 5))) {
    return NextResponse.json({ ok: false, error: "답변은 1~5 사이 값의 20개여야 합니다." }, { status: 400 });
  }

  const result = computeResult(answers);

  // profile은 익명 처리를 가정하고(서버 저장 없이) 해석에만 참고한다는 전제의 예시.
  // 실제 서비스에서는 개인정보 정책에 맞게 서버 저장/마스킹 로직을 추가하세요.
  return NextResponse.json(
    {
      ok: true,
      result: {
        profile: {
          age: (profile as Profile).age,
          job: (profile as Profile).job,
          interests: (profile as Profile).interests,
        },
        overallAverage: result.overallAverage,
        domainAverages: result.domainAverages,
        answeredCount: 20,
      },
    },
    { status: 200 },
  );
}

