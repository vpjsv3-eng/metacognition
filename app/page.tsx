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
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const isCustomJob =
    jobIndex >= 0 && JOB_OPTIONS[jobIndex].startsWith("기타");

  const canSubmit = jobIndex >= 0;

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

    const profile: Profile = { job, keywords: selectedKeywords };
    localStorage.setItem("mc_profile", JSON.stringify(profile));
    router.push("/survey");
  }

  return (
    <main className="container" style={{ paddingTop: 48 }}>
      {/* ── 진단 배지 ── */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <span
          style={{
            display: "inline-block",
            padding: "8px 18px",
            borderRadius: 999,
            background: "var(--accentSoft)",
            color: "var(--accent)",
            fontSize: 14,
            fontWeight: 700,
            marginBottom: 6,
          }}
        >
          🔬 AI 서비스 적합도 진단
        </span>
        <p
          style={{
            margin: "6px 0 0",
            fontSize: 13,
            color: "var(--textSecondary)",
          }}
        >
          총 13문항 · 약 3분 소요
        </p>
      </div>

      {/* ── 헤더 ── */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
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

      {/* ── 신뢰도 지표 ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 16,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        {[
          { icon: "📊", label: "GPT-4o 기반 분석" },
          { icon: "🎯", label: "맞춤 아이디어 5가지 제공" },
          { icon: "📩", label: "결과지 이메일 발송" },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              color: "var(--textSecondary)",
              fontWeight: 500,
            }}
          >
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {/* ── 안내 문구 ── */}
      <div
        style={{
          background: "var(--surface)",
          borderRadius: 12,
          padding: "14px 18px",
          marginBottom: 28,
          fontSize: 13,
          lineHeight: 1.7,
          color: "var(--textSecondary)",
          textAlign: "center",
        }}
      >
        이 진단은 실제 AI 서비스 기획 전문가의
        <br />
        분석 프레임워크를 기반으로 설계됐어요.
        <br />
        답변이 구체적일수록 더 정확한 아이디어를 받을 수 있어요.
      </div>

      <form onSubmit={onSubmit}>
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
