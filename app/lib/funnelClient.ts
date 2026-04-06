import {
  safeSessionStorageGet,
  safeSessionStorageSet,
} from "./safeStorage";

export const FUNNEL_SESSION_KEY = "funnelSessionId";
export const FUNNEL_CURRENT_STEP_KEY = "funnelCurrentStep";

/** 설문 퍼널 세션 ID (sessionStorage) */
export function initFunnelSession(): string {
  let id = safeSessionStorageGet(FUNNEL_SESSION_KEY);
  if (!id) {
    id = Math.random().toString(36).slice(2, 11);
    safeSessionStorageSet(FUNNEL_SESSION_KEY, id);
  }
  return id;
}

export function setFunnelCurrentStep(step: string): void {
  safeSessionStorageSet(FUNNEL_CURRENT_STEP_KEY, step);
}

/** 퍼널 이벤트 전송 (실패는 무시) */
export function logFunnel(
  step: string,
  action: string,
  options?: { beacon?: boolean },
): void {
  const sessionId = safeSessionStorageGet(FUNNEL_SESSION_KEY);
  if (!sessionId) return;
  const body = JSON.stringify({ sessionId, step, action });

  if (
    options?.beacon &&
    typeof navigator !== "undefined" &&
    navigator.sendBeacon
  ) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/funnel", blob);
    return;
  }

  void fetch("/api/funnel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}
