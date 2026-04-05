/** sessionStorage 키 — 광고 UTM 유입 추적 */
export const UTM_SESSION_KEY = "utm";

export type UtmData = {
  source: string;
  medium: string;
  campaign: string;
};

function pickParam(
  fromUrl: string | null,
  previous: string | undefined,
  fallback: string,
): string {
  if (fromUrl !== null && fromUrl !== "") return fromUrl;
  if (previous !== undefined && previous !== "") return previous;
  return fallback;
}

/** 클라이언트: URL + 기존 세션을 합쳐 sessionStorage에 저장 (첫 유입 UTM 유지) */
export function captureUtmToSession(): void {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    let prev: Partial<UtmData> = {};
    const raw = sessionStorage.getItem(UTM_SESSION_KEY);
    if (raw) {
      try {
        prev = JSON.parse(raw) as Partial<UtmData>;
      } catch {
        prev = {};
      }
    }

    const utm: UtmData = {
      source: pickParam(
        params.get("utm_source"),
        prev.source,
        "direct",
      ),
      medium: pickParam(
        params.get("utm_medium"),
        prev.medium,
        "organic",
      ),
      campaign: pickParam(
        params.get("utm_campaign"),
        prev.campaign,
        "",
      ),
    };

    sessionStorage.setItem(UTM_SESSION_KEY, JSON.stringify(utm));
  } catch {
    /* ignore */
  }
}

/** API 페이로드용 (클라이언트에서만 호출) */
export function readUtmForApi(): UtmData {
  if (typeof window === "undefined") {
    return { source: "direct", medium: "organic", campaign: "" };
  }
  try {
    const raw = sessionStorage.getItem(UTM_SESSION_KEY);
    if (!raw) return { source: "direct", medium: "organic", campaign: "" };
    const p = JSON.parse(raw) as Partial<UtmData>;
    return {
      source: typeof p.source === "string" ? p.source : "direct",
      medium: typeof p.medium === "string" ? p.medium : "organic",
      campaign: typeof p.campaign === "string" ? p.campaign : "",
    };
  } catch {
    return { source: "direct", medium: "organic", campaign: "" };
  }
}
