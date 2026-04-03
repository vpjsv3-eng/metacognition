import type { Profile, ServiceIdea } from "./types";

type IdeaTemplate = {
  name: string;
  description: string;
  coreFeature: string;
  reasonFragment: string;
  tags: string[];
};

function answersToTags(answers: number[]): string[] {
  const tags: string[] = [];

  // Q1: 유튜브 콘텐츠
  const q1Map: string[][] = [
    ["finance", "side-hustle"],
    ["self-dev", "study"],
    ["cooking", "fitness", "hobby"],
    ["work", "career"],
    ["parenting", "lifestyle"],
  ];
  if (q1Map[answers[0]]) tags.push(...q1Map[answers[0]]);

  // Q2: 주요 활동
  const q2Map: string[][] = [
    ["employee", "work"],
    ["freelancer", "business"],
    ["student", "study"],
    ["job-seeker", "career-change"],
  ];
  if (q2Map[answers[1]]) tags.push(...q2Map[answers[1]]);

  // Q3: 여가
  const q3Map: string[][] = [
    ["content-consumer"],
    ["fitness"],
    ["study", "certification"],
    ["side-hustle", "project"],
    ["parenting", "homemaking"],
  ];
  if (q3Map[answers[2]]) tags.push(...q3Map[answers[2]]);

  // Q4: 주변이 묻는 것
  const q4Map: string[][] = [
    ["recommendation", "lifestyle"],
    ["work-expert"],
    ["finance-expert"],
    ["health-expert"],
    [],
  ];
  if (q4Map[answers[3]]) tags.push(...q4Map[answers[3]]);

  // Q5: 자동화 니즈
  if (answers[4] === 0) tags.push("automation-high");
  else if (answers[4] === 1) tags.push("automation-mid");

  // Q6: 미충족 니즈
  if (answers[5] === 0) tags.push("unmet-need");

  // Q7: 주변 불만
  const q7Map: string[][] = [
    ["time-poor"],
    ["money-mgmt"],
    ["info-overload"],
    ["repetitive-work"],
    [],
  ];
  if (q7Map[answers[6]]) tags.push(...q7Map[answers[6]]);

  // Q8: AI 경험
  if (answers[7] === 0) tags.push("ai-advanced");
  else if (answers[7] === 1) tags.push("ai-beginner");
  else tags.push("ai-novice");

  // Q9: 목적
  const q9Map: string[][] = [
    ["efficiency"],
    ["income"],
    ["helping"],
    ["curiosity"],
  ];
  if (q9Map[answers[8]]) tags.push(...q9Map[answers[8]]);

  // Q10: 장벽
  if (answers[9] === 0 || answers[9] === 2) tags.push("no-idea");
  if (answers[9] === 1 || answers[9] === 2) tags.push("no-code");
  if (answers[9] === 3) tags.push("no-time");

  return tags;
}

const IDEA_POOL: IdeaTemplate[] = [
  {
    name: "AI 부업 매칭 서비스",
    description:
      "나의 관심사·가용 시간·스킬을 입력하면 딱 맞는 부업 아이디어를 추천합니다",
    coreFeature: "프로필 분석 → 맞춤 부업 3가지 추천 + 시작 가이드",
    reasonFragment: "수익 창출에 관심이 많은",
    tags: ["finance", "side-hustle", "income"],
  },
  {
    name: "AI 가계부 코치",
    description:
      "소비 내역을 붙여넣으면 AI가 절약 포인트와 재테크 팁을 알려줍니다",
    coreFeature: "소비 분석 → 절약 포인트 3개 + 실행 가능한 재테크 팁",
    reasonFragment: "돈 관리에 관심이 많은",
    tags: ["finance", "money-mgmt", "finance-expert"],
  },
  {
    name: "AI 학습 플래너",
    description:
      "목표와 기간을 입력하면 AI가 매일 공부할 내용과 분량을 짜줍니다",
    coreFeature: "학습 목표 입력 → 일별 커리큘럼 자동 생성",
    reasonFragment: "자기계발과 공부에 열정이 있는",
    tags: ["self-dev", "study", "certification", "student"],
  },
  {
    name: "AI 독서 요약 노트",
    description:
      "책 제목이나 핵심 키워드를 입력하면 3분 안에 읽을 수 있는 요약을 만들어줍니다",
    coreFeature: "책 제목 입력 → 핵심 내용 5줄 요약 + 실천 포인트",
    reasonFragment: "학습 효율을 높이고 싶은",
    tags: ["self-dev", "study", "info-overload", "content-consumer"],
  },
  {
    name: "AI 냉장고 레시피",
    description:
      "집에 있는 재료를 입력하면 AI가 만들 수 있는 요리를 추천합니다",
    coreFeature: "재료 입력 → 레시피 3개 추천 + 조리 순서 안내",
    reasonFragment: "요리와 건강한 식생활에 관심이 많은",
    tags: ["cooking", "lifestyle", "recommendation"],
  },
  {
    name: "AI 운동 루틴 코치",
    description:
      "체력 수준과 목표를 입력하면 오늘의 맞춤 운동 루틴을 짜줍니다",
    coreFeature: "목표 입력 → 오늘의 맞춤 운동 루틴 생성",
    reasonFragment: "운동과 건강 관리에 관심이 있는",
    tags: ["fitness", "health-expert", "hobby"],
  },
  {
    name: "AI 회의록 정리 도우미",
    description:
      "회의 내용을 붙여넣으면 요약·결정사항·할 일을 자동으로 정리합니다",
    coreFeature: "회의 내용 입력 → 3줄 요약 + 액션 아이템 목록",
    reasonFragment: "업무 효율을 높이고 싶은",
    tags: ["work", "employee", "efficiency", "repetitive-work", "time-poor"],
  },
  {
    name: "AI 이메일/보고서 작성기",
    description:
      "키워드와 상황을 입력하면 AI가 깔끔한 비즈니스 문서를 작성합니다",
    coreFeature: "상황 입력 → 이메일/보고서 초안 즉시 생성",
    reasonFragment: "업무 글쓰기가 잦은",
    tags: ["work", "employee", "work-expert", "efficiency"],
  },
  {
    name: "AI 이력서/자소서 코치",
    description:
      "경력과 지원 회사를 입력하면 맞춤형 자소서 초안을 만들어줍니다",
    coreFeature: "경력 + 공고 입력 → 맞춤 자소서 초안 생성",
    reasonFragment: "커리어 전환이나 취업 준비 중인",
    tags: ["career", "career-change", "job-seeker"],
  },
  {
    name: "AI 육아 일기",
    description:
      "아이의 하루를 간단히 적으면 AI가 예쁜 성장 일기로 만들어줍니다",
    coreFeature: "간단 메모 입력 → 감성 성장 일기 자동 생성",
    reasonFragment: "육아와 가정생활에 정성을 쏟는",
    tags: ["parenting", "lifestyle", "homemaking"],
  },
  {
    name: "AI 생활 꿀팁 추천기",
    description:
      "고민이나 상황을 입력하면 AI가 실생활에 바로 쓸 수 있는 팁을 추천합니다",
    coreFeature: "상황 입력 → 실천 가능한 맞춤 팁 3개 제공",
    reasonFragment: "실생활 개선에 관심이 많은",
    tags: ["lifestyle", "recommendation", "helping"],
  },
  {
    name: "AI 블로그 글 생성기",
    description:
      "주제를 입력하면 SEO에 최적화된 블로그 글 초안을 만들어줍니다",
    coreFeature: "키워드 입력 → SEO 블로그 글 초안 + 제목 3개",
    reasonFragment: "콘텐츠로 수익을 만들고 싶은",
    tags: ["income", "side-hustle", "content-consumer", "project"],
  },
  {
    name: "AI SNS 콘텐츠 생성기",
    description:
      "주제와 톤을 정하면 인스타그램/트위터에 올릴 글을 자동으로 만듭니다",
    coreFeature: "주제 + 톤 선택 → SNS 포스팅 초안 3개 생성",
    reasonFragment: "개인 브랜딩에 관심이 있는",
    tags: ["income", "side-hustle", "business", "freelancer"],
  },
  {
    name: "AI 반복 업무 자동화 설계기",
    description:
      "반복되는 업무를 설명하면 AI가 자동화 방법과 도구를 추천합니다",
    coreFeature: "업무 설명 입력 → 자동화 방법 + 추천 도구 안내",
    reasonFragment: "업무 자동화에 대한 필요성을 느끼는",
    tags: ["automation-high", "automation-mid", "repetitive-work", "efficiency"],
  },
  {
    name: "AI 일정 관리 도우미",
    description:
      "할 일을 나열하면 AI가 우선순위와 시간 배분을 자동으로 정해줍니다",
    coreFeature: "할 일 입력 → 우선순위 + 시간 블록 자동 배분",
    reasonFragment: "시간이 부족하다고 느끼는",
    tags: ["time-poor", "efficiency", "no-time", "employee"],
  },
  {
    name: "AI 정보 큐레이터",
    description:
      "관심 분야를 설정하면 매일 핵심 정보만 골라 요약해줍니다",
    coreFeature: "관심 분야 설정 → 일일 핵심 정보 요약 리포트",
    reasonFragment: "정보 과부하를 정리하고 싶은",
    tags: ["info-overload", "self-dev", "content-consumer"],
  },
  {
    name: "AI 고민 상담 챗봇",
    description:
      "고민을 입력하면 AI가 다양한 관점에서 솔루션을 제안합니다",
    coreFeature: "고민 입력 → 해결 방향 3가지 + 실천 가이드",
    reasonFragment: "주변 사람들을 돕고 싶어하는",
    tags: ["helping", "curiosity"],
  },
  {
    name: "AI 견적서 생성기",
    description:
      "프로젝트 내용을 입력하면 전문적인 견적서를 자동으로 만들어줍니다",
    coreFeature: "프로젝트 정보 입력 → 전문 견적서 PDF 생성",
    reasonFragment: "효율적인 업무 처리가 필요한",
    tags: ["freelancer", "business", "efficiency"],
  },
  {
    name: "AI 학습 퀴즈 생성기",
    description:
      "공부한 내용을 입력하면 AI가 복습용 퀴즈를 자동으로 만들어줍니다",
    coreFeature: "학습 내용 입력 → 복습 퀴즈 10문제 자동 생성",
    reasonFragment: "효율적인 학습 방법을 찾는",
    tags: ["study", "student", "certification", "self-dev"],
  },
  {
    name: "AI 맞춤 뉴스레터 생성기",
    description:
      "관심 주제를 설정하면 AI가 나만의 뉴스레터를 자동으로 만들어줍니다",
    coreFeature: "주제 설정 → 주간 뉴스레터 콘텐츠 자동 생성",
    reasonFragment: "정보를 정리하고 공유하고 싶은",
    tags: ["income", "project", "info-overload", "self-dev"],
  },
];

export function generateIdeas(
  answers: number[],
  profile: Profile,
): ServiceIdea[] {
  const userTags = answersToTags(answers);

  const scored = IDEA_POOL.map((idea) => {
    let score = 0;
    for (const tag of idea.tags) {
      if (userTags.includes(tag)) score += 1;
    }
    return { idea, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const selected: typeof scored = [];
  for (const item of scored) {
    if (selected.length >= 5) break;
    selected.push(item);
  }

  const jobText = profile.job || "활동";
  const interestText =
    profile.interests.length > 0
      ? profile.interests.slice(0, 2).join(", ")
      : "";

  return selected.map((s) => {
    const parts = [
      `${jobText}(으)로 활동 중인 당신은 ${s.idea.reasonFragment} 분이에요.`,
    ];
    if (interestText) {
      parts.push(
        `${interestText}에 대한 관심과도 자연스럽게 연결됩니다.`,
      );
    }
    parts.push("바이브 코딩 툴로 2주 안에 만들 수 있어요.");

    return {
      name: s.idea.name,
      description: s.idea.description,
      coreFeature: s.idea.coreFeature,
      reason: parts.join(" "),
    };
  });
}
