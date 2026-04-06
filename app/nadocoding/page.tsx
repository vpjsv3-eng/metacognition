"use client";

import { useRef, useState, useEffect } from "react";
import CtaForm from "../components/CtaForm";
import InstagramStickyCtaOffset from "../components/InstagramStickyCtaOffset";
import { bottomFixedCtaBarStyle } from "../lib/fixedCtaBarStyle";
import { useBlockHorizontalTouchScroll } from "../lib/useBlockHorizontalTouchScroll";

type CurriculumAccordionItem = {
  mainBadge: { text: string; variant: "outside" | "day" };
  title: string;
  subBadge: { text: string; variant: "offline" | "online" | "session" };
  detail: string;
};

const CURRICULUM_ACCORDION: CurriculumAccordionItem[] = [
  {
    mainBadge: { text: "과정 외 준비", variant: "outside" },
    title: "4.13 월 ~ 4.17 금 | 사전 준비",
    subBadge: { text: "온라인", variant: "online" },
    detail: `· 사전 VOD 3편 시청
  - AI 시대에 왜 직접 만들어야 하는가 (15분)
  - 바이브 코딩이란? Lovable / Bolt 소개 (15분)
  - AI 프롬프트 잘 쓰는 법 기초 (15분)
· Lovable / GitHub / Vercel 회원가입 + 툴 세팅
· 진단 결과 참고해서 만들고 싶은
  서비스 아이디어 3가지 제출`,
  },
  {
    mainBadge: { text: "DAY 1", variant: "day" },
    title: "4.18 토 | 개강 OT",
    subBadge: { text: "오프라인", variant: "offline" },
    detail: `· OT + 자기소개
· 클론 바이브 코딩 실습 (첫 배포 경험)
· 기획안 템플릿 배포 + 작성 시작`,
  },
  {
    mainBadge: { text: "DAY 2-3", variant: "day" },
    title: "4.19 일 ~ 4.20 월 | 기획안 작성",
    subBadge: { text: "온라인", variant: "online" },
    detail: `· 기획안 템플릿 완성 + 제출
· 강사 개별 피드백 제공
· 디스코드 질문 → 강사 답변`,
  },
  {
    mainBadge: { text: "DAY 4", variant: "day" },
    title: "4.22 수 오후 8~10시 | 기획안 중간 점검",
    subBadge: { text: "온라인 세션", variant: "session" },
    detail: `· 기획안 피드백 반영 확인
· 구현 방향 확정
· 막히는 것 실시간 해결
· 세션 종료 후 구현 시작`,
  },
  {
    mainBadge: { text: "DAY 5-9", variant: "day" },
    title: "4.23 목 ~ 4.27 월 | 구현 + 배포",
    subBadge: { text: "온라인", variant: "online" },
    detail: `· Lovable / Bolt로 서비스 구현
· 디스코드 질문 → 강사 실시간 답변
· 4.26 일 오후 2~4시
  서비스 중간 점검 온라인 세션
  (진행 상황 공유 + 피드백 + 방향 수정)`,
  },
  {
    mainBadge: { text: "DAY 10-12", variant: "day" },
    title: "4.28 화 ~ 4.30 목 | 서비스 완성",
    subBadge: { text: "온라인", variant: "online" },
    detail: `· 핵심 기능 마무리
· Vercel 최종 배포 완료
· 5.1 금 발표 자료 제출 마감`,
  },
  {
    mainBadge: { text: "DAY 13", variant: "day" },
    title: "5.2 토 | 성과 공유회 + 수료식",
    subBadge: { text: "오프라인", variant: "offline" },
    detail: `· 수강생 서비스 발표 (인당 5분)
· 질의응답 + 피드백
· 수료증 수여 + 단체사진`,
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

const SERVICE_EXAMPLES = [
  {
    emoji: "📰",
    name: "AI 뉴스 큐레이터",
    desc: "매일 아침 관심 분야 뉴스를\nAI가 요약해서 보내주는 앱",
    tags: ["#직장인", "#정보수집"],
  },
  {
    emoji: "✍️",
    name: "유튜브 스크립트 생성기",
    desc: "주제만 입력하면 AI가\n영상 스크립트를 써주는 도구",
    tags: ["#크리에이터", "#콘텐츠"],
  },
  {
    emoji: "🍽️",
    name: "식단 분석 챗봇",
    desc: "오늘 먹은 것을 입력하면\n영양 분석과 추천을 해주는 앱",
    tags: ["#건강", "#라이프스타일"],
  },
  {
    emoji: "📧",
    name: "비즈니스 이메일 작성기",
    desc: "상황만 입력하면 깔끔한\n업무 이메일을 자동 생성",
    tags: ["#직장인", "#업무자동화"],
  },
  {
    emoji: "👶",
    name: "육아 일기 자동 정리",
    desc: "오늘 있었던 일을 입력하면\n예쁜 육아 일기로 정리해주는 앱",
    tags: ["#부모", "#육아"],
  },
];

const REVIEWS = [
  {
    name: "김O진 · 직장인",
    text: "솔직히 처음엔 2주 만에 뭘 만들겠어 싶었어요. 근데 OT 날 처음으로 배포 성공하고 나서 생각이 완전히 바뀌었어요. 나도 할 수 있구나 싶었어요.",
  },
  {
    name: "박O현 · 프리랜서",
    text: "AI 툴은 써봤는데 뭘 만들어야 할지 몰라서 항상 멈췄거든요. 진단으로 내 아이디어를 찾고 그걸 직접 만들었을 때 짜릿했어요.",
  },
  {
    name: "이O은 · 취업 준비생",
    text: "포트폴리오가 없어서 고민이었는데 2주 만에 실제 배포된 서비스가 생겼어요. 면접에서도 이걸 보여줄 수 있을 것 같아요.",
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
        a: "네, 실제로 링크가 생겨요 🔗\n4.18 개강부터 5.2 수료까지\n기획 → 구현 → 배포 한 사이클을\n완성해드려요.",
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
        a: "4.18(토) OT와 5.2(토) 성과공유회는 오프라인이에요.\n가능하면 참석을 권장드려요.\n불가피한 경우 개별 안내드릴게요.",
      },
      {
        q: "직장인도 병행할 수 있나요?",
        a: "충분히 가능해요 💪\n오프라인은 토요일만, 나머지는 자율 진행이에요.\n하루 1~2시간이면 충분해요.",
      },
      {
        q: "막히면 어떻게 하나요?",
        a: "디스코드에서 바로 질문하시면 돼요!\n강사가 실시간으로 답변드려요.",
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
        a: "네! 5.2 성과공유회 당일 드려요.\n포트폴리오로도 활용할 수 있어요.",
      },
      {
        q: "수료 후에도 동료들과 연결되나요?",
        a: "디스코드 커뮤니티는 수료 후에도 유지돼요.\n계속 교류하고 피드백할 수 있어요 😊",
      },
    ],
  },
];

/** 히어로 얼리버드 카운트다운: 마운트 시점 기준 23시간, 종료 후 "마감됐어요" */
function useHeroDeadlineCountdown() {
  const deadlineRef = useRef<number | null>(null);
  if (deadlineRef.current === null) {
    const d = new Date();
    d.setHours(d.getHours() + 23);
    deadlineRef.current = d.getTime();
  }

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = deadlineRef.current - now;
  if (diff <= 0) return { expired: true as const };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { expired: false as const, days, hours, minutes, seconds };
}

export default function NadocodingPage() {
  const formRef = useRef<HTMLDivElement>(null);
  const [openFaq, setOpenFaq] = useState<Set<number>>(new Set());
  const [openCurriculum, setOpenCurriculum] = useState<Set<number>>(new Set());
  const [showScrollTop, setShowScrollTop] = useState(false);

  const countdown = useHeroDeadlineCountdown();

  useBlockHorizontalTouchScroll();

  useEffect(() => {
    function handleScroll() {
      setShowScrollTop(window.scrollY > 300);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function toggleFaq(idx: number) {
    setOpenFaq((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  function toggleCurriculum(idx: number) {
    setOpenCurriculum((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  let faqFlatIdx = 0;

  return (
    <main
      className="container page-container nadocodingPageWithBottomCta nadocoding-container nadocoding-page"
      style={{
        maxWidth: "min(600px, 100%)",
        width: "100%",
        paddingBottom: "70px",
      }}
    >
      <InstagramStickyCtaOffset />
      {showScrollTop && (
        <button
          type="button"
          className="scrollToTopBtn"
          aria-label="맨 위로"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          ↑
        </button>
      )}

      {/* ① 히어로 섹션 */}
      <section className="nadocodingHero nadocoding-hero">
        <div
          style={{
            display: "inline-block",
            padding: "12px 24px",
            borderRadius: 100,
            background: "#00C471",
            color: "#ffffff",
            fontSize: 16,
            fontWeight: 700,
            marginBottom: 0,
            boxShadow: "0 4px 12px rgba(0, 196, 113, 0.4)",
          }}
        >
          나도 코딩 올인원 부트캠프 1기 모집
        </div>
        <p className="nadocodingHeroDate date">4월 18일 (토) ~ 5월 2일 (토)</p>

        <h1 className="nadocodingHeroTitle">
          아이디어 발굴부터
          <br />
          <span className="nadocodingHeroTitleEm">실제 서비스 배포까지</span>
        </h1>
        <p className="nadocodingHeroSubtitle subtitle">
          ✦ 코딩 없이 2주 완성 올인원 과정 ✦
        </p>

        {/* 4개 박스 */}
        <div
          className="hero-stats-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 12,
            marginBottom: 28,
            width: "100%",
            maxWidth: "100%",
          }}
        >
          {[
            {
              kw: "2주",
              label: "기획→구현→배포\n한 사이클 완성",
              kwColor: "var(--accent)" as const,
            },
            {
              kw: "검증된",
              label: "현직 AI 전문가가\n직접 가르쳐요",
              kwColor: "#00C471" as const,
              kwFontSize: 24,
              descFontSize: 13,
              descColor: "#374151",
            },
            {
              kw: "온+오프",
              label: "온·오프라인\n완벽 밀착 관리",
              kwColor: "var(--accent)" as const,
            },
            {
              kw: "전액 환불",
              label: (
                <>
                  배포 못하면
                  <br />
                  <span style={{ color: "#EF4444", fontWeight: 700 }}>100%</span>{" "}
                  환불 보장
                </>
              ),
              kwColor: "#00C471" as const,
            },
          ].map((item, i) => (
            <div key={i} className="heroStatBox" style={{ textAlign: "center", minWidth: 0, maxWidth: "100%" }}>
              <div
                className="stat-number"
                style={{
                  fontSize: (item as { kwFontSize?: number }).kwFontSize ?? 18,
                  fontWeight: 800,
                  color: item.kwColor,
                }}
              >
                {item.kw}
              </div>
              <div
                className="stat-desc"
                style={{
                  fontSize: (item as { descFontSize?: number }).descFontSize ?? 11,
                  color:
                    (item as { descColor?: string }).descColor ??
                    "var(--textSecondary)",
                  marginTop: 6,
                  lineHeight: 1.45,
                  ...(typeof item.label === "string"
                    ? { whiteSpace: "pre-line" as const }
                    : {}),
                }}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* 카운트다운 (페이지 진입 시점 +23시간) */}
        <div className="countdownTimer countdown-text" style={{ marginBottom: 20, maxWidth: "100%" }}>
          {countdown.expired
            ? "⏰ 마감됐어요"
            : `⏰ 얼리버드 마감까지 ${countdown.days}일${String(countdown.hours).padStart(2, "0")}시간${String(countdown.minutes).padStart(2, "0")}분${String(countdown.seconds).padStart(2, "0")}초`}
        </div>

        {/* 가격 */}
        <div style={{ margin: "0 0 20px" }}>
          <span className="priceOriginal">299,000원</span>
          <span className="priceEarlybird price-early">99,000원</span>
          <p
            className="price-save"
            style={{
              margin: "6px 0 0",
              fontSize: 14,
              fontWeight: 600,
              color: "#EF4444",
            }}
          >
            지금 신청하면 200,000원 절약
          </p>
        </div>

        <button
          className="btnPrimary"
          type="button"
          onClick={scrollToForm}
          style={{ fontSize: 16 }}
        >
          지금 얼리버드 신청하기
        </button>
      </section>

      {/* ② 공감 훅 (히어로 직후) */}
      <section style={{ marginBottom: 24 }}>
        <div className="card" style={{ padding: 28 }}>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              margin: "0 0 20px",
              textAlign: "center",
              color: "var(--text)",
            }}
          >
            혹시 이런 생각 해본 적 있나요?
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              "ChatGPT로 뭔가 만들어보고 싶은데\n뭘 만들어야 할지 모르겠어",
              "AI 서비스 만드는 건 개발자만\n할 수 있는 거 아닌가?",
              "아이디어는 있는데 구현을\n못하니까 그냥 포기했어",
              "AI 뭔가 해야 할 것 같은데\n어디서 시작해야 할지 모르겠어",
            ].map((text, i) => (
              <div
                key={i}
                className="hook-item"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  fontSize: 15,
                  color: "var(--text)",
                  lineHeight: 1.6,
                  maxWidth: "100%",
                  minWidth: 0,
                }}
              >
                <span style={{ color: "var(--accent)", fontWeight: 700, flexShrink: 0 }}>✓</span>
                <span style={{ whiteSpace: "pre-line" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ③ AI 시대 — VS */}
      <section style={{ marginBottom: 24, maxWidth: "100%" }}>
        <div
          style={{
            background: "linear-gradient(135deg, #E8FAF2 0%, #F0FDF4 100%)",
            borderRadius: 20,
            padding: "40px 24px",
            maxWidth: "100%",
            boxSizing: "border-box",
          }}
        >
          <h2
            style={{
              margin: "0 0 24px",
              textAlign: "center",
              lineHeight: 1.35,
              letterSpacing: -0.4,
            }}
          >
            <span
              style={{
                display: "block",
                fontSize: 18,
                fontWeight: 700,
                color: "#111827",
                marginBottom: 4,
              }}
            >
              AI 시대,
            </span>
            <span
              style={{
                display: "block",
                fontSize: 36,
                fontWeight: 800,
                color: "#111827",
              }}
            >
              <span style={{ color: "#00C471" }}>만드는 사람</span>이 됩니다
            </span>
          </h2>
          <div className="nadocodingVsRow">
            <div
              className="vs-card nadocodingVsCard"
              style={{
                background: "#F9FAFB",
                border: "1px solid #E5E7EB",
                opacity: 0.9,
              }}
            >
              <div className="nadocodingVsCardTitle">😰 AI를 쓰는 사람</div>
              <ul className="nadocodingVsBulletList">
                <li className="nadocodingVsBulletItem">남이 만든 서비스 사용</li>
                <li className="nadocodingVsBulletItem">트렌드를 따라가기 바쁜 사람</li>
              </ul>
            </div>
            <div className="nadocodingVsDivider">VS</div>
            <div
              className="vs-card nadocodingVsCard nadocodingVsCard--emphasis"
              style={{
                background: "#FFFFFF",
                border: "2px solid #00C471",
                boxShadow: "0 4px 12px rgba(0, 196, 113, 0.2)",
              }}
            >
              <div className="nadocodingVsCardTitle">🚀 AI로 만드는 사람</div>
              <ul className="nadocodingVsBulletList">
                <li className="nadocodingVsBulletItem nadocodingVsBulletItem--emphasis">
                  직접 서비스를 만드는 사람
                </li>
                <li className="nadocodingVsBulletItem nadocodingVsBulletItem--emphasis">
                  트렌드를 이끄는 사람
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ④ 대상 안내 */}
      <section style={{ marginBottom: 24 }}>
        <div className="card" style={{ padding: 28 }}>
          <p
            style={{
              margin: "0 0 20px",
              textAlign: "center",
              fontSize: 15,
              fontWeight: 600,
              color: "var(--text)",
              lineHeight: 1.6,
            }}
          >
            이 중 하나라도 해당된다면
            <br />
            나도코딩 1기가 딱 맞아요 👇
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { icon: "🤔", text: "AI에 관심은 있지만\n뭘 만들어야 할지 모르는 분" },
              { icon: "💻", text: "코딩을 전혀 몰라도\n내 서비스를 만들고 싶은 분" },
              { icon: "🚀", text: "2주 안에 배포된\n내 AI 서비스를 갖고 싶은 분" },
            ].map((item, i) => (
              <div key={i} className="targetCard">
                <span className="targetIcon">{item.icon}</span>
                <span style={{ whiteSpace: "pre-line" }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ⑤ 수강생이 만들게 될 서비스 예시 */}
      <section style={{ marginBottom: 24 }}>
        <div className="card" style={{ padding: 28 }}>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              margin: "0 0 4px",
              textAlign: "center",
              color: "var(--text)",
            }}
          >
            이런 서비스를 직접 만들게 돼요
          </h2>
          <p
            style={{
              margin: "0 0 20px",
              textAlign: "center",
              fontSize: 13,
              color: "var(--textSecondary)",
            }}
          >
            코딩 없이, 바이브 코딩 툴로만 만든 실제 예시
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {SERVICE_EXAMPLES.map((ex, i) => (
              <div key={i} className="cardPlainInner">
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 24 }}>{ex.emoji}</span>
                  <strong className="example-title" style={{ fontSize: 15, color: "var(--text)" }}>{ex.name}</strong>
                </div>
                <p
                  className="example-desc"
                  style={{
                    margin: "0 0 10px",
                    fontSize: 14,
                    color: "var(--textSecondary)",
                    lineHeight: 1.6,
                    whiteSpace: "pre-line",
                  }}
                >
                  {ex.desc}
                </p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {ex.tags.map((tag) => (
                    <span
                      key={tag}
                      className="example-tag"
                      style={{
                        padding: "3px 10px",
                        borderRadius: 999,
                        background: "var(--accentSoft)",
                        color: "var(--accent)",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ⑥ 2주 후 내 모습 */}
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
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {BENEFITS.map((b, i) => (
              <div key={i} className="benefitCard" style={{ flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="benefitIcon">{b.icon}</span>
                  <strong className="after-title" style={{ fontSize: 15, color: "var(--text)" }}>{b.title}</strong>
                </div>
                <span className="after-desc" style={{ fontSize: 13, color: "var(--textSecondary)", paddingLeft: 34 }}>{b.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ⑦ 나도코딩이 다른 이유 */}
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
              <div key={i} className="cardPlainInner">
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 22 }}>{d.icon}</span>
                  <strong style={{ fontSize: 15, color: "var(--text)" }}>{d.title}</strong>
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

      {/* ⑧ 강사 소개 */}
      <section style={{ marginBottom: 24 }}>
        <div className="card" style={{ padding: 28 }}>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              margin: "0 0 20px",
              textAlign: "center",
              color: "var(--text)",
            }}
          >
            검증된 전문가와 함께해요
          </h2>

          {/* 메인 강사 */}
          <div
            className="cardPlainInner"
            style={{ marginBottom: 12, textAlign: "center", padding: "24px 20px", borderRadius: 14 }}
          >
            <div
              className="instructor-avatar-main"
              style={{
                width: "min(100px, 100%)",
                height: "min(100px, 100%)",
                maxWidth: "100%",
                aspectRatio: "1",
                borderRadius: "50%",
                background: "#1F2937",
                margin: "0 auto 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 50,
                  background: "#4B5563",
                  borderRadius: "50% 50% 0 0",
                  position: "absolute",
                  bottom: 10,
                }}
              />
              <div
                style={{
                  width: 30,
                  height: 30,
                  background: "#6B7280",
                  borderRadius: "50%",
                  position: "absolute",
                  top: 20,
                }}
              />
              <span
                style={{
                  position: "absolute",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "white",
                  bottom: 8,
                  background: "rgba(0,0,0,0.5)",
                  padding: "2px 10px",
                  borderRadius: 999,
                }}
              >
                🔒 곧 공개됩니다
              </span>
            </div>
            <strong className="instructor-name" style={{ fontSize: 16, color: "var(--text)", display: "block", marginBottom: 6 }}>
              메인 강사 (공개 예정)
            </strong>
            <span
              className="instructor-role"
              style={{
                display: "inline-block",
                padding: "4px 12px",
                borderRadius: 999,
                background: "var(--accentSoft)",
                color: "var(--accent)",
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 12,
              }}
            >
              검증된 현직 AI 개발자
            </span>
            <div className="instructor-bio" style={{ fontSize: 14, color: "var(--textSecondary)", lineHeight: 1.8, textAlign: "left", paddingLeft: 20 }}>
              · 국내 AI 앱 3개 직접 런칭
              <br />
              · 실무 중심 커리큘럼 설계
              <br />
              · 현직 AI 서비스 기획 및 개발
            </div>
          </div>

          {/* 보조 강사 */}
          <div
            className="cardPlainInner"
            style={{ textAlign: "center", padding: "24px 20px", borderRadius: 14 }}
          >
            <div
              className="instructor-avatar-sub"
              style={{
                width: "min(80px, 100%)",
                height: "min(80px, 100%)",
                maxWidth: "100%",
                aspectRatio: "1",
                borderRadius: "50%",
                background: "var(--accent)",
                margin: "0 auto 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                fontWeight: 800,
                color: "white",
              }}
            >
              J
            </div>
            <strong className="instructor-name" style={{ fontSize: 16, color: "var(--text)", display: "block", marginBottom: 6 }}>
              제이 (J)
            </strong>
            <span
              className="instructor-role"
              style={{
                display: "inline-block",
                padding: "4px 12px",
                borderRadius: 999,
                background: "var(--accentSoft)",
                color: "var(--accent)",
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 12,
              }}
            >
              나도코딩 1기 총괄
            </span>
            <div className="instructor-bio" style={{ fontSize: 14, color: "var(--textSecondary)", lineHeight: 1.8, textAlign: "left", paddingLeft: 20 }}>
              · 전) 교육 기획 & 운영 전문가
              <br />
              · 커리큘럼 설계 및 수강생 관리 담당
              <br />
              · 아이디어 발굴 → 배포 전 과정 퍼실리테이터
            </div>
          </div>
        </div>
      </section>

      {/* ⑨ 수강 후기 */}
      <section style={{ marginBottom: 24 }}>
        <div className="card" style={{ padding: 28 }}>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              margin: "0 0 4px",
              textAlign: "center",
              color: "var(--text)",
            }}
          >
            먼저 경험해본 분들의 이야기
          </h2>
          <p
            style={{
              margin: "0 0 20px",
              textAlign: "center",
              fontSize: 13,
              color: "var(--textSecondary)",
            }}
          >
            베타 테스터 후기
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {REVIEWS.map((review, i) => (
              <div key={i} className="cardPlainInner" style={{ padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <strong className="review-name" style={{ fontSize: 14, color: "var(--text)" }}>{review.name}</strong>
                  <span style={{ fontSize: 14, letterSpacing: 2 }}>⭐⭐⭐⭐⭐</span>
                </div>
                <p
                  className="review-text"
                  style={{
                    margin: 0,
                    fontSize: 14,
                    color: "var(--textSecondary)",
                    lineHeight: 1.7,
                  }}
                >
                  &ldquo;{review.text}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ⑩ 2주 커리큘럼 */}
      <section style={{ marginBottom: 24 }}>
        <div className="card" style={{ padding: 28 }}>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              margin: "0 0 4px",
              textAlign: "center",
              color: "var(--text)",
            }}
          >
            2주 커리큘럼
          </h2>
          <p
            style={{
              margin: "0 0 20px",
              textAlign: "center",
              fontSize: 13,
              color: "var(--textSecondary)",
              lineHeight: 1.5,
            }}
          >
            사전 준비부터 수료까지
          </p>
          <div>
            {CURRICULUM_ACCORDION.map((item, i) => {
              const isOpen = openCurriculum.has(i);
              const subClass =
                item.subBadge.variant === "offline"
                  ? "nadocodingCurriculumSubBadge--offline"
                  : item.subBadge.variant === "session"
                    ? "nadocodingCurriculumSubBadge--session"
                    : "nadocodingCurriculumSubBadge--online";
              const mainClass =
                item.mainBadge.variant === "outside"
                  ? "nadocodingCurriculumMainBadge--outside"
                  : "nadocodingCurriculumMainBadge--day";
              return (
                <div
                  key={i}
                  className={`nadocodingCurriculumCard${isOpen ? " nadocodingCurriculumCard--open" : ""}`}
                >
                  <div className="nadocodingCurriculumCardHead">
                    <button
                      type="button"
                      className="nadocodingCurriculumToggle"
                      onClick={() => toggleCurriculum(i)}
                      aria-expanded={isOpen}
                    >
                      {isOpen ? "접기 ▲" : "자세히 보기 ▼"}
                    </button>
                    <div className="nadocodingCurriculumBadgeRow">
                      <span className={`nadocodingCurriculumMainBadge ${mainClass}`}>
                        {item.mainBadge.text}
                      </span>
                      <span className={`nadocodingCurriculumSubBadge ${subClass}`}>
                        {item.subBadge.text}
                      </span>
                    </div>
                    <div className="nadocodingCurriculumTitle">{item.title}</div>
                  </div>
                  {isOpen ? (
                    <div className="nadocodingCurriculumDetail">{item.detail}</div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ⑪ FAQ */}
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
                  <div className="faqQuestion faq-question" onClick={() => toggleFaq(idx)}>
                    <span>Q. {item.q}</span>
                    <span className="faqArrow" data-open={isOpen ? "true" : "false"}>
                      ▼
                    </span>
                  </div>
                  {isOpen && (
                    <div className="faqAnswer faq-answer" style={{ whiteSpace: "pre-line" }}>
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

      {/* ⑫ 최하단 신청 폼 */}
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
            margin: "0 0 16px",
            fontSize: 14,
            fontWeight: 700,
            color: "#FDE68A",
          }}
        >
          ⚠️ 선착순 10명 마감 시 조기 종료
        </p>

        <div style={{ margin: "12px 0 16px", textAlign: "center" }}>
          <span className="priceOriginal" style={{ color: "rgba(255,255,255,0.6)" }}>
            299,000원
          </span>
          <span
            className="price-early"
            style={{
              display: "inline-block",
              fontSize: 28,
              fontWeight: 800,
              color: "#EF4444",
              background: "white",
              padding: "4px 16px",
              borderRadius: 8,
            }}
          >
            99,000원
          </span>
        </div>

        <div className="nadocoding-form-wrap" style={{ maxWidth: "min(400px, 100%)", width: "100%", margin: "0 auto" }}>
          <CtaForm onGreenBg source="nadocoding_page" />
        </div>
      </section>

      <div
        className="nadocodingFixedCtaBar sticky-bar sticky-cta-bar"
        role="navigation"
        aria-label="사전 신청"
        style={bottomFixedCtaBarStyle}
      >
        <span className="nadocodingFixedCtaBarLabel">🔥 얼리버드 마감 D-1</span>
        <button type="button" className="nadocodingFixedCtaBarBtn" onClick={scrollToForm}>
          무료로 사전 신청하기 →
        </button>
      </div>
    </main>
  );
}
