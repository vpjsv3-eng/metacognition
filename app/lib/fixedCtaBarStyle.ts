import type { CSSProperties } from "react";

/** 하단 고정 CTA — 클래스보다 우선하도록 인라인으로 병합 */
export const fixedCtaBarInlineStyle: CSSProperties = {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 999999,
  backgroundColor: "#111827",
  paddingTop: "12px",
  paddingBottom: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  paddingLeft: "16px",
  paddingRight: "16px",
};
