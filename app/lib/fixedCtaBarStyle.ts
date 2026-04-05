import type { CSSProperties } from "react";

/** 하단 고정 CTA 컨테이너 — 결과·상세 공통 */
export const fixedCtaBarInlineStyle: CSSProperties = {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 999999,
  backgroundColor: "#111827",
  paddingTop: "8px",
  paddingBottom: "8px",
  paddingLeft: "12px",
  paddingRight: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "8px",
  minHeight: "48px",
  height: "auto",
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
