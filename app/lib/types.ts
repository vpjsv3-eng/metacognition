export type Profile = {
  age: number;
  job: string;
  interests: string[];
};

export type DiagnosisPayload = {
  profile: Profile;
  // 질문 1~20에 대한 5점 척도 값(1~5). 미응답이면 0을 사용하지 않고 모든 값을 제출하도록 구성합니다.
  answers: Array<number>; // length: 20, values: 1..5
};

