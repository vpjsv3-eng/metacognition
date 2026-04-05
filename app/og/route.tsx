import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  const [fontBold, fontRegular] = await Promise.all([
    fetch(
      "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-kr@5.2.9/files/noto-sans-kr-korean-700-normal.woff",
    ).then((res) => {
      if (!res.ok) throw new Error("font bold fetch failed");
      return res.arrayBuffer();
    }),
    fetch(
      "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-kr@5.2.9/files/noto-sans-kr-korean-400-normal.woff",
    ).then((res) => {
      if (!res.ok) throw new Error("font regular fetch failed");
      return res.arrayBuffer();
    }),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          padding: 80,
          background: "#FFFFFF",
          fontFamily: '"Noto Sans KR", system-ui, sans-serif',
        }}
      >
        <div
          style={{
            background: "#00C471",
            color: "white",
            fontSize: 28,
            fontWeight: 700,
            borderRadius: 100,
            padding: "12px 32px",
            marginBottom: 8,
          }}
        >
          AI 서비스 아이디어 무료 진단
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            color: "#111827",
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.3,
          }}
        >
          <span>나만의 AI 서비스 아이디어</span>
          <span>무료로 찾아드려요</span>
        </div>
        <div
          style={{
            color: "#6B7280",
            fontSize: 28,
            marginTop: 8,
            fontWeight: 400,
          }}
        >
          3분 진단 · 맞춤 아이디어 5가지 · 코딩 불필요
        </div>
        <div
          style={{
            color: "#00C471",
            fontSize: 32,
            fontWeight: 700,
            marginTop: 32,
          }}
        >
          나도코딩
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Noto Sans KR",
          data: fontBold,
          style: "normal",
          weight: 700,
        },
        {
          name: "Noto Sans KR",
          data: fontRegular,
          style: "normal",
          weight: 400,
        },
      ],
    },
  );
}
