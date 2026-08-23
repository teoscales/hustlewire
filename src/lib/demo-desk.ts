import { deskPass } from "./premium";
import type { DeskPassRecord, DeskStore, PromoRecord, SaleRecord } from "./desk-types";

function plusDays(from: Date, days: number) {
  const next = new Date(from);
  next.setDate(next.getDate() + days);
  return next.toISOString();
}

function daysAgo(days: number, hour = 14) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 18, 0, 0);
  return date;
}

function iso(days: number, hour = 14) {
  return daysAgo(days, hour).toISOString();
}

function paid(
  id: string,
  days: number,
  person: { name: string; email: string },
  ended = false,
): { pass: DeskPassRecord; sale: SaleRecord } {
  const createdAt = iso(days);
  const visitorId = `demo-${id}`;
  const passId = `pass-${id}`;
  const pass: DeskPassRecord = {
    id: passId,
    visitorId,
    kind: "paid",
    createdAt,
    expiresAt: plusDays(daysAgo(days), 30),
    endedAt: ended ? iso(Math.max(0, days - 12), 9) : null,
    name: person.name,
    email: person.email,
  };
  const sale: SaleRecord = {
    id: `sale-${id}`,
    passId,
    visitorId,
    amount: deskPass.price,
    createdAt,
    name: person.name,
    email: person.email,
  };
  return { pass, sale };
}

function promoPass(
  id: string,
  days: number,
  person: { name: string; email: string },
): DeskPassRecord {
  return {
    id: `pass-${id}`,
    visitorId: `demo-${id}`,
    kind: "promo",
    createdAt: iso(days),
    expiresAt: plusDays(daysAgo(days), 30),
    endedAt: null,
    name: person.name,
    email: person.email,
  };
}

const people = {
  mira: { name: "Mira Chen", email: "mira@nightshift.co" },
  jamal: { name: "Jamal Ortiz", email: "jamal@eightfold.studio" },
  priya: { name: "Priya Shah", email: "priya@localbrand.shop" },
  leo: { name: "Leo Park", email: "leo@sparegpu.dev" },
  nia: { name: "Nia Brooks", email: "nia@clipmounts.com" },
  otto: { name: "Otto Varga", email: "otto@pawncut.tv" },
  sage: { name: "Sage Okonkwo", email: "sage@larpdesk.io" },
  rafi: { name: "Rafi Mendes", email: "rafi@kioskdemo.co" },
  hana: { name: "Hana Iwasaki", email: "hana@returns.fast" },
  cole: { name: "Cole Brennan", email: "cole@streetwire.xyz" },
  amira: { name: "Amira Haddad", email: "amira@goldtape.co" },
  dex: { name: "Dex Lang", email: "dex@temulane.com" },
  yara: { name: "Yara Santos", email: "yara@wristclip.shop" },
  noah: { name: "Noah Pell", email: "noah@emptyaisle.co" },
  june: { name: "June Alvarez", email: "june@paidlane.tv" },
  kit: { name: "Kit Rahman", email: "kit@hustlecut.com" },
};

export function demoDeskStore(): DeskStore {
  const paidRows = [
    paid("mira", 1, people.mira),
    paid("jamal", 3, people.jamal),
    paid("priya", 5, people.priya),
    paid("leo", 8, people.leo),
    paid("nia", 11, people.nia),
    paid("otto", 14, people.otto),
    paid("sage", 18, people.sage),
    paid("rafi", 22, people.rafi),
    paid("hana", 27, people.hana),
    paid("cole", 33, people.cole),
    paid("amira", 38, people.amira),
    paid("dex", 44, people.dex),
    paid("yara", 19, people.yara, true),
  ];

  const promoRows = [
    promoPass("noah", 6, people.noah),
    promoPass("june", 10, people.june),
    promoPass("kit", 16, people.kit),
  ];

  const promos: PromoRecord[] = [
    {
      id: "promo-pending-1",
      visitorId: "demo-pending-1",
      name: "Tasha Quinn",
      email: "tasha@clipreels.co",
      videoUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
      note: "TikTok-style walkthrough of the AP x Swatch wrist-clip play. Posted it on Shorts.",
      status: "pending",
      createdAt: iso(1, 11),
      reviewedAt: null,
      reviewNote: "",
      claimedAt: null,
      passId: null,
    },
    {
      id: "promo-pending-2",
      visitorId: "demo-pending-2",
      name: "Eli Navarro",
      email: "eli@larpdesk.tv",
      videoUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
      note: "Reel about Paid / 8ball going dark. Asking people to take the LARP lane for real.",
      status: "pending",
      createdAt: iso(2, 16),
      reviewedAt: null,
      reviewNote: "",
      claimedAt: null,
      passId: null,
    },
    {
      id: "promo-pending-3",
      visitorId: "demo-pending-3",
      name: "Mina Cho",
      email: "mina@goldcut.studio",
      videoUrl: "https://www.tiktok.com/@scout2015/video/6718339392118902022",
      note: "Talking pawn-content while gold is at a record. Shot in the shop after close.",
      status: "pending",
      createdAt: iso(0, 9),
      reviewedAt: null,
      reviewNote: "",
      claimedAt: null,
      passId: null,
    },
    {
      id: "promo-ok-1",
      visitorId: "demo-noah",
      name: people.noah.name,
      email: people.noah.email,
      videoUrl: "https://www.youtube.com/watch?v=LXb3EKWsInQ",
      note: "Empty kiosk live-demo. Posted to YouTube and tagged the wire.",
      status: "approved",
      createdAt: iso(8, 13),
      reviewedAt: iso(6, 10),
      reviewNote: "Clear, on-brief. Month granted.",
      claimedAt: iso(6, 12),
      passId: "pass-noah",
    },
    {
      id: "promo-ok-2",
      visitorId: "demo-june",
      name: people.june.name,
      email: people.june.email,
      videoUrl: "https://youtu.be/aqz-KE-bpKQ",
      note: "Instagram reel: why Desk Pass is the playbook not the news.",
      status: "approved",
      createdAt: iso(12, 15),
      reviewedAt: iso(10, 11),
      reviewNote: "",
      claimedAt: iso(10, 14),
      passId: "pass-june",
    },
    {
      id: "promo-ok-3",
      visitorId: "demo-kit",
      name: people.kit.name,
      email: people.kit.email,
      videoUrl: "https://www.instagram.com/reel/C123demo/",
      note: "Street recap of the Temu-fee local brand move.",
      status: "approved",
      createdAt: iso(18, 17),
      reviewedAt: iso(16, 9),
      reviewNote: "Good enough. Watch the trademark talk.",
      claimedAt: iso(16, 10),
      passId: "pass-kit",
    },
    {
      id: "promo-no-1",
      visitorId: "demo-reject-1",
      name: "Vince Hale",
      email: "vince@spamcut.io",
      videoUrl: "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
      note: "General grindset montage. Barely mentions HustleWire.",
      status: "rejected",
      createdAt: iso(4, 20),
      reviewedAt: iso(3, 8),
      reviewNote: "Needs to be about the desk, not a generic hustle clip.",
      claimedAt: null,
      passId: null,
    },
  ];

  return {
    seeded: true,
    users: [],
    passes: [...paidRows.map((row) => row.pass), ...promoRows],
    sales: paidRows.map((row) => row.sale),
    promos,
    applications: [],
    tips: [],
    chats: [],
  };
}
