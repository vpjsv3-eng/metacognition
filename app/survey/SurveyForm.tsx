"use client";

import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type {
  Profile,
  DiagnosisPayload,
  DiagnosisResult,
  SurveyAnswer,
  AnswersMap,
} from "../lib/types";
import {
  SURVEY_QUESTIONS,
  BASE_SURVEY_STEP_COUNT,
  getSurveyProgressMainNumber,
  type SurveyQuestion,
} from "../lib/questions";
import {
  safeLocalStorageGet,
  safeLocalStorageSet,
  safeLocalStorageRemove,
} from "../lib/safeStorage";
import { readUtmForApi } from "../lib/utm";

const JOB_OPTIONS = [
  "직장인",
  "프리랜서 / 1인 사업자",
  "학생",
  "취업 준비 / 경력 전환 중",
  "기타 (직접 입력)",
];

const JOB_DETAIL_PLACEHOLDERS: Record<string, string> = {
  "직장인": "어떤 업종/직무인지 알려주세요\n예: 마케터, 영업, 개발자, 간호사 등",
  "프리랜서 / 1인 사업자": "어떤 일을 하시나요?\n예: 디자이너, 작가, 유튜버, 쇼핑몰 운영 등",
  "학생": "어떤 전공을 공부하고 있나요?\n예: 경영학, 컴퓨터공학, 간호학 등",
  "취업 준비 / 경력 전환 중": "어떤 분야로 가고 싶으신가요?\n예: IT, 마케팅, 디자인, 창업 등",
  "기타 (직접 입력)": "하시는 일을 간단히 알려주세요",
};

const STORAGE_KEY = "survey_progress";

/** 복수 선택 시 최대 2개로 제한하는 본 설문 문항 (Q11은 단일 선택이라 미포함) */
const MULTI_MAX_TWO_QUESTION_IDS = new Set([
  "Q1",
  "Q2",
  "Q3",
  "Q4",
  "Q6",
  "Q7",
  "Q9",
  "Q12",
]);

const KEYWORD_OPTIONS = [
  "재테크 / 절약",
  "배우는 걸 좋아해요",
  "부업 / 수익화",
  "업무 자동화",
  "콘텐츠 제작",
  "건강 / 운동",
  "육아 / 가족",
  "라이프스타일",
  "직무 역량 향상",
  "창업 / 사이드 프로젝트",
];

type AnswerState = {
  selectedIndex?: number;
  selectedIndices?: number[];
  textValue?: string;
  customText?: string;
  skipped?: boolean;
};

type Phase =
  | "profile_job"
  | "profile_keywords"
  | "survey"
  | "email_input"
  | "email_confirm"
  | "loading";

function isCustomOption(text: string) {
  return text.startsWith("기타");
}

const LOADING_STEPS = [
  "답변 패턴 분석 중...",
  "맞춤 아이디어 생성 중...",
  "결과지 준비 중...",
];

const EMAIL_SENT_KEY = "emailSent";

/** 문항 전환 후 DOM 갱신 뒤 최상단으로 스크롤 (인앱 브라우저 호환) */
function scrollSurveyToTop() {
  setTimeout(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, 0);
}

export default function SurveyForm() {
  const router = useRouter();

  // Profile state (STEP 0-1, 0-2)
  const [jobIndex, setJobIndex] = useState(-1);
  const [jobCustom, setJobCustom] = useState("");
  const [jobDetail, setJobDetail] = useState("");
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [phase, setPhase] = useState<Phase>("profile_job");
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animKey, setAnimKey] = useState(0);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [apiDone, setApiDone] = useState(false);
  const [loadingSlowHint, setLoadingSlowHint] = useState(false);
  const [loadingFailed, setLoadingFailed] = useState(false);
  const submitAbortRef = useRef<AbortController | null>(null);

  const [email, setEmail] = useState("");
  const [emailConsent, setEmailConsent] = useState(false);
  const [emailConsentOpen, setEmailConsentOpen] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const pulseTriggered = useRef(false);
  const [showPulse, setShowPulse] = useState(false);
  const [showMotivation, setShowMotivation] = useState(false);
  const motivationTriggered = useRef(false);

  const [q7EncourageOpen, setQ7EncourageOpen] = useState(false);
  const pendingNavigateStepRef = useRef<number | null>(null);

  const [showResumeModal, setShowResumeModal] = useState(false);
  const resumeChecked = useRef(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isCustomJob = jobIndex >= 0 && JOB_OPTIONS[jobIndex].startsWith("기타");

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 2000);
    return () => clearTimeout(t);
  }, [toastMessage]);

  const saveProgress = useCallback(() => {
    try {
      const data = {
        currentStep,
        answers,
        job: jobIndex,
        jobCustom,
        jobDetail,
        keywords: selectedKeywords,
        phase,
        savedAt: new Date().toISOString(),
      };
      safeLocalStorageSet(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }, [currentStep, answers, jobIndex, jobCustom, jobDetail, selectedKeywords, phase]);

  useEffect(() => {
    if (resumeChecked.current) return;
    resumeChecked.current = true;
    try {
      const saved = safeLocalStorageGet(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.answers && Object.keys(parsed.answers).length > 0) {
          setShowResumeModal(true);
        }
      }
    } catch {}
  }, []);

  function restoreProgress() {
    try {
      const saved = safeLocalStorageGet(STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (parsed.job !== undefined) setJobIndex(parsed.job);
      if (parsed.jobCustom) setJobCustom(parsed.jobCustom);
      if (parsed.jobDetail) setJobDetail(parsed.jobDetail);
      if (parsed.keywords) setSelectedKeywords(parsed.keywords);
      if (parsed.answers) setAnswers(parsed.answers);
      if (parsed.phase) setPhase(parsed.phase);
      if (parsed.currentStep !== undefined) setCurrentStep(parsed.currentStep);
    } catch {}
    setShowResumeModal(false);
  }

  function clearProgress() {
    safeLocalStorageRemove(STORAGE_KEY);
    safeLocalStorageRemove(EMAIL_SENT_KEY);
    setShowResumeModal(false);
  }

  function getProfile(): Profile {
    const job = isCustomJob ? jobCustom.trim() : JOB_OPTIONS[jobIndex] || "";
    return { job, keywords: selectedKeywords };
  }

  function toggleKeyword(kw: string) {
    if (selectedKeywords.includes(kw)) {
      setSelectedKeywords((prev) => prev.filter((k) => k !== kw));
      return;
    }
    if (selectedKeywords.length >= 3) {
      setToastMessage("최대 3개까지 선택할 수 있어요");
      return;
    }
    setSelectedKeywords((prev) => [...prev, kw]);
  }

  const visibleQuestions = useMemo(() => {
    const result: SurveyQuestion[] = [];
    for (const q of SURVEY_QUESTIONS) {
      if (q.parentQuestionId) {
        const parentAnswer = answers[q.parentQuestionId];
        if (parentAnswer?.selectedIndex !== q.parentTriggerIndex) {
          continue;
        }
      } else {
        const parent = SURVEY_QUESTIONS.find(
          (pq) => pq.subQuestionId === q.id,
        );
        if (parent) {
          const parentAnswer = answers[parent.id];
          if (parent.type === "multi" && parent.multiFollowUp) {
            const mf = parent.multiFollowUp;
            const idxs = parentAnswer?.selectedIndices ?? [];
            const showSub =
              idxs.length > 0 &&
              !mf.skipIfAnyOf.some((i) => idxs.includes(i)) &&
              mf.requireAnyOf.some((i) => idxs.includes(i));
            if (!showSub) continue;
          } else {
            const triggerIndices =
              parent.branchTriggerIndices ??
              (parent.branchTriggerIndex !== undefined
                ? [parent.branchTriggerIndex]
                : []);
            if (!triggerIndices.includes(parentAnswer?.selectedIndex ?? -1)) {
              continue;
            }
          }
        }
      }
      result.push(q);
    }
    return result;
  }, [answers]);

  const total = visibleQuestions.length;
  const safeStep = total > 0 ? Math.min(currentStep, total - 1) : 0;
  const currentQ = total > 0 ? visibleQuestions[safeStep] : undefined;
  const currentAnswer = currentQ ? answers[currentQ.id] : undefined;

  const progressLabelQuestionId =
    currentQ?.id ?? visibleQuestions[0]?.id ?? "Q1";

  const progressPercent =
    phase === "profile_job" || phase === "profile_keywords"
      ? 0
      : (getSurveyProgressMainNumber(progressLabelQuestionId) /
          BASE_SURVEY_STEP_COUNT) *
        100;

  useEffect(() => {
    if (phase !== "survey" || total <= 0) return;
    if (currentStep >= total) {
      setCurrentStep(total - 1);
    }
  }, [phase, total, currentStep]);

  useEffect(() => {
    if (phase !== "survey") return;
    if (progressPercent >= 50 && !pulseTriggered.current) {
      pulseTriggered.current = true;
      setShowPulse(true);
      const t = setTimeout(() => setShowPulse(false), 1000);
      return () => clearTimeout(t);
    }
  }, [progressPercent, phase]);

  useEffect(() => {
    if (phase !== "survey") return;
    if (progressPercent >= 50 && !motivationTriggered.current) {
      motivationTriggered.current = true;
      setShowMotivation(true);
      const t = setTimeout(() => setShowMotivation(false), 3000);
      return () => clearTimeout(t);
    }
  }, [progressPercent, phase]);

  useEffect(() => {
    if (phase !== "loading") return;
    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < LOADING_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase !== "loading") return;
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (apiDone) return 100;
        if (loadingFailed) return prev;
        if (prev < 85) return prev + Math.random() * 8;
        return prev;
      });
    }, 400);
    return () => clearInterval(interval);
  }, [phase, apiDone, loadingFailed]);

  useEffect(() => {
    if (phase !== "loading" || apiDone || loadingFailed) return;
    setLoadingSlowHint(false);
    const t = window.setTimeout(() => setLoadingSlowHint(true), 30_000);
    return () => window.clearTimeout(t);
  }, [phase, apiDone, loadingFailed]);

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
    scrollSurveyToTop();
  }

  function shouldShowQ7Encouragement(fromQId: string, nextStepIndex: number) {
    const nextQ = visibleQuestions[nextStepIndex];
    return (
      nextQ?.id === "Q8" &&
      (fromQId === "Q7" || fromQId === "Q7-1")
    );
  }

  function finishQ7Encouragement() {
    setQ7EncourageOpen(false);
    const step = pendingNavigateStepRef.current;
    pendingNavigateStepRef.current = null;
    if (step !== null) {
      navigate(step);
      setTimeout(saveProgress, 0);
    }
  }

  function selectSingleOption(idx: number) {
    if (!currentQ) return;
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
    const q = currentQ;
    if (!q || q.type !== "multi") return;
    const maxTwo = MULTI_MAX_TWO_QUESTION_IDS.has(q.id);
    const exclusive = q.exclusiveAloneIndices ?? [];
    const curr = currentAnswer?.selectedIndices || [];

    if (!exclusive.includes(idx)) {
      const base = curr.filter((i) => !exclusive.includes(i));
      if (!base.includes(idx) && maxTwo && base.length >= 2) {
        setToastMessage("최대 2개까지 선택할 수 있어요");
        return;
      }
    }

    setAnswers((prev) => {
      const prevCurr = prev[q.id]?.selectedIndices || [];
      let next: number[];
      if (exclusive.includes(idx)) {
        next = prevCurr.includes(idx) ? [] : [idx];
      } else {
        const base = prevCurr.filter((i) => !exclusive.includes(i));
        next = base.includes(idx)
          ? base.filter((i) => i !== idx)
          : [...base, idx];
      }
      return {
        ...prev,
        [q.id]: {
          ...prev[q.id],
          selectedIndices: next,
          customText: prev[q.id]?.customText || "",
          skipped: false,
        },
      };
    });
    setError(null);
  }

  function setCustomText(text: string) {
    if (!currentQ) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: { ...prev[currentQ.id], customText: text },
    }));
  }

  function setTextValue(text: string) {
    if (!currentQ) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: { ...prev[currentQ.id], textValue: text },
    }));
  }

  function goPrev() {
    if (phase === "survey" && safeStep === 0) {
      setPhase("profile_keywords");
      scrollSurveyToTop();
      return;
    }
    if (safeStep > 0) navigate(safeStep - 1);
  }

  function goNext() {
    if (!currentQ) return;
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

    if (safeStep < total - 1) {
      const nextIdx = safeStep + 1;
      if (shouldShowQ7Encouragement(currentQ.id, nextIdx)) {
        pendingNavigateStepRef.current = nextIdx;
        setQ7EncourageOpen(true);
        return;
      }
      navigate(nextIdx);
      setTimeout(saveProgress, 0);
    }
  }

  function skipQuestion() {
    if (!currentQ) return;
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

    if (safeStep < total - 1) {
      const nextIdx = safeStep + 1;
      if (shouldShowQ7Encouragement(currentQ.id, nextIdx)) {
        pendingNavigateStepRef.current = nextIdx;
        setQ7EncourageOpen(true);
        return;
      }
      navigate(nextIdx);
      setTimeout(saveProgress, 0);
    }
  }

  function startEmailFlow() {
    if (!currentQ) return;
    setError(null);
    const a = currentAnswer;

    if (currentQ.type === "text") {
      if (!a?.textValue?.trim() && !a?.skipped) {
        setError("내용을 입력하거나 건너뛰기를 눌러주세요.");
        return;
      }
    } else if (currentQ.type === "multi") {
      if (!a?.selectedIndices?.length && !a?.skipped) {
        setError("최소 1개를 선택해 주세요.");
        return;
      }
    } else {
      if (a?.selectedIndex === undefined || a.selectedIndex < 0) {
        setError("하나를 선택해 주세요.");
        return;
      }
    }

    if (!isComplete()) {
      setError("모든 문항을 선택한 뒤 제출해 주세요.");
      return;
    }

    setPhase("email_input");
    scrollSurveyToTop();
  }

  function handleEmailSubmit() {
    setEmailError(null);
    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError("이메일을 입력해 주세요.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError("올바른 이메일 형식을 입력해 주세요.");
      return;
    }
    if (!emailConsent) {
      setEmailError("개인정보 수집 동의가 필요해요.");
      return;
    }
    setPhase("email_confirm");
    scrollSurveyToTop();
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
    if (jobDetail.trim()) {
      map["job_detail"] = jobDetail.trim();
    }

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
    safeLocalStorageRemove(EMAIL_SENT_KEY);
    const profile = getProfile();
    const updatedProfile = { ...profile, email: email.trim() };

    const payload: DiagnosisPayload = {
      profile: updatedProfile,
      answers: buildAnswerList(),
      answersMap: buildAnswersMap(),
      utm: readUtmForApi(),
    };

    submitAbortRef.current?.abort();
    const ac = new AbortController();
    submitAbortRef.current = ac;

    setSubmitting(true);
    setPhase("loading");
    setLoadingStep(0);
    setLoadingProgress(0);
    setApiDone(false);
    setLoadingSlowHint(false);
    setLoadingFailed(false);

    try {
      const res = await fetch("/api/diagnosis/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: ac.signal,
      });
      if (!res.ok) {
        setLoadingFailed(true);
        return;
      }
      const data = (await res.json()) as { ok: true; result: DiagnosisResult };
      safeLocalStorageSet("diagnosis_result", JSON.stringify(data.result));
      setApiDone(true);
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      setLoadingFailed(true);
    } finally {
      setSubmitting(false);
    }
  }

  const surveyToast =
    toastMessage != null ? (
      <div className="surveyToast" role="status" aria-live="polite">
        {toastMessage}
      </div>
    ) : null;

  // ── Resume modal ──
  if (showResumeModal) {
    return (
      <>
        {surveyToast}
        <div className="modalOverlay">
        <div className="modalContent">
          <h3
            style={{
              fontSize: 18,
              fontWeight: 700,
              margin: "0 0 8px",
              color: "var(--text)",
            }}
          >
            이전에 하던 진단이 있어요
          </h3>
          <p
            style={{
              margin: "0 0 24px",
              fontSize: 15,
              color: "var(--textSecondary)",
            }}
          >
            이어서 진행하시겠어요?
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button className="btnPrimary" type="button" onClick={restoreProgress}>
              이어서 하기
            </button>
            <button className="btnGhost" type="button" onClick={clearProgress}>
              처음부터 하기
            </button>
          </div>
        </div>
      </div>
      </>
    );
  }

  // ── STEP 0-1: 직업 선택 ──
  if (phase === "profile_job") {
    const selectedJobName = jobIndex >= 0 ? JOB_OPTIONS[jobIndex] : "";
    const detailPlaceholder = JOB_DETAIL_PLACEHOLDERS[selectedJobName] || "";

    return (
      <>
        {surveyToast}
        <div className="progressBar">
          <div className="progressFill" style={{ width: "0%" }} />
        </div>
        <div className="surveyWrap">
          <div className="questionBlock" key="profile-job">
            <h2 className="questionTitle">먼저 현재 하시는 일을 알려주세요</h2>
            <div className="optionList">
              {JOB_OPTIONS.map((opt, idx) => {
                const selected = jobIndex === idx;
                return (
                  <label
                    key={idx}
                    className="optionCard"
                    data-selected={selected ? "true" : "false"}
                  >
                    <input
                      type="radio"
                      name="job"
                      value={idx}
                      checked={selected}
                      onChange={() => {
                        setJobIndex(idx);
                        setProfileError(null);
                      }}
                      style={{ display: "none" }}
                    />
                    <span className="optionText">{opt}</span>
                    <span className="optionCheck">{selected ? "✓" : ""}</span>
                  </label>
                );
              })}
            </div>
            {isCustomJob && (
              <input
                type="text"
                className="customInput"
                value={jobCustom}
                onChange={(e) => setJobCustom(e.target.value)}
                placeholder="직업을 직접 입력해 주세요"
                autoFocus
              />
            )}
            {jobIndex >= 0 && detailPlaceholder && (
              <textarea
                className="textInput"
                value={jobDetail}
                onChange={(e) => setJobDetail(e.target.value)}
                placeholder={detailPlaceholder}
                rows={2}
                style={{ marginTop: 12 }}
              />
            )}
            {profileError && <p className="errorText">{profileError}</p>}
            <div className="navArea">
              <button
                className="btnPrimary"
                type="button"
                onClick={() => {
                  if (jobIndex < 0) {
                    setProfileError("직업을 선택해 주세요.");
                    return;
                  }
                  if (isCustomJob && !jobCustom.trim()) {
                    setProfileError("직업을 직접 입력해 주세요.");
                    return;
                  }
                  setProfileError(null);
                  setPhase("profile_keywords");
                  setAnimKey((k) => k + 1);
                  setTimeout(saveProgress, 0);
                  scrollSurveyToTop();
                }}
              >
                다음 →
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── STEP 0-2: 키워드 선택 ──
  if (phase === "profile_keywords") {
    return (
      <>
        {surveyToast}
        <div className="progressBar">
          <div className="progressFill" style={{ width: "0%" }} />
        </div>
        <div className="surveyWrap">
          <div className="questionBlock" key="profile-keywords">
            <h2 className="questionTitle">
              나를 가장 잘 설명하는 키워드를 골라주세요
            </h2>
            <span className="multiBadge">최대 3개 선택</span>
            <div className="keywordGrid">
              {KEYWORD_OPTIONS.map((kw) => {
                const selected = selectedKeywords.includes(kw);
                const disabled = !selected && selectedKeywords.length >= 3;
                return (
                  <button
                    key={kw}
                    type="button"
                    className="keywordChip"
                    data-selected={selected ? "true" : "false"}
                    data-disabled={disabled ? "true" : "false"}
                    onClick={() => !disabled && toggleKeyword(kw)}
                  >
                    {kw}
                  </button>
                );
              })}
            </div>
            {selectedKeywords.length > 0 && (
              <p className="help">선택: {selectedKeywords.length}/3</p>
            )}
            {profileError && <p className="errorText">{profileError}</p>}
            <div className="navArea">
              <button
                className="btnPrimary"
                type="button"
                onClick={() => {
                  setProfileError(null);
                  setPhase("survey");
                  setAnimKey((k) => k + 1);
                  setTimeout(saveProgress, 0);
                  scrollSurveyToTop();
                }}
              >
                다음 →
              </button>
              <div className="navBar">
                <div>
                  <button
                    className="btnGhost"
                    type="button"
                    onClick={() => {
                      setProfileError(null);
                      setPhase("profile_job");
                      scrollSurveyToTop();
                    }}
                  >
                    ← 이전
                  </button>
                </div>
                <div />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Email input screen ──
  if (phase === "email_input") {
    return (
      <>
        {surveyToast}
        <div className="progressBar">
          <div className="progressFill" style={{ width: "100%" }} />
        </div>
        <div className="surveyWrap">
          <div className="questionBlock" key="email-input">
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <span style={{ fontSize: 44, display: "block", marginBottom: 12 }}>
                📋
              </span>
              <h2
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  margin: "0 0 8px",
                  color: "var(--text)",
                }}
              >
                결과지를 받을 이메일을 입력해 주세요
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: 15,
                  color: "var(--textSecondary)",
                  lineHeight: 1.6,
                }}
              >
                분석 결과를 이메일로 보내드려요 📋
              </p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(null);
                }}
                placeholder="result@example.com"
                style={{
                  borderColor: emailError ? "var(--error)" : undefined,
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  fontSize: 14,
                  color: "var(--text)",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={emailConsent}
                  onChange={(e) => setEmailConsent(e.target.checked)}
                  style={{
                    width: 18,
                    height: 18,
                    marginTop: 2,
                    accentColor: "var(--accent)",
                    flexShrink: 0,
                  }}
                />
                <span>
                  개인정보 수집 및 이용에 동의합니다.{" "}
                  <span style={{ color: "var(--error)" }}>(필수)</span>
                </span>
              </label>
              <button
                type="button"
                onClick={() => setEmailConsentOpen((v) => !v)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--textSecondary)",
                  fontSize: 13,
                  cursor: "pointer",
                  marginTop: 4,
                  marginLeft: 26,
                  padding: 0,
                }}
              >
                {emailConsentOpen ? "내용 닫기 ▲" : "내용 보기 ▼"}
              </button>
              {emailConsentOpen && (
                <div
                  style={{
                    marginTop: 8,
                    marginLeft: 26,
                    padding: "12px 14px",
                    borderRadius: 8,
                    background: "var(--surface)",
                    fontSize: 13,
                    color: "var(--textSecondary)",
                    lineHeight: 1.7,
                  }}
                >
                  · 수집 항목: 이메일
                  <br />
                  · 수집 목적: AI 서비스 아이디어 진단 결과 발송
                  <br />
                  · 보유 기간: 서비스 오픈 후 1년
                  <br />· 위 동의를 거부할 권리가 있으나, 거부 시 결과지를 받을
                  수 없어요.
                </div>
              )}
            </div>

            {emailError && <p className="errorText">{emailError}</p>}

            <button
              className="btnPrimary"
              type="button"
              onClick={handleEmailSubmit}
              style={{ marginTop: 8 }}
            >
              결과 받기
            </button>
            <button
              className="btnGhost"
              type="button"
              onClick={() => {
                setPhase("survey");
                setEmailError(null);
                scrollSurveyToTop();
              }}
              style={{ marginTop: 8, display: "block", width: "100%", textAlign: "center" }}
            >
              ← 설문으로 돌아가기
            </button>
          </div>
        </div>
      </>
    );
  }

  // ── Email confirmation ──
  if (phase === "email_confirm") {
    return (
      <>
        {surveyToast}
        <div className="progressBar">
          <div className="progressFill" style={{ width: "100%" }} />
        </div>
        <div className="modalOverlay">
          <div className="modalContent">
            <h3
              style={{
                fontSize: 18,
                fontWeight: 700,
                margin: "0 0 16px",
                color: "var(--text)",
              }}
            >
              입력하신 이메일이 맞나요?
            </h3>
            <p
              style={{
                margin: "0 0 8px",
                fontSize: 16,
                fontWeight: 600,
                color: "var(--accent)",
                wordBreak: "break-all",
              }}
            >
              {email.trim()}
            </p>
            <p
              style={{
                margin: "0 0 24px",
                fontSize: 14,
                color: "var(--textSecondary)",
              }}
            >
              이 주소로 결과지가 발송돼요 📩
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button className="btnPrimary" type="button" onClick={onSubmit}>
                맞아요
              </button>
              <button
                className="btnGhost"
                type="button"
                onClick={() => {
                  setPhase("email_input");
                  scrollSurveyToTop();
                }}
                style={{ textAlign: "center" }}
              >
                수정할게요
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Loading screen with CSS animation ──
  if (phase === "loading") {
    return (
      <>
        {surveyToast}
        <div className="progressBar">
          <div className="progressFill" style={{ width: "100%" }} />
        </div>
        <div className="loadingWrap">
          <div className="loadingContent">
            <span style={{ fontSize: 64, display: "block", marginBottom: 12 }}>🤖</span>

            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 24 }}>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "var(--accent)",
                    display: "inline-block",
                    animation: `loadingPulse 1.2s ease-in-out infinite`,
                    animationDelay: `${i * 0.3}s`,
                  }}
                />
              ))}
            </div>

            <h2
              style={{
                fontSize: 20,
                fontWeight: 800,
                margin: "0 0 12px",
                color: "var(--text)",
                lineHeight: 1.45,
                textAlign: "center",
              }}
            >
              {loadingFailed || loadingSlowHint
                ? "네트워크 상태를 확인해주세요."
                : "분석에 시간이 걸리고 있어요 🙏"}
            </h2>
            <p
              style={{
                margin: "0 0 24px",
                fontSize: 15,
                color: "var(--textSecondary)",
                lineHeight: 1.6,
                textAlign: "center",
              }}
            >
              {loadingFailed || loadingSlowHint
                ? "새로고침 후 다시 시도해보세요."
                : "잠시만 기다려주세요..."}
            </p>

            <div
              style={{
                width: "100%",
                maxWidth: 320,
                height: 6,
                borderRadius: 3,
                background: "var(--border)",
                marginBottom: 28,
                overflow: "hidden",
                opacity: loadingFailed ? 0.35 : 1,
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

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                opacity: loadingFailed ? 0.4 : 1,
              }}
            >
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
                    transition: "opacity 0.6s ease, transform 0.6s ease",
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

            {(loadingSlowHint || loadingFailed) && (
              <button
                type="button"
                className="btnPrimary"
                style={{ marginTop: 24, minWidth: 200 }}
                disabled={submitting}
                onClick={() => onSubmit()}
              >
                다시 시도하기
              </button>
            )}
          </div>
        </div>
      </>
    );
  }

  // ── Survey screen ──
  if (phase === "survey") {
    const stickyQNum = getSurveyProgressMainNumber(progressLabelQuestionId);

    const showCustomInput =
      currentQ &&
      (() => {
        if (!currentQ.hasCustomOption || !currentQ.options) return false;
        const lastIdx = currentQ.options.length - 1;
        if (currentQ.type === "multi") {
          return currentAnswer?.selectedIndices?.includes(lastIdx) ?? false;
        }
        return currentAnswer?.selectedIndex === lastIdx;
      })();

    const prevSection =
      currentQ && safeStep > 0
        ? visibleQuestions[safeStep - 1].section
        : null;
    const showSection =
      !!currentQ && currentQ.section !== prevSection;

    const isLast = total > 0 && currentQ ? safeStep === total - 1 : false;

    return (
      <>
        {surveyToast}
        <div className="surveyProgressSticky">
          <div className="surveyProgressStickyRow">
            <span className="questionCounter">
              Q{stickyQNum}/{BASE_SURVEY_STEP_COUNT}
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
          <div className="surveyProgressTrack">
            <div
              className={`surveyProgressFill${showPulse ? " pulse" : ""}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {showMotivation && (
          <div className="motivationMessage">
            절반 왔어요 👏 거의 다 왔어요, 조금만 더요!
          </div>
        )}

        {q7EncourageOpen && (
          <div
            className="q7EncourageOverlay"
            role="presentation"
            onClick={finishQ7Encouragement}
          >
            <div
              className="q7EncourageModal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="q7-encourage-title"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="q7EncourageEmoji" aria-hidden>
                🎉
              </span>
              <h3 id="q7-encourage-title" className="q7EncourageTitle">
                거의 다 왔어요!
              </h3>
              <p className="q7EncourageSubtitle">
                조금만 더 하면 끝이에요
                <br />
                완료하시면 나에게 딱 맞는
                <br />
                AI 서비스 아이디어 5개를 드릴게요!
              </p>
              <button
                type="button"
                className="q7EncourageBtn"
                onClick={finishQ7Encouragement}
              >
                계속하기 →
              </button>
            </div>
          </div>
        )}

        <div className="surveyWrap surveyWrap--withStickyProgress">
          {!currentQ ? (
            <div className="questionBlock">
              <p style={{ color: "var(--textSecondary)", fontSize: 15 }}>
                문항을 불러오는 중이에요…
              </p>
            </div>
          ) : (
            <div className="questionBlock" key={animKey}>
              {showSection && (
                <div className="sectionTag">{currentQ.section}</div>
              )}

              {currentQ.showRecommendationBadge && (
                <div className="surveyRecommendationBadge">
                  ⭐ 이 답변이 추천 정확도를 높여요
                </div>
              )}

              <h2 className="questionTitle">
                {["Q6-1", "Q7-1", "Q9-1"].includes(currentQ.id)
                  ? currentQ.text
                  : `${currentQ.id}. ${currentQ.text}`}
              </h2>

              {currentQ.hint && (
                <p
                  style={{
                    margin: "4px 0 12px",
                    fontSize: 13,
                    color: "var(--textHint)",
                    lineHeight: 1.65,
                    whiteSpace: "pre-line",
                  }}
                >
                  {currentQ.hint}
                </p>
              )}

              {currentQ.type === "multi" && (
                <span className="multiBadge">
                  {MULTI_MAX_TWO_QUESTION_IDS.has(currentQ.id)
                    ? "최대 2개 선택"
                    : "복수 선택 가능"}
                </span>
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
                      ? (currentAnswer?.selectedIndices?.includes(idx) ??
                        false)
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
                    onClick={startEmailFlow}
                    disabled={submitting}
                  >
                    결과 보기
                  </button>
                )}

                <div className="navBar">
                  <div>
                    <button
                      className="btnGhost"
                      type="button"
                      onClick={goPrev}
                      disabled={submitting}
                    >
                      ← 이전
                    </button>
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
          )}
        </div>
      </>
    );
  }

  return null;
}
