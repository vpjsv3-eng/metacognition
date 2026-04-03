"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type {
  Profile,
  DiagnosisPayload,
  DiagnosisResult,
  SurveyAnswer,
  AnswersMap,
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

type Phase = "survey" | "encouragement" | "loading";

function isCustomOption(text: string) {
  return text.startsWith("기타");
}

const LOADING_STEPS = [
  "답변 패턴 분석 중...",
  "맞춤 아이디어 생성 중...",
  "결과지 준비 중...",
];

export default function SurveyForm({ profile }: Props) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animKey, setAnimKey] = useState(0);
  const [phase, setPhase] = useState<Phase>("survey");
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [apiDone, setApiDone] = useState(false);

  const visibleQuestions = useMemo(() => {
    const result: SurveyQuestion[] = [];
    for (const q of SURVEY_QUESTIONS) {
      const parent = SURVEY_QUESTIONS.find(
        (pq) => pq.subQuestionId === q.id,
      );
      if (parent) {
        const parentAnswer = answers[parent.id];
        const triggerIndices =
          parent.branchTriggerIndices ??
          (parent.branchTriggerIndex !== undefined
            ? [parent.branchTriggerIndex]
            : []);
        if (!triggerIndices.includes(parentAnswer?.selectedIndex ?? -1)) {
          continue;
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
        if (a.skipped) return true;
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

  const isQ6Step = useMemo(() => {
    if (!currentQ) return false;
    const mainQs = visibleQuestions.filter((q) => !q.id.includes("-"));
    const currentMainQ = currentQ.id.includes("-")
      ? visibleQuestions[safeStep - 1]
      : currentQ;
    const mainIndex = mainQs.findIndex((q) => q.id === currentMainQ?.id);
    return mainIndex === 5;
  }, [currentQ, visibleQuestions, safeStep]);

  const currentQMainIndex = useMemo(() => {
    if (!currentQ) return 0;
    const baseId = currentQ.id.split("-")[0];
    const num = parseInt(baseId.replace("Q", ""), 10);
    return isNaN(num) ? 0 : num;
  }, [currentQ]);

  useEffect(() => {
    if (phase !== "loading") return;
    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < LOADING_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase !== "loading") return;
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (apiDone) return 100;
        if (prev < 85) return prev + Math.random() * 8;
        return prev;
      });
    }, 400);
    return () => clearInterval(interval);
  }, [phase, apiDone]);

  useEffect(() => {
    if (apiDone && loadingProgress >= 100) {
      const t = setTimeout(() => router.push("/survey/complete"), 500);
      return () => clearTimeout(t);
    }
  }, [apiDone, loadingProgress, router]);

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
          skipped: false,
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

  const shouldShowEncouragement = useCallback(() => {
    if (!currentQ) return false;
    const currentId = currentQ.id;
    if (currentId === "Q6" || currentId === "Q6-1") {
      const nextStepIdx = safeStep + 1;
      if (nextStepIdx < total) {
        const nextQ = visibleQuestions[nextStepIdx];
        return nextQ && nextQ.id !== "Q6-1";
      }
      return true;
    }
    return false;
  }, [currentQ, safeStep, total, visibleQuestions]);

  function goNext() {
    setError(null);
    const a = currentAnswer;

    if (currentQ.type === "text") {
      if (!a?.textValue?.trim() && !a?.skipped) {
        setError("내용을 입력하거나 건너뛰기를 눌러주세요.");
        return;
      }
    } else if (currentQ.type === "multi") {
      if (!a?.selectedIndices?.length && !a?.skipped) {
        setError(
          currentQ.skippable
            ? "최소 1개를 선택하거나 건너뛰기를 눌러주세요."
            : "최소 1개를 선택해 주세요.",
        );
        return;
      }
      if (
        !a?.skipped &&
        currentQ.hasCustomOption &&
        a?.selectedIndices?.includes(currentQ.options!.length - 1) &&
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

    if (shouldShowEncouragement()) {
      setPhase("encouragement");
      return;
    }

    if (safeStep < total - 1) {
      navigate(safeStep + 1);
    }
  }

  function onEncouragementContinue() {
    setPhase("survey");
    if (safeStep < total - 1) {
      navigate(safeStep + 1);
    }
  }

  function skipQuestion() {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        skipped: true,
        textValue: "",
        selectedIndices: [],
      },
    }));
    setError(null);

    if (shouldShowEncouragement()) {
      setPhase("encouragement");
      return;
    }

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
        if (a?.skipped) {
          answerText = "(건너뜀)";
        } else {
          const indices = a?.selectedIndices || [];
          const parts = indices.map((i) => {
            const opt = q.options![i];
            return isCustomOption(opt) ? (a?.customText?.trim() || opt) : opt;
          });
          answerText = parts.join(", ");
        }
      } else {
        const idx = a?.selectedIndex ?? 0;
        const opt = q.options![idx];
        answerText = isCustomOption(opt) ? (a?.customText?.trim() || opt) : opt;
      }

      return { questionId: q.id, questionText: q.text, answer: answerText };
    });
  }

  function buildAnswersMap(): AnswersMap {
    const map: AnswersMap = {};

    for (const q of visibleQuestions) {
      const a = answers[q.id];
      const key = q.id.replace("-", "_");

      if (q.type === "text") {
        map[key] = a?.skipped ? "(건너뜀)" : (a?.textValue?.trim() || "");
      } else if (q.type === "multi") {
        if (a?.skipped) {
          map[key] = [];
        } else {
          const indices = a?.selectedIndices || [];
          map[key] = indices.map((i) => {
            const opt = q.options![i];
            return isCustomOption(opt) ? (a?.customText?.trim() || opt) : opt;
          });
        }
      } else {
        const idx = a?.selectedIndex ?? 0;
        const opt = q.options![idx];
        map[key] = isCustomOption(opt) ? (a?.customText?.trim() || opt) : opt;
      }
    }

    return map;
  }

  function isComplete(): boolean {
    return visibleQuestions.every((q) => {
      const a = answers[q.id];
      if (!a) return false;
      if (q.type === "text") return !!(a.textValue?.trim() || a.skipped);
      if (q.type === "multi") {
        if (a.skipped) return true;
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
      answersMap: buildAnswersMap(),
    };

    setSubmitting(true);
    setPhase("loading");
    setLoadingStep(0);
    setLoadingProgress(0);
    setApiDone(false);

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
      setApiDone(true);
    } catch (e) {
      setPhase("survey");
      setError(e instanceof Error ? e.message : "제출 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Encouragement screen ──
  if (phase === "encouragement") {
    return (
      <>
        <div className="progressBar">
          <div className="progressFill" style={{ width: `${progress}%` }} />
        </div>
        <div className="encouragementWrap">
          <div className="encouragementContent">
            <span style={{ fontSize: 48, display: "block", marginBottom: 16 }}>
              👏
            </span>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 800,
                margin: "0 0 12px",
                color: "var(--text)",
              }}
            >
              절반 왔어요
            </h2>
            <p
              style={{
                fontSize: 15,
                color: "var(--textSecondary)",
                lineHeight: 1.6,
                margin: "0 0 28px",
              }}
            >
              답변이 구체적일수록
              <br />
              더 정확한 아이디어를 추천받을 수 있어요
            </p>
            <button
              className="btnPrimary"
              type="button"
              onClick={onEncouragementContinue}
            >
              계속하기
            </button>
          </div>
        </div>
      </>
    );
  }

  // ── Loading screen ──
  if (phase === "loading") {
    return (
      <>
        <div className="progressBar">
          <div className="progressFill" style={{ width: "100%" }} />
        </div>
        <div className="loadingWrap">
          <div className="loadingContent">
            <span style={{ fontSize: 44, display: "block", marginBottom: 16 }}>
              🔍
            </span>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 800,
                margin: "0 0 24px",
                color: "var(--text)",
              }}
            >
              AI가 회원님의 답변을 분석하고 있어요
            </h2>

            <div
              style={{
                width: "100%",
                maxWidth: 320,
                height: 6,
                borderRadius: 3,
                background: "var(--border)",
                marginBottom: 28,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  borderRadius: 3,
                  background: "var(--accent)",
                  transition: "width 0.4s ease",
                  width: `${Math.min(loadingProgress, 100)}%`,
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {LOADING_STEPS.map((text, i) => (
                <p
                  key={i}
                  className="loadingStepText"
                  style={{
                    opacity: i <= loadingStep ? 1 : 0,
                    transform:
                      i <= loadingStep
                        ? "translateY(0)"
                        : "translateY(8px)",
                    transition: "opacity 0.5s ease, transform 0.5s ease",
                    margin: 0,
                    fontSize: 14,
                    color:
                      i === loadingStep
                        ? "var(--accent)"
                        : "var(--textSecondary)",
                    fontWeight: i === loadingStep ? 600 : 400,
                  }}
                >
                  {text}
                </p>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Survey screen ──
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
      <div className="progressBar">
        <div className="progressFill" style={{ width: `${progress}%` }} />
      </div>

      <div className="surveyWrap">
        <div className="questionBlock" key={animKey}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <span className="questionCounter">
              {answeredCount}/{total} 문항 완료
            </span>
            <span
              style={{
                fontSize: 12,
                color: "var(--accent)",
                fontWeight: 600,
              }}
            >
              AI 분석 진행 중
            </span>
          </div>

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
                    <span className="optionText">{opt}</span>
                    <span className="optionCheck">
                      {selected ? "✓" : ""}
                    </span>
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

          <div className="navArea">
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
              <div>
                {currentQ.skippable && (
                  <button
                    className="btnSkip"
                    type="button"
                    onClick={skipQuestion}
                    disabled={submitting}
                  >
                    건너뛰기
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
