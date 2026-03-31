"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PDFDownloadLink } from "@react-pdf/renderer";
import type { DiagnosisResult } from "../../lib/types";
import type { AiReport } from "../../lib/aiReport";
import { buildAiReportFromResult } from "../../lib/aiReport";
import DiagnosisReportPdf from "../DiagnosisReportPdf";

export default function CompletePage() {
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [aiReport, setAiReport] = useState<AiReport | null>(null);
  const router = useRouter();

  useEffect(() => {
    const savedData = localStorage.getItem("diagnosis_result");
    if (!savedData) {
      alert("진단 데이터가 없습니다. 다시 시작하세요.");
      router.push("/");
      return;
    }

    try {
      const parsed = JSON.parse(savedData) as any;
      // 요청사항: diagnosis_result에는 'result 전체'가 저장됨.
      // 그래도 이전 포맷이 남아있을 수 있어 방어적으로 처리합니다.
      const parsedResult: DiagnosisResult | null =
        parsed?.domainAverages && parsed?.overallAverage && parsed?.profile
          ? (parsed as DiagnosisResult)
          : parsed?.result
            ? (parsed.result as DiagnosisResult)
            : null;

      if (!parsedResult) throw new Error("진단 결과 포맷을 확인할 수 없습니다.");

      const report = parsedResult.aiReport ?? buildAiReportFromResult(parsedResult);
      setResult(parsedResult);
      setAiReport(report);
    } catch {
      alert("진단 데이터가 손상되었습니다. 다시 시작하세요.");
      router.push("/");
    }
  }, []);

  const domainPills = useMemo(() => {
    if (!result) return [];
    const d = result.domainAverages;
    return [
      { label: "영역1(인지적 자기 객관화)", value: d.self_awareness },
      { label: "영역2(AI 자원 활용/최적화)", value: d.resource_management },
      { label: "영역3(실행 모니터링/통제)", value: d.monitoring_control },
      { label: "영역4(변화 대응/전략 수정)", value: d.cognitive_flexibility },
    ];
  }, [result]);

  if (!result || !aiReport) {
    return (
      <main className="container">
        <div className="card">진단 리포트를 생성하는 중...</div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="card" style={{ padding: 26 }}>
        <div className="topBar" style={{ marginBottom: 14 }}>
          <div className="brand">
            <strong>전략 보고서</strong>
            <span className="muted" style={{ fontSize: 13 }}>
              메타인지 진단 결과 · 5점 척도 평균 기반
            </span>
          </div>
          <span className="pill">생성: {new Date().toLocaleString("ko-KR")}</span>
        </div>

        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div className="pill" style={{ marginBottom: 10 }}>
            퍼소나 유형
          </div>
          <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: -0.4, fontStyle: "italic" }}>
            {aiReport.typeName}
          </div>
          <div className="help" style={{ marginTop: 8 }}>
            종합 평균:{" "}
            <strong style={{ color: "var(--text)" }}>{result.overallAverage.toFixed(2)}</strong>
          </div>
        </div>

        <div className="row" style={{ marginBottom: 18 }}>
          {domainPills.map((p) => (
            <div key={p.label} className="pill" style={{ flex: "1 1 260px", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>{p.label}</span>
              <strong style={{ color: "var(--text)" }}>{p.value.toFixed(2)}</strong>
            </div>
          ))}
        </div>

        <div
          className="card"
          style={{
            background: "rgba(255, 255, 255, 0.04)",
            borderColor: "rgba(255, 110, 110, 0.35)",
            marginBottom: 18,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
            <span style={{ fontWeight: 900, color: "#ff9b9b" }}>●</span>
            <strong style={{ fontSize: 16 }}>냉혹한 진단</strong>
          </div>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.86)", lineHeight: 1.65 }}>
            {aiReport.diagnosis}
          </p>
        </div>

        <div className="row" style={{ marginBottom: 18 }}>
          <div className="card" style={{ flex: "1 1 360px", background: "rgba(0,0,0,0.18)" }}>
            <strong style={{ color: "#7db2ff" }}>추천 수익 모델</strong>
            <div className="help" style={{ marginTop: 6 }}>
              현재 강점 축을 상품화하는 방식으로 제안합니다.
            </div>
            <div style={{ marginTop: 12 }}>
              {aiReport.revenueModels.map((m, i) => (
                <div key={i} className="pill" style={{ marginBottom: 10, width: "100%", justifyContent: "flex-start" }}>
                  <span style={{ color: "var(--muted)", minWidth: 86 }}>모델 {String(i + 1).padStart(2, "0")}</span>
                  <span style={{ color: "var(--text)", fontWeight: 750 }}>{m}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ flex: "1 1 360px", background: "rgba(0,0,0,0.18)" }}>
            <strong style={{ color: "#7c5cff" }}>24시간 내 실행 과제</strong>
            <div className="help" style={{ marginTop: 6 }}>
              “생각”이 아니라 “실행”을 고정합니다.
            </div>
            <div style={{ marginTop: 12 }}>
              {aiReport.actionTasks.map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                  <span className="pill" style={{ width: 34, justifyContent: "center" }}>
                    {i + 1}
                  </span>
                  <div style={{ color: "rgba(255,255,255,0.88)", lineHeight: 1.55, fontWeight: 650 }}>{t}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <PDFDownloadLink
              document={<DiagnosisReportPdf aiReport={aiReport} result={result} />}
              fileName="diagnosis-report.pdf"
            >
              {({ loading }) => (
                <span className="btn" style={{ width: "auto", padding: "12px 18px", opacity: loading ? 0.85 : 1 }}>
                  {loading ? "진단서 생성 중..." : "진단서 다운로드"}
                </span>
              )}
            </PDFDownloadLink>
          </div>

          <button
            className="btn"
            type="button"
            onClick={() => {
              localStorage.removeItem("mc_profile");
              localStorage.removeItem("diagnosis_result");
              router.push("/");
            }}
            style={{ width: "auto", padding: "12px 18px" }}
          >
            다시 하기
          </button>
        </div>
      </div>
    </main>
  );
}