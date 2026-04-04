export type Profile = {
  job: string;
  keywords: string[];
  email?: string;
};

export type SurveyAnswer = {
  questionId: string;
  questionText: string;
  answer: string;
};

export type AnswersMap = Record<string, string | string[]>;

export type Persona = {
  title: string;
  summary: string;
  strength: string;
  painpoint: string;
};

export type ServiceIdea = {
  rank: number;
  name: string;
  oneline: string;
  reason: string;
  core_feature: string;
  how_it_works: string;
  /** 바이브 코딩 툴 플로우 (예: A → B → C) */
  tool_flow?: string;
  impact?: string;
  difficulty: string;
  period: string;
  tool: string;
};

export type FirstStep = {
  idea_name: string;
  reason: string;
  steps: string[];
  encouragement: string;
};

export type GPTResult = {
  persona: Persona;
  ideas: ServiceIdea[];
  first_step: FirstStep;
};

export type DiagnosisResult = {
  profile: Profile;
  answers: SurveyAnswer[];
  persona: Persona;
  ideas: ServiceIdea[];
  first_step: FirstStep;
  surveyId?: string;
};

export type DiagnosisPayload = {
  profile: Profile;
  answers: SurveyAnswer[];
  answersMap: AnswersMap;
};
