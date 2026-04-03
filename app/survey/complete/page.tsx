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
  const [resending, setResending] = useState(false);
  const emailSentRef = useRef(false);
  const router = useRouter();

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
          console.log("[이메일 발송 완료]", email);
        } else if (data.skipped) {
          setEmailStatus("failed");
          console.warn("[이메일 발송 건너뜀] RESEND_API_KEY 미설정");
        } else {
          setEmailStatus("failed");
          console.error("[이메일 발송 실패]", data.error);
        }
      })
      .catch((e) => {
        setEmailStatus("failed");
        console.error("[이메일 발송 오류]", e);
      });
  }, [result]);

  async function resendEmail() {
    if (!result?.profile?.email || resending) return;
    setResending(true);
    try {
      const res = await fetch("/api/send-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: result.profile.email,
          persona: result.persona,
          ideas: result.ideas,
          first_step: result.first_step,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        alert("결과지가 이메일로 재발송되었어요!");
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
          <p
            style={{ margin: "8px 0 0", fontSize: 13, color: "var(--textHint)" }}
          >
            📧 진단 결과를 이메일로 보내는 중...
          </p>
        )}
        {emailStatus === "sent" && (
          <p
            style={{ margin: "8px 0 0", fontSize: 13, color: "var(--accent)" }}
          >
            ✅ 이메일 발송 완료!
          </p>
        )}
        {emailStatus === "failed" && (
          <p
            style={{ margin: "8px 0 0", fontSize: 13, color: "var(--textHint)" }}
          >
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
            <span className="personaTag">
              💪 강점: {persona.strength}
            </span>
            <span className="personaTag">
              🎯 핵심 니즈: {persona.painpoint}
            </span>
          </div>
        </div>
      )}

      {/* ═══ PART 2: 맞춤 아이디어 5가지 ═══ */}
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

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {result.ideas.map((idea, i) => {
          const isFirst = idea.rank === 1 || i === 0;
          return (
            <div
              key={i}
              className="ideaCard"
              style={
                isFirst
                  ? { borderColor: "var(--accent)", borderWidth: 2 }
                  : undefined
              }
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 6,
                }}
              >
                <span
                  className="rankBadge"
                  style={
                    isFirst
                      ? { background: "var(--accent)", color: "#fff" }
                      : undefined
                  }
                >
                  추천 {idea.rank ?? i + 1}순위
                </span>
              </div>

              <strong
                style={{
                  fontSize: 18,
                  color: "var(--text)",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                {idea.name}
              </strong>
              <p
                style={{
                  margin: "0 0 14px",
                  color: "var(--textSecondary)",
                  fontSize: 15,
                  lineHeight: 1.5,
                }}
              >
                {idea.oneline}
              </p>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 8 }}
              >
                <div className="ideaDetail">
                  <span className="ideaLabel">이 아이디어를 추천하는 이유</span>
                  <span>{idea.reason}</span>
                </div>
                <div className="ideaDetail">
                  <span className="ideaLabel">핵심 기능</span>
                  <span>{idea.core_feature}</span>
                </div>
                <div className="ideaDetail">
                  <span className="ideaLabel">실제 작동 방식</span>
                  <span>{idea.how_it_works}</span>
                </div>
              </div>

              <div className="ideaMetaTags">
                <span className="ideaMetaTag">🎯 {idea.difficulty}</span>
                <span className="ideaMetaTag">⏱ {idea.period}</span>
                <span className="ideaMetaTag">🛠 {idea.tool}</span>
              </div>
            </div>
          );
        })}
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
          <p
            style={{
              margin: "0 0 6px",
              fontSize: 15,
              color: "var(--text)",
            }}
          >
            가장 추천하는 아이디어:{" "}
            <strong style={{ color: "var(--accent)" }}>
              {firstStep.idea_name}
            </strong>
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

      {/* 하단 CTA 버튼 */}
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
          onClick={resendEmail}
          disabled={resending}
          style={{ fontSize: 14 }}
        >
          {resending ? "발송 중..." : "결과지 다시 받기"}
        </button>
      </div>

      {/* CTA 섹션 */}
      <div style={{ marginTop: 48 }}>
        <hr
          style={{
            border: "none",
            borderTop: "1px solid var(--border)",
            marginBottom: 32,
          }}
        />
        <div style={{ textAlign: "center" }}>
          <span className="earlybirdBadge">🎉 얼리버드 특가 진행 중</span>
          <h2
            style={{
              margin: "0 0 8px",
              fontSize: 22,
              fontWeight: 700,
              color: "var(--text)",
            }}
          >
            내 아이디어, 직접 만들어보고 싶다면?
          </h2>
          <p
            style={{
              margin: "0 0 4px",
              fontSize: 15,
              lineHeight: 1.6,
              color: "var(--textSecondary)",
            }}
          >
            코딩 몰라도 괜찮아요. 나도 코딩 1기에서
            <br />
            아이디어 발굴부터 배포까지 함께합니다.
          </p>

          <div style={{ margin: "20px 0" }}>
            <span className="priceOriginal">299,000원</span>
            <span className="priceEarlybird">99,000원</span>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: 13,
                color: "var(--textHint)",
              }}
            >
              지금 신청하신 분께만 적용되는 특별 할인가예요
            </p>
          </div>

          <div style={{ maxWidth: 400, margin: "0 auto" }}>
            <button
              className="btn"
              type="button"
              onClick={() => router.push("/nadocoding")}
              style={{ fontSize: 16 }}
            >
              나도 코딩 1기 얼리버드 신청하기
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
