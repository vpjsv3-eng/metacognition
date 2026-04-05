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

    const ctaBars = document.querySelectorAll(".sticky-cta-bar");
    ctaBars.forEach((bar) => {
      const el = bar as HTMLElement;
      el.style.boxSizing = "border-box";
      el.style.bottom = "12px";
      el.style.paddingBottom = "44px";
      el.style.minHeight = "80px";
      el.style.zIndex = "99999";
    });

    document.body.style.paddingBottom = "140px";

    return () => {
      document.body.style.paddingBottom = "";
      ctaBars.forEach((bar) => {
        const el = bar as HTMLElement;
        el.style.removeProperty("box-sizing");
        el.style.removeProperty("bottom");
        el.style.removeProperty("padding-bottom");
        el.style.removeProperty("min-height");
        el.style.removeProperty("z-index");
      });
    };
  }, []);

  return null;
}
