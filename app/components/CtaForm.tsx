"use client";

import { useState, useCallback } from "react";
import confetti from "canvas-confetti";

type Props = {
  surveyId?: string;
  onGreenBg?: boolean;
  source?: string;
  compact?: boolean;
};

function fireConfetti() {
  const colors = ["#00C471", "#ffffff", "#FFD700"];
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { x: 0.1, y: 0.9 },
    colors,
  });
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { x: 0.9, y: 0.9 },
    colors,
  });
}

export default function CtaForm({ surveyId, onGreenBg, source, compact }: Props) {
  const [name, setName] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [consent, setConsent] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);

  function handlePhoneChange(value: string) {
    const raw = value.replace(/[^0-9]/g, "").slice(0, 8);
    setPhoneDigits(raw);
  }

  const phoneFormatted =
    phoneDigits.length > 4
      ? `${phoneDigits.slice(0, 4)}-${phoneDigits.slice(4)}`
      : phoneDigits;

  const fullPhone = `010-${phoneFormatted}`;
  const isPhoneComplete = phoneDigits.length === 8;
  const canSubmit = name.trim() && isPhoneComplete && consent;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: fullPhone,
          surveyId: surveyId || undefined,
          source: source || "nadocoding_page",
          timestamp: new Date().toISOString(),
          privacy_consent: consent,
        }),
      });
      setSubmitted(true);
      fireConfetti();
    } catch {
      alert("신청 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }, [canSubmit, name, fullPhone, surveyId, source]);

  if (submitted) {
    return (
      <p
        style={{
          textAlign: "center",
          fontSize: compact ? 15 : 18,
          fontWeight: 700,
          padding: compact ? "16px 0" : "24px 0",
          lineHeight: 1.7,
          color: onGreenBg ? "white" : "var(--text)",
        }}
      >
        🎉 사전 신청 완료!
        <br />
        <span style={{ fontSize: compact ? 13 : 15, fontWeight: 500 }}>
          오픈하면 가장 먼저 연락드릴게요
        </span>
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: compact ? 8 : 12 }}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="이름을 입력해 주세요"
      />
      <div className="phoneInputWrapper">
        <span className="phonePrefix">010</span>
        <input
          type="tel"
          value={phoneFormatted}
          onChange={(e) => handlePhoneChange(e.target.value)}
          placeholder="0000-0000"
          inputMode="numeric"
        />
      </div>

      {/* 개인정보 동의 */}
      <div style={{ marginTop: compact ? 2 : 4 }}>
        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            fontSize: 13,
            color: onGreenBg ? "rgba(255,255,255,0.9)" : "var(--text)",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            style={{
              width: 16,
              height: 16,
              marginTop: 2,
              accentColor: onGreenBg ? "white" : "var(--accent)",
              flexShrink: 0,
            }}
          />
          <span>
            개인정보 수집 및 이용에 동의합니다.{" "}
            <span style={{ color: onGreenBg ? "#FFD700" : "var(--error)" }}>(필수)</span>
          </span>
        </label>
        <button
          type="button"
          onClick={() => setConsentOpen((v) => !v)}
          style={{
            background: "none",
            border: "none",
            color: onGreenBg ? "rgba(255,255,255,0.7)" : "var(--textSecondary)",
            fontSize: 12,
            cursor: "pointer",
            marginTop: 2,
            marginLeft: 24,
            padding: 0,
          }}
        >
          {consentOpen ? "내용 닫기 ▲" : "내용 보기 ▼"}
        </button>
        {consentOpen && (
          <div
            style={{
              marginTop: 6,
              marginLeft: 24,
              padding: "10px 12px",
              borderRadius: 8,
              background: onGreenBg ? "rgba(255,255,255,0.15)" : "var(--surface)",
              fontSize: 12,
              color: onGreenBg ? "rgba(255,255,255,0.85)" : "var(--textSecondary)",
              lineHeight: 1.7,
            }}
          >
            · 수집 항목: 이름, 휴대폰 번호, 이메일
            <br />
            · 수집 목적: 나도코딩 1기 오픈 알림 및 얼리버드 혜택 안내
            <br />
            · 보유 기간: 서비스 오픈 후 1년
            <br />· 위 동의를 거부할 권리가 있으나, 거부 시 오픈 알림 서비스를 받을 수 없어요.
          </div>
        )}
      </div>

      <button
        className={onGreenBg ? "btnWhite" : "btn"}
        type="button"
        onClick={handleSubmit}
        disabled={submitting || !canSubmit}
        style={compact ? { padding: "12px 16px", fontSize: 14 } : undefined}
      >
        {submitting ? "신청 중..." : compact ? "사전 무료 신청하기" : "무료로 사전 신청하기"}
      </button>
    </div>
  );
}
