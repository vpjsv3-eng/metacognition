import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "메타인지 진단",
  description: "나이/직업/관심사 입력 후 20문항 메타인지 5점 척도 설문을 진행합니다.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        {children}
      </body>
    </html>
  );
}

