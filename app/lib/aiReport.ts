import type { Profile, ServiceIdea, SurveyAnswer, GPTResult, Persona, FirstStep } from "./types";

type IdeaTemplate = {
  name: string;
  oneline: string;
  core_feature: string;
  how_it_works: string;
  difficulty: string;
  period: string;
  tool: string;
  reasonFragment: string;
  tags: string[];
};

const IDEA_POOL: IdeaTemplate[] = [
  {
    name: "AI 부업 매칭 서비스",
    oneline: "관심사·가용 시간·스킬을 입력하면 딱 맞는 부업 아이디어를 추천합니다",
    core_feature: "프로필 분석 → 맞춤 부업 3가지 추천 + 시작 가이드",
    how_it_works: "관심사와 가용 시간을 입력하면 AI가 수익성과 난이도를 분석해서 부업 3가지를 추천합니다",
    difficulty: "쉬움",
    period: "3~5일",
    tool: "Lovable",
    reasonFragment: "수익 창출에 관심이 많은",
    tags: ["재테크", "부업", "수익화"],
  },
  {
    name: "AI 가계부 코치",
    oneline: "소비 내역을 붙여넣으면 AI가 절약 포인트와 재테크 팁을 알려줍니다",
    core_feature: "소비 분석 → 절약 포인트 + 실행 가능한 재테크 팁",
    how_it_works: "카드 내역을 복붙하면 카테고리별 분석 후 구체적인 절약 방법을 알려줍니다",
    difficulty: "보통",
    period: "5~7일",
    tool: "Bolt",
    reasonFragment: "돈 관리에 관심이 많은",
    tags: ["재테크", "절약", "돈 관리"],
  },
  {
    name: "AI 학습 플래너",
    oneline: "목표와 기간을 입력하면 매일 공부할 내용과 분량을 짜줍니다",
    core_feature: "학습 목표 입력 → 일별 커리큘럼 자동 생성",
    how_it_works: "시험 날짜와 범위를 입력하면 AI가 매일의 학습 분량을 자동으로 배분해줍니다",
    difficulty: "쉬움",
    period: "3~5일",
    tool: "Lovable",
    reasonFragment: "자기계발과 학습에 열정이 있는",
    tags: ["자기계발", "공부", "배우기", "학생"],
  },
  {
    name: "AI 운동 루틴 코치",
    oneline: "체력 수준과 목표를 입력하면 오늘의 맞춤 운동 루틴을 짜줍니다",
    core_feature: "목표 입력 → 오늘의 맞춤 운동 루틴 생성",
    how_it_works: "운동 목표와 가능한 시간을 입력하면 난이도에 맞는 루틴을 매일 새로 만들어줍니다",
    difficulty: "쉬움",
    period: "3~4일",
    tool: "Lovable",
    reasonFragment: "운동과 건강 관리에 관심이 있는",
    tags: ["운동", "건강"],
  },
  {
    name: "AI 회의록 정리 도우미",
    oneline: "회의 내용을 붙여넣으면 요약·결정사항·할 일을 자동 정리합니다",
    core_feature: "회의 내용 입력 → 3줄 요약 + 액션 아이템 목록",
    how_it_works: "회의 중 메모한 내용을 그대로 붙여넣으면 깔끔한 회의록으로 정리됩니다",
    difficulty: "쉬움",
    period: "2~3일",
    tool: "Bolt",
    reasonFragment: "업무 효율을 높이고 싶은",
    tags: ["직무", "반복업무", "직장인"],
  },
  {
    name: "AI 이메일/보고서 작성기",
    oneline: "키워드와 상황을 입력하면 깔끔한 비즈니스 문서를 만듭니다",
    core_feature: "상황 입력 → 이메일/보고서 초안 즉시 생성",
    how_it_works: "받는 사람과 상황을 간단히 적으면 적절한 톤의 비즈니스 이메일이 완성됩니다",
    difficulty: "쉬움",
    period: "2~4일",
    tool: "Lovable",
    reasonFragment: "업무 글쓰기가 많은",
    tags: ["직무", "글쓰기", "콘텐츠", "직장인"],
  },
  {
    name: "AI 이력서/자소서 코치",
    oneline: "경력과 지원 회사를 입력하면 맞춤형 자소서 초안을 만들어줍니다",
    core_feature: "경력 + 공고 입력 → 맞춤 자소서 생성",
    how_it_works: "이력 사항과 지원 공고를 입력하면 해당 회사에 맞는 자소서 초안을 만들어줍니다",
    difficulty: "보통",
    period: "4~6일",
    tool: "Bolt",
    reasonFragment: "커리어를 준비 중인",
    tags: ["취업", "경력 전환"],
  },
  {
    name: "AI 냉장고 레시피",
    oneline: "집에 있는 재료를 입력하면 만들 수 있는 요리를 추천합니다",
    core_feature: "재료 입력 → 레시피 3개 추천 + 조리 순서 안내",
    how_it_works: "냉장고에 있는 재료를 나열하면 바로 만들 수 있는 요리와 순서를 알려줍니다",
    difficulty: "쉬움",
    period: "3~4일",
    tool: "Lovable",
    reasonFragment: "요리와 생활에 관심이 많은",
    tags: ["요리", "라이프스타일"],
  },
  {
    name: "AI 육아 일기",
    oneline: "아이의 하루를 간단히 적으면 예쁜 성장 일기로 만들어줍니다",
    core_feature: "간단 메모 → 감성 성장 일기 자동 생성",
    how_it_works: "오늘 아이가 한 것을 몇 줄만 적으면 감성적인 일기로 변환됩니다",
    difficulty: "쉬움",
    period: "3~5일",
    tool: "Lovable",
    reasonFragment: "육아에 정성을 쏟는",
    tags: ["육아", "가족"],
  },
  {
    name: "AI 블로그 글 생성기",
    oneline: "주제를 입력하면 SEO 최적화된 블로그 글 초안을 만들어줍니다",
    core_feature: "키워드 입력 → SEO 블로그 글 초안 + 제목 3개",
    how_it_works: "키워드와 타겟 독자를 입력하면 검색에 잘 걸리는 블로그 글 초안이 나옵니다",
    difficulty: "보통",
    period: "4~6일",
    tool: "Bolt",
    reasonFragment: "콘텐츠로 수익을 만들고 싶은",
    tags: ["콘텐츠", "부업", "수익화", "글쓰기"],
  },
  {
    name: "AI SNS 콘텐츠 생성기",
    oneline: "주제와 톤을 정하면 SNS 포스팅 글을 자동으로 만듭니다",
    core_feature: "주제 + 톤 선택 → SNS 포스팅 초안 3개 생성",
    how_it_works: "어떤 SNS에 올릴지와 주제를 입력하면 해시태그까지 포함된 포스팅이 완성됩니다",
    difficulty: "쉬움",
    period: "3~5일",
    tool: "Lovable",
    reasonFragment: "개인 브랜딩에 관심이 있는",
    tags: ["콘텐츠", "부업", "수익화", "프리랜서", "사업"],
  },
  {
    name: "AI 반복 업무 자동화 설계기",
    oneline: "반복 업무를 설명하면 자동화 방법과 도구를 추천합니다",
    core_feature: "업무 설명 → 자동화 방법 + 추천 도구 안내",
    how_it_works: "귀찮은 반복 업무를 설명하면 어떤 도구로 어떻게 자동화할 수 있는지 가이드해줍니다",
    difficulty: "보통",
    period: "5~7일",
    tool: "Bolt",
    reasonFragment: "업무 자동화에 관심이 많은",
    tags: ["반복업무", "직무"],
  },
  {
    name: "AI 일정 관리 도우미",
    oneline: "할 일을 나열하면 우선순위와 시간 배분을 자동으로 정해줍니다",
    core_feature: "할 일 입력 → 우선순위 + 시간 블록 자동 배분",
    how_it_works: "해야 할 일을 나열하면 중요도와 마감일을 고려해 시간표를 만들어줍니다",
    difficulty: "쉬움",
    period: "3~4일",
    tool: "Lovable",
    reasonFragment: "시간이 부족하다고 느끼는",
    tags: ["직장인", "반복업무"],
  },
  {
    name: "AI 정보 큐레이터",
    oneline: "관심 분야를 설정하면 매일 핵심 정보만 골라 요약합니다",
    core_feature: "관심 분야 설정 → 일일 핵심 정보 요약 리포트",
    how_it_works: "관심 키워드를 등록하면 매일 아침 핵심 뉴스만 요약해서 보여줍니다",
    difficulty: "보통",
    period: "5~7일",
    tool: "Bolt",
    reasonFragment: "정보를 효율적으로 정리하고 싶은",
    tags: ["자기계발", "배우기", "직무"],
  },
  {
    name: "AI 견적서 생성기",
    oneline: "프로젝트 내용을 입력하면 전문 견적서를 자동 생성합니다",
    core_feature: "프로젝트 정보 입력 → 견적서 자동 생성",
    how_it_works: "프로젝트 범위와 단가를 입력하면 전문적인 견적서가 바로 만들어집니다",
    difficulty: "보통",
    period: "5~7일",
    tool: "Bolt",
    reasonFragment: "효율적인 업무 처리가 필요한",
    tags: ["프리랜서", "사업"],
  },
];

function buildTags(profile: Profile, answers: SurveyAnswer[]): string[] {
  const tags: string[] = [];
  const kw = profile.keywords.join(" ");
  const allAnswers = answers.map((a) => a.answer).join(" ");
  const text = `${kw} ${allAnswers} ${profile.job}`;

  const mapping: Record<string, string[]> = {
    재테크: ["재테크", "절약", "투자", "돈"],
    부업: ["부업", "수익", "사이드"],
    수익화: ["수익화", "수익"],
    자기계발: ["자기계발", "배우", "공부", "강의"],
    공부: ["공부", "자격증", "학습"],
    배우기: ["배우"],
    직무: ["직무", "업무", "마케팅", "디자인", "개발", "엑셀"],
    반복업무: ["반복", "자동화", "귀찮"],
    글쓰기: ["글쓰기", "콘텐츠"],
    콘텐츠: ["콘텐츠"],
    운동: ["운동", "건강", "산책", "영양"],
    건강: ["건강"],
    육아: ["육아", "가족"],
    요리: ["요리", "인테리어", "라이프"],
    라이프스타일: ["라이프스타일", "인테리어"],
    직장인: ["직장인"],
    프리랜서: ["프리랜서", "1인 사업"],
    학생: ["학생"],
    취업: ["취업", "경력 전환"],
    "경력 전환": ["경력 전환"],
    사업: ["사업", "창업"],
    도움: ["도움", "주변"],
  };

  for (const [tag, keywords] of Object.entries(mapping)) {
    if (keywords.some((k) => text.includes(k))) {
      tags.push(tag);
    }
  }
  return tags;
}

export function generateIdeasFallback(
  profile: Profile,
  answers: SurveyAnswer[],
): GPTResult {
  const userTags = buildTags(profile, answers);

  const scored = IDEA_POOL.map((idea) => ({
    idea,
    score: idea.tags.filter((t) => userTags.includes(t)).length,
  }));
  scored.sort((a, b) => b.score - a.score);

  const top5 = scored.slice(0, 5);

  const ideas: ServiceIdea[] = top5.map((s, i) => ({
    rank: i + 1,
    name: s.idea.name,
    oneline: s.idea.oneline,
    reason: `${profile.job}(으)로 활동 중인 당신은 ${s.idea.reasonFragment} 분이에요. 바이브 코딩 툴로 빠르게 만들 수 있어요.`,
    core_feature: s.idea.core_feature,
    how_it_works: s.idea.how_it_works,
    difficulty: s.idea.difficulty,
    period: s.idea.period,
    tool: s.idea.tool,
  }));

  const persona: Persona = {
    title: `${profile.keywords[0] || "다양한 관심사를 가진"} ${profile.job}`,
    summary: `${profile.job}(으)로 활동하면서 ${profile.keywords.slice(0, 2).join(", ")}에 관심이 많은 분이에요. 일상에서 느끼는 불편함을 해결하고 싶어하고, 새로운 시도에 대한 의지가 있어 보여요.`,
    strength: `${profile.keywords[0] || "다양한 관심사"}에 대한 깊은 이해와 실행력`,
    painpoint: "어디서부터 시작해야 할지 모르는 막막함",
  };

  const first_step: FirstStep = {
    idea_name: top5[0].idea.name,
    reason: `당신의 관심사와 가장 잘 맞고, 난이도가 낮아서 빠르게 성과를 낼 수 있어요.`,
    steps: [
      `1단계: ${top5[0].idea.tool} 가입 후 '${top5[0].idea.name}' 이라고 입력하기`,
      "2단계: AI가 만들어준 초안을 확인하고 내용 수정하기",
      "3단계: 주변 사람에게 공유하고 피드백 받기",
    ],
    encouragement: `${profile.keywords.slice(0, 2).join(", ")}에 관심이 많은 당신이라면 충분히 만들 수 있어요. 처음부터 완벽하지 않아도 괜찮아요, 일단 시작해보는 게 가장 중요합니다!`,
  };

  return { persona, ideas, first_step };
}
