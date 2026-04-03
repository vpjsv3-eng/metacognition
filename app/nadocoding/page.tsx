"use client";

import { useRef, useState } from "react";
import CtaForm from "../components/CtaForm";

const TARGET_LIST = [
  { icon: "🤔", text: "AI에 관심은 있지만 뭘 만들어야 할지 모르는 분" },
  { icon: "💻", text: "코딩을 전혀 몰라도 내 서비스를 만들고 싶은 분" },
  { icon: "🚀", text: "2주 안에 배포된 내 AI 서비스를 갖고 싶은 분" },
];

type CurriculumItem = {
  label: string;
  title: string;
  desc: string;
  mode: "online" | "offline";
};

const CURRICULUM: CurriculumItem[] = [
  {
    label: "WEEK 0 (4.13 월 ~ 4.17 금)",
    title: "사전 준비",
    mode: "online",
    desc: `사전 VOD 3편 시청 + 과제 제출
· VOD 1: AI 시대에 왜 직접 만들어야 하는가 (15분)
· VOD 2: 바이브 코딩이란? Lovable / Bolt 툴 소개 (15분)
· VOD 3: AI 프롬프트 잘 쓰는 법 기초 (15분)
· 과제: 진단 결과를 참고해서
  내가 만들고 싶은 서비스 아이디어 3가지 적어오기`,
  },
  {
    label: "DAY 1 (4.18 토)",
    title: "개강 OT",
    mode: "offline",
    desc: `14:00 오프닝 + 자기소개
15:00 툴 세팅 (GitHub / Vercel / Lovable)
16:00 클론 바이브 코딩 실습 → 첫 배포 성공 경험
17:00 기획서 작성 → 내가 만들 서비스 확정`,
  },
  {
    label: "DAY 2 (4.19 일)",
    title: "기획서 확정",
    mode: "online",
    desc: `기획서 디스코드 제출
운영진 피드백 제공`,
  },
  {
    label: "DAY 3-4 (4.20 월 ~ 4.21 화)",
    title: "구현 시작",
    mode: "online",
    desc: `Lovable로 화면 만들기
핵심 기능 구현 시작
디스코드 실시간 질의응답`,
  },
  {
    label: "DAY 5 (4.21 화)",
    title: "중간 체크인",
    mode: "online",
    desc: `진행 상황 디스코드 공유
막히는 것 실시간 질의응답`,
  },
  {
    label: "DAY 6-8 (4.22 수 ~ 4.24 금)",
    title: "구현 완료 + 배포",
    mode: "online",
    desc: `핵심 기능 마무리
Vercel 배포 완료
발표 자료 제출 (4.24 금 마감)`,
  },
  {
    label: "DAY 9 (4.25 토)",
    title: "성과 공유회 + 수료식",
    mode: "offline",
    desc: `1기 수강생 서비스 발표
질의응답 + 피드백
수료증 수여 + 단체사진`,
  },
];

const BENEFITS = [
  {
    icon: "🌐",
    title: "내 이름으로 된 AI 서비스가 생겨요",
    desc: "링크 하나로 누구에게나 공유할 수 있어요",
  },
  {
    icon: "🛠",
    title: "코딩 없이 앱을 만드는 방법을 알게 돼요",
    desc: "Lovable, Bolt 같은 툴로 혼자서도 만들 수 있어요",
  },
  {
    icon: "🧠",
    title: "머릿속 아이디어를 현실로 꺼내는 법을 배워요",
    desc: "기획부터 완성까지 한 사이클을 경험해요",
  },
  {
    icon: "👥",
    title: "같은 목표를 가진 동료들이 생겨요",
    desc: "수료 후에도 함께 만들고 피드백해요",
  },
];

const DIFFERENTIATORS = [
  {
    icon: "📅",
    title: "2주, 딱 필요한 만큼만",
    desc: "긴 강의 들을 시간 없어요.\n2주 안에 기획 → 구현 → 배포\n한 사이클을 끝냅니다.",
  },
  {
    icon: "🎯",
    title: "내 아이디어로 만들어요",
    desc: "정해진 예제 따라하기 NO.\n진단으로 찾은 내 아이디어를\n직접 만들어요.",
  },
  {
    icon: "👨‍👩‍👧",
    title: "혼자 하지 않아요",
    desc: "막히면 디스코드에서 바로 질문.\n같은 목표를 가진 동료들과\n함께 완주해요.",
  },
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
        a: "네, 전혀 몰라도 괜찮아요 😊\n코딩 없이 AI 툴만으로 만드는 방법을 알려드려요.",
      },
      {
        q: "2주가 너무 짧은 거 아닌가요?",
        a: "짧아서 오히려 좋아요!\n완성도보다 완주가 목표예요.\n2주 안에 기획 → 구현 → 배포를 한 번 경험하면\n그다음은 혼자서도 할 수 있어요.",
      },
      {
        q: "2주 안에 진짜 서비스가 만들어지나요?",
        a: "네, 실제로 링크가 생겨요 🔗\n핵심 기능 1개짜리 MVP를 목표로 해서\n주변에 공유할 수 있는 수준까지 만들어요.",
      },
      {
        q: "어떤 서비스를 만들게 되나요?",
        a: "정해진 주제 없어요!\n사전 진단 결과와 기획서를 통해\n본인만의 아이디어로 만들어요.",
      },
    ],
  },
  {
    title: "일정 및 참여",
    items: [
      {
        q: "오프라인 참석이 꼭 필요한가요?",
        a: "4.18(토) OT와 4.25(토) 성과공유회는 오프라인이에요.\n가능하면 참석을 권장드려요.\n불가피한 경우 개별 안내드릴게요.",
      },
      {
        q: "직장인도 병행할 수 있나요?",
        a: "충분히 가능해요 💪\n오프라인은 토요일만, 나머지는 자율 진행이에요.\n하루 1~2시간이면 충분해요.",
      },
      {
        q: "막히면 어떻게 하나요?",
        a: "디스코드에서 바로 질문하시면 돼요!\n운영진이 실시간으로 답변드려요.",
      },
    ],
  },
  {
    title: "툴 및 비용",
    items: [
      {
        q: "어떤 툴을 쓰나요?",
        a: "Lovable, Bolt 같은 바이브 코딩 툴과\nGitHub, Vercel을 사용해요.\n대부분 무료로 시작할 수 있어요.",
      },
      {
        q: "툴 비용이 따로 드나요?",
        a: "대부분 무료 플랜으로 가능해요.\n유료가 필요한 경우 월 2~3만원 수준이고\n비용 최소화 방법도 알려드려요.",
      },
    ],
  },
  {
    title: "수강료 및 신청",
    items: [
      {
        q: "얼리버드는 언제까지인가요?",
        a: "1기 오픈 전까지만이에요.\n지금 사전 신청하시면 99,000원 적용돼요 🎉",
      },
      {
        q: "환불되나요?",
        a: "개강 전 100% 환불 가능해요.\n개강 후에는 어려운 점 양해 부탁드려요.",
      },
      {
        q: "2기도 있나요?",
        a: "네, 1기 이후 2기 모집 예정이에요.\n얼리버드 가격은 1기에만 적용돼요.",
      },
    ],
  },
  {
    title: "수료 후",
    items: [
      {
        q: "수료 후 혼자서도 만들 수 있나요?",
        a: "그게 이 과정의 목표예요 🎯\n한 사이클을 경험하면\n혼자서도 만들 수 있는 힘이 생겨요.",
      },
      {
        q: "수료증이 나오나요?",
        a: "네! 4.25 성과공유회 당일 드려요.\n포트폴리오로도 활용할 수 있어요.",
      },
      {
        q: "수료 후에도 동료들과 연결되나요?",
        a: "디스코드 커뮤니티는 수료 후에도 유지돼요.\n계속 교류하고 피드백할 수 있어요 😊",
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

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            className="btnPrimary"
            type="button"
            onClick={scrollToForm}
            style={{ fontSize: 16 }}
          >
            무료로 사전 신청하기
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

      {/* ③ 2주 후 내 모습 */}
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
            2주 후 내 모습
          </h2>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {BENEFITS.map((b, i) => (
              <div key={i} className="benefitCard" style={{ flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="benefitIcon">{b.icon}</span>
                  <strong style={{ fontSize: 15, color: "var(--text)" }}>{b.title}</strong>
                </div>
                <span style={{ fontSize: 13, color: "var(--textSecondary)", paddingLeft: 34 }}>{b.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ④ 나도 코딩이 다른 이유 */}
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
            나도 코딩이 다른 이유
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {DIFFERENTIATORS.map((d, i) => (
              <div
                key={i}
                style={{
                  padding: "18px 20px",
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "#FFFFFF",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 8,
                  }}
                >
                  <span style={{ fontSize: 22 }}>{d.icon}</span>
                  <strong
                    style={{ fontSize: 15, color: "var(--text)" }}
                  >
                    {d.title}
                  </strong>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    color: "var(--textSecondary)",
                    lineHeight: 1.65,
                    whiteSpace: "pre-line",
                  }}
                >
                  {d.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ⑤ 2주 커리큘럼 */}
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
                <div className="timelineLabel">
                  {item.label}
                  <span
                    style={{
                      display: "inline-block",
                      marginLeft: 8,
                      padding: "2px 8px",
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 600,
                      background:
                        item.mode === "offline"
                          ? "var(--accent)"
                          : "var(--surface)",
                      color:
                        item.mode === "offline"
                          ? "#fff"
                          : "var(--textSecondary)",
                      border:
                        item.mode === "offline"
                          ? "none"
                          : "1px solid var(--border)",
                    }}
                  >
                    {item.mode === "offline" ? "오프라인" : "온라인"}
                  </span>
                </div>
                <div className="timelineTitle">{item.title}</div>
                <div className="timelineDesc">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ⑥ FAQ */}
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
                    <div className="faqAnswer" style={{ whiteSpace: "pre-line" }}>
                      {item.a}
                    </div>
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

      {/* ⑦ 사전 신청 폼 */}
      <section ref={formRef} className="greenCtaSection">
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            margin: "0 0 8px",
          }}
        >
          사전 무료 신청하기
        </h2>
        <p
          style={{
            margin: "0 0 4px",
            fontSize: 15,
            lineHeight: 1.6,
          }}
        >
          지금 신청해두시면 1기 오픈 시 가장 먼저 알려드려요
          <br />
          얼리버드 할인가 99,000원도 자동으로 적용돼요 🎉
        </p>
        <div
          style={{
            margin: "16px auto 20px",
            maxWidth: 380,
            padding: "12px 16px",
            borderRadius: 10,
            background: "rgba(255,255,255,0.15)",
            fontSize: 13,
            lineHeight: 1.6,
            textAlign: "center",
          }}
        >
          💡 지금은 결제가 필요 없어요
          <br />
          신청만 해두시면 오픈 알림 + 얼리버드 혜택이 자동 적용돼요
        </div>
        <div style={{ maxWidth: 400, margin: "0 auto" }}>
          <CtaForm onGreenBg />
        </div>
      </section>
    </main>
  );
}
