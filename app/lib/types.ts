export type Profile = {
  age: number;
  job: string;
  interests: string[];
};

export type ServiceIdea = {
  name: string;
  description: string;
  reason: string;
  coreFeature: string;
};

export type DiagnosisResult = {
  profile: Profile;
  answers: number[];
  ideas: ServiceIdea[];
};

export type DiagnosisPayload = {
  profile: Profile;
  answers: number[]; // length: 10, 0-based option indices
};
