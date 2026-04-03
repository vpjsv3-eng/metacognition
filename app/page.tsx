"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import type { Profile } from "./lib/types";

const JOB_OPTIONS = [
  "직장인",
  "프리랜서 / 1인 사업자",
  "학생",
  "취업 준비 / 경력 전환 중",
  "기타 (직접 입력)",
];

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

export default function LandingPage() {
  const router = useRouter();
  const [jobIndex, setJobIndex] = useState(-1);
  const [jobCustom, setJobCustom] = useState("");
  const [email, setEmail] = useState("");
  const [emailConfirm, setEmailConfirm] = useState("");
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const isCustomJob =
    jobIndex >= 0 && JOB_OPTIONS[jobIndex].startsWith("기타");

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const emailsMatch =
    email.trim().length > 0 &&
    emailConfirm.trim().length > 0 &&
    email.trim() === emailConfirm.trim();
  const emailMismatch =
    emailConfirm.trim().length > 0 && email.trim() !== emailConfirm.trim();

  const canSubmit = emailValid && emailsMatch && jobIndex >= 0;

  function toggleKeyword(kw: string) {
    setSelectedKeywords((prev) => {
      if (prev.includes(kw)) return prev.filter((k) => k !== kw);
      if (prev.length >= 3) return prev;
      return [...prev, kw];
    });
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (jobIndex < 0) {
      setError("직업을 선택해 주세요.");
      return;
    }

    const job = isCustomJob ? jobCustom.trim() : JOB_OPTIONS[jobIndex];
    if (isCustomJob && !job) {
      setError("직업을 직접 입력해 주세요.");
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !emailValid) {
      setError("이메일 주소를 정확히 입력해 주세요.");
      return;
    }

    if (!emailsMatch) {
      setError("이메일이 일치하지 않아요.");
      return;
    }

    const profile: Profile = { job, keywords: selectedKeywords, email: trimmedEmail };
    localStorage.setItem("mc_profile", JSON.stringify(profile));
    router.push("/survey");
  }

  return (
    <main className="container" style={{ paddingTop: 48 }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <span
          style={{
            display: "inline-block",
            padding: "6px 16px",
            borderRadius: 999,
            background: "var(--accentSoft)",
            color: "var(--accent)",
            fontSize: 13,
            fontWeight: 700,
            marginBottom: 20,
          }}
        >
          ✨ 유료 AI 컨설팅 50,000원 상당 · 지금 무료로 받아보세요
        </span>

        <h1
          style={{
            fontSize: 26,
            fontWeight: 800,
            margin: "0 0 10px",
            letterSpacing: -0.5,
            lineHeight: 1.4,
            color: "var(--text)",
          }}
        >
          나만의 AI 서비스 아이디어
          <br />
          무료로 찾아드려요
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: 15,
            lineHeight: 1.6,
            color: "var(--textSecondary)",
          }}
        >
          3분 진단으로 나에게 딱 맞는
          <br />
          AI 서비스 아이디어 5가지를 추천해드려요
        </p>
      </div>

      <div
        style={{
          background: "#E8FAF2",
          borderRadius: 12,
          padding: "14px 18px",
          marginBottom: 28,
          fontSize: 12,
          lineHeight: 1.7,
          color: "var(--text)",
        }}
      >
        📋 진단 결과지를 이메일로 보내드려요
        <br />
        결과지에는 맞춤 아이디어 5가지 + 시작 로드맵이 담겨 있어요
        <br />
        스팸함도 꼭 확인해주세요 🙂
      </div>

      <form onSubmit={onSubmit}>
        {/* 이메일 입력 */}
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "var(--text)",
              display: "block",
              marginBottom: 6,
            }}
          >
            결과지를 받을 이메일{" "}
            <span style={{ color: "var(--error)" }}>*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="result@example.com"
          />
        </div>

        {/* 이메일 확인 */}
        <div style={{ marginBottom: 28 }}>
          <label
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "var(--text)",
              display: "block",
              marginBottom: 6,
            }}
          >
            이메일 확인{" "}
            <span style={{ color: "var(--error)" }}>*</span>
          </label>
          <div style={{ position: "relative" }}>
            <input
              type="email"
              value={emailConfirm}
              onChange={(e) => setEmailConfirm(e.target.value)}
              placeholder="이메일을 한 번 더 입력해주세요"
              style={{
                borderColor: emailMismatch
                  ? "var(--error)"
                  : emailsMatch
                    ? "var(--accent)"
                    : undefined,
                paddingRight: 40,
              }}
            />
            {emailsMatch && (
              <span
                style={{
                  position: "absolute",
                  right: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--accent)",
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                ✓
              </span>
            )}
          </div>
          {emailMismatch && (
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 13,
                color: "var(--error)",
              }}
            >
              이메일이 일치하지 않아요
            </p>
          )}
        </div>

        {/* 직업 선택 */}
        <div style={{ marginBottom: 28 }}>
          <label
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "var(--text)",
              display: "block",
              marginBottom: 4,
            }}
          >
            현재 직업 또는 주요 활동{" "}
            <span style={{ color: "var(--error)" }}>*</span>
          </label>
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
                    onChange={() => setJobIndex(idx)}
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
        </div>

        {/* 키워드 선택 */}
        <div style={{ marginBottom: 28 }}>
          <label
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "var(--text)",
              display: "block",
              marginBottom: 4,
            }}
          >
            나를 가장 잘 설명하는 키워드{" "}
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--textHint)",
              }}
            >
              최대 3개 선택
            </span>
          </label>
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
        </div>

        {error && (
          <p className="errorText" style={{ marginBottom: 12 }}>
            {error}
          </p>
        )}

        <button
          className="btn"
          type="submit"
          disabled={!canSubmit}
          style={{
            fontSize: 16,
            opacity: canSubmit ? 1 : 0.45,
            cursor: canSubmit ? "pointer" : "not-allowed",
          }}
        >
          무료 진단 시작하기
        </button>
      </form>
    </main>
  );
}
