const requests = new Map<string, { count: number; resetTime: number }>();

export function isRateLimited(
  identifier: string,
  limit = 10,
  windowMs = 60_000,
): boolean {
  const now = Date.now();
  const entry = requests.get(identifier);

  if (!entry || now > entry.resetTime) {
    requests.set(identifier, { count: 1, resetTime: now + windowMs });
    return false;
  }

  entry.count++;
  return entry.count > limit;
}

export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/[^0-9]/g, "");
  return digits.length === 11 && digits.startsWith("010");
}
