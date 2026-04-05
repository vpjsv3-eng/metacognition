"use client";

import { useEffect } from "react";

/** 인스타·카카오·페이스북 인앱에서 하단 CTA·본문 여백 보정 */
export default function InAppCtaAdjust() {
  useEffect(() => {
    const ua = navigator.userAgent;
    const isInApp =
      ua.includes("Instagram") ||
      ua.includes("KAKAOTALK") ||
      ua.includes("FBAN") ||
      ua.includes("FBAV");

    if (!isInApp) return;

    /* CTA 바는 React 인라인 스타일로 고정 — 여기서 덮어쓰지 않음 */
    document.body.style.paddingBottom = "80px";

    return () => {
      document.body.style.paddingBottom = "";
    };
  }, []);

  return null;
}
