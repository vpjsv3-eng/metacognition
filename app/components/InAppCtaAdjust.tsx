"use client";

import { useEffect } from "react";

/** 인스타·카카오 인앱에서 하단 CTA·본문 여백 보정 */
export default function InAppCtaAdjust() {
  useEffect(() => {
    const ua = navigator.userAgent;
    const isInstagram = ua.includes("Instagram");
    const isKakao = ua.includes("KAKAOTALK");

    if (isInstagram || isKakao) {
      const ctaBars = document.querySelectorAll(".sticky-cta-bar");
      ctaBars.forEach((bar) => {
        const el = bar as HTMLElement;
        el.style.paddingBottom = "24px";
        el.style.bottom = "0px";
        el.style.zIndex = "99999";
      });

      const containers = document.querySelectorAll(
        ".result-page, .nadocoding-page, .page-container",
      );
      containers.forEach((container) => {
        (container as HTMLElement).style.paddingBottom = "88px";
      });
    }
  }, []);

  return null;
}
