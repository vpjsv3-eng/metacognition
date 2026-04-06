import type { CSSProperties } from "react";

/** 하단 고정 CTA 바 — 결과·상세 공통 (인라인으로 그대로 전달) */
export const bottomFixedCtaBarStyle: CSSProperties = {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 99999,
  backgroundColor: "#111827",
  padding: "10px 12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "8px",
};
