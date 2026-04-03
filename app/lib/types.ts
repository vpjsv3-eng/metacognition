export type Profile = {
  job: string;
  keywords: string[];
};

export type SurveyAnswer = {
  questionId: number;
  questionText: string;
  answer: string;
};

export type ServiceIdea = {
  name: string;
  description: string;
  reason: string;
  coreFeature: string;
};

export type DiagnosisResult = {
  profile: Profile;
  answers: SurveyAnswer[];
  ideas: ServiceIdea[];
  comment: string;
  surveyId?: string;
};

export type DiagnosisPayload = {
  profile: Profile;
  answers: SurveyAnswer[];
};
