import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { DiagnosisResult } from "../lib/types";

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
    lineHeight: 1.5,
    fontFamily: "NotoSansKR",
  },
  title: {
    fontSize: 18,
    fontWeight: 800,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: "#9ca3af",
    marginBottom: 20,
  },
  ideaCard: {
    border: "1 solid #334155",
    borderRadius: 8,
    padding: 14,
    backgroundColor: "#111827",
    marginBottom: 12,
  },
  ideaNumber: {
    fontSize: 12,
    fontWeight: 800,
    color: "#a78bfa",
    marginBottom: 4,
  },
  ideaName: {
    fontSize: 14,
    fontWeight: 800,
    marginBottom: 6,
  },
  ideaDesc: {
    fontSize: 11,
    marginBottom: 8,
    color: "#d1d5db",
  },
  label: {
    fontSize: 9,
    color: "#93c5fd",
    fontWeight: 800,
    marginBottom: 2,
  },
  detail: {
    fontSize: 10,
    marginBottom: 6,
    color: "#d1d5db",
  },
});

export default function DiagnosisReportPdf({
  result,
}: {
  result: DiagnosisResult;
}) {
  ensureFontRegistered();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>AI 서비스 아이디어 진단서</Text>
        <Text style={styles.subtitle}>
          생성: {new Date().toLocaleString("ko-KR")} | 바이브 코딩 툴로 2주
          안에 만들 수 있는 서비스 추천
        </Text>

        {result.ideas.map((idea, i) => (
          <View key={i} style={styles.ideaCard}>
            <Text style={styles.ideaNumber}>아이디어 {i + 1}</Text>
            <Text style={styles.ideaName}>{idea.name}</Text>
            <Text style={styles.ideaDesc}>{idea.description}</Text>

            <Text style={styles.label}>이 사람에게 맞는 이유</Text>
            <Text style={styles.detail}>{idea.reason}</Text>

            <Text style={styles.label}>핵심 기능</Text>
            <Text style={styles.detail}>{idea.coreFeature}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}
