import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import UtmCapture from "./components/UtmCapture";
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
        url: "/og-image.png",
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
    images: [`${siteUrl}/og-image.png`],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" style={{ overscrollBehavior: "none" }}>
      <body>
        <div id="__next">
          <UtmCapture />
          {children}
        </div>
      </body>
    </html>
  );
}
