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

/** 결과 페이지 CTA 왼쪽 라벨 */
export const resultCtaBarLabelInlineStyle: CSSProperties = {
  whiteSpace: "nowrap",
  fontSize: "13px",
  flexShrink: 0,
  color: "white",
};

/** 결과 페이지 CTA 오른쪽 버튼 */
export const resultCtaBarButtonInlineStyle: CSSProperties = {
  whiteSpace: "nowrap",
  fontSize: "13px",
  flexShrink: 0,
  padding: "8px 12px",
  backgroundColor: "#00C471",
  color: "white",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
};
