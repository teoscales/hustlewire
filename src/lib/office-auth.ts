export const ownerLogin = {
  email: (process.env.HW_OWNER_EMAIL || "teo.tselidis@icloud.com").trim().toLowerCase(),
  password: process.env.HW_OWNER_PASSWORD || "",
};

export { newDeskId } from "./password";
