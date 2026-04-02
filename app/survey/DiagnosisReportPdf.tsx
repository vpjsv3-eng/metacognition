import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import type { AiReport } from "../lib/aiReport";
import type { DiagnosisResult } from "../lib/types";

// 한국어 폰트 등록: 브라우저 환경(PDFDownloadLink)에서만 실행되도록 lazily 처리
let _fontRegistered = false;
function ensureFontRegistered() {
  if (_fontRegistered || typeof window === "undefined") return;
  _fontRegistered = true;
  Font.register({
    family: "NotoSansKR",
    src: `${window.location.origin}/fonts/NotoSansKR.ttf`,
  });
}

const styles = StyleSheet.create({
  page: {
    padding: 32,
    backgroundColor: "#0b1220",
    color: "#e5e7eb",
    fontSize: 11,
    lineHeight: 1.4,
    fontFamily: "NotoSansKR",
  },
  title: {
    fontSize: 18,
    fontWeight: 800,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 11,
    color: "#9ca3af",
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 800,
    marginTop: 18,
    marginBottom: 8,
  },
  card: {
    border: "1 solid #334155",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#111827",
  },
  label: {
    color: "#93c5fd",
    fontWeight: 800,
    marginBottom: 4,
  },
  bodyText: {
    marginBottom: 8,
  },
  list: {
    marginTop: 6,
    gap: 6,
  },
  listItem: {
    flexDirection: "row",
    gap: 8,
  },
  bullet: {
    width: 12,
    color: "#60a5fa",
  },
  valueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 6,
  },
});

function format(n: number) {
  return n.toFixed(2);
}

export default function DiagnosisReportPdf({
  aiReport,
  result,
}: {
  aiReport: AiReport;
  result: DiagnosisResult;
}) {
  ensureFontRegistered();
  const d = result.domainAverages;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>메타인지 진단서(전략 보고서)</Text>
        <Text style={styles.subtitle}>생성 시각: {new Date().toLocaleString("ko-KR")}</Text>

        <View style={styles.card}>
          <Text style={styles.label}>유형 이름</Text>
          <Text style={{ fontSize: 14, fontWeight: 900, marginBottom: 6 }}>{aiReport.typeName}</Text>

          <View style={{ marginTop: 10 }}>
            <View style={styles.valueRow}>
              <Text>전체 평균</Text>
              <Text>{format(result.overallAverage)}</Text>
            </View>
            <View style={styles.valueRow}>
              <Text>영역1(인지적 자기 객관화)</Text>
              <Text>{format(d.self_awareness)}</Text>
            </View>
            <View style={styles.valueRow}>
              <Text>영역2(AI 자원 활용/최적화)</Text>
              <Text>{format(d.resource_management)}</Text>
            </View>
            <View style={styles.valueRow}>
              <Text>영역3(실행 모니터링/통제)</Text>
              <Text>{format(d.monitoring_control)}</Text>
            </View>
            <View style={styles.valueRow}>
              <Text>영역4(변화 대응/전략 수정)</Text>
              <Text>{format(d.cognitive_flexibility)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>냉혹한 진단</Text>
        <View style={styles.card}>
          <Text style={styles.bodyText}>{aiReport.diagnosis}</Text>
        </View>

        <Text style={styles.sectionTitle}>수익 모델</Text>
        <View style={styles.card}>
          <View style={styles.list}>
            {aiReport.revenueModels.map((m, i) => (
              <View key={i} style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text>{m}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.sectionTitle}>실행 과제</Text>
        <View style={styles.card}>
          <View style={styles.list}>
            {aiReport.actionTasks.map((t, i) => (
              <View key={i} style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text>{t}</Text>
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
}

