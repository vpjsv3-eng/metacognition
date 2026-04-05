"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { captureUtmToSession } from "../lib/utm";

function UtmCaptureInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    captureUtmToSession();
  }, [pathname, searchParams]);

  return null;
}

/** 라우트·쿼리 변경 시 URL의 UTM을 sessionStorage에 반영 */
export default function UtmCapture() {
  return (
    <Suspense fallback={null}>
      <UtmCaptureInner />
    </Suspense>
  );
}
