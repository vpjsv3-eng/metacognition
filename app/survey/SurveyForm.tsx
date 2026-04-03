"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Profile, DiagnosisPayload, DiagnosisResult } from "../lib/types";
import { SURVEY_QUESTIONS } from "../lib/questions";

type Props = {
  profile: Profile;
};

function computeIsComplete(answers: number[]): boolean {
  return answers.length === 10 && answers.every((v) => v >= 0);
}

export default function SurveyForm({ profile }: Props) {
  const router = useRouter();
  const questions = SURVEY_QUESTIONS;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>(() =>
    Array.from({ length: 10 }, () => -1),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = questions[currentIndex];
  const total = questions.length;

  const progressText = useMemo(() => {
    const answeredCount = answers.filter((v) => v >= 0).length;
    return `${answeredCount}/${total} 문항 선택 완료`;
  }, [answers, total]);

  function setAnswer(optionIndex: number) {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = optionIndex;
      return next;
    });
    setError(null);
    if (currentIndex < total - 1) {
      setTimeout(() => {
        setCurrentIndex((i) => Math.min(total - 1, i + 1));
      }, 350);
    }
  }

  function goPrev() {
    setError(null);
    setCurrentIndex((i) => Math.max(0, i - 1));
  }

  function goNext() {
    setError(null);
    if (answers[currentIndex] < 0) {
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
      answers,
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
      localStorage.setItem("diagnosis_result", JSON.stringify(data.result));
      router.push("/survey/complete");
    } catch (e) {
      setError(e instanceof Error ? e.message : "제출 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  const selectedValue = answers[currentIndex];
  const isLast = currentIndex === total - 1;

  return (
    <div className="card">
      <div className="topBar">
        <div className="brand">
          <strong>AI 아이디어 진단</strong>
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
          {profile.job}
        </span>
        <span className="pill">
          관심사:{" "}
          {profile.interests.slice(0, 3).join(", ")}
          {profile.interests.length > 3 ? "…" : ""}
        </span>
      </div>

      <h2 style={{ margin: "12px 0 8px", fontSize: 18 }}>
        Q{currentQuestion.id}. {currentQuestion.text}
      </h2>
      <p className="help" style={{ marginTop: 0 }}>
        아래 중 하나를 선택해 주세요.
      </p>

      <div className="optionList" role="radiogroup" aria-label={`문항 ${currentQuestion.id}`}>
        {currentQuestion.options.map((opt, idx) => {
          const selected = selectedValue === idx;
          return (
            <label
              key={idx}
              className="radioOption"
              data-selected={selected ? "true" : "false"}
            >
              <input
                type="radio"
                name={`q-${currentQuestion.id}`}
                value={idx}
                checked={selected}
                onChange={() => setAnswer(idx)}
                style={{ display: "none" }}
              />
              <span className="optionNum">{idx + 1}</span>
              <span style={{ fontWeight: 700 }}>{opt}</span>
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
        <button
          className="btn"
          type="button"
          onClick={goPrev}
          disabled={currentIndex === 0 || submitting}
          style={{ width: "auto", padding: "12px 18px" }}
        >
          이전
        </button>

        {!isLast ? (
          <button
            className="btn"
            type="button"
            onClick={goNext}
            disabled={submitting}
            style={{ width: "auto", padding: "12px 18px" }}
          >
            다음
          </button>
        ) : (
          <button
            className="btn"
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            style={{ width: "auto", padding: "12px 18px" }}
          >
            {submitting ? "분석 중..." : "결과 보기"}
          </button>
        )}
      </div>
    </div>
  );
}
