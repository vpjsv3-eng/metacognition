export type ScaleValue = 1 | 2 | 3 | 4 | 5;
export type Domain =
  | "self_awareness"
  | "resource_management"
  | "monitoring_control"
  | "cognitive_flexibility";

export type McQuestion = {
  id: number;
  domain: Domain;
  text: string;
};

export const MC_5POINT_OPTIONS: Array<{ value: ScaleValue; label: string }> = [
  { value: 1, label: "전혀 아니다" },
  { value: 2, label: "대체로 아니다" },
  { value: 3, label: "보통이다" },
  { value: 4, label: "대체로 그렇다" },
  { value: 5, label: "매우 그렇다" },
];

export const METACOGNITION_QUESTIONS: McQuestion[] = [
  // 영역 1: 인지적 자기 객관화(Self-Awareness)
  { id: 1, domain: "self_awareness", text: "나는 새로운 일을 시작할 때, 내가 가진 지식과 부족한 지식을 명확히 구분할 수 있다." },
  { id: 2, domain: "self_awareness", text: "내가 내린 결정이 감정적인 판단인지, 논리적인 근거에 의한 것인지 즉각 인지한다." },
  { id: 3, domain: "self_awareness", text: "나는 내가 하루 중 가장 몰입이 잘 되는 시간과 그 이유를 정확히 알고 있다." },
  { id: 4, domain: "self_awareness", text: "타인의 비판을 들었을 때, 감정적 대응보다 내 로직의 오류를 먼저 점검한다." },
  { id: 5, domain: "self_awareness", text: "나는 내가 왜 특정 분야에서 성과를 내지 못하고 있는지 구체적인 원인 3가지를 댈 수 있다." },

  // 영역 2: AI 자원 활용 및 최적화(Resource Management)
  { id: 6, domain: "resource_management", text: "업무 중 막히는 부분이 생기면 검색보다 AI에게 질문하는 것이 먼저 습관화되어 있다." },
  { id: 7, domain: "resource_management", text: "나는 AI가 내놓은 답이 '틀릴 수 있다'는 전제하에 결과물을 검토한다." },
  { id: 8, domain: "resource_management", text: "단순 반복 업무를 할 때, \"이것을 어떻게 자동화할까?\"를 가장 먼저 고민한다." },
  { id: 9, domain: "resource_management", text: "나는 최신 AI 도구들을 내 업무 프로세스에 적용해 본 구체적인 경험이 있다." },
  { id: 10, domain: "resource_management", text: "기술적 한계(코딩 등)에 부딪혔을 때, 이를 해결해 줄 AI 프롬프트를 작성할 수 있다." },

  // 영역 3: 실행 모니터링 및 통제(Monitoring & Control)
  { id: 11, domain: "monitoring_control", text: "나는 목표를 세울 때 결과(Output)가 아닌 측정 가능한 수치(Input)로 계획한다." },
  { id: 12, domain: "monitoring_control", text: "업무 도중 딴짓(SNS 등)을 하고 있다는 사실을 1분 이내에 알아차리고 복귀한다." },
  { id: 13, domain: "monitoring_control", text: "계획이 틀어졌을 때 자책하기보다, 계획 자체가 잘못된 원인을 분석한다." },
  { id: 14, domain: "monitoring_control", text: "나는 '완벽하게 준비된 상태'보다 '미완성된 상태로 런칭'하는 것의 가치를 안다." },
  { id: 15, domain: "monitoring_control", text: "매일 내가 실행한 내용과 실제 성과 사이의 간극을 기록하고 피드백한다." },

  // 영역 4: 변화 대응 및 전략 수정(Cognitive Flexibility)
  { id: 16, domain: "cognitive_flexibility", text: "기존에 내가 맞다고 믿었던 방식이 효율적이지 않다는 증거가 나오면 즉시 버릴 수 있다." },
  { id: 17, domain: "cognitive_flexibility", text: "나는 새로운 기술이 등장했을 때 내 비즈니스 모델에 어떻게 이식할지 시나리오를 짠다." },
  { id: 18, domain: "cognitive_flexibility", text: "실패한 프로젝트에서 '무엇을 배웠는지'를 데이터로 정리하여 다음 계획에 반영한다." },
  { id: 19, domain: "cognitive_flexibility", text: "복잡한 문제를 만났을 때, 이를 작고 실행 가능한 단위로 쪼개는 능력이 있다." },
  { id: 20, domain: "cognitive_flexibility", text: "나는 1년 전의 나와 지금의 내가 '의사결정 방식'에서 어떻게 달라졌는지 설명할 수 있다." },
];

