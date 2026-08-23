export const DESK_PASS_COOKIE = "hw_desk_pass";
export const STUDIO_COOKIE = "hw_studio";

export const deskPass = {
  name: "Desk Pass",
  price: 4.99,
  period: "month" as const,
  priceLabel: "$4.99 / month",
  stripeCents: 499,
};

export const writerPay = {
  perTip: 2,
  label: "$2",
};

export function passCookie(value: string, maxAge: number) {
  return {
    name: DESK_PASS_COOKIE,
    value,
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
