import type { Article } from "./types";

const stop = new Set([
  "the",
  "and",
  "for",
  "this",
  "that",
  "with",
  "from",
  "what",
  "how",
  "should",
  "would",
  "could",
  "you",
  "your",
  "are",
  "is",
  "do",
  "does",
  "a",
  "an",
  "to",
  "of",
  "in",
  "on",
  "or",
  "my",
  "i",
  "it",
  "be",
  "can",
  "if",
  "about",
  "into",
]);

const extras: Record<string, string[]> = {
  price: ["charge", "capital", "cash", "cost", "retail", "bid", "dollar"],
  charge: ["price", "retail", "capital"],
  buy: ["purchase", "first", "weekend", "kit"],
  first: ["start", "weekend", "tonight", "day"],
  start: ["first", "weekend", "hour"],
  ip: ["trademark", "logo", "strike", "ap", "swatch"],
  impersonat: ["paid", "8ball", "identity", "clone"],
  dm: ["script", "message", "comment"],
  say: ["script", "message", "call"],
  stop: ["kill", "done", "when"],
  mold: ["batch", "units", "print"],
  partner: ["license", "shop", "gold"],
  mall: ["kiosk", "rent", "weekend", "table"],
  nfc: ["tap", "card", "chip", "ntag", "alibaba"],
  alibaba: ["nfc", "card", "buy", "order"],
  review: ["google", "tap", "shop", "card"],
  google: ["review", "maps", "star"],
  shop: ["walk", "owner", "script", "door"],
  illegal: ["fake", "star", "tos", "risk"],
  leak: ["gta", "files", "download", "rockstar", "recap"],
  gta: ["leak", "rockstar", "recap", "vice", "waiting"],
  rockstar: ["gta", "leak", "logo", "trademark"],
  download: ["files", "leak", "mega", "torrent"],
  recap: ["leak", "commentary", "youtube"],
  miami: ["walk", "analog", "vice"],
};

type Chunk = { kind: string; label: string; text: string };

function tokens(text: string) {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .filter((word) => word.length > 2 && !stop.has(word));
}

function expand(query: string[]) {
  const set = new Set(query);
  for (const word of query) {
    for (const extra of extras[word] ?? []) set.add(extra);
  }
  return [...set];
}

function playbookChunks(article: Article): Chunk[] {
  const play = article.playbook;
  return [
    { kind: "thesis", label: "The play", text: `${article.play.headline}. ${play.thesis}` },
    { kind: "money", label: "Cash and speed", text: `Cash: ${play.capital}. Speed: ${play.speed}.` },
    ...play.briefing.map((text) => ({ kind: "brief", label: "Briefing", text })),
    ...play.sequence.map((step) => ({
      kind: "step",
      label: step.title,
      text: `${step.window}: ${step.title}. ${step.body}`,
    })),
    ...play.numbers.map((row) => ({
      kind: "money",
      label: row.label,
      text: `${row.label}: ${row.value}. ${row.note}`,
    })),
    ...play.scripts.map((script) => ({
      kind: "script",
      label: script.where,
      text: `${script.where}: “${script.text}”`,
    })),
    ...play.kit.map((text) => ({ kind: "kit", label: "Kit", text })),
    ...play.pitfalls.map((text) => ({ kind: "risk", label: "Don't", text })),
    ...play.kill.map((text) => ({ kind: "kill", label: "Kill line", text })),
    ...play.week.map((row) => ({ kind: "week", label: row.day, text: `${row.day}: ${row.move}` })),
  ];
}

function preferKind(question: string): string | null {
  const q = question.toLowerCase();
  if (/(charge|price|cost|cash|capital|bid|\$|dollar)/.test(q)) return "money";
  if (/(say|script|dm|comment|call|email|title)/.test(q)) return "script";
  if (/(impersonat|trademark|ip|logo|license|legal|stolen|clone|illegal|fake review)/.test(q))
    return "risk";
  if (/(stop|kill|when do i|done|quit)/.test(q)) return "kill";
  if (/(kit|need|bring|buy first|what do i (need|get))/.test(q)) return "kit";
  if (/(first|start|weekend|tonight|day 0|hour 0)/.test(q)) return "step";
  return null;
}

export function askPlaybook(article: Article, question: string) {
  const query = expand(tokens(question));
  const kind = preferKind(question);
  const ranked = playbookChunks(article)
    .map((chunk) => {
      const hay = tokens(`${chunk.label} ${chunk.text}`);
      const overlap = query.filter((word) => hay.includes(word)).length;
      const kindBonus = kind && chunk.kind === kind ? 4 : 0;
      return { chunk, score: overlap * 2 + kindBonus };
    })
    .sort((a, b) => b.score - a.score);

  const picked =
    (ranked[0]?.score ?? 0) > 0
      ? ranked.filter((row) => row.score > 0).slice(0, 4)
      : ranked.slice(0, 3);

  const steps = picked.filter((row) => row.chunk.kind === "step").map((row) => row.chunk);
  const other = picked.filter((row) => row.chunk.kind !== "step").map((row) => row.chunk);

  const lines: string[] = [
    `This situation: ${article.play.headline}`,
    "",
  ];

  if (steps.length > 0) {
    lines.push("Do this:");
    steps.forEach((step, index) => {
      lines.push(`${index + 1}. ${step.text}`);
    });
    lines.push("");
  }

  for (const chunk of other) {
    lines.push(`${chunk.label}: ${chunk.text}`);
    lines.push("");
  }

  lines.push("That’s from this playbook only. If a step needs a license, get the license.");
  return lines.join("\n").trim();
}
