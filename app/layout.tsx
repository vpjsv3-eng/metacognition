import type { Metadata } from "next";
import type { ReactNode } from "react";
import UtmCapture from "./components/UtmCapture";
import ViewportMeta from "./components/ViewportMeta";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://metacognition-r6lc.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "나만의 AI 서비스 아이디어 무료 진단",
  description:
    "3분 진단으로 나에게 딱 맞는 AI 서비스 아이디어 5가지를 추천받으세요. 코딩 몰라도 괜찮아요.",
  openGraph: {
    title: "나만의 AI 서비스 아이디어 무료 진단",
    description:
      "아이디어도 코딩도 몰라도 괜찮아요. 3분이면 나만의 AI 서비스를 찾을 수 있어요.",
    url: siteUrl,
    siteName: "나도코딩",
    images: [
      {
        url: "/og",
        width: 1200,
        height: 630,
        alt: "나도코딩 AI 서비스 아이디어 진단",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "나만의 AI 서비스 아이디어 무료 진단",
    description:
      "아이디어도 코딩도 몰라도 괜찮아요. 3분이면 나만의 AI 서비스를 찾을 수 있어요.",
    images: [`${siteUrl}/og`],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" style={{ overscrollBehavior: "none" }}>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover"
        />
      </head>
      <body>
        <div id="__next">
          <UtmCapture />
          <ViewportMeta />
          {children}
        </div>
      </body>
    </html>
  );
}
