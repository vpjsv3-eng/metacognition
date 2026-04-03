"use client";

import { useState } from "react";

type Props = {
  surveyId?: string;
};

export default function CtaForm({ surveyId }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!name.trim() || !phone.trim()) return;
    setSubmitting(true);
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
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
          lineHeight: 1.6,
        }}
      >
        신청 완료됐어요!
        <br />
        오픈하면 가장 먼저 연락드릴게요 😊
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
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="010-0000-0000"
      />
      <button
        className="btn"
        type="button"
        onClick={handleSubmit}
        disabled={submitting || !name.trim() || !phone.trim()}
      >
        {submitting ? "신청 중..." : "오픈 알림 신청하기"}
      </button>
    </div>
  );
}
