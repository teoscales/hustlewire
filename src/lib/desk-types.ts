export type AccountRole = "user" | "owner";

export type Account = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: AccountRole;
  createdAt: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  paypalEmail?: string;
};

export type PublicAccount = {
  id: string;
  email: string;
  name: string;
  role: AccountRole;
};
export type PassKind = "paid" | "promo";
export type PromoStatus = "pending" | "approved" | "rejected";

export type DeskPassRecord = {
  id: string;
  visitorId: string;
  userId?: string;
  kind: PassKind;
  createdAt: string;
  expiresAt: string;
  endedAt: string | null;
  name?: string;
  email?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripeSessionId?: string;
  cancelAtPeriodEnd?: boolean;
};

export type SaleRecord = {
  id: string;
  passId: string;
  visitorId: string;
  userId?: string;
  amount: number;
  createdAt: string;
  name?: string;
  email?: string;
  stripeSessionId?: string;
};

export type PromoRecord = {
  id: string;
  visitorId: string;
  userId?: string;
  name: string;
  email: string;
  videoUrl: string;
  note: string;
  status: PromoStatus;
  createdAt: string;
  reviewedAt: string | null;
  reviewNote: string;
  claimedAt: string | null;
  passId: string | null;
};

export type WriterStatus = "pending" | "approved" | "rejected";
export type TipStatus = "open" | "paid" | "rejected";

export type WriterApplication = {
  id: string;
  userId: string;
  name: string;
  email: string;
  note: string;
  createdAt: string;
  reviewedAt: string | null;
  status: WriterStatus;
};

export type SituationTip = {
  id: string;
  userId: string;
  name: string;
  email: string;
  note: string;
  createdAt: string;
  amount: number;
  status: TipStatus;
  paypalEmail?: string;
  reviewNote?: string;
  reviewedAt?: string | null;
};

export type WriterChatRole = "writer" | "owner";

export type WriterChatMessage = {
  id: string;
  userId: string;
  from: WriterChatRole;
  body: string;
  createdAt: string;
};

export type LoginKind = "signup" | "login";

export type LoginEvent = {
  id: string;
  userId: string;
  email: string;
  name: string;
  kind: LoginKind;
  role: AccountRole;
  status: string;
  createdAt: string;
};

export type DeskStore = {
  seeded?: boolean;
  users: Account[];
  passes: DeskPassRecord[];
  sales: SaleRecord[];
  promos: PromoRecord[];
  applications: WriterApplication[];
  tips: SituationTip[];
  chats: WriterChatMessage[];
  logins: LoginEvent[];
  stories: WireStory[];
};

export type WireStatus = "draft" | "live";

export type WireStory = {
  id: string;
  status: WireStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  article: import("./types").Article;
};
