"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Profile, DiagnosisPayload, DiagnosisResult, SurveyAnswer } from "../lib/types";
import { SURVEY_QUESTIONS } from "../lib/questions";

type Props = { profile: Profile };

type AnswerState = {
  selectedIndex: number;
  customText: string;
};

function isCustomOption(optionText: string) {
  return optionText.startsWith("기타");
}

export default function SurveyForm({ profile }: Props) {
  const router = useRouter();
  const questions = SURVEY_QUESTIONS;
  const total = questions.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, AnswerState>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentQ = questions[currentIndex];
  const currentAnswer = answers[currentQ.id];

  const answeredCount = useMemo(
    () =>
      questions.filter((q) => {
        const a = answers[q.id];
        if (!a || a.selectedIndex < 0) return false;
        if (isCustomOption(q.options[a.selectedIndex]) && !a.customText.trim())
          return false;
        return true;
      }).length,
    [answers, questions],
  );

  function selectOption(optionIndex: number) {
    const qId = currentQ.id;
    setAnswers((prev) => ({
      ...prev,
      [qId]: {
        selectedIndex: optionIndex,
        customText: prev[qId]?.customText || "",
      },
    }));
    setError(null);

    const opt = currentQ.options[optionIndex];
    if (!isCustomOption(opt) && currentIndex < total - 1) {
      setTimeout(() => setCurrentIndex((i) => Math.min(total - 1, i + 1)), 350);
    }
  }

  function setCustomText(text: string) {
    const qId = currentQ.id;
    setAnswers((prev) => ({
      ...prev,
      [qId]: { ...prev[qId], customText: text },
    }));
  }

  function goPrev() {
    setError(null);
    setCurrentIndex((i) => Math.max(0, i - 1));
  }

  function goNext() {
    setError(null);
    const a = currentAnswer;
    if (!a || a.selectedIndex < 0) {
      setError("현재 문항을 먼저 선택해 주세요.");
      return;
    }
    if (
      isCustomOption(currentQ.options[a.selectedIndex]) &&
      !a.customText.trim()
    ) {
      setError("기타 내용을 입력해 주세요.");
      return;
    }
    setCurrentIndex((i) => Math.min(total - 1, i + 1));
  }

  function buildAnswerList(): SurveyAnswer[] {
    return questions.map((q) => {
      const a = answers[q.id];
      const opt = q.options[a?.selectedIndex ?? 0];
      const answerText = isCustomOption(opt) ? a.customText.trim() : opt;
      return { questionId: q.id, questionText: q.text, answer: answerText };
    });
  }

  function isComplete(): boolean {
    return questions.every((q) => {
      const a = answers[q.id];
      if (!a || a.selectedIndex < 0) return false;
      if (isCustomOption(q.options[a.selectedIndex]) && !a.customText.trim())
        return false;
      return true;
    });
  }

  async function onSubmit() {
    setError(null);
    if (!isComplete()) {
      setError("모든 문항을 선택한 뒤 제출해 주세요.");
      return;
    }

    const payload: DiagnosisPayload = {
      profile,
      answers: buildAnswerList(),
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

  const isLast = currentIndex === total - 1;
  const showCustomInput =
    currentAnswer?.selectedIndex >= 0 &&
    isCustomOption(currentQ.options[currentAnswer.selectedIndex]);

  const prevSection =
    currentIndex > 0 ? questions[currentIndex - 1].section : null;
  const showSection = currentQ.section !== prevSection;

  return (
    <div className="card">
      <div className="topBar">
        <div className="brand">
          <strong>AI 아이디어 진단</strong>
          <span className="muted" style={{ fontSize: 13 }}>
            {answeredCount}/{total} 문항 완료
          </span>
        </div>
        <span className="pill">
          Q{currentIndex + 1}/{total}
        </span>
      </div>

      <div style={{ marginBottom: 12 }}>
        <span className="pill" style={{ marginRight: 8 }}>{profile.job}</span>
        {profile.keywords.slice(0, 2).map((kw) => (
          <span key={kw} className="pill" style={{ marginRight: 8 }}>
            {kw}
          </span>
        ))}
      </div>

      {showSection && (
        <div className="sectionLabel">{currentQ.section}</div>
      )}

      <h2 style={{ margin: "8px 0 8px", fontSize: 18 }}>
        Q{currentQ.id}. {currentQ.text}
      </h2>
      <p className="help" style={{ marginTop: 0 }}>
        아래 중 하나를 선택해 주세요.
      </p>

      <div
        className="optionList"
        role="radiogroup"
        aria-label={`문항 ${currentQ.id}`}
      >
        {currentQ.options.map((opt, idx) => {
          const selected = currentAnswer?.selectedIndex === idx;
          return (
            <label
              key={idx}
              className="radioOption"
              data-selected={selected ? "true" : "false"}
            >
              <input
                type="radio"
                name={`q-${currentQ.id}`}
                value={idx}
                checked={selected}
                onChange={() => selectOption(idx)}
                style={{ display: "none" }}
              />
              <span className="optionNum">{idx + 1}</span>
              <span style={{ fontWeight: 700 }}>{opt}</span>
            </label>
          );
        })}
      </div>

      {showCustomInput && (
        <input
          type="text"
          className="customInput"
          value={currentAnswer?.customText ?? ""}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder="내용을 직접 입력해 주세요"
          autoFocus
        />
      )}

      {error && (
        <p style={{ margin: "12px 0 0", color: "#ffd1d1" }}>
          <strong>안내:</strong> {error}
        </p>
      )}

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
            {submitting ? "AI 분석 중..." : "결과 보기"}
          </button>
        )}
      </div>
    </div>
  );
}
