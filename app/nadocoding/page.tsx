"use client";

import { useRef, useState } from "react";
import CtaForm from "../components/CtaForm";

const TARGET_LIST = [
  { icon: "🤔", text: "AI에 관심은 있지만 뭘 만들어야 할지 모르는 분" },
  { icon: "💻", text: "코딩을 전혀 몰라도 내 서비스를 만들고 싶은 분" },
  { icon: "🚀", text: "2주 안에 배포된 내 AI 서비스를 갖고 싶은 분" },
];

const CURRICULUM = [
  {
    label: "WEEK 0 (4.13~4.17)",
    title: "사전 준비",
    desc: `사전 VOD 3편 시청 + 과제 제출
· VOD 1: AI 시대에 왜 직접 만들어야 하는가 (15분)
· VOD 2: 바이브 코딩이란? Lovable / Bolt 툴 소개 (15분)
· VOD 3: AI 프롬프트 잘 쓰는 법 기초 (15분)
· 과제: 진단 결과를 참고해서
  내가 만들고 싶은 서비스 아이디어 3가지 적어오기`,
  },
  {
    label: "DAY 1 (4.18 토)",
    title: "개강 OT — 오프라인",
    desc: `14:00 오프닝 + 자기소개
15:00 툴 세팅 (GitHub / Vercel / Lovable)
16:00 클론 바이브 코딩 실습 → 첫 배포 성공 경험
17:00 기획서 작성 → 내가 만들 서비스 확정`,
  },
  {
    label: "DAY 2 (4.19 일)",
    title: "기획서 확정",
    desc: `기획서 디스코드 제출
운영진 피드백 제공`,
  },
  {
    label: "DAY 3-8 (4.19~4.24)",
    title: "구현 + 배포 — 온라인",
    desc: `Lovable로 화면 만들기
핵심 기능 구현
디스코드 실시간 질의응답
4.21 화 중간 체크인
4.24 금 배포 완료 + 발표 자료 제출`,
  },
  {
    label: "DAY 9 (4.25 토)",
    title: "성과 공유회 + 수료식 — 오프라인",
    desc: `1기 수강생 서비스 발표
질의응답 + 피드백
수료증 수여 + 단체사진`,
  },
];

const BENEFITS = [
  { icon: "🌐", text: "배포된 나만의 AI 서비스 URL" },
  { icon: "🛠", text: "바이브 코딩 툴 활용 능력" },
  { icon: "🧠", text: "아이디어를 서비스로 만드는 사고 프레임" },
  { icon: "👥", text: "함께 성장하는 1기 동료 커뮤니티" },
];

type FaqCategory = {
  title: string;
  items: { q: string; a: string }[];
};

const FAQ_DATA: FaqCategory[] = [
  {
    title: "과정 기본 정보",
    items: [
      {
        q: "코딩을 전혀 몰라도 할 수 있나요?",
        a: "네, 괜찮아요. 이 과정은 코딩 없이 AI 툴만으로 서비스를 만드는 방법을 배워요. 코딩 지식이 전혀 없어도 따라올 수 있도록 설계됐어요.",
      },
      {
        q: "2주가 너무 짧은 거 아닌가요?",
        a: "이 과정이 추구하는 건 완벽한 서비스가 아니에요. 빠르게 변하는 AI 시대에 가장 중요한 건 아이디어를 빠르게 실행해보는 경험이에요. 2주 안에 기획 → 구현 → 배포 한 사이클을 완성하면 그다음은 혼자서도 할 수 있어요. 완성도보다 완주가 목표예요.",
      },
      {
        q: "2주 안에 진짜 서비스를 만들 수 있나요?",
        a: "네, 가능해요. 핵심 기능 1개짜리 MVP를 목표로 하기 때문이에요. 실제로 배포된 URL이 생기고 주변에 공유할 수 있는 수준까지 만들어요.",
      },
      {
        q: "어떤 서비스를 만들게 되나요?",
        a: "정해진 주제가 없어요. 사전 진단 결과와 기획서 작성을 통해 본인만의 아이디어로 서비스를 만들어요.",
      },
    ],
  },
  {
    title: "일정 및 참여 방식",
    items: [
      {
        q: "오프라인 참석이 필수인가요?",
        a: "4.18 개강 OT와 4.25 성과 공유회는 오프라인으로 진행돼요. 가능하면 참석을 권장해요. 동료들과의 유대감이 완주율에 큰 영향을 줘요. 불가피한 경우 온라인 참여 방법은 별도 안내드려요.",
      },
      {
        q: "직장인인데 병행할 수 있나요?",
        a: "네, 가능해요. 오프라인 세션은 토요일에만 있고 나머지는 본인 시간에 자율적으로 진행해요. 하루 1~2시간 정도면 충분해요.",
      },
      {
        q: "중간에 막히면 어떻게 하나요?",
        a: "디스코드 채널에서 실시간으로 질문할 수 있어요. 운영진이 상주하며 답변해드려요. 수요일엔 중간 체크인도 진행돼요.",
      },
    ],
  },
  {
    title: "툴 및 비용",
    items: [
      {
        q: "어떤 툴을 사용하나요?",
        a: "Lovable, Bolt 같은 바이브 코딩 툴과 GitHub, Vercel을 사용해요. 모두 무료 또는 저렴한 플랜으로 시작할 수 있어요.",
      },
      {
        q: "툴 사용 비용이 따로 드나요?",
        a: "대부분 무료 플랜으로 진행 가능해요. Lovable 유료 플랜이 필요한 경우 월 약 2~3만원 수준이에요. 과정 내에서 비용 최소화하는 방법도 함께 안내드려요.",
      },
      {
        q: "수료 후에도 서비스를 계속 운영할 수 있나요?",
        a: "네, 배포된 서비스는 수료 후에도 계속 운영 가능해요. 유지비 없이 운영하는 방법도 과정 안에서 안내드려요.",
      },
    ],
  },
  {
    title: "수강료 및 신청",
    items: [
      {
        q: "얼리버드 할인은 언제까지인가요?",
        a: "1기 오픈 전까지만 적용돼요. 오픈 후에는 정가 299,000원으로 변경돼요. 지금 사전 신청하시면 99,000원에 수강 가능해요.",
      },
      {
        q: "환불은 되나요?",
        a: "개강 전까지는 100% 환불 가능해요. 개강 후에는 환불이 어려운 점 양해 부탁드려요.",
      },
      {
        q: "1기 이후 추가 모집이 있나요?",
        a: "네, 1기 운영 후 2기 모집 예정이에요. 다만 1기는 선착순 10명 한정이고 얼리버드 가격은 1기에만 적용돼요.",
      },
    ],
  },
  {
    title: "수료 후",
    items: [
      {
        q: "수료 후 혼자서도 계속 만들 수 있나요?",
        a: "네, 이 과정의 목표가 그거예요. 한 사이클을 경험하고 나면 혼자서도 아이디어를 서비스로 만들 수 있는 사고 프레임과 툴 활용 능력이 생겨요.",
      },
      {
        q: "수료증이 발급되나요?",
        a: "네, 성과 공유회 당일 수료증을 드려요. 포트폴리오로도 활용할 수 있어요.",
      },
      {
        q: "1기 수강생들끼리 계속 연결될 수 있나요?",
        a: "네, 디스코드 커뮤니티는 수료 후에도 유지돼요. 1기 동료들과 계속 교류하고 서로의 서비스를 피드백할 수 있어요.",
      },
    ],
  },
];

export default function NadocodingPage() {
  const formRef = useRef<HTMLDivElement>(null);
  const curriculumRef = useRef<HTMLDivElement>(null);
  const [openFaq, setOpenFaq] = useState<Set<number>>(new Set());

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function scrollToCurriculum() {
    curriculumRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function toggleFaq(idx: number) {
    setOpenFaq((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  let faqFlatIdx = 0;

  return (
    <main className="container" style={{ maxWidth: 600 }}>
      {/* ① 히어로 섹션 */}
      <section className="heroSection">
        <div className="recruitBadge">🔥 1기 모집 중 · 선착순 10명</div>

        <h1
          style={{
            fontSize: 32,
            fontWeight: 800,
            margin: "0 0 12px",
            letterSpacing: -0.5,
            lineHeight: 1.4,
            color: "var(--text)",
          }}
        >
          코딩 몰라도 괜찮아요
          <br />
          나도 코딩 1기
        </h1>
        <p
          style={{
            fontSize: 16,
            margin: "0 0 20px",
            lineHeight: 1.7,
            color: "var(--textSecondary)",
          }}
        >
          아이디어 발굴부터 AI 서비스 배포까지
          <br />
          처음 하는 사람도 2주면 완성합니다
        </p>

        <p
          style={{
            fontSize: 14,
            color: "var(--textSecondary)",
            margin: "0 0 20px",
          }}
        >
          📅 2026년 4월 오픈 예정 | 👥 1기 모집 선착순 10명 한정
        </p>

        <div style={{ margin: "0 0 28px" }}>
          <span className="priceOriginal">299,000원</span>
          <span className="priceEarlybird">99,000원</span>
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 13,
              color: "var(--textHint)",
            }}
          >
            사전 신청자 한정 특별가
          </p>
        </div>

        <div
          style={{ display: "flex", flexDirection: "column", gap: 10 }}
        >
          <button
            className="btnPrimary"
            type="button"
            onClick={scrollToForm}
            style={{ fontSize: 16 }}
          >
            지금 얼리버드 신청하기
          </button>
          <button
            className="btnOutline"
            type="button"
            onClick={scrollToCurriculum}
          >
            과정 자세히 보기
          </button>
        </div>
      </section>

      {/* ② 이런 분들을 위해 만들었어요 */}
      <section style={{ marginBottom: 24 }}>
        <div className="card" style={{ padding: 28 }}>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              margin: "0 0 16px",
              textAlign: "center",
              color: "var(--text)",
            }}
          >
            이런 분들을 위해 만들었어요
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {TARGET_LIST.map((item, i) => (
              <div key={i} className="targetCard">
                <span className="targetIcon">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ③ 2주 커리큘럼 */}
      <section ref={curriculumRef} style={{ marginBottom: 24 }}>
        <div className="card" style={{ padding: 28 }}>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              margin: "0 0 24px",
              textAlign: "center",
              color: "var(--text)",
            }}
          >
            2주 커리큘럼
          </h2>
          <div className="timeline">
            {CURRICULUM.map((item, i) => (
              <div key={i} className="timelineItem">
                <div className="timelineDot" />
                <div className="timelineLabel">{item.label}</div>
                <div className="timelineTitle">{item.title}</div>
                <div className="timelineDesc">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ④ 수강하면 이런 게 생겨요 */}
      <section style={{ marginBottom: 24 }}>
        <div className="card" style={{ padding: 28 }}>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              margin: "0 0 16px",
              textAlign: "center",
              color: "var(--text)",
            }}
          >
            수강하면 이런 게 생겨요
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 10,
            }}
          >
            {BENEFITS.map((b, i) => (
              <div key={i} className="benefitCard">
                <span className="benefitIcon">{b.icon}</span>
                <span>{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ⑤ FAQ */}
      <section style={{ marginBottom: 24 }}>
        <div className="card" style={{ padding: 28 }}>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              margin: "0 0 8px",
              textAlign: "center",
              color: "var(--text)",
            }}
          >
            자주 묻는 질문
          </h2>

          {FAQ_DATA.map((category) => {
            const categoryItems = category.items.map((item) => {
              const idx = faqFlatIdx++;
              const isOpen = openFaq.has(idx);
              return (
                <div key={idx} className="faqItem">
                  <div
                    className="faqQuestion"
                    onClick={() => toggleFaq(idx)}
                  >
                    <span>Q. {item.q}</span>
                    <span
                      className="faqArrow"
                      data-open={isOpen ? "true" : "false"}
                    >
                      ▼
                    </span>
                  </div>
                  {isOpen && (
                    <div className="faqAnswer">{item.a}</div>
                  )}
                </div>
              );
            });

            return (
              <div key={category.title}>
                <div className="faqCategory">{category.title}</div>
                {categoryItems}
              </div>
            );
          })}
        </div>
      </section>

      {/* ⑥ 사전 신청 폼 */}
      <section ref={formRef} className="greenCtaSection">
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            margin: "0 0 8px",
          }}
        >
          지금 신청하면 얼리버드 99,000원
        </h2>
        <p
          style={{
            margin: "0 0 4px",
            fontSize: 15,
            lineHeight: 1.6,
          }}
        >
          1기 오픈 시 가장 먼저 안내드릴게요
        </p>
        <p
          style={{
            margin: "0 0 24px",
            fontSize: 13,
            opacity: 0.8,
          }}
        >
          선착순 10명 마감 시 조기 종료될 수 있어요
        </p>
        <div style={{ maxWidth: 400, margin: "0 auto" }}>
          <CtaForm onGreenBg />
        </div>
      </section>
    </main>
  );
}
