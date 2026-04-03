"use client";

import { useState, useCallback } from "react";
import confetti from "canvas-confetti";

type Props = {
  surveyId?: string;
  onGreenBg?: boolean;
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

export default function CtaForm({ surveyId, onGreenBg }: Props) {
  const [name, setName] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = useCallback(async () => {
    if (!name.trim() || !isPhoneComplete) return;
    setSubmitting(true);
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: fullPhone,
          surveyId: surveyId || undefined,
          timestamp: new Date().toISOString(),
        }),
      });
      setSubmitted(true);
      fireConfetti();
    } catch {
      alert("신청 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }, [name, isPhoneComplete, fullPhone, surveyId]);

  if (submitted) {
    return (
      <p
        style={{
          textAlign: "center",
          fontSize: 18,
          fontWeight: 700,
          padding: "24px 0",
          lineHeight: 1.7,
          color: onGreenBg ? "white" : "var(--text)",
        }}
      >
        🎉 사전 신청 완료!
        <br />
        <span style={{ fontSize: 15, fontWeight: 500 }}>
          오픈하면 가장 먼저 연락드릴게요
        </span>
        <br />
        <span style={{ fontSize: 14, fontWeight: 500, opacity: 0.85 }}>
          얼리버드 할인가 99,000원이 자동 적용돼요
        </span>
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="이름을 입력해주세요"
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
      <button
        className={onGreenBg ? "btnWhite" : "btn"}
        type="button"
        onClick={handleSubmit}
        disabled={submitting || !name.trim() || !isPhoneComplete}
      >
        {submitting ? "신청 중..." : "무료로 사전 신청하기"}
      </button>
    </div>
  );
}
