import type { DiagnosisResult, DomainAverages } from "./types";

export type AiReport = {
  typeName: string;
  diagnosis: string;
  revenueModels: string[];
  actionTasks: string[];
};

type DomainKey = keyof DomainAverages;

const DOMAIN_LABEL: Record<DomainKey, string> = {
  self_awareness: "인지적 자기 객관화(영역1)",
  resource_management: "AI 자원 활용 및 최적화(영역2)",
  monitoring_control: "실행 모니터링 및 통제(영역3)",
  cognitive_flexibility: "변화 대응 및 전략 수정(영역4)",
};

const DOMAIN_TYPE_NAME: Record<DomainKey, string> = {
  self_awareness: "인지 해부형",
  resource_management: "AI 워크플로우 설계형",
  monitoring_control: "통제-피드백 루프형",
  cognitive_flexibility: "전략 재구성형",
};

function pickTopBottom(domainAverages: DomainAverages): { top: DomainKey; low: DomainKey } {
  const entries = Object.entries(domainAverages) as Array<[DomainKey, number]>;
  entries.sort((a, b) => b[1] - a[1]);
  return { top: entries[0][0], low: entries[entries.length - 1][0] };
}

function formatScore(n: number): string {
  return n.toFixed(2);
}

export function buildAiReportFromResult(result: DiagnosisResult): AiReport {
  const { top, low } = pickTopBottom(result.domainAverages);

  const topScore = result.domainAverages[top];
  const lowScore = result.domainAverages[low];

  const typeName = DOMAIN_TYPE_NAME[top];

  const diagnosis = [
    `종합 평균 ${formatScore(result.overallAverage)}.`,
    `당신의 강한 축은 "${DOMAIN_LABEL[top]}"이며 평균 ${formatScore(topScore)}로 확인됩니다.`,
    `하지만 취약 축인 "${DOMAIN_LABEL[low]}" 평균은 ${formatScore(lowScore)}로, 실행이 반복될수록 비용이 커질 가능성이 높습니다.`,
    `지금 필요한 건 더 많은 의지 표현이 아니라, 약한 영역을 "시스템"으로 고정하는 설계입니다.`,
  ].join(" ");

  const revenueModels: string[] = (() => {
    switch (top) {
      case "self_awareness":
        return [
          "진단 기반 코칭/교육: 개인 메타인지 모델링 + 맞춤 훈련 플랜",
          "작성 템플릿 판매: 자기 객관화 로그(원인-근거-검증) 워크시트",
        ];
      case "resource_management":
        return [
          "AI 워크플로 템플릿: 프롬프트-검증-자동화 패키지(업종별)",
          "AI 도입 컨설팅: 기술/업무 흐름을 프롬프트 체계로 재구성",
        ];
      case "monitoring_control":
        return [
          "습관/성과 대시보드 구독: 기록-피드백-교정 자동화",
          "실행 리드 시스템: 측정(Input) 기반 주간 리포트 자동 생성",
        ];
      case "cognitive_flexibility":
        return [
          "전략 수정 패키지: 실패 회고 → 실험 설계 → 다음 계획으로 연결",
          "변화 대응 워크숍: 새로운 기술/모델을 비즈니스 시나리오로 전환",
        ];
      default:
        return ["메타인지 진단 기반 코칭/템플릿 상품화", "습관-피드백 시스템 구독형 서비스"];
    }
  })();

  const actionTasks: string[] = (() => {
    switch (low) {
      case "self_awareness":
        return [
          "하루 5분: '내 결정의 근거'를 3문장으로 기록(감정 vs 논리 구분)",
          "주 1회: '성공/실패' 각각 1개씩 원인 가설 3개 작성 후 검증 계획 세우기",
          "비판을 들으면 즉시 10분: 로직 오류 체크리스트로 재평가",
        ];
      case "resource_management":
        return [
          "막힐 때마다 1회: 문제를 '질문 템플릿'으로 변환해 AI에 먼저 요청",
          "매주 1개 자동화 실험: 반복 작업 1개를 선정해 프롬프트/스크립트로 대체",
          "AI 답변은 반드시 검토: '틀릴 수 있다' 가정 하에 근거 점검 루틴 고정",
        ];
      case "monitoring_control":
        return [
          "매일 3회 기록: Input(측정 수치) 1개 + 진행 상태 1개 + 교정 1개",
          "딴짓 감지 규칙: 1분 이내 복귀 확인(알람/체크리스트 활용)",
          "주 1회 회고: 계획이 틀어진 원인을 '항목(가정/자원/환경)'별로 분류",
        ];
      case "cognitive_flexibility":
        return [
          "실험 설계: 큰 문제를 1~2주 단위의 작은 단위로 쪼개 실행",
          "실패 회고를 데이터로: '학습 항목 3개'를 다음 계획에 의무 반영",
          "1년 비교: 의사결정 방식 변화 5줄 요약 후 다음 선택 기준으로 전환",
        ];
      default:
        return ["약한 영역을 시스템화하는 루틴을 하루 1개부터 시작", "주간 피드백을 고정해 다음 실험으로 연결"];
    }
  })();

  return { typeName, diagnosis, revenueModels, actionTasks };
}

