"use client";

import CtaForm from "../components/CtaForm";

const TARGET_LIST = [
  "AI에 관심은 있지만 뭘 만들어야 할지 모르는 분",
  "코딩을 전혀 몰라도 서비스를 만들고 싶은 분",
  "3개월 안에 배포된 내 서비스를 갖고 싶은 분",
];

const STEPS = [
  {
    step: "1단계",
    title: "아이디어 발굴",
    desc: "나만의 AI 서비스 주제 찾기",
  },
  { step: "2단계", title: "기획", desc: "핵심 기능 정의하기" },
  {
    step: "3단계",
    title: "바이브 코딩",
    desc: "Bolt/Lovable로 구현하기",
  },
  {
    step: "4단계",
    title: "배포",
    desc: "실제로 쓸 수 있는 서비스 완성",
  },
];

const BENEFITS = [
  "배포된 나만의 AI 서비스",
  "바이브 코딩 툴 활용 능력",
  "아이디어를 서비스로 만드는 사고 프레임",
  "함께 성장하는 1기 커뮤니티",
];

export default function NadocodingPage() {
  return (
    <main className="container" style={{ maxWidth: 780 }}>
      {/* 히어로 */}
      <section style={{ textAlign: "center", padding: "48px 0 40px" }}>
        <h1
          style={{
            fontSize: 36,
            fontWeight: 900,
            margin: "0 0 12px",
            letterSpacing: -0.6,
          }}
        >
          코딩 몰라도 괜찮아요
        </h1>
        <p
          style={{
            fontSize: 18,
            color: "var(--muted)",
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          아이디어 발굴부터 AI 서비스 배포까지,
          <br />
          <strong style={{ color: "var(--text)" }}>나도 코딩 1기</strong>
        </p>
      </section>

      {/* 이런 분들을 위해 */}
      <section className="card" style={{ padding: 28, marginBottom: 20 }}>
        <h2
          style={{
            fontSize: 20,
            fontWeight: 800,
            margin: "0 0 16px",
            textAlign: "center",
          }}
        >
          이런 분들을 위해 만들었어요
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {TARGET_LIST.map((item, i) => (
            <div
              key={i}
              className="pill"
              style={{
                width: "100%",
                justifyContent: "flex-start",
                padding: "14px 16px",
                fontSize: 15,
                gap: 12,
              }}
            >
              <span style={{ color: "var(--accent)", fontWeight: 800 }}>✓</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 과정 소개 */}
      <section className="card" style={{ padding: 28, marginBottom: 20 }}>
        <h2
          style={{
            fontSize: 20,
            fontWeight: 800,
            margin: "0 0 20px",
            textAlign: "center",
          }}
        >
          과정 소개
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 14,
          }}
        >
          {STEPS.map((s, i) => (
            <div
              key={i}
              style={{
                background: "rgba(0,0,0,0.25)",
                border: "1px solid var(--cardBorder)",
                borderRadius: 14,
                padding: 18,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: "var(--accent2)",
                  fontWeight: 800,
                  marginBottom: 8,
                }}
              >
                {s.step}
              </div>
              <div
                style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}
              >
                {s.title}
              </div>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>
                {s.desc}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  style={{
                    color: "var(--muted)",
                    fontSize: 20,
                    marginTop: 8,
                    display: "none",
                  }}
                >
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 수강 후 얻는 것 */}
      <section className="card" style={{ padding: 28, marginBottom: 20 }}>
        <h2
          style={{
            fontSize: 20,
            fontWeight: 800,
            margin: "0 0 16px",
            textAlign: "center",
          }}
        >
          수강 후 얻는 것
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 12,
          }}
        >
          {BENEFITS.map((b, i) => (
            <div
              key={i}
              className="pill"
              style={{
                justifyContent: "flex-start",
                padding: "14px 16px",
                fontSize: 14,
                gap: 10,
              }}
            >
              <span style={{ fontSize: 18 }}>🎯</span>
              <span>{b}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 사전 신청 */}
      <section className="card" style={{ padding: 28, textAlign: "center" }}>
        <h2 style={{ margin: "0 0 8px", fontSize: 22 }}>사전 신청</h2>
        <p
          className="help"
          style={{ marginTop: 0, fontSize: 15, lineHeight: 1.6 }}
        >
          오픈 시 가장 먼저 알려드릴게요 🙌
        </p>
        <div style={{ maxWidth: 400, margin: "16px auto 0" }}>
          <CtaForm />
        </div>
      </section>
    </main>
  );
}
