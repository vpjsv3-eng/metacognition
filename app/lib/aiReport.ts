import type { Profile, ServiceIdea, SurveyAnswer } from "./types";

// GPT API 키가 없을 때 사용하는 결정론적 추천 엔진
type IdeaTemplate = {
  name: string;
  description: string;
  coreFeature: string;
  reasonFragment: string;
  tags: string[];
};

const IDEA_POOL: IdeaTemplate[] = [
  {
    name: "AI 부업 매칭 서비스",
    description: "관심사·가용 시간·스킬을 입력하면 딱 맞는 부업 아이디어를 추천합니다",
    coreFeature: "프로필 분석 → 맞춤 부업 3가지 추천 + 시작 가이드",
    reasonFragment: "수익 창출에 관심이 많은",
    tags: ["재테크", "부업", "수익화"],
  },
  {
    name: "AI 가계부 코치",
    description: "소비 내역을 붙여넣으면 AI가 절약 포인트와 재테크 팁을 알려줍니다",
    coreFeature: "소비 분석 → 절약 포인트 + 실행 가능한 재테크 팁",
    reasonFragment: "돈 관리에 관심이 많은",
    tags: ["재테크", "절약", "돈 관리"],
  },
  {
    name: "AI 학습 플래너",
    description: "목표와 기간을 입력하면 매일 공부할 내용과 분량을 짜줍니다",
    coreFeature: "학습 목표 입력 → 일별 커리큘럼 자동 생성",
    reasonFragment: "자기계발과 학습에 열정이 있는",
    tags: ["자기계발", "공부", "배우기", "학생"],
  },
  {
    name: "AI 운동 루틴 코치",
    description: "체력 수준과 목표를 입력하면 오늘의 맞춤 운동 루틴을 짜줍니다",
    coreFeature: "목표 입력 → 오늘의 맞춤 운동 루틴 생성",
    reasonFragment: "운동과 건강 관리에 관심이 있는",
    tags: ["운동", "건강"],
  },
  {
    name: "AI 회의록 정리 도우미",
    description: "회의 내용을 붙여넣으면 요약·결정사항·할 일을 자동 정리합니다",
    coreFeature: "회의 내용 입력 → 3줄 요약 + 액션 아이템 목록",
    reasonFragment: "업무 효율을 높이고 싶은",
    tags: ["직무", "반복업무", "직장인"],
  },
  {
    name: "AI 이메일/보고서 작성기",
    description: "키워드와 상황을 입력하면 깔끔한 비즈니스 문서를 만듭니다",
    coreFeature: "상황 입력 → 이메일/보고서 초안 즉시 생성",
    reasonFragment: "업무 글쓰기가 많은",
    tags: ["직무", "글쓰기", "콘텐츠", "직장인"],
  },
  {
    name: "AI 이력서/자소서 코치",
    description: "경력과 지원 회사를 입력하면 맞춤형 자소서 초안을 만들어줍니다",
    coreFeature: "경력 + 공고 입력 → 맞춤 자소서 생성",
    reasonFragment: "커리어를 준비 중인",
    tags: ["취업", "경력 전환"],
  },
  {
    name: "AI 냉장고 레시피",
    description: "집에 있는 재료를 입력하면 만들 수 있는 요리를 추천합니다",
    coreFeature: "재료 입력 → 레시피 3개 추천 + 조리 순서 안내",
    reasonFragment: "요리와 생활에 관심이 많은",
    tags: ["요리", "라이프스타일"],
  },
  {
    name: "AI 육아 일기",
    description: "아이의 하루를 간단히 적으면 예쁜 성장 일기로 만들어줍니다",
    coreFeature: "간단 메모 → 감성 성장 일기 자동 생성",
    reasonFragment: "육아에 정성을 쏟는",
    tags: ["육아", "가족"],
  },
  {
    name: "AI 블로그 글 생성기",
    description: "주제를 입력하면 SEO 최적화된 블로그 글 초안을 만들어줍니다",
    coreFeature: "키워드 입력 → SEO 블로그 글 초안 + 제목 3개",
    reasonFragment: "콘텐츠로 수익을 만들고 싶은",
    tags: ["콘텐츠", "부업", "수익화", "글쓰기"],
  },
  {
    name: "AI SNS 콘텐츠 생성기",
    description: "주제와 톤을 정하면 SNS 포스팅 글을 자동으로 만듭니다",
    coreFeature: "주제 + 톤 선택 → SNS 포스팅 초안 3개 생성",
    reasonFragment: "개인 브랜딩에 관심이 있는",
    tags: ["콘텐츠", "부업", "수익화", "프리랜서", "사업"],
  },
  {
    name: "AI 반복 업무 자동화 설계기",
    description: "반복 업무를 설명하면 자동화 방법과 도구를 추천합니다",
    coreFeature: "업무 설명 → 자동화 방법 + 추천 도구 안내",
    reasonFragment: "업무 자동화에 관심이 많은",
    tags: ["반복업무", "직무"],
  },
  {
    name: "AI 일정 관리 도우미",
    description: "할 일을 나열하면 우선순위와 시간 배분을 자동으로 정해줍니다",
    coreFeature: "할 일 입력 → 우선순위 + 시간 블록 자동 배분",
    reasonFragment: "시간이 부족하다고 느끼는",
    tags: ["직장인", "반복업무"],
  },
  {
    name: "AI 정보 큐레이터",
    description: "관심 분야를 설정하면 매일 핵심 정보만 골라 요약합니다",
    coreFeature: "관심 분야 설정 → 일일 핵심 정보 요약 리포트",
    reasonFragment: "정보를 효율적으로 정리하고 싶은",
    tags: ["자기계발", "배우기", "직무"],
  },
  {
    name: "AI 견적서 생성기",
    description: "프로젝트 내용을 입력하면 전문 견적서를 자동 생성합니다",
    coreFeature: "프로젝트 정보 입력 → 견적서 PDF 생성",
    reasonFragment: "효율적인 업무 처리가 필요한",
    tags: ["프리랜서", "사업"],
  },
  {
    name: "AI 고민 상담 챗봇",
    description: "고민을 입력하면 다양한 관점에서 솔루션을 제안합니다",
    coreFeature: "고민 입력 → 해결 방향 3가지 + 실천 가이드",
    reasonFragment: "주변 사람들을 돕고 싶은",
    tags: ["도움"],
  },
  {
    name: "AI 학습 퀴즈 생성기",
    description: "공부한 내용을 입력하면 복습용 퀴즈를 자동으로 만들어줍니다",
    coreFeature: "학습 내용 입력 → 복습 퀴즈 10문제 자동 생성",
    reasonFragment: "효율적인 학습을 추구하는",
    tags: ["공부", "배우기", "학생", "자기계발"],
  },
  {
    name: "AI 맞춤 뉴스레터 생성기",
    description: "관심 주제를 설정하면 나만의 뉴스레터를 자동 생성합니다",
    coreFeature: "주제 설정 → 주간 뉴스레터 콘텐츠 자동 생성",
    reasonFragment: "정보를 정리하고 공유하고 싶은",
    tags: ["콘텐츠", "부업", "수익화"],
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
    "취업": ["취업", "경력 전환"],
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
): { ideas: ServiceIdea[]; comment: string } {
  const userTags = buildTags(profile, answers);

  const scored = IDEA_POOL.map((idea) => ({
    idea,
    score: idea.tags.filter((t) => userTags.includes(t)).length,
  }));
  scored.sort((a, b) => b.score - a.score);

  const top5 = scored.slice(0, 5);

  const ideas: ServiceIdea[] = top5.map((s) => ({
    name: s.idea.name,
    description: s.idea.description,
    coreFeature: s.idea.coreFeature,
    reason: `${profile.job}(으)로 활동 중인 당신은 ${s.idea.reasonFragment} 분이에요. 바이브 코딩 툴로 2주 안에 만들 수 있어요.`,
  }));

  const comment = `당신은 ${profile.keywords.slice(0, 2).join(", ")}에 관심이 많은 실행형 스타일이에요. 가장 먼저 만들어볼 서비스는 "${top5[0].idea.name}"을 추천해요.`;

  return { ideas, comment };
}
