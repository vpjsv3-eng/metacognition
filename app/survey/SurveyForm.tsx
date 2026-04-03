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
import { SURVEY_QUESTIONS, type SurveyQuestion } from "../lib/questions";

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

const KEYWORD_OPTIONS = [
  "절약/재테크에 관심 많아요",
  "새로운 걸 배우는 걸 좋아해요",
  "부업이나 수익화에 관심 있어요",
  "반복적인 업무를 줄이고 싶어요",
  "글쓰기/콘텐츠 만들기를 즐겨요",
  "운동/건강 관리에 신경 써요",
  "육아나 가족 관련 정보를 많이 찾아봐요",
  "요리/인테리어 등 라이프스타일에 관심 많아요",
  "직무 역량을 키우고 싶어요",
  "창업/사업 아이디어를 구상 중이에요",
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

  const [email, setEmail] = useState("");
  const [emailConsent, setEmailConsent] = useState(false);
  const [emailConsentOpen, setEmailConsentOpen] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const pulseTriggered = useRef(false);
  const [showPulse, setShowPulse] = useState(false);
  const [showMotivation, setShowMotivation] = useState(false);
  const motivationTriggered = useRef(false);

  const [showResumeModal, setShowResumeModal] = useState(false);
  const resumeChecked = useRef(false);

  const isCustomJob = jobIndex >= 0 && JOB_OPTIONS[jobIndex].startsWith("기타");

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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }, [currentStep, answers, jobIndex, jobCustom, jobDetail, selectedKeywords, phase]);

  useEffect(() => {
    if (resumeChecked.current) return;
    resumeChecked.current = true;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
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
      const saved = localStorage.getItem(STORAGE_KEY);
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
    localStorage.removeItem(STORAGE_KEY);
    setShowResumeModal(false);
  }

  function getProfile(): Profile {
    const job = isCustomJob ? jobCustom.trim() : JOB_OPTIONS[jobIndex] || "";
    return { job, keywords: selectedKeywords };
  }

  function toggleKeyword(kw: string) {
    setSelectedKeywords((prev) => {
      if (prev.includes(kw)) return prev.filter((k) => k !== kw);
      if (prev.length >= 3) return prev;
      return [...prev, kw];
    });
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

  const progress =
    phase === "profile_job" || phase === "profile_keywords"
      ? 0
      : total > 0
        ? ((safeStep + 1) / total) * 100
        : 0;

  useEffect(() => {
    if (phase !== "survey") return;
    if (progress >= 50 && !pulseTriggered.current) {
      pulseTriggered.current = true;
      setShowPulse(true);
      const t = setTimeout(() => setShowPulse(false), 1000);
      return () => clearTimeout(t);
    }
  }, [progress, phase]);

  useEffect(() => {
    if (phase !== "survey") return;
    if (progress >= 50 && !motivationTriggered.current) {
      motivationTriggered.current = true;
      setShowMotivation(true);
      const t = setTimeout(() => setShowMotivation(false), 3000);
      return () => clearTimeout(t);
    }
  }, [progress, phase]);

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
    if (phase === "survey" && safeStep === 0) {
      setPhase("profile_keywords");
      return;
    }
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
      navigate(safeStep + 1);
      setTimeout(saveProgress, 0);
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

    if (safeStep < total - 1) {
      navigate(safeStep + 1);
      setTimeout(saveProgress, 0);
    }
  }

  function startEmailFlow() {
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
    const profile = getProfile();
    const updatedProfile = { ...profile, email: email.trim() };

    const payload: DiagnosisPayload = {
      profile: updatedProfile,
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

  // ── Resume modal ──
  if (showResumeModal) {
    return (
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
    );
  }

  // ── STEP 0-1: 직업 선택 ──
  if (phase === "profile_job") {
    const selectedJobName = jobIndex >= 0 ? JOB_OPTIONS[jobIndex] : "";
    const detailPlaceholder = JOB_DETAIL_PLACEHOLDERS[selectedJobName] || "";

    return (
      <>
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
                결과지를 받을 이메일을 입력해주세요
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
                onClick={() => setPhase("email_input")}
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

  // ── Loading screen with cat GIF ──
  if (phase === "loading") {
    return (
      <>
        <div className="progressBar">
          <div className="progressFill" style={{ width: "100%" }} />
        </div>
        <div className="loadingWrap">
          <div className="loadingContent">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif"
              alt="AI 분석 중"
              width={180}
              height={180}
              style={{ borderRadius: 16, marginBottom: 16, objectFit: "cover" }}
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                if (img.src.includes("3oEjI6SIIHBdRxXI40")) {
                  img.src = "https://media.giphy.com/media/l3nWhI38IWDofyDrW/giphy.gif";
                } else if (img.src.includes("l3nWhI38IWDofyDrW")) {
                  img.src = "https://media.giphy.com/media/RkDkBsVvWDkFPJAKPY/giphy.gif";
                }
              }}
            />
            <h2
              style={{
                fontSize: 20,
                fontWeight: 800,
                margin: "0 0 24px",
                color: "var(--text)",
              }}
            >
              AI가 답변을 분석하고 있어요 🤖
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
        <div
          className={`progressFill${showPulse ? " pulse" : ""}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {showMotivation && (
        <div className="motivationMessage">
          절반 왔어요 👏 거의 다 왔어요, 조금만 더요!
        </div>
      )}

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
                onClick={startEmailFlow}
                disabled={submitting}
              >
                결과 보기
              </button>
            )}

            <div className="navBar">
              <div>
                {(safeStep > 0 || phase === "survey") && (
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
