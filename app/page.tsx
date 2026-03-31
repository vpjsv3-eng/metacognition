"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { Profile } from "./lib/types";

function parseInterests(raw: string): string[] {
  return raw
    .split(/[,\n]/g)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export default function LandingPage() {
  const router = useRouter();
  const [age, setAge] = useState<string>("");
  const [job, setJob] = useState<string>("");
  const [interestsRaw, setInterestsRaw] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const interestsPreview = useMemo(() => parseInterests(interestsRaw), [interestsRaw]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const ageNum = Number(age);
    if (!Number.isFinite(ageNum) || ageNum <= 0 || ageNum > 120) {
      setError("나이를 올바르게 입력해 주세요.");
      return;
    }
    if (!job.trim()) {
      setError("직업(또는 직군)을 입력해 주세요.");
      return;
    }

    const interests = parseInterests(interestsRaw);
    if (interests.length === 0) {
      setError("관심사는 쉼표(,) 또는 줄바꿈으로 1개 이상 입력해 주세요.");
      return;
    }

    const profile: Profile = { age: ageNum, job: job.trim(), interests };
    localStorage.setItem("mc_profile", JSON.stringify(profile));
    router.push("/survey");
  }

  return (
    <main className="container">
      <div className="topBar">
        <div className="brand">
          <strong>메타인지 진단</strong>
          <span className="muted" style={{ fontSize: 13 }}>
            20문항, 5점 척도 설문
          </span>
        </div>
        <span className="pill">약 3~5분</span>
      </div>

      <div className="card">
        <h1 style={{ margin: "0 0 10px", fontSize: 22 }}>시작하기</h1>
        <p className="help" style={{ marginTop: 0 }}>
          아래 정보를 바탕으로 결과 해석에 참고할 수 있도록 사용합니다. 설문은 익명으로 진행되며, 제출 후 브라우저에 기록은 남기지
          않습니다.
        </p>

        <form onSubmit={onSubmit} style={{ marginTop: 14 }}>
          <div className="row">
            <div className="field" style={{ flex: "1 1 200px" }}>
              <label htmlFor="age">나이</label>
              <input
                id="age"
                type="number"
                inputMode="numeric"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min={1}
                max={120}
                placeholder="예: 29"
                required
              />
            </div>

            <div className="field" style={{ flex: "2 1 260px" }}>
              <label htmlFor="job">직업(또는 직군)</label>
              <input
                id="job"
                type="text"
                value={job}
                onChange={(e) => setJob(e.target.value)}
                placeholder="예: 개발자, 학생, 의료, 프리랜서 등"
                required
              />
            </div>
          </div>

          <div className="field" style={{ marginTop: 12 }}>
            <label htmlFor="interests">관심사</label>
            <textarea
              id="interests"
              value={interestsRaw}
              onChange={(e) => setInterestsRaw(e.target.value)}
              placeholder="예: 심리학, 글쓰기, 운동, 학습법"
            />
            <div className="help">
              미리보기:{" "}
              {interestsPreview.length > 0 ? (
                interestsPreview.map((x, idx) => (
                  <span key={x + idx} className="pill" style={{ marginRight: 8, marginTop: 8 }}>
                    {x}
                  </span>
                ))
              ) : (
                <span className="muted">입력 없음</span>
              )}
            </div>
          </div>

          {error ? (
            <p style={{ margin: "12px 0 0", color: "#ffd1d1" }}>
              <strong>입력 오류:</strong> {error}
            </p>
          ) : null}

          <button className="btn" type="submit" style={{ marginTop: 14 }}>
            설문 시작
          </button>
        </form>
      </div>
    </main>
  );
}

