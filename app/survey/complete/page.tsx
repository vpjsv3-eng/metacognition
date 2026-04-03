"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PDFDownloadLink } from "@react-pdf/renderer";
import type { DiagnosisResult } from "../../lib/types";
import DiagnosisReportPdf from "../DiagnosisReportPdf";
import CtaForm from "../../components/CtaForm";

export default function CompletePage() {
  const [result, setResult] = useState<DiagnosisResult | null>(null);
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

  return (
    <main className="resultContainer">
      <div style={{ textAlign: "center", margin: "16px 0 28px" }}>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 800,
            margin: "0 0 8px",
            letterSpacing: -0.4,
          }}
        >
          추천 AI 서비스 아이디어
        </h1>
        <p className="muted" style={{ margin: 0, fontSize: 14 }}>
          바이브 코딩 툴(Bolt, Lovable 등)로 2주 안에 만들 수 있는 서비스예요.
        </p>
      </div>

      {/* 한 줄 코멘트 */}
      {result.comment && (
        <div className="resultComment">
          <p>{result.comment}</p>
        </div>
      )}

      {/* 아이디어 카드 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {result.ideas.map((idea, i) => (
          <div key={i} className="ideaCard">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <span className="ideaNum">{i + 1}</span>
              <strong style={{ fontSize: 17 }}>{idea.name}</strong>
            </div>

            <p
              style={{
                margin: "0 0 14px",
                color: "rgba(255,255,255,0.82)",
                fontSize: 15,
                lineHeight: 1.5,
              }}
            >
              {idea.description}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div className="ideaDetail">
                <span className="ideaLabel">이 사람에게 맞는 이유</span>
                <span>{idea.reason}</span>
              </div>
              <div className="ideaDetail">
                <span className="ideaLabel">핵심 기능</span>
                <span>{idea.coreFeature}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 버튼 그룹 */}
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
          marginTop: 28,
        }}
      >
        <PDFDownloadLink
          document={<DiagnosisReportPdf result={result} />}
          fileName="ai-idea-diagnosis.pdf"
        >
          {({ loading }) => (
            <span className="btnSecondary" style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? "PDF 생성 중..." : "진단서 다운로드"}
            </span>
          )}
        </PDFDownloadLink>

        <button
          className="btnAccent"
          type="button"
          onClick={() => router.push("/nadocoding")}
        >
          나도 코딩 1기 자세히 보기
        </button>

        <button
          className="btnSecondary"
          type="button"
          onClick={() => {
            localStorage.removeItem("mc_profile");
            localStorage.removeItem("diagnosis_result");
            router.push("/");
          }}
        >
          다시 하기
        </button>
      </div>

      {/* CTA 섹션 */}
      <div style={{ marginTop: 40 }}>
        <hr
          style={{
            border: "none",
            borderTop: "1px solid var(--border)",
            marginBottom: 32,
          }}
        />
        <div style={{ textAlign: "center" }}>
          <h2
            style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700 }}
          >
            내 아이디어, 직접 만들어보고 싶다면?
          </h2>
          <p
            className="muted"
            style={{ margin: "0 0 4px", fontSize: 15, lineHeight: 1.6 }}
          >
            코딩 몰라도 괜찮아요. 나도 코딩 1기에서
            <br />
            아이디어 발굴부터 배포까지 함께합니다.
          </p>
          <p style={{ margin: "10px 0 24px", fontSize: 15 }}>
            오픈 시 가장 먼저 알려드릴게요 🙌
          </p>
          <div style={{ maxWidth: 400, margin: "0 auto" }}>
            <CtaForm surveyId={result.surveyId} />
          </div>
        </div>
      </div>
    </main>
  );
}
