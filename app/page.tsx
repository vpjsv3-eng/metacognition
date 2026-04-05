"use client";

import { useRouter } from "next/navigation";
import { safeLocalStorageRemove } from "./lib/safeStorage";

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="container" style={{ paddingTop: 48 }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          textAlign: "center",
        }}
      >
        {/* 진단 배지 */}
        <span
          style={{
            display: "inline-block",
            padding: "8px 18px",
            borderRadius: 999,
            background: "var(--accentSoft)",
            color: "var(--accent)",
            fontSize: 14,
            fontWeight: 700,
            marginBottom: 24,
          }}
        >
          🔬 AI 서비스 적합도 진단
        </span>

        {/* 제목 */}
        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            margin: "0 0 8px",
            letterSpacing: -0.5,
            lineHeight: 1.45,
            color: "var(--text)",
          }}
        >
          나만의 AI 서비스 아이디어
          <br />
          무료로 찾아드려요
        </h1>

        {/* 부제 (제목과 구분) */}
        <p
          style={{
            margin: "12px 0 40px",
            fontSize: 16,
            lineHeight: 1.6,
            color: "var(--textSecondary)",
          }}
        >
          3분 진단으로 나에게 딱 맞는
          <br />
          AI 서비스 아이디어 5가지를 추천해드려요
        </p>

        {/* 시작 버튼 */}
        <button
          className="btn"
          type="button"
          onClick={() => {
            safeLocalStorageRemove("emailSent");
            safeLocalStorageRemove("emailSending");
            router.push("/survey");
          }}
          style={{
            fontSize: 18,
            padding: "18px 48px",
            maxWidth: 360,
          }}
        >
          무료 진단 시작하기
        </button>
      </div>
    </main>
  );
}
