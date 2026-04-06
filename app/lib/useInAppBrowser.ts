"use client";

import { useEffect, useState } from "react";

/** 인스타·카카오·페이스북 인앱 등 (하단 네비가 fixed CTA를 가리는 환경) */
export function detectInAppBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return (
    ua.includes("Instagram") ||
    ua.includes("KAKAOTALK") ||
    ua.includes("FBAN") ||
    ua.includes("FBAV")
  );
}

export function useInAppBrowser(): boolean {
  const [inApp, setInApp] = useState(false);
  useEffect(() => {
    setInApp(detectInAppBrowser());
  }, []);
  return inApp;
}
