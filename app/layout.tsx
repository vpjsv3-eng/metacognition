import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "나만의 AI 서비스 아이디어 진단",
  description:
    "AI로 뭘 만들지 모르겠다면? 12문항으로 나에게 딱 맞는 AI 서비스 아이디어를 찾아드려요.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
