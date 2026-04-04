"use client";

import { useEffect, useState } from "react";

function isInAppBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return (
    ua.includes("KAKAOTALK") ||
    ua.includes("Instagram") ||
    ua.includes("FBAN") ||
    ua.includes("FBAV") ||
    ua.includes("Line") ||
    ua.includes("NAVER")
  );
}

function openInChrome() {
  const url = window.location.href;
  const ua = navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/i.test(ua);

  if (isIOS) {
    window.location.href = url;
    return;
  }

  if (ua.includes("Android")) {
    const path = url.replace(/^https?:\/\//, "");
    window.open(
      `intent://${path}#Intent;scheme=https;package=com.android.chrome;end`,
      "_blank",
    );
    return;
  }

  window.open(url, "_blank");
}

export default function InAppBrowserBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(isInAppBrowser());
  }, []);

  if (!show) return null;

  return (
    <div
      role="region"
      aria-label="브라우저 안내"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
        padding: "10px 16px",
        background: "#FFF3CD",
        borderBottom: "1px solid #FFE69C",
        fontSize: 14,
        color: "#664d03",
        lineHeight: 1.5,
      }}
    >
      <span style={{ flex: "1 1 200px", minWidth: 0 }}>
        원활한 이용을 위해 크롬에서 열어주세요 🙏
      </span>
      <button
        type="button"
        onClick={openInChrome}
        style={{
          flexShrink: 0,
          padding: "8px 14px",
          borderRadius: 8,
          border: "1px solid #856404",
          background: "#fff",
          color: "#664d03",
          fontSize: 13,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        크롬으로 열기
      </button>
    </div>
  );
}
