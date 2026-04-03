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
      <main className="container">
        <div className="card">분석 결과를 불러오는 중...</div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="card" style={{ padding: 26 }}>
        <div className="topBar" style={{ marginBottom: 14 }}>
          <div className="brand">
            <strong>AI 서비스 아이디어 진단 결과</strong>
            <span className="muted" style={{ fontSize: 13 }}>
              10문항 분석 기반 맞춤 추천
            </span>
          </div>
          <span className="pill">
            생성: {new Date().toLocaleString("ko-KR")}
          </span>
        </div>

        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 900,
              margin: "0 0 6px",
              letterSpacing: -0.4,
            }}
          >
            나에게 딱 맞는 AI 서비스 아이디어
          </h1>
          <p className="help" style={{ marginTop: 0 }}>
            코딩 없이, 바이브 코딩 툴(Bolt, Lovable 등)로 2주 안에 만들 수
            있는 서비스예요.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {result.ideas.map((idea, i) => (
            <div
              key={i}
              className="card ideaCard"
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                borderColor: "rgba(124, 92, 255, 0.25)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 10,
                }}
              >
                <span
                  className="pill"
                  style={{
                    background: "rgba(124, 92, 255, 0.25)",
                    borderColor: "rgba(124, 92, 255, 0.5)",
                    color: "#c4b5fd",
                    fontWeight: 800,
                    minWidth: 32,
                    justifyContent: "center",
                  }}
                >
                  {i + 1}
                </span>
                <strong style={{ fontSize: 18 }}>{idea.name}</strong>
              </div>

              <p
                style={{
                  margin: "0 0 12px",
                  color: "rgba(255,255,255,0.88)",
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

        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: 24,
          }}
        >
          <PDFDownloadLink
            document={<DiagnosisReportPdf result={result} />}
            fileName="ai-idea-diagnosis.pdf"
          >
            {({ loading }) => (
              <span
                className="btn"
                style={{
                  width: "auto",
                  padding: "12px 20px",
                  opacity: loading ? 0.85 : 1,
                }}
              >
                {loading ? "PDF 생성 중..." : "진단서 다운로드"}
              </span>
            )}
          </PDFDownloadLink>

          <button
            className="btn"
            type="button"
            onClick={() => router.push("/nadocoding")}
            style={{
              width: "auto",
              padding: "12px 20px",
              background:
                "linear-gradient(90deg, rgba(255, 140, 50, 0.9), rgba(255, 80, 120, 0.8))",
            }}
          >
            나도 코딩 1기 자세히 보기
          </button>

          <button
            className="btn"
            type="button"
            onClick={() => {
              localStorage.removeItem("mc_profile");
              localStorage.removeItem("diagnosis_result");
              router.push("/");
            }}
            style={{ width: "auto", padding: "12px 20px" }}
          >
            다시 하기
          </button>
        </div>
      </div>

      {/* CTA 섹션 */}
      <div style={{ margin: "32px 0 0" }}>
        <hr
          style={{
            border: "none",
            borderTop: "1px solid rgba(255,255,255,0.12)",
            marginBottom: 28,
          }}
        />
        <div className="card" style={{ padding: 28, textAlign: "center" }}>
          <h2 style={{ margin: "0 0 8px", fontSize: 22 }}>
            내 아이디어, 직접 만들어보고 싶다면?
          </h2>
          <p
            className="help"
            style={{ marginTop: 0, fontSize: 15, lineHeight: 1.6 }}
          >
            코딩 몰라도 괜찮아요. 나도 코딩 1기에서
            <br />
            아이디어 발굴부터 배포까지 함께합니다.
          </p>
          <p style={{ margin: "12px 0 20px", fontSize: 15 }}>
            오픈 시 가장 먼저 알려드릴게요 🙌
          </p>
          <div style={{ maxWidth: 400, margin: "0 auto" }}>
            <CtaForm />
          </div>
        </div>
      </div>
    </main>
  );
}
