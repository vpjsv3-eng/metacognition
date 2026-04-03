export type QuestionType = "single" | "multi" | "branch" | "text";

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
  parentQuestionId?: string;
  parentTriggerIndex?: number;
  hint?: string;
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

  // ── AI 실행 역량 ──
  {
    id: "Q5",
    section: "AI 실행 역량",
    text: "AI 서비스 만들기에 일주일에 얼마나 시간을 쓸 수 있어요?",
    type: "single",
    options: [
      "1~2시간 (틈틈이)",
      "3~5시간 (주말 활용)",
      "5시간 이상 (적극적으로)",
      "아직 잘 모르겠어요",
    ],
  },

  // ── 불편함 발굴 ──
  {
    id: "Q6",
    section: "불편함 발굴",
    text: '일하거나 생활하면서 "이거 매번 하기 귀찮은데..." 싶은 게 있나요?',
    type: "branch",
    options: ["있어요", "없어요", "생각해본 적 없어요"],
    branchTriggerIndex: 0,
    subQuestionId: "Q6-1",
    hint: "예: 내 식비를 자동으로 분류해주는 가계부,\n매일 운동 루틴을 짜주는 앱,\n육아 일기를 자동으로 정리해주는 서비스 등\n완성된 아이디어가 아니어도 괜찮아요 😊",
  },
  {
    id: "Q6-1",
    section: "불편함 발굴",
    text: "어떤 게 귀찮으세요?",
    type: "text",
    placeholder:
      "예: 매일 회의록 정리, 거래처 이메일 답장, SNS 글 쓰기 등\n생각나는 대로 편하게 적어주세요.",
    skippable: true,
  },
  {
    id: "Q7",
    section: "불편함 발굴",
    text: "뭔가를 검색했는데 딱 맞는 앱이나 서비스가 없어서 불편했던 적 있나요?",
    type: "branch",
    options: ["있어요", "없어요", "생각해본 적 없어요"],
    branchTriggerIndex: 0,
    subQuestionId: "Q7-1",
  },
  {
    id: "Q7-1",
    section: "불편함 발굴",
    text: "어떤 걸 찾으셨어요?",
    type: "text",
    placeholder: "어떤 상황이었는지 편하게 적어주세요.",
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
    text: '"이런 앱이 있으면 좋겠다"고 생각하거나 주변에 말한 적 있나요?',
    type: "branch",
    options: ["있어요", "있긴 한데 흐릿해요", "생각해본 적 없어요"],
    branchTriggerIndex: 0,
    subQuestionId: "Q9-1",
    hint: "예: 운동 루틴 짜주는 앱, 육아 일기 자동 정리,\n거래처 이메일 자동 답장 등\n완성된 아이디어가 아니어도 괜찮아요 😊",
  },
  {
    id: "Q9-1",
    section: "불편함 발굴",
    text: "어떤 앱이었나요?",
    type: "text",
    placeholder: "간단하게 적어주세요. 완성된 아이디어가 아니어도 괜찮아요.",
    skippable: true,
  },
  {
    id: "Q9-2",
    section: "불편함 발굴",
    text: "어떤 분야나 상황인지만 알려줘도 괜찮아요",
    type: "text",
    placeholder: "예: 육아 관련, 업무 자동화,\n운동 도움 등 키워드만 적어도 돼요",
    skippable: true,
    parentQuestionId: "Q9",
    parentTriggerIndex: 1,
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
    text: "지금 삶에서 가장 원하는 변화가 뭐예요?",
    type: "multi",
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
