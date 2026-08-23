export const ACCOUNT_COOKIE = "hw_account";
export const VISITOR_COOKIE = "hw_visitor";
export const PROMO_COOKIE = "hw_promo";

export const MONTH_SECONDS = 60 * 60 * 24 * 30;

export function accountCookie(value: string, maxAge: number) {
  return {
    name: ACCOUNT_COOKIE,
    value,
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export function visitorCookie(value: string) {
  return {
    name: VISITOR_COOKIE,
    value,
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  };
}

export function promoCookie(value: string) {
  return {
    name: PROMO_COOKIE,
    value,
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: MONTH_SECONDS * 3,
  };
}
