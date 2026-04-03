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

    if (selectedKeywords.length === 0) {
      setError("키워드를 1개 이상 선택해 주세요.");
      return;
    }

    const profile: Profile = { job, keywords: selectedKeywords };
    localStorage.setItem("mc_profile", JSON.stringify(profile));
    router.push("/survey");
  }

  return (
    <main className="container" style={{ paddingTop: 60 }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            margin: "0 0 10px",
            letterSpacing: -0.5,
            lineHeight: 1.35,
          }}
        >
          나만의 AI 서비스,
          <br />
          뭘 만들면 좋을까요?
        </h1>
        <p
          className="muted"
          style={{ margin: "0 0 6px", fontSize: 15, lineHeight: 1.5 }}
        >
          10분 진단으로 나에게 딱 맞는 AI 서비스 아이디어를 찾아드려요
        </p>
        <span
          className="pill"
          style={{ marginTop: 10, display: "inline-flex" }}
        >
          약 2~3분 소요
        </span>
      </div>

      <form onSubmit={onSubmit}>
        {/* ① 직업 선택 */}
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
                  <span className="optionCheck">{selected ? "✓" : ""}</span>
                  <span className="optionText">{opt}</span>
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

        {/* ② 키워드 선택 */}
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
            나를 가장 잘 설명하는 키워드를 골라주세요{" "}
            <span className="muted" style={{ fontSize: 13, fontWeight: 400 }}>
              (복수 선택, 최대 3개)
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

        <button className="btn" type="submit" style={{ fontSize: 16 }}>
          무료 진단 시작하기
        </button>
      </form>
    </main>
  );
}
