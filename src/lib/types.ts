export const categoryIds = ["markets", "products", "platforms", "street"] as const;

export type CategoryId = (typeof categoryIds)[number];

export type Risk = "low" | "medium" | "high";

export type Category = {
  id: CategoryId;
  label: string;
  blurb: string;
};

export type PlayStep = {
  title: string;
  window: string;
  body: string;
};

export type Playbook = {
  thesis: string;
  capital: string;
  speed: string;
  risk: Risk;
  briefing: string[];
  sequence: PlayStep[];
  numbers: { label: string; value: string; note: string }[];
  kit: string[];
  scripts: { where: string; text: string }[];
  pitfalls: string[];
  week: { day: string; move: string }[];
  kill: string[];
  suggestedGoals: string[];
  questions: string[];
};

export type Article = {
  slug: string;
  code: string;
  accent: string;
  ink: string;
  category: CategoryId;
  kicker: string;
  title: string;
  dek: string;
  publishedAt: string;
  readMinutes: number;
  featured?: boolean;
  marketTick?: string;
  news: {
    headline: string;
    body: string[];
  };
  play: {
    headline: string;
    teaser: string;
  };
  playbook: Playbook;
};
