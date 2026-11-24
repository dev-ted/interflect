/**
 * Analytics consent, kept in this browser only. Nothing that tracks loads until
 * the visitor chooses "granted". Read it with useSyncExternalStore(subscribe, …).
 */
export type Consent = "granted" | "denied";

const KEY = "interflect:consent";
const EVENT = "interflect:consent-change";
let reopened = false;

function read(): Consent | null {
  try {
    const value = window.localStorage.getItem(KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null; // Storage blocked: treat as undecided, so nothing tracks.
  }
}

export function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange); // other tabs
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** "granted" | "denied" | "unset", with ":open" when the banner should show. */
export function getSnapshot() {
  const consent = read() ?? "unset";
  return reopened || consent === "unset" ? `${consent}:open` : consent;
}

/** On the server nothing is known yet, so neither the banner nor any tag renders. */
export function getServerSnapshot() {
  return "server";
}

export function setConsent(value: Consent) {
  const previous = read();
  try {
    window.localStorage.setItem(KEY, value);
  } catch {
    // Storage blocked: the choice lasts for this page view only.
  }
  reopened = false;
  window.dispatchEvent(new Event(EVENT));
  // Withdrawing consent: remove analytics cookies and reload so loaded tags stop running.
  if (previous === "granted" && value === "denied") {
    clearAnalyticsCookies();
    window.location.reload();
  }
}

/** Show the banner again so the visitor can change their choice. */
export function openConsentSettings() {
  reopened = true;
  window.dispatchEvent(new Event(EVENT));
}

function clearAnalyticsCookies() {
  const host = window.location.hostname;
  const domains = ["", host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0].trim();
    if (!/^(_ga|_gid|_gat|_gcl|_fbp|_fbc)/.test(name)) continue;
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ""}`;
    }
  }
}
