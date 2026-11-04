// Invitation project categories, guest link rules and invitation wording.
// Invitation projects use the "wedding" division key internally (kept so old
// records and backups stay valid); the category says which kind of event it is.

export const INVITATION_CATEGORIES = ["wedding", "anniversary", "baby_born", "bartabandha"] as const;
export type InvitationCategory = (typeof INVITATION_CATEGORIES)[number];

export const CATEGORY_INFO: Record<InvitationCategory, {
  label: string;
  path: string;
  blurb: string;
  event: string;
  greeting: string;
  milestones: string[];
}> = {
  wedding: {
    label: "Wedding", path: "wedding", blurb: "Marriage ceremonies and receptions",
    event: "Wedding Ceremony", greeting: "request the pleasure of your company at the wedding celebration",
    milestones: ["Requirements gathered", "Design draft", "Couple review", "Revisions", "Guest list ready", "Invitations sent"],
  },
  anniversary: {
    label: "Anniversary", path: "anniversary", blurb: "Milestone anniversaries and renewals",
    event: "Anniversary Celebration", greeting: "warmly invite you to celebrate their anniversary",
    milestones: ["Requirements gathered", "Design draft", "Family review", "Revisions", "Guest list ready", "Invitations sent"],
  },
  baby_born: {
    label: "Baby Born", path: "baby-born", blurb: "Welcoming a newborn and naming ceremonies",
    event: "Welcoming Our Little One", greeting: "joyfully invite you to bless and welcome their little one",
    milestones: ["Requirements gathered", "Design draft", "Family review", "Revisions", "Guest list ready", "Invitations sent"],
  },
  bartabandha: {
    label: "Bartabandha", path: "bartabandha", blurb: "Sacred thread ceremonies",
    event: "Bartabandha Ceremony", greeting: "cordially invite you to grace the sacred Bartabandha ceremony",
    milestones: ["Requirements gathered", "Design draft", "Family review", "Revisions", "Guest list ready", "Invitations sent"],
  },
};

export const categoryFromPath = (path: string): InvitationCategory | undefined =>
  INVITATION_CATEGORIES.find((c) => CATEGORY_INFO[c].path === path);

/** Turn a guest name into a readable URL part; keeps letters from any script (e.g. Devanagari). */
export function slugifyName(name: string): string {
  const base = name
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  return base || "guest";
}

const ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";
function randomCode(length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

/** Unique, hard-to-guess invitation link part built from the guest's name, e.g. "sita-rai-k7q2m9". */
export function guestSlug(name: string): string {
  return `${slugifyName(name)}-${randomCode(6)}`;
}

/** Split pasted guest lists: one guest per line, optional ", relation" after the name. */
export function parseGuestList(text: string): { name: string; relation: string }[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name = "", ...rest] = line.split(",");
      return { name: name.trim().slice(0, 200), relation: rest.join(",").trim().slice(0, 200) };
    })
    .filter((g) => g.name.length > 0);
}

const PUBLISHED_SITE = "https://studio-ledger-compass.lovable.app";
/** Links are always shared on the public site; the editor preview isn't reachable by guests. */
export function inviteBaseUrl(origin: string): string {
  return /id-preview--|lovableproject\.com|localhost|127\.0\.0\.1/.test(origin) ? PUBLISHED_SITE : origin;
}
export const inviteUrl = (origin: string, slug: string) => `${inviteBaseUrl(origin)}/invite/${encodeURIComponent(slug)}`;
