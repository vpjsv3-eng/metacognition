export type QuestionType = "single" | "multi" | "branch" | "text";

/** 진행률 바·Qn/13 표시용 — 꼬리질문(Q6-1 등)은 부모 번호로만 센다 */
export const BASE_SURVEY_STEP_COUNT = 13;

export function getSurveyProgressMainNumber(questionId: string): number {
  const followMap: Record<string, number> = {
    "Q6-1": 6,
    "Q7-1": 7,
    "Q9-1": 9,
    "Q10-1": 10,
  };
  if (followMap[questionId] !== undefined) return followMap[questionId]!;
  const m = questionId.match(/^Q(\d+)/);
  return m ? parseInt(m[1], 10) : 1;
}

export type MultiFollowUpRule = {
  /** 이 인덱스 중 하나라도 선택되면 꼬리질문 후보 */
  requireAnyOf: number[];
  /** 이 인덱스가 하나라도 있으면 꼬리질문 숨김 (예: 딱히 없어요, 기타) */
  skipIfAnyOf: number[];
};

export type SurveyQuestion = {
  id: string;
  section: string;
  text: string;
  type: QuestionType;
  options?: string[];
  hasCustomOption?: boolean;
  placeholder?: string;
  skippable?: boolean;
  branchTriggerIndex?: number;
  branchTriggerIndices?: number[];
  subQuestionId?: string;
  /** multi 문항에서 꼬리질문 노출 조건 */
  multiFollowUp?: MultiFollowUpRule;
  /** 선택 시 다른 선택을 모두 해제하는 인덱스(예: 딱히 없어요) */
  exclusiveAloneIndices?: number[];
  parentQuestionId?: string;
  parentTriggerIndex?: number;
  hint?: string;
  /** Q6/Q7/Q9 상단 추천 정확도 배지 */
  showRecommendationBadge?: boolean;
};

export const SURVEY_QUESTIONS: SurveyQuestion[] = [
  // ── 일상 행동 파악 ──
  {
    id: "Q1",
    section: "일상 행동 파악",
    text: "요즘 유튜브에서 가장 자주 보는 영상 종류가 뭐예요?",
    type: "multi",
    options: [
      "재테크 / 절약 / 부업",
      "자기계발 / 공부 / 자격증",
      "요리 / 운동 / 취미",
      "직무 관련 (마케팅, 디자인, 개발 등)",
      "육아 / 라이프스타일",
      "AI / 테크 트렌드",
      "기타 (직접 입력)",
    ],
    hasCustomOption: true,
  },
  {
    id: "Q2",
    section: "일상 행동 파악",
    text: "평소에 가장 많이 쓰는 앱 카테고리가 뭐예요?",
    type: "multi",
    options: [
      "생산성 / 업무 도구 (노션, 슬랙 등)",
      "금융 / 재테크 (토스, 뱅크샐러드 등)",
      "건강 / 운동 (캐시워크, 눔 등)",
      "쇼핑 / 커머스",
      "콘텐츠 / 엔터테인먼트 (유튜브, 넷플릭스 등)",
      "커뮤니티 / SNS",
      "AI 툴 (ChatGPT, Claude 등)",
      "기타 (직접 입력)",
    ],
    hasCustomOption: true,
  },
  {
    id: "Q3",
    section: "일상 행동 파악",
    text: "퇴근 후나 주말에 가장 많이 하는 게 뭐예요?",
    type: "multi",
    options: [
      "유튜브 / 넷플릭스 / 릴스 보기",
      "운동 또는 산책",
      "공부 / 자격증 준비",
      "부업 또는 사이드 프로젝트",
      "육아 / 살림",
      "기타 (직접 입력)",
    ],
    hasCustomOption: true,
  },
  {
    id: "Q4",
    section: "일상 행동 파악",
    text: "주변 사람들이 나한테 자주 물어보는 게 있다면요?",
    type: "multi",
    options: [
      "맛집 / 여행 / 쇼핑 추천",
      "엑셀, 문서 작성, 업무 관련",
      "재테크 / 절약 / 투자 팁",
      "운동 / 건강 관련",
      "딱히 없어요",
      "기타 (직접 입력)",
    ],
    hasCustomOption: true,
  },

  // ── 서비스 방향 ──
  {
    id: "Q5",
    section: "서비스 방향",
    text: "만약 AI 서비스를 만든다면 누구를 위한 서비스면 좋겠어요?",
    type: "single",
    options: [
      "나 자신 (내 문제 해결)",
      "직장 동료 / 같은 직군",
      "가족 / 지인",
      "불특정 다수 (일반 소비자)",
      "아직 모르겠어요",
    ],
  },

  // ── 불편함 발굴 ──
  {
    id: "Q6",
    section: "불편함 발굴",
    text: "하루 중 가장 반복적으로 하는 일이 뭔가요?",
    type: "multi",
    options: [
      "이메일 / 메시지 확인 및 답장",
      "보고서 / 문서 작성",
      "일정 / 할 일 정리",
      "SNS 콘텐츠 올리기",
      "가계부 / 지출 기록",
      "식단 / 운동 기록",
      "딱히 없어요",
      "기타 (직접 입력)",
    ],
    hasCustomOption: true,
    subQuestionId: "Q6-1",
    multiFollowUp: {
      requireAnyOf: [0, 1, 2, 3, 4, 5],
      skipIfAnyOf: [6, 7],
    },
    exclusiveAloneIndices: [6],
    showRecommendationBadge: true,
  },
  {
    id: "Q6-1",
    section: "불편함 발굴",
    text: "어떤 상황에서 주로 하시나요?\n대략적으로라도 적어줘도 괜찮아요 😊",
    type: "text",
    placeholder:
      "예: 퇴근 후 집에서 매일 가계부 적어요,\n매주 월요일 팀 보고서 써요",
    skippable: true,
  },
  {
    id: "Q7",
    section: "불편함 발굴",
    text: "AI가 내 일상에서 어떤 불편함을 해결해줬으면 좋겠어요?",
    type: "multi",
    options: [
      "출퇴근 / 이동할 때",
      "요리하거나 장볼 때",
      "업무 보고서 / 이메일 쓸 때",
      "건강 / 운동 관리할 때",
      "돈 관리할 때",
      "육아 / 살림할 때",
      "딱히 없어요",
      "기타 (직접 입력)",
    ],
    hasCustomOption: true,
    subQuestionId: "Q7-1",
    multiFollowUp: {
      requireAnyOf: [0, 1, 2, 3, 4, 5],
      skipIfAnyOf: [6, 7],
    },
    exclusiveAloneIndices: [6],
    showRecommendationBadge: true,
  },
  {
    id: "Q7-1",
    section: "불편함 발굴",
    text: "구체적으로 어떤 상황인지 살짝만 알려줘도 괜찮아요 😊",
    type: "text",
    placeholder:
      "예: 장 볼 때 뭘 사야 할지 항상 까먹어요,\n건강 관리를 어디서 시작해야 할지 모르겠어요",
    skippable: true,
  },
  {
    id: "Q8",
    section: "불편함 발굴",
    text: "주변 사람들이 요즘 가장 많이 하는 불평이나 걱정이 뭔가요?",
    type: "multi",
    options: [
      "시간이 너무 없어요",
      "돈 관리, 지출 파악이 어려워요",
      "정보가 너무 많아서 뭘 선택해야 할지 모르겠어요",
      "반복적인 일이 너무 많아요",
      "AI 흐름을 따라가기가 너무 벅차요",
      "새로운 기술을 배워야 할 것 같은데 어디서 시작해야 할지 모르겠어요",
      "딱히 없어요",
      "기타 (직접 입력)",
    ],
    hasCustomOption: true,
  },
  {
    id: "Q9",
    section: "불편함 발굴",
    text: "만약 AI가 내 생활을 도와준다면 어떤 걸 해줬으면 좋겠어요?",
    type: "multi",
    options: [
      "매일 반복하는 업무 자동으로 처리",
      "내가 관심 있는 정보만 모아서 요약",
      "건강 / 식단 / 운동 맞춤 관리",
      "돈 관리 및 절약 팁 제공",
      "글쓰기 / 콘텐츠 제작 도움",
      "육아 / 살림 관련 도움",
      "딱히 없어요",
      "기타 (직접 입력)",
    ],
    hasCustomOption: true,
    subQuestionId: "Q9-1",
    multiFollowUp: {
      requireAnyOf: [0, 1, 2, 3, 4, 5],
      skipIfAnyOf: [6, 7],
    },
    exclusiveAloneIndices: [6],
    showRecommendationBadge: true,
  },
  {
    id: "Q9-1",
    section: "불편함 발굴",
    text: "어떤 상황에서 도움이 됐으면 하는지 조금만 더 알려줘도 괜찮아요 😊",
    type: "text",
    placeholder:
      "예: 매일 아침 오늘 먹을 것 추천받고 싶어요,\n유튜브 스크립트 쓰는 게 너무 힘들어요",
    skippable: true,
  },

  // ── AI / 기술 관련 ──
  {
    id: "Q10",
    section: "AI / 기술 관련",
    text: "ChatGPT 같은 AI 서비스나 툴을 써본 적 있나요?",
    type: "branch",
    options: ["자주 써요", "몇 번 써봤어요", "아직 안 써봤어요"],
    branchTriggerIndices: [0, 1],
    subQuestionId: "Q10-1",
  },
  {
    id: "Q10-1",
    section: "AI / 기술 관련",
    text: "주로 어떤 용도로 쓰고 있어요?",
    type: "multi",
    options: [
      "글쓰기 / 문서 작성",
      "업무 자동화 / 정리",
      "공부 / 정보 검색",
      "아이디어 구상 / 기획",
      "이미지 생성",
      "코딩 도움",
      "기타 (직접 입력)",
    ],
    hasCustomOption: true,
    skippable: true,
  },
  {
    id: "Q11",
    section: "AI / 기술 관련",
    text: "지금 가장 원하는 게 뭐예요?",
    type: "single",
    options: [
      "시간적 여유",
      "부업 수입",
      "업무 자동화",
      "나만의 프로젝트",
      "새로운 커리어",
      "기타 (직접 입력)",
    ],
    hasCustomOption: true,
  },
  {
    id: "Q12",
    section: "AI / 기술 관련",
    text: "AI 서비스를 직접 만든다면 어떤 목적이면 좋겠어요?",
    type: "multi",
    options: [
      "내 반복 업무를 줄여주는 것",
      "부업이나 수익을 낼 수 있는 것",
      "주변 사람들한테 도움이 되는 것",
      "일단 그냥 만들어보고 싶어요",
      "기타 (직접 입력)",
    ],
    hasCustomOption: true,
  },
  {
    id: "Q13",
    section: "AI / 기술 관련",
    text: "지금 AI 서비스 만들기를 시작 못하는 가장 큰 이유가 뭔가요?",
    type: "multi",
    options: [
      "뭘 만들어야 할지 모르겠어요",
      "코딩을 몰라서요",
      "아이디어도 없고 코딩도 몰라서 둘 다요",
      "시간이 없어서요",
      "나도 할 수 있을지 자신이 없어요",
      "기타 (직접 입력)",
    ],
    hasCustomOption: true,
  },
];
