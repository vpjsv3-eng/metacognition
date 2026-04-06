"use client";

import { useEffect } from "react";

/** 인스타 인앱 하단 네비 높이만큼 `.sticky-cta-bar`의 bottom을 올림 */
export default function InstagramStickyCtaOffset() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const ua = navigator.userAgent;
    const isInstagram = ua.includes("Instagram");
    if (!isInstagram) return;

    const updateCTA = () => {
      const ctaBars = document.querySelectorAll(".sticky-cta-bar");
      const viewportHeight =
        window.visualViewport?.height ?? window.innerHeight;
      const windowHeight = window.innerHeight;
      const offset = windowHeight - viewportHeight;

      ctaBars.forEach((bar) => {
        (bar as HTMLElement).style.bottom = `${Math.max(offset, 0)}px`;
      });
    };

    updateCTA();

    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener("resize", updateCTA);
      vv.addEventListener("scroll", updateCTA);
    }
    window.addEventListener("resize", updateCTA);

    return () => {
      if (vv) {
        vv.removeEventListener("resize", updateCTA);
        vv.removeEventListener("scroll", updateCTA);
      }
      window.removeEventListener("resize", updateCTA);
      document.querySelectorAll(".sticky-cta-bar").forEach((bar) => {
        (bar as HTMLElement).style.removeProperty("bottom");
      });
    };
  }, []);

  return null;
}
