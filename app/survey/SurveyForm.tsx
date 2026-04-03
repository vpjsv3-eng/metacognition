"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  Profile,
  DiagnosisPayload,
  DiagnosisResult,
  SurveyAnswer,
} from "../lib/types";
import { SURVEY_QUESTIONS, type SurveyQuestion } from "../lib/questions";

type Props = { profile: Profile };

type AnswerState = {
  selectedIndex?: number;
  selectedIndices?: number[];
  textValue?: string;
  customText?: string;
  skipped?: boolean;
};

function isCustomOption(text: string) {
  return text.startsWith("기타");
}

export default function SurveyForm({ profile }: Props) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animKey, setAnimKey] = useState(0);

  const visibleQuestions = useMemo(() => {
    const result: SurveyQuestion[] = [];
    for (const q of SURVEY_QUESTIONS) {
      if (q.type === "text") {
        const parent = SURVEY_QUESTIONS.find(
          (pq) => pq.subQuestionId === q.id,
        );
        if (parent) {
          const parentAnswer = answers[parent.id];
          if (parentAnswer?.selectedIndex !== parent.branchTriggerIndex) {
            continue;
          }
        }
      }
      result.push(q);
    }
    return result;
  }, [answers]);

  const total = visibleQuestions.length;
  const safeStep = Math.min(currentStep, total - 1);
  const currentQ = visibleQuestions[safeStep];
  const currentAnswer = currentQ ? answers[currentQ.id] : undefined;

  const answeredCount = useMemo(() => {
    return visibleQuestions.filter((q) => {
      const a = answers[q.id];
      if (!a) return false;
      if (q.type === "text") return !!(a.textValue?.trim() || a.skipped);
      if (q.type === "multi") {
        if (!a.selectedIndices?.length) return false;
        if (
          q.hasCustomOption &&
          a.selectedIndices.includes(q.options!.length - 1) &&
          !a.customText?.trim()
        )
          return false;
        return true;
      }
      if (a.selectedIndex === undefined || a.selectedIndex < 0) return false;
      if (
        q.hasCustomOption &&
        a.selectedIndex === q.options!.length - 1 &&
        !a.customText?.trim()
      )
        return false;
      return true;
    }).length;
  }, [answers, visibleQuestions]);

  const progress = total > 0 ? ((safeStep + 1) / total) * 100 : 0;

  function navigate(step: number) {
    setError(null);
    setCurrentStep(step);
    setAnimKey((k) => k + 1);
  }

  function selectSingleOption(idx: number) {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        selectedIndex: idx,
        customText: prev[currentQ.id]?.customText || "",
      },
    }));
    setError(null);
  }

  function toggleMultiOption(idx: number) {
    setAnswers((prev) => {
      const curr = prev[currentQ.id]?.selectedIndices || [];
      const next = curr.includes(idx)
        ? curr.filter((i) => i !== idx)
        : [...curr, idx];
      return {
        ...prev,
        [currentQ.id]: {
          ...prev[currentQ.id],
          selectedIndices: next,
          customText: prev[currentQ.id]?.customText || "",
        },
      };
    });
    setError(null);
  }

  function setCustomText(text: string) {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: { ...prev[currentQ.id], customText: text },
    }));
  }

  function setTextValue(text: string) {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: { ...prev[currentQ.id], textValue: text },
    }));
  }

  function goPrev() {
    if (safeStep > 0) navigate(safeStep - 1);
  }

  function goNext() {
    setError(null);
    const a = currentAnswer;

    if (currentQ.type === "text") {
      if (!a?.textValue?.trim() && !a?.skipped) {
        setError("내용을 입력하거나 건너뛰기를 눌러주세요.");
        return;
      }
    } else if (currentQ.type === "multi") {
      if (!a?.selectedIndices?.length) {
        setError("최소 1개를 선택해 주세요.");
        return;
      }
      if (
        currentQ.hasCustomOption &&
        a.selectedIndices.includes(currentQ.options!.length - 1) &&
        !a.customText?.trim()
      ) {
        setError("기타 내용을 입력해 주세요.");
        return;
      }
    } else {
      if (a?.selectedIndex === undefined || a.selectedIndex < 0) {
        setError("하나를 선택해 주세요.");
        return;
      }
      if (
        currentQ.hasCustomOption &&
        a.selectedIndex === currentQ.options!.length - 1 &&
        !a.customText?.trim()
      ) {
        setError("기타 내용을 입력해 주세요.");
        return;
      }
    }

    if (safeStep < total - 1) {
      navigate(safeStep + 1);
    }
  }

  function skipTextQuestion() {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: { ...prev[currentQ.id], skipped: true, textValue: "" },
    }));
    setError(null);
    if (safeStep < total - 1) {
      navigate(safeStep + 1);
    }
  }

  function buildAnswerList(): SurveyAnswer[] {
    return visibleQuestions.map((q) => {
      const a = answers[q.id];
      let answerText = "";

      if (q.type === "text") {
        answerText = a?.skipped
          ? "(건너뜀)"
          : (a?.textValue?.trim() || "");
      } else if (q.type === "multi") {
        const indices = a?.selectedIndices || [];
        const parts = indices.map((i) => {
          const opt = q.options![i];
          return isCustomOption(opt) ? (a?.customText?.trim() || opt) : opt;
        });
        answerText = parts.join(", ");
      } else {
        const idx = a?.selectedIndex ?? 0;
        const opt = q.options![idx];
        answerText = isCustomOption(opt) ? (a?.customText?.trim() || opt) : opt;
      }

      return { questionId: q.id, questionText: q.text, answer: answerText };
    });
  }

  function isComplete(): boolean {
    return visibleQuestions.every((q) => {
      const a = answers[q.id];
      if (!a) return false;
      if (q.type === "text") return !!(a.textValue?.trim() || a.skipped);
      if (q.type === "multi") {
        if (!a.selectedIndices?.length) return false;
        if (
          q.hasCustomOption &&
          a.selectedIndices.includes(q.options!.length - 1) &&
          !a.customText?.trim()
        )
          return false;
        return true;
      }
      if (a.selectedIndex === undefined || a.selectedIndex < 0) return false;
      if (
        q.hasCustomOption &&
        a.selectedIndex === q.options!.length - 1 &&
        !a.customText?.trim()
      )
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

  if (!currentQ) return null;

  const isLast = safeStep === total - 1;
  const showCustomInput = (() => {
    if (!currentQ.hasCustomOption || !currentQ.options) return false;
    const lastIdx = currentQ.options.length - 1;
    if (currentQ.type === "multi") {
      return currentAnswer?.selectedIndices?.includes(lastIdx) ?? false;
    }
    return currentAnswer?.selectedIndex === lastIdx;
  })();

  const prevSection =
    safeStep > 0 ? visibleQuestions[safeStep - 1].section : null;
  const showSection = currentQ.section !== prevSection;

  return (
    <>
      {/* Progress bar */}
      <div className="progressBar">
        <div className="progressFill" style={{ width: `${progress}%` }} />
      </div>

      <div className="surveyWrap">
        <div className="questionBlock" key={animKey}>
          <span className="questionCounter">
            {answeredCount}/{total} 문항 완료
          </span>

          {showSection && (
            <div className="sectionTag">{currentQ.section}</div>
          )}

          <h2 className="questionTitle">
            {currentQ.id.replace("-", "-")}. {currentQ.text}
          </h2>

          {currentQ.type === "multi" && (
            <span className="multiBadge">복수 선택 가능</span>
          )}

          {currentQ.type === "text" ? (
            <textarea
              className="textInput"
              value={currentAnswer?.textValue ?? ""}
              onChange={(e) => setTextValue(e.target.value)}
              placeholder={currentQ.placeholder}
              rows={4}
            />
          ) : (
            <div
              className="optionList"
              role={currentQ.type === "multi" ? "group" : "radiogroup"}
              aria-label={`문항 ${currentQ.id}`}
            >
              {currentQ.options!.map((opt, idx) => {
                const isMulti = currentQ.type === "multi";
                const selected = isMulti
                  ? (currentAnswer?.selectedIndices?.includes(idx) ?? false)
                  : currentAnswer?.selectedIndex === idx;
                return (
                  <label
                    key={idx}
                    className="optionCard"
                    data-selected={selected ? "true" : "false"}
                  >
                    <input
                      type={isMulti ? "checkbox" : "radio"}
                      name={`q-${currentQ.id}`}
                      value={idx}
                      checked={selected}
                      onChange={() =>
                        isMulti
                          ? toggleMultiOption(idx)
                          : selectSingleOption(idx)
                      }
                      style={{ display: "none" }}
                    />
                    <span className="optionCheck">
                      {selected ? "✓" : ""}
                    </span>
                    <span className="optionText">{opt}</span>
                  </label>
                );
              })}
            </div>
          )}

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

          {error && <p className="errorText">{error}</p>}

          <div className="navBar">
            <div>
              {safeStep > 0 && (
                <button
                  className="btnGhost"
                  type="button"
                  onClick={goPrev}
                  disabled={submitting}
                >
                  ← 이전
                </button>
              )}
            </div>

            <div className="navRight">
              {currentQ.type === "text" && currentQ.skippable && (
                <button
                  className="btnSkip"
                  type="button"
                  onClick={skipTextQuestion}
                  disabled={submitting}
                >
                  건너뛰기
                </button>
              )}

              {!isLast ? (
                <button
                  className="btnPrimary"
                  type="button"
                  onClick={goNext}
                  disabled={submitting}
                >
                  다음 →
                </button>
              ) : (
                <button
                  className="btnPrimary"
                  type="button"
                  onClick={onSubmit}
                  disabled={submitting}
                >
                  {submitting ? "AI 분석 중..." : "결과 보기"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
