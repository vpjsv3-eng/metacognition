"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { DiagnosisResult, ServiceIdea } from "../../lib/types";
import { getEarlybirdDDay } from "../../lib/earlybird";
import {
  safeLocalStorageGet,
  safeLocalStorageSet,
  safeLocalStorageRemove,
} from "../../lib/safeStorage";

const SURVEY_STORAGE_KEY = "survey_progress";
const EMAIL_SENT_KEY = "emailSent";
const EMAIL_SENDING_KEY = "emailSending";

function getEmailId(email?: string): string {
  if (!email) return "사용자";
  return email.split("@")[0] || "사용자";
}

function getTodayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${dd}`;
}

function IdeaWorkflowSection({ idea }: { idea: ServiceIdea }) {
  const raw = idea.tool_flow?.trim();
  const parts =
    raw && raw.includes("→")
      ? raw
          .split(/\s*→\s*/)
          .map((s) => s.trim())
          .filter(Boolean)
      : null;

  const rowContent =
    parts && parts.length >= 2 ? (
      <>
        {parts.map((part, i) => (
          <span
            key={i}
            style={{
              display: "inline-flex",
              alignItems: "center",
              flexWrap: "wrap",
              minWidth: 0,
            }}
          >
            {i > 0 ? (
              <span className="toolFlowArrowInline" aria-hidden>
                →
              </span>
            ) : null}
            <span className="toolFlowStepInline">{part}</span>
          </span>
        ))}
      </>
    ) : (
      <span className="toolFlowStepInline">{raw || idea.how_it_works}</span>
    );

  return (
    <div className="ideaDetail">
      <span className="ideaLabel">실제 작동 방식</span>
      <div className="toolFlowBox toolFlowBox--row">{rowContent}</div>
    </div>
  );
}

function AccordionIdea({
  idea,
  index,
}: {
  idea: ServiceIdea;
  index: number;
}) {
  const [open, setOpen] = useState(false);
  const rank = idea.rank ?? index + 2;

  return (
    <div className="ideaCard" style={{ padding: 0 }}>
      <div
        onClick={() => setOpen((v) => !v)}
        style={{ padding: "16px", cursor: "pointer" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "var(--accentSoft)",
              color: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            {rank}
          </span>
          <strong style={{ fontSize: 16, color: "var(--text)" }}>
            {idea.name}
          </strong>
        </div>
        <p
          style={{
            margin: "8px 0 0",
            color: "var(--textSecondary)",
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          {idea.oneline}
        </p>
      </div>

      {open && (
        <div className="accordionBody" style={{ padding: "0 16px 16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="ideaDetail">
              <span className="ideaLabel">이 아이디어를 추천하는 이유</span>
              <span>{idea.reason}</span>
            </div>
            <div className="ideaDetail">
              <span className="ideaLabel">핵심 기능</span>
              <span>{idea.core_feature}</span>
            </div>
            <IdeaWorkflowSection idea={idea} />
          </div>
          <div className="ideaMetaTags">
            <span className="ideaMetaTag">🎯 {idea.difficulty}</span>
            <span className="ideaMetaTag">⏱ {idea.period}</span>
            <span className="ideaMetaTag">🛠 {idea.tool}</span>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          padding: "12px 16px",
          border: "none",
          borderTop: "1px solid var(--border)",
          background: "var(--surface)",
          color: "var(--accent)",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
          borderRadius: "0 0 14px 14px",
          textAlign: "center",
        }}
      >
        {open ? "▲ 접기" : "▼ 자세히 보기"}
      </button>
    </div>
  );
}

export default function CompletePage() {
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [emailStatus, setEmailStatus] = useState<
    "idle" | "sending" | "sent" | "failed"
  >("idle");
  const router = useRouter();

  const [resendModalOpen, setResendModalOpen] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendDone, setResendDone] = useState(false);
  const [isRestoredResult, setIsRestoredResult] = useState(false);
  const [personaExpanded, setPersonaExpanded] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    function onScroll() {
      setShowScrollTop(window.scrollY > 300);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    safeLocalStorageRemove(SURVEY_STORAGE_KEY);

    const savedData = safeLocalStorageGet("diagnosis_result");
    if (!savedData) {
      alert("진단 데이터가 없습니다. 다시 시작하세요.");
      router.push("/");
      return;
    }
    try {
      const parsed = JSON.parse(savedData) as DiagnosisResult;
      if (!parsed?.ideas || !Array.isArray(parsed.ideas)) {
        throw new Error("결과 포맷 오류");
      }
      setResult(parsed);
      setResendEmail(parsed.profile?.email || "");

      const savedAt = safeLocalStorageGet("diagnosis_result_savedAt");
      if (savedAt) {
        setIsRestoredResult(true);
      }
      safeLocalStorageSet("diagnosis_result_savedAt", new Date().toISOString());
    } catch {
      alert("진단 데이터가 손상되었습니다. 다시 시작하세요.");
      safeLocalStorageRemove("diagnosis_result");
      safeLocalStorageRemove("diagnosis_result_savedAt");
      router.push("/");
    }
  }, []);

  useEffect(() => {
    if (!result) return;
    const emailAddr = result.profile?.email;
    if (!emailAddr) return;

    if (safeLocalStorageGet(EMAIL_SENT_KEY) === "true") {
      setEmailStatus("sent");
      return;
    }
    if (safeLocalStorageGet(EMAIL_SENDING_KEY) === "1") {
      setEmailStatus("sending");
      return;
    }
    safeLocalStorageSet(EMAIL_SENDING_KEY, "1");

    setEmailStatus("sending");

    fetch("/api/send-result", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: emailAddr,
        persona: result.persona,
        ideas: result.ideas,
        first_step: result.first_step,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        safeLocalStorageRemove(EMAIL_SENDING_KEY);
        if (data.ok && !data.skipped) {
          safeLocalStorageSet(EMAIL_SENT_KEY, "true");
          setEmailStatus("sent");
        } else if (data.skipped) {
          setEmailStatus("failed");
        } else {
          setEmailStatus("failed");
        }
      })
      .catch(() => {
        safeLocalStorageRemove(EMAIL_SENDING_KEY);
        setEmailStatus("failed");
      });
  }, [result]);

  async function handleResend() {
    if (!result || resending) return;
    const trimmed = resendEmail.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      alert("올바른 이메일을 입력해주세요.");
      return;
    }
    setResending(true);
    try {
      const res = await fetch("/api/send-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmed,
          persona: result.persona,
          ideas: result.ideas,
          first_step: result.first_step,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setResendDone(true);
        setTimeout(() => {
          setResendModalOpen(false);
          setResendDone(false);
        }, 2500);
      } else {
        alert("발송에 실패했어요. 잠시 후 다시 시도해주세요.");
      }
    } catch {
      alert("발송 중 오류가 발생했어요.");
    } finally {
      setResending(false);
    }
  }

  if (!result) {
    return (
      <main className="resultContainer result-container">
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <p style={{ fontSize: 16, color: "var(--textSecondary)" }}>
            AI가 아이디어를 분석하는 중...
          </p>
        </div>
      </main>
    );
  }

  const email = result.profile?.email || "";
  const emailId = getEmailId(email);
  const persona = result.persona;
  const firstStep = result.first_step;
  const firstIdea = result.ideas[0];
  const otherIdeas = result.ideas.slice(1);

  const dDay = getEarlybirdDDay();

  return (
    <main className="resultContainer resultWithBottomCta result-container">
      {isRestoredResult && (
        <div
          style={{
            textAlign: "center",
            padding: "10px 16px",
            marginBottom: 8,
            fontSize: 13,
            color: "var(--textSecondary)",
            background: "var(--surface)",
            borderRadius: 8,
          }}
        >
          이전 진단 결과예요 ·{" "}
          <button
            type="button"
            onClick={() => {
              safeLocalStorageRemove("diagnosis_result");
              safeLocalStorageRemove("diagnosis_result_savedAt");
              safeLocalStorageRemove(EMAIL_SENT_KEY);
              safeLocalStorageRemove(EMAIL_SENDING_KEY);
              router.push("/");
            }}
            style={{
              background: "none",
              border: "none",
              color: "var(--accent)",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              padding: 0,
            }}
          >
            새로 진단하기
          </button>
        </div>
      )}

      {/* ═══ 개인화 헤더 (개선) ═══ */}
      <div className="resultPageHeader" style={{ textAlign: "center", margin: "16px 0 28px" }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            margin: "0 0 8px",
            letterSpacing: -0.4,
            color: "var(--text)",
          }}
        >
          {emailId}님의 AI 서비스 아이디어 진단 결과
        </h1>
        <p
          style={{
            margin: "0 0 12px",
            fontSize: 14,
            color: "var(--textSecondary)",
          }}
        >
          {getTodayString()}
        </p>
        {emailStatus === "sending" && (
          <p style={{ margin: 0, fontSize: 13, color: "var(--textHint)" }}>
            📧 진단 결과를 이메일로 보내는 중...
          </p>
        )}
        {emailStatus === "sent" && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 16px",
              borderRadius: 999,
              background: "var(--accentSoft)",
            }}
          >
            <span style={{ color: "var(--accent)", fontSize: 16 }}>✅</span>
            <span style={{ fontSize: 13, color: "var(--accent)", fontWeight: 600 }}>
              {email}으로 결과지 발송 완료
            </span>
          </div>
        )}
        {emailStatus === "failed" && (
          <p style={{ margin: 0, fontSize: 13, color: "var(--textHint)" }}>
            이메일 발송에 실패했어요. 아래 &quot;결과지 다시 받기&quot; 버튼을 눌러주세요.
          </p>
        )}
      </div>

      {/* ═══ PART 1: 나의 성향 분석 (접기/펼치기) ═══ */}
      {persona && (
        <div className="personaCard personaCardCollapsed" style={{ marginBottom: 10, padding: "16px 18px 0" }}>
          <div
            style={{
              maxHeight: personaExpanded ? undefined : 120,
              overflow: personaExpanded ? "visible" : "hidden",
              position: "relative",
              paddingBottom: personaExpanded ? 12 : 0,
            }}
          >
            <h2
              style={{
                fontSize: 20,
                fontWeight: 800,
                margin: "0 0 8px",
                color: "var(--text)",
              }}
            >
              {persona.title}
            </h2>
            <p
              style={{
                margin: "0 0 10px",
                fontSize: 14,
                lineHeight: 1.7,
                color: "var(--text)",
              }}
            >
              {persona.summary}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span
                className="personaStrengthBadge"
                style={{
                  fontSize: 12,
                  padding: "4px 12px",
                  display: "inline-block",
                  whiteSpace: "normal",
                }}
              >
                💪 {persona.strength}
              </span>
              <span
                className="personaNeedsBadge"
                style={{
                  fontSize: 12,
                  padding: "4px 12px",
                  display: "inline-block",
                  whiteSpace: "normal",
                }}
              >
                🎯 {persona.painpoint}
              </span>
            </div>
            {!personaExpanded && <div className="personaCardFade" aria-hidden />}
          </div>
          <button
            type="button"
            onClick={() => setPersonaExpanded((v) => !v)}
            style={{
              width: "100%",
              marginTop: 4,
              marginBottom: 12,
              padding: "10px 0 14px",
              border: "none",
              background: "none",
              color: "var(--accent)",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              textAlign: "center",
            }}
          >
            {personaExpanded ? "접기 ▲" : "자세히 보기 ▼"}
          </button>
        </div>
      )}

      {/* ═══ PART 2: 맞춤 아이디어 ═══ */}
      <h2
        style={{
          fontSize: 20,
          fontWeight: 700,
          margin: "12px 0 12px",
          color: "var(--text)",
        }}
      >
        맞춤 아이디어 {result.ideas.length}가지
      </h2>

      {/* 1순위: 강조 카드 */}
      {firstIdea && (
        <div className="ideaCard firstIdeaCard" style={{ marginBottom: 14 }}>
          <div className="firstIdeaBanner">
            ✨ 가장 추천하는 아이디어
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span
              className="rankBadge"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              추천 1순위
            </span>
          </div>
          <strong style={{ fontSize: 18, color: "var(--text)", display: "block", marginBottom: 4 }}>
            {firstIdea.name}
          </strong>
          <p style={{ margin: "0 0 14px", color: "var(--textSecondary)", fontSize: 15, lineHeight: 1.5 }}>
            {firstIdea.oneline}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="ideaDetail firstIdeaReasonBg">
              <span className="ideaLabel">이 아이디어를 추천하는 이유</span>
              <span>{firstIdea.reason}</span>
            </div>
            <div className="ideaDetail">
              <span className="ideaLabel">핵심 기능</span>
              <span>{firstIdea.core_feature}</span>
            </div>
            <IdeaWorkflowSection idea={firstIdea} />
          </div>
          <div className="ideaMetaTags">
            <span className="ideaMetaTag">🎯 {firstIdea.difficulty}</span>
            <span className="ideaMetaTag">⏱ {firstIdea.period}</span>
            <span className="ideaMetaTag">🛠 {firstIdea.tool}</span>
          </div>
        </div>
      )}

      {/* 나도코딩 유입 섹션 */}
      <div className="promoSection">
        <h3
          style={{
            fontSize: 22,
            fontWeight: 800,
            margin: "0 0 20px",
            color: "var(--text)",
            lineHeight: 1.45,
            letterSpacing: -0.3,
          }}
        >
          추천받은 &lsquo;{firstIdea?.name || "AI 서비스"}&rsquo;
          <br />
          2주 안에 만들러 가기! 🚀
        </h3>
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: 12,
            padding: "16px 4px",
            marginBottom: 20,
            display: "flex",
            alignItems: "stretch",
          }}
        >
          {[
            { keyword: "2주", sub: "완성", color: "#00C471", key: "2w" },
            { keyword: "소수 정예", sub: "10명 한정", color: "#00C471", key: "10" },
            {
              keyword: "전액 환불",
              sub: (
                <>
                  배포 못하면
                  <br />
                  <span style={{ color: "#EF4444", fontWeight: 700 }}>100%</span> 환불 보장
                </>
              ),
              color: "#00C471",
              key: "refund",
            },
          ].map((cell, i) => (
            <div key={cell.key} style={{ display: "flex", flex: 1, minWidth: 0, alignItems: "stretch" }}>
              {i > 0 ? (
                <div
                  style={{
                    width: 1,
                    flexShrink: 0,
                    background: "#E5E7EB",
                    alignSelf: "stretch",
                  }}
                  aria-hidden
                />
              ) : null}
              <div
                style={{
                  flex: 1,
                  textAlign: "center",
                  padding: "4px 6px",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: cell.color,
                    letterSpacing: -0.4,
                    lineHeight: 1.25,
                  }}
                >
                  {cell.keyword}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#6B7280",
                    marginTop: 6,
                    lineHeight: 1.35,
                  }}
                >
                  {cell.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
        <p
          style={{
            margin: "0 0 16px",
            fontSize: 15,
            color: "var(--textSecondary)",
            lineHeight: 1.5,
          }}
        >
          어떻게 가능한지 궁금하다면?
        </p>
        <button
          className="btnPrimary"
          type="button"
          onClick={() => router.push("/nadocoding")}
          style={{
            width: "100%",
            fontSize: 16,
            fontWeight: 700,
            padding: "14px 16px",
          }}
        >
          나도코딩 1기에서 만들기 →
        </button>
        {firstStep && (
          <div className="encourageBox encourageBox--promo">
            <p title={firstStep.encouragement}>{firstStep.encouragement}</p>
          </div>
        )}
      </div>

      {/* 2~5순위: 아코디언 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {otherIdeas.map((idea, i) => (
          <AccordionIdea key={i} idea={idea} index={i} />
        ))}
      </div>

      {/* ═══ PART 3: 지금 당장 시작하는 법 ═══ */}
      {firstStep && (
        <div className="firstStepSection">
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              margin: "0 0 8px",
              color: "var(--text)",
            }}
          >
            ✅ 지금 바로 시작해보세요
          </h2>
          <p style={{ margin: "0 0 6px", fontSize: 15, color: "var(--text)" }}>
            가장 추천하는 아이디어:{" "}
            <strong style={{ color: "var(--accent)" }}>{firstStep.idea_name}</strong>
          </p>
          <p
            style={{
              margin: "0 0 20px",
              fontSize: 14,
              color: "var(--textSecondary)",
              lineHeight: 1.6,
            }}
          >
            {firstStep.reason}
          </p>
          <div className="stepsContainer">
            {firstStep.steps.map((step, i) => (
              <div key={i} className="stepItem">
                <span className="stepNum">{i + 1}</span>
                <span className="stepText">{step.replace(/^\d+단계:\s*/, "")}</span>
              </div>
            ))}
          </div>
          <button
            className="btnAccent"
            type="button"
            onClick={() => router.push("/nadocoding")}
            style={{
              width: "100%",
              marginTop: 20,
              fontSize: 16,
              fontWeight: 700,
              padding: "14px 20px",
            }}
          >
            나도 코딩 1기 자세히 보기
          </button>
        </div>
      )}

      {/* 하단 버튼 */}
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
          marginTop: 32,
        }}
      >
        <button
          className="btnAccent"
          type="button"
          onClick={() => router.push("/nadocoding")}
          style={{ fontSize: 15, padding: "14px 24px" }}
        >
          나도 코딩 1기 자세히 보기
        </button>
        <button
          className="btnSecondary"
          type="button"
          onClick={() => {
            setResendDone(false);
            setResendModalOpen(true);
          }}
          style={{ fontSize: 14 }}
        >
          결과지 다시 받기
        </button>
      </div>

      {/* 결과지 다시 받기 모달 */}
      <div
        className="resultFixedCtaBar"
        role="navigation"
        aria-label="얼리버드 신청"
      >
        <span className="resultFixedCtaBarLabel">
          🔥 얼리버드 마감 D-{dDay}
        </span>
        <button
          type="button"
          className="resultFixedCtaBarBtn"
          onClick={() => router.push("/nadocoding")}
        >
          올인원 나도코딩 1기 자세히 보기 →
        </button>
      </div>

      {showScrollTop && (
        <button
          type="button"
          className="scrollToTopBtn"
          aria-label="맨 위로"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          ↑
        </button>
      )}

      {resendModalOpen && (
        <div className="modalOverlay" onClick={() => !resending && setResendModalOpen(false)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            {resendDone ? (
              <>
                <span style={{ fontSize: 40, display: "block", marginBottom: 12 }}>✅</span>
                <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>
                  발송됐어요! 스팸함도 확인해주세요 📩
                </p>
              </>
            ) : (
              <>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 6px", color: "var(--text)" }}>
                  결과지를 다시 보내드릴게요
                </h3>
                <p style={{ margin: "0 0 20px", fontSize: 14, color: "var(--textSecondary)" }}>
                  이메일 주소를 확인하거나 수정해주세요
                </p>
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="result@example.com"
                  style={{ marginBottom: 14 }}
                />
                <button
                  className="btnPrimary"
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                >
                  {resending ? "발송 중..." : "다시 받기"}
                </button>
                <button
                  className="btnGhost"
                  type="button"
                  onClick={() => setResendModalOpen(false)}
                  style={{ marginTop: 8, display: "block", width: "100%", textAlign: "center" }}
                >
                  닫기
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
