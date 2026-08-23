import type { Article } from "./types";

/** Fake sample only. Never listed on the wire. */
export const demoStorySlug = "desk-pass-sample";

export const demoArticle: Article = {
  slug: demoStorySlug,
  code: "DEMO",
  accent: "#3a3a3a",
  ink: "#f4efe4",
  category: "products",
  kicker: "Sample copy",
  title: "GlimmerCo shipped a lamp that only turns on if you clap twice in a closet.",
  dek: "This is dummy copy for the Desk Pass sample. None of it is on the wire. The layout is 1:1 with a real pass.",
  publishedAt: "2026-01-01T00:00:00.000Z",
  readMinutes: 3,
  marketTick: "DEMO ±0.0%",
  news: {
    headline: "A fictional company launched a fictional lamp. This paragraph is filler.",
    body: [
      "GlimmerCo does not exist. North Bramble is not a city. This block is here so you can see how a story sits next to the three free moves.",
      "The made-up product is a closet lamp that needs two claps in a dark room. Comments on the fake launch are also fake: people wanted a switch on the wall.",
      "Sample numbers, names, and shops below are placeholders. They are not a play you should run.",
      "Scroll the right card, then the playbook. That stack is what Desk Pass opens on a live story.",
    ],
  },
  play: {
    headline: "Sell the missing wall switch. (This is fake.)",
    teaser: "Dummy play: a $14 clap puck so nobody has to clap in a closet. Sample only.",
  },
  playbook: {
    thesis:
      "Demo thesis: the collab left a hole, a puck that claps for you. Real pass playbooks look like this: thesis, sequence, numbers, scripts, week, kill lines.",
    capital: "$40–$90 in sample cash (not real)",
    speed: "Sample speed: a weekend of dummy steps",
    risk: "low",
    briefing: [
      "This briefing is filler so the sample has the same shape as a live playbook.",
      "A real pass would tell you what happened, why the hole exists, and what you actually buy.",
      "Ask AI on this sample only answers from this fake playbook. It will not know HustleWire stories.",
      "If this were live, the briefing would name real suppliers, real prices, and real constraints.",
    ],
    sequence: [
      {
        title: "Buy 20 dummy pucks from a made-up supplier.",
        window: "Day 0",
        body: "Sample step. A live playbook would name the actual SKU, the landed cost, and where it ships from.",
      },
      {
        title: "Build a fake 12-shop list in North Bramble.",
        window: "Day 1",
        body: "Sample step. Live desks name the real street, the real buyer, and who to skip.",
      },
      {
        title: "Film a fake clap so the lamp turns on.",
        window: "Day 1",
        body: "Sample step. This is move three, the last free move on a real story. Everything after this is Desk Pass.",
      },
      {
        title: "Walk in with the puck. Don’t sell the lamp.",
        window: "Days 2–4",
        body: "Sample step four. On a pass this is where the sequence keeps going: doors, price, and what you leave on the counter.",
      },
      {
        title: "Take the dummy $39. Leave two pucks.",
        window: "Days 4–7",
        body: "Sample close. Live playbooks put the real price, the add-on, and when to walk.",
      },
      {
        title: "Reorder when you have 8 blanks left.",
        window: "Week 2",
        body: "Sample restock rule. A real pass would say when the box has to leave the factory.",
      },
    ],
    numbers: [
      { label: "Dummy puck", value: "$4", note: "Placeholder cost. Not a real SKU." },
      { label: "Sample price", value: "$39", note: "Placeholder retail for the demo close." },
      { label: "Add-on", value: "$12", note: "A second fake puck for the other closet." },
      { label: "Ad spend", value: "$0", note: "This sample is a walking desk. No ads." },
    ],
    kit: [
      "A box of imaginary clap pucks",
      "A phone to film a fake demo",
      "A list titled North Bramble, sample only",
      "A price card that says $39",
    ],
    scripts: [
      {
        where: "In the door (sample)",
        text: "This lamp is fake. I sell the puck that claps. I’ll do it on your closet right now.",
      },
      {
        where: "After the fake lamp turns on",
        text: "Two pucks is $39. You’re not buying GlimmerCo. You’re buying the switch they forgot.",
      },
      {
        where: "If they want you to install wiring",
        text: "I don’t touch the wall. If the puck isn’t enough, I’m the wrong desk.",
      },
    ],
    pitfalls: [
      "Treating this sample as a real supplier list.",
      "Pitching a product that does not exist.",
      "Ordering 1,000 units of a made-up SKU.",
    ],
    week: [
      { day: "Sat", move: "Sample: order dummy pucks. Write the fake list." },
      { day: "Sun", move: "Sample: film one clap. Cut 12 seconds." },
      { day: "Mon", move: "Sample: walk 6 imaginary shops." },
      { day: "Tue–Thu", move: "Sample: close or walk. Log the no’s." },
      { day: "Fri", move: "Sample: reorder blanks. Hit the next 6." },
    ],
    kill: [
      "Ten fake doors and nobody pays $29+. This sample would tell you to change the object, not the price to $8.",
      "The clap fails on camera. Fix the demo before another door.",
    ],
    suggestedGoals: [
      "Order a dummy batch of clap pucks",
      "Write a 12-name sample hit list",
      "Film one working clap (fake lamp)",
      "Close the first sample door at $29 or more",
      "Deliver 5 sample 2-packs",
    ],
    questions: [
      "What do I actually buy first?",
      "What do I say at the door?",
      "What should I charge?",
      "When do I stop?",
    ],
  },
};
