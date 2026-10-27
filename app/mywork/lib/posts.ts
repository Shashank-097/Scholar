/* Data layer for the Screen / Studies dashboard.
   Everything the UI needs goes through this file, so swapping localStorage for a real
   database or API later only means changing `load` / `save` and the publish handler. */

export type Category = "Movies" | "Characters" | "OTT" | "Short films" | "Adaptation";
export type Format = "Opinion" | "Review" | "Analysis" | "Essay";

export const CATEGORIES: Category[] = ["Movies", "Characters", "OTT", "Short films", "Adaptation"];
export const FORMATS: Format[] = ["Opinion", "Review", "Analysis", "Essay"];

export interface Piece {
  id: string;
  title: string;
  category: Category;
  format: Format;
  excerpt: string;
  body: string[]; // paragraphs
  tags: string[];
  rating?: number; // 1–5, optional (reviews)
  readMins: number;
  date: string; // YYYY-MM-DD
  featured?: boolean;
  image?: string; // optional artwork, e.g. "/assets/pieces/my-cover.jpg"
  sample?: boolean; // placeholder content, safe to delete
}

export const SEED: Piece[] = [
  {
    id: "grammar-of-the-binge", title: "The grammar of the binge", category: "OTT", format: "Analysis",
    excerpt: "Streaming didn't just change where we watch. It changed how a story breathes.",
    body: [
      "Weekly television taught audiences to wait. Every episode ended on a pause that the audience filled with theories, arguments and rewatching. The binge removed the pause, and with it a whole layer of storytelling that lived in the gap between episodes.",
      "Writers now build for momentum rather than anticipation. Cliffhangers are shorter, recaps disappear, and the middle of a season is asked to hold attention without the help of a calendar. The result is a different grammar, not a worse one, and it deserves to be read on its own terms.",
    ],
    tags: ["streaming", "structure", "binge"], readMins: 4, date: "2026-10-10", featured: true, sample: true,
  },
  {
    id: "what-the-page-keeps", title: "What the page keeps", category: "Adaptation", format: "Essay",
    excerpt: "Every adaptation is an argument about what mattered most in the book.",
    body: [
      "A novel can spend a paragraph inside one thought. A film has to find that thought in a face, a cut or a silence. Adaptation is less about faithfulness than about translation, and every translation chooses what to carry across.",
      "The interesting question is never what was cut. It is what the screen found that the page could not: a look held too long, a sound under a scene, a landscape that becomes a character.",
    ],
    tags: ["adaptation", "literature", "screen"], readMins: 5, date: "2026-10-08", featured: true, sample: true,
  },
  {
    id: "side-characters-carry-the-season", title: "Side characters carry the season", category: "Characters", format: "Opinion",
    excerpt: "The lead gets the poster. The supporting cast gets the audience's loyalty.",
    body: [
      "Look at what viewers quote, meme and defend months after a series ends. It is rarely the lead. Supporting characters have the freedom to be strange, funny and specific, because the plot does not depend on them being likeable.",
      "That freedom is a gift to writers and a quiet lesson about spectatorship: audiences attach to people who feel like they had a life before the first scene.",
    ],
    tags: ["characters", "writing", "audiences"], readMins: 3, date: "2026-10-06", featured: true, sample: true,
  },
  {
    id: "twelve-minutes-is-enough", title: "Twelve minutes is enough", category: "Short films", format: "Opinion",
    excerpt: "The short film is not a smaller feature. It is a different animal entirely.",
    body: [
      "A short has no time for subplots, which is exactly why it is honest. One idea, one location, one change in a person. When it works, the ending lands like a held breath finally released.",
      "Shorts also travel better than they ever did. A phone screen on a bus is a legitimate cinema now, and the form is quietly better for it.",
    ],
    tags: ["short film", "craft"], readMins: 3, date: "2026-10-04", sample: true,
  },
  {
    id: "autoplay-and-the-pause", title: "Autoplay and the end of the pause", category: "OTT", format: "Opinion",
    excerpt: "When the next episode starts on its own, who is actually choosing to watch?",
    body: [
      "Autoplay is a small interface decision with a large cultural effect. It turns finishing into a default and stopping into an act. The viewer is still free, but the path of least resistance has moved.",
      "Reading platforms critically means reading their buttons, timers and countdowns as part of the text.",
    ],
    tags: ["platforms", "design", "spectatorship"], readMins: 3, date: "2026-10-02", sample: true,
  },
  {
    id: "why-the-quiet-ending-works", title: "Why the quiet ending works", category: "Movies", format: "Opinion",
    excerpt: "The loudest endings are forgotten first. The quiet ones follow you home.",
    body: [
      "A quiet ending trusts the audience. It leaves the question open and lets the viewer carry it out of the hall. That trust is the opposite of a recap or a twist explained, and it is rarer than it should be.",
      "The best examples end a beat early, on an image rather than an answer, and let the credits do the rest of the work.",
    ],
    tags: ["endings", "cinema"], readMins: 3, date: "2026-09-30", sample: true,
  },
  {
    id: "the-tired-anti-hero", title: "The tired anti-hero", category: "Characters", format: "Essay",
    excerpt: "Why the morally grey lead stopped surprising us, and what comes next.",
    body: [
      "The anti-hero was once a provocation. Now it is a template, and audiences can see the gears. The next interesting character is not darker; she is more specific, more contradictory, and less interested in being admired.",
      "Complexity is not the same as cruelty. The characters that last are the ones whose contradictions feel earned.",
    ],
    tags: ["anti-hero", "characters"], readMins: 4, date: "2026-09-27", sample: true,
  },
  {
    id: "the-one-location-film", title: "The one-location film", category: "Short films", format: "Analysis",
    excerpt: "Constraint is the quiet engine behind the best short work.",
    body: [
      "One room, two people and a problem is a classic recipe because it forces every choice to mean something. The camera cannot escape, so the performances, sound and framing have to do the escaping for it.",
      "Limits are not a lack of budget. They are a design brief.",
    ],
    tags: ["constraint", "craft", "short film"], readMins: 3, date: "2026-09-24", sample: true,
  },
  {
    id: "cinema-halls-small-screens", title: "Cinema halls, small screens", category: "Movies", format: "Essay",
    excerpt: "Is the big screen a place or a way of paying attention?",
    body: [
      "We say the cinema hall is dying while audiences still queue for the right film. What seems to be fading is not the room but the habit of giving a story two uninterrupted hours.",
      "Seen that way, a hall is an agreement as much as a building, and agreements can be renewed anywhere people choose to commit their attention.",
    ],
    tags: ["cinema", "culture", "spectatorship"], readMins: 4, date: "2026-09-20", sample: true,
  },
];

/* ---------- helpers ---------- */

export const wordsToMins = (text: string) =>
  Math.max(1, Math.round(text.trim().split(/\s+/).filter(Boolean).length / 200));

export const STORAGE = {
  pieces: "ss:pieces", // pieces you publish from the Write panel
  saved: "ss:saved", // "My list"
  liked: "ss:liked",
  progress: "ss:progress", // reading progress per piece
} as const;

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable (private mode / quota) */
  }
}