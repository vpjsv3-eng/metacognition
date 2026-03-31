"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Profile } from "../lib/types";
import SurveyForm from "./SurveyForm";

export default function SurveyPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("mc_profile");
      if (!raw) {
        setProfile(null);
        return;
      }
      setProfile(JSON.parse(raw) as Profile);
    } catch {
      setProfile(null);
    } finally {
      setChecked(true);
    }
  }, []);

  if (!checked) {
    return (
      <main className="container">
        <div className="card">로딩 중...</div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="container">
        <div className="card">
          <h1 style={{ margin: 0, fontSize: 18 }}>프로필 정보가 없습니다.</h1>
          <p className="help">
            설문을 시작하려면 먼저 랜딩 페이지에서 `나이/직업/관심사`를 입력해 주세요.
          </p>
          <button className="btn" type="button" onClick={() => router.push("/")} style={{ marginTop: 14 }}>
            랜딩으로 돌아가기
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <SurveyForm profile={profile} />
    </main>
  );
}

