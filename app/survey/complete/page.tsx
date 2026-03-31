"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Result = {
  profile?: {
    age: number;
    job: string;
    interests: string[];
  };
  overallAverage: number;
  domainAverages: {
    self_awareness: number;
    resource_management: number;
    monitoring_control: number;
    cognitive_flexibility: number;
  };
  answeredCount?: number;
};

export default function CompletePage() {
  const router = useRouter();
  const [result, setResult] = useState<Result | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("mc_last_result");
      if (!raw) {
        setResult(null);
        return;
      }
      setResult(JSON.parse(raw) as Result);
    } catch {
      setResult(null);
    } finally {
      setChecked(true);
    }
  }, []);

  if (!checked) {
    return (
      <main className="container">
        <div className="card">로딩 중...</div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="card">
        <h1 style={{ margin: 0, fontSize: 22 }}>제출이 완료되었습니다</h1>
        <p className="help" style={{ marginTop: 8 }}>
          아래 점수는 예시 계산(평균)입니다. 실제 서비스에서는 설문 문항/문항군별 채점 규칙에 맞게 조정하세요.
        </p>

        {!result ? (
          <div style={{ marginTop: 14 }}>
            <p className="help">결과 데이터를 불러올 수 없습니다. 다시 설문을 시작해 주세요.</p>
            <button className="btn" type="button" onClick={() => router.push("/")} style={{ width: "auto" }}>
              랜딩으로 이동
            </button>
          </div>
        ) : (
          <div style={{ marginTop: 14 }}>
            <div className="row">
              <div className="field" style={{ flex: "1 1 260px" }}>
                <label>전체 평균</label>
                <div style={{ fontSize: 30, fontWeight: 900, marginTop: 2 }}>{result.overallAverage.toFixed(2)}</div>
                <div className="help" style={{ marginTop: 6 }}>
                  1~5 사이 평균 점수
                </div>
              </div>

              <div className="field" style={{ flex: "1 1 260px" }}>
                <label>하위 영역 평균</label>
                <div style={{ marginTop: 8 }}>
                  <div className="pill" style={{ marginRight: 8, marginBottom: 8 }}>
                    영역1(인지적 자기 객관화): {result.domainAverages.self_awareness.toFixed(2)}
                  </div>
                  <div className="pill" style={{ marginRight: 8, marginBottom: 8 }}>
                    영역2(AI 자원 활용/최적화): {result.domainAverages.resource_management.toFixed(2)}
                  </div>
                  <div className="pill" style={{ marginBottom: 8 }}>
                    영역3(실행 모니터링/통제): {result.domainAverages.monitoring_control.toFixed(2)}
                  </div>
                  <div className="pill" style={{ marginBottom: 8 }}>
                    영역4(변화 대응/전략 수정): {result.domainAverages.cognitive_flexibility.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <button
                className="btn"
                type="button"
                onClick={() => {
                  localStorage.removeItem("mc_profile");
                  localStorage.removeItem("mc_last_result");
                  router.push("/");
                }}
                style={{ width: "auto" }}
              >
                다시 하기
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

