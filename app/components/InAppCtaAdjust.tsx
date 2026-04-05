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
      el.style.paddingTop = "10px";
      el.style.paddingBottom = "10px";
      el.style.minHeight = "56px";
    });

    document.body.style.paddingBottom = "76px";

    return () => {
      document.body.style.paddingBottom = "";
      ctaBars.forEach((bar) => {
        const el = bar as HTMLElement;
        el.style.removeProperty("padding-top");
        el.style.removeProperty("padding-bottom");
        el.style.removeProperty("min-height");
      });
    };
  }, []);

  return null;
}
