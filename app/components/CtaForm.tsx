"use client";

import { useState, useCallback, useEffect, useId, useRef } from "react";
import confetti from "canvas-confetti";
import { readUtmForApi } from "../lib/utm";
import { safeLocalStorageGet } from "../lib/safeStorage";

const USER_EMAIL_KEY = "userEmail";

type Props = {
  surveyId?: string;
  onGreenBg?: boolean;
  /** `result_page` | `nadocoding_page` — waitlist.source 저장용 */
  source?: string;
  compact?: boolean;
  /** 진단 결과 이메일 등 미리 채움 (선택 입력으로도 수정 가능) */
  defaultEmail?: string;
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

export default function CtaForm({
  surveyId,
  onGreenBg,
  source,
  compact,
  defaultEmail,
}: Props) {
  const [name, setName] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [emailField, setEmailField] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [consent, setConsent] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);
  const privacyAgreeId = useId();
  const phoneRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = safeLocalStorageGet(USER_EMAIL_KEY) || "";
    if (defaultEmail?.trim()) {
      setEmailField(defaultEmail.trim());
    } else if (saved) {
      setEmailField(saved);
    }
  }, [defaultEmail]);

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
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: fullPhone,
          email: emailField.trim() || undefined,
          surveyId: surveyId || undefined,
          source: source || "nadocoding_page",
          timestamp: new Date().toISOString(),
          privacy_consent: true,
          utm: readUtmForApi(),
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        saved?: Record<string, unknown> | null;
      };
      if (!res.ok || !json.ok) {
        alert(
          typeof json.error === "string"
            ? json.error
            : "신청에 실패했습니다. 잠시 후 다시 시도해 주세요.",
        );
        return;
      }
      if (process.env.NODE_ENV === "development" && json.saved) {
        console.log("waitlist 저장 성공 (클라이언트 확인)", json.saved);
      }
      setSubmitted(true);
      fireConfetti();
    } catch {
      alert("신청 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  }, [canSubmit, name, fullPhone, emailField, surveyId, source]);

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
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            phoneRef.current?.focus();
          }
        }}
        onBlur={() => {
          if (name.trim().length > 0) {
            phoneRef.current?.focus();
          }
        }}
      />
      <div className="phoneInputWrapper">
        <span className="phonePrefix">010</span>
        <input
          ref={phoneRef}
          type="tel"
          value={phoneFormatted}
          onChange={(e) => handlePhoneChange(e.target.value)}
          placeholder="0000-0000"
          inputMode="numeric"
        />
      </div>

      <input
        type="email"
        value={emailField}
        onChange={(e) => setEmailField(e.target.value)}
        placeholder="이메일 (선택, 알림 받을 주소)"
        autoComplete="email"
      />

      {/* 개인정보 동의 — 네이티브 checkbox */}
      <div style={{ marginTop: compact ? 2 : 4 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            id={privacyAgreeId}
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            style={{
              width: "20px",
              height: "20px",
              minWidth: "20px",
              accentColor: "#00C471",
              cursor: "pointer",
            }}
          />
          <label
            htmlFor={privacyAgreeId}
            style={{
              fontSize: "14px",
              color: onGreenBg ? "rgba(255,255,255,0.95)" : "#374151",
              cursor: "pointer",
            }}
          >
            개인정보 수집 및 이용에 동의합니다.
            <span style={{ color: "#EF4444" }}> (필수)</span>
          </label>
        </div>
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
            marginLeft: 28,
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
