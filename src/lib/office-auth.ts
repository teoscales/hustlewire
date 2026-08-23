function ownerEntry(email: string, password: string) {
  const cleaned = email.trim().toLowerCase();
  if (!cleaned) return null;
  return { email: cleaned, password };
}

export const ownerLogins = [
  ownerEntry(
    process.env.HW_OWNER_EMAIL || "teo.tselidis@icloud.com",
    process.env.HW_OWNER_PASSWORD || "",
  ),
  ownerEntry(
    process.env.HW_OWNER_EMAIL_2 || "slovenskakrabica@gmail.com",
    process.env.HW_OWNER_PASSWORD_2 || "",
  ),
].filter((owner): owner is { email: string; password: string } => Boolean(owner));

export const ownerLogin = ownerLogins[0] ?? {
  email: "teo.tselidis@icloud.com",
  password: "",
};

export { newDeskId } from "./password";
