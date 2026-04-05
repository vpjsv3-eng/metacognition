"use client";

import { useEffect } from "react";

const VIEWPORT_CONTENT =
  "width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover";

/** 인앱 WebView에서도 viewport-fit=cover가 적용되도록 보강 */
export default function ViewportMeta() {
  useEffect(() => {
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "viewport");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", VIEWPORT_CONTENT);
  }, []);

  return null;
}
