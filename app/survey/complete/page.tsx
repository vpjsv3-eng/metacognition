"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { DiagnosisResult } from "../../lib/types";

function getDisplayName(email?: string): string {
  if (!email) return "회원";
  return email.split("@")[0] || "회원";
}

function getTodayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${dd}`;
}

export default function CompletePage() {
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [emailStatus, setEmailStatus] = useState<
    "idle" | "sending" | "sent" | "failed"
  >("idle");
  const emailSentRef = useRef(false);
  const router = useRouter();

  const [resendModalOpen, setResendModalOpen] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendDone, setResendDone] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem("diagnosis_result");
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
    } catch {
      alert("진단 데이터가 손상되었습니다. 다시 시작하세요.");
      localStorage.removeItem("diagnosis_result");
      router.push("/");
    }
  }, []);

  useEffect(() => {
    if (!result || emailSentRef.current) return;
    const email = result.profile?.email;
    if (!email) return;

    emailSentRef.current = true;
    setEmailStatus("sending");

    fetch("/api/send-result", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        persona: result.persona,
        ideas: result.ideas,
        first_step: result.first_step,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && !data.skipped) {
          setEmailStatus("sent");
        } else if (data.skipped) {
          setEmailStatus("failed");
        } else {
          setEmailStatus("failed");
        }
      })
      .catch(() => {
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
      <main className="resultContainer">
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <p style={{ fontSize: 16, color: "var(--textSecondary)" }}>
            AI가 아이디어를 분석하는 중...
          </p>
        </div>
      </main>
    );
  }

  const displayName = getDisplayName(result.profile?.email);
  const email = result.profile?.email || "";
  const persona = result.persona;
  const firstStep = result.first_step;
  const firstIdea = result.ideas[0];
  const otherIdeas = result.ideas.slice(1);

  return (
    <main className="resultContainer">
      {/* 개인화 헤더 */}
      <div style={{ textAlign: "center", margin: "16px 0 28px" }}>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 800,
            margin: "0 0 6px",
            letterSpacing: -0.4,
            color: "var(--text)",
          }}
        >
          📋 {displayName}님의 AI 서비스 아이디어 진단 결과
        </h1>
        <p
          style={{
            margin: "0 0 8px",
            fontSize: 14,
            color: "var(--textSecondary)",
          }}
        >
          분석 완료 · {getTodayString()}
        </p>
        {email && (
          <p style={{ margin: 0, fontSize: 13, color: "var(--textHint)" }}>
            결과지가 {email} 으로 발송됐어요 📩
          </p>
        )}
        {emailStatus === "sending" && (
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--textHint)" }}>
            📧 진단 결과를 이메일로 보내는 중...
          </p>
        )}
        {emailStatus === "sent" && (
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--accent)" }}>
            ✅ 이메일 발송 완료!
          </p>
        )}
        {emailStatus === "failed" && (
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--textHint)" }}>
            이메일 발송에 실패했어요. 아래 &quot;결과지 다시 받기&quot; 버튼을 눌러주세요.
          </p>
        )}
      </div>

      {/* ═══ PART 1: 나의 성향 분석 ═══ */}
      {persona && (
        <div className="personaCard">
          <h2 className="personaTitle">{persona.title}</h2>
          <p className="personaSummary">{persona.summary}</p>
          <div className="personaTags">
            <span className="personaTag">💪 강점: {persona.strength}</span>
            <span className="personaTag">🎯 핵심 니즈: {persona.painpoint}</span>
          </div>
        </div>
      )}

      {/* ═══ PART 2: 맞춤 아이디어 ═══ */}
      <h2
        style={{
          fontSize: 20,
          fontWeight: 700,
          margin: "32px 0 16px",
          color: "var(--text)",
        }}
      >
        맞춤 아이디어 {result.ideas.length}가지
      </h2>

      {/* 1순위: 전체 공개 */}
      {firstIdea && (
        <div
          className="ideaCard"
          style={{ borderColor: "var(--accent)", borderWidth: 2, marginBottom: 14 }}
        >
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
            <div className="ideaDetail">
              <span className="ideaLabel">이 아이디어를 추천하는 이유</span>
              <span>{firstIdea.reason}</span>
            </div>
            <div className="ideaDetail">
              <span className="ideaLabel">핵심 기능</span>
              <span>{firstIdea.core_feature}</span>
            </div>
            <div className="ideaDetail">
              <span className="ideaLabel">실제 작동 방식</span>
              <span>{firstIdea.how_it_works}</span>
            </div>
          </div>
          <div className="ideaMetaTags">
            <span className="ideaMetaTag">🎯 {firstIdea.difficulty}</span>
            <span className="ideaMetaTag">⏱ {firstIdea.period}</span>
            <span className="ideaMetaTag">🛠 {firstIdea.tool}</span>
          </div>
        </div>
      )}

      {/* ═══ 나도코딩 유입 섹션 ═══ */}
      <div className="promoSection">
        <h3
          style={{
            fontSize: 18,
            fontWeight: 700,
            margin: "0 0 8px",
            color: "var(--text)",
          }}
        >
          이 아이디어, 직접 만들어볼 수 있어요
        </h3>
        <p
          style={{
            margin: "0 0 20px",
            fontSize: 14,
            lineHeight: 1.7,
            color: "var(--textSecondary)",
          }}
        >
          코딩 몰라도 괜찮아요.
          <br />
          2주 안에 기획 → 구현 → 배포까지
          <br />
          나도 코딩 1기에서 함께해요.
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            alignItems: "center",
            marginBottom: 20,
            fontSize: 14,
            color: "var(--text)",
          }}
        >
          <span>✅ 코딩 지식 0이어도 OK</span>
          <span>✅ 2주 안에 실제 배포까지</span>
          <span>✅ 선착순 10명 · 얼리버드 신청 중</span>
        </div>
        <button
          className="btn"
          type="button"
          onClick={() => router.push("/nadocoding")}
          style={{ fontSize: 16, background: "var(--accent)" }}
        >
          나도 코딩 1기 자세히 보기 →
        </button>
      </div>

      {/* 2~5순위: 블러 처리 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {otherIdeas.map((idea, i) => (
          <div key={i} className="ideaCard ideaBlurred">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span className="rankBadge">추천 {idea.rank ?? i + 2}순위</span>
            </div>
            <strong style={{ fontSize: 18, color: "var(--text)", display: "block", marginBottom: 4 }}>
              {idea.name}
            </strong>
            <p style={{ margin: "0 0 14px", color: "var(--textSecondary)", fontSize: 15, lineHeight: 1.5 }}>
              {idea.oneline}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div className="ideaDetail">
                <span className="ideaLabel">이 아이디어를 추천하는 이유</span>
                <span>{idea.reason}</span>
              </div>
              <div className="ideaDetail">
                <span className="ideaLabel">핵심 기능</span>
                <span>{idea.core_feature}</span>
              </div>
            </div>
            <div className="ideaMetaTags">
              <span className="ideaMetaTag">🎯 {idea.difficulty}</span>
              <span className="ideaMetaTag">⏱ {idea.period}</span>
              <span className="ideaMetaTag">🛠 {idea.tool}</span>
            </div>

            <div className="ideaLockedOverlay">
              <p style={{ margin: "0 0 8px", fontSize: 13, color: "var(--textSecondary)" }}>
                🔒 나도 코딩 1기에서 이 아이디어로 직접 만들어보세요
              </p>
              <button
                className="btnAccent"
                type="button"
                onClick={() => router.push("/nadocoding")}
                style={{ fontSize: 13, padding: "8px 16px" }}
              >
                자세히 보기
              </button>
            </div>
          </div>
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
          <div className="encourageBox">
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6 }}>
              {firstStep.encouragement}
            </p>
          </div>
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
