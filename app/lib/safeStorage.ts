/** 인앱 브라우저 등에서 localStorage가 막혀도 앱이 동작하도록 래핑 */

export function safeLocalStorageGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn("localStorage 사용 불가:", e);
    return null;
  }
}

export function safeLocalStorageSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    console.warn("localStorage 사용 불가:", e);
    return false;
  }
}

export function safeLocalStorageRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn("localStorage 사용 불가:", e);
  }
}

export function safeSessionStorageGet(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch (e) {
    console.warn("sessionStorage 사용 불가:", e);
    return null;
  }
}

export function safeSessionStorageSet(key: string, value: string): boolean {
  try {
    sessionStorage.setItem(key, value);
    return true;
  } catch (e) {
    console.warn("sessionStorage 사용 불가:", e);
    return false;
  }
}
