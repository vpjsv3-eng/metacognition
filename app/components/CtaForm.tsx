"use client";

import { useState } from "react";

type Props = {
  surveyId?: string;
  onGreenBg?: boolean;
};

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

  async function handleSubmit() {
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
    } catch {
      alert("신청 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

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
        신청 완료! 오픈하면 가장 먼저 연락드릴게요 🎉
        <br />
        <span style={{ fontSize: 15, fontWeight: 500 }}>
          얼리버드 할인가 99,000원이 적용돼요
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
        {submitting ? "신청 중..." : "얼리버드 신청하기"}
      </button>
    </div>
  );
}
