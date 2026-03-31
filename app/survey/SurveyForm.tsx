"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Profile, DiagnosisPayload, DiagnosisResult } from "../lib/types";
import { MC_5POINT_OPTIONS, METACOGNITION_QUESTIONS, type ScaleValue } from "../lib/questions";

type Props = {
  profile: Profile;
};

function computeIsComplete(answers: number[]): boolean {
  return answers.length === 20 && answers.every((v) => v >= 1 && v <= 5);
}

export default function SurveyForm({ profile }: Props) {
  const router = useRouter();
  const questions = METACOGNITION_QUESTIONS;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>(() => Array.from({ length: 20 }, () => 0));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = questions[currentIndex];
  const total = questions.length;

  const progressText = useMemo(() => {
    const answeredCount = answers.filter((v) => v >= 1 && v <= 5).length;
    return `${answeredCount}/${total} 문항 선택 완료`;
  }, [answers, total]);

  function setAnswer(value: ScaleValue) {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = value;
      return next;
    });
    setError(null);
  }

  function goPrev() {
    setError(null);
    setCurrentIndex((i) => Math.max(0, i - 1));
  }

  function goNext() {
    setError(null);
    const val = answers[currentIndex];
    if (!(val >= 1 && val <= 5)) {
      setError("현재 문항을 먼저 선택해 주세요.");
      return;
    }
    setCurrentIndex((i) => Math.min(total - 1, i + 1));
  }

  async function onSubmit() {
    setError(null);

    if (!computeIsComplete(answers)) {
      setError("모든 문항을 선택한 뒤 제출해 주세요.");
      return;
    }

    const payload: DiagnosisPayload = {
      profile,
      answers: answers as Array<number>,
    };

    setSubmitting(true);
    try {
      const res = await fetch("/api/diagnosis/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `제출 실패 (HTTP ${res.status})`);
      }

      const data = (await res.json()) as { ok: true; result: DiagnosisResult };
      // 요청사항: 응답의 result 전체를 'diagnosis_result' 키로 저장
      localStorage.setItem("diagnosis_result", JSON.stringify(data.result));
      router.push("/survey/complete");
    } catch (e) {
      setError(e instanceof Error ? e.message : "제출 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  const selectedValue = answers[currentIndex] as 0 | ScaleValue;
  const isLast = currentIndex === total - 1;

  return (
    <div className="card">
      <div className="topBar">
        <div className="brand">
          <strong>설문</strong>
          <span className="muted" style={{ fontSize: 13 }}>
            {progressText}
          </span>
        </div>
        <span className="pill">
          문항 {currentIndex + 1}/{total}
        </span>
      </div>

      <div style={{ marginBottom: 12 }}>
        <span className="pill" style={{ marginRight: 8 }}>
          나이: {profile.age}
        </span>
        <span className="pill" style={{ marginRight: 8 }}>
          직업: {profile.job}
        </span>
        <span className="pill">관심사: {profile.interests.slice(0, 4).join(", ")}{profile.interests.length > 4 ? "…" : ""}</span>
      </div>

      <h2 style={{ margin: "12px 0 8px", fontSize: 18 }}>{currentQuestion.text}</h2>
      <p className="help" style={{ marginTop: 0 }}>
        아래 중 하나를 선택해 주세요.
      </p>

      <div className="radioGrid" role="radiogroup" aria-label={`문항 ${currentQuestion.id}`}>
        {MC_5POINT_OPTIONS.map((opt) => {
          const selected = selectedValue === opt.value;
          return (
            <label key={opt.value} className="radioOption" data-selected={selected ? "true" : "false"}>
              <input
                type="radio"
                name={`q-${currentQuestion.id}`}
                value={opt.value}
                checked={selected}
                onChange={() => setAnswer(opt.value)}
                style={{ display: "none" }}
              />
              <span style={{ fontWeight: 800 }}>{opt.label}</span>
              <span className="muted" style={{ fontSize: 12 }}>
                {opt.value}/5
              </span>
            </label>
          );
        })}
      </div>

      {error ? (
        <p style={{ margin: "12px 0 0", color: "#ffd1d1" }}>
          <strong>안내:</strong> {error}
        </p>
      ) : null}

      <div className="stepNav" style={{ marginTop: 16 }}>
        <button className="btn" type="button" onClick={goPrev} disabled={currentIndex === 0 || submitting} style={{ width: "auto", padding: "12px 18px" }}>
          이전
        </button>

        {!isLast ? (
          <button className="btn" type="button" onClick={goNext} disabled={submitting} style={{ width: "auto", padding: "12px 18px" }}>
            다음
          </button>
        ) : (
          <button className="btn" type="button" onClick={onSubmit} disabled={submitting} style={{ width: "auto", padding: "12px 18px" }}>
            {submitting ? "제출 중..." : "제출하기"}
          </button>
        )}
      </div>
    </div>
  );
}

