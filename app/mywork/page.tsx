"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import gsap from "gsap";
import "./dashboard.css";
import {
  CATEGORIES, FORMATS, SEED, STORAGE, load, save, wordsToMins,
  type Category, type Format, type Piece,
} from "./lib/posts";

/* ------------------------------------------------------------------ icons */
const PATHS = {
  home: "M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4",
  list: "M6 3h12v18l-6-4-6 4z",
  pen: "M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4",
  sun: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5",
  moon: "M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z",
  play: "M7 4l13 8-13 8z",
  close: "M5 5l14 14M19 5L5 19",
  left: "M15 5l-7 7 7 7",
  right: "M9 5l7 7-7 7",
  heart: "M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z",
  trash: "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13",
} as const;

function Icon({ n, fill }: { n: keyof typeof PATHS; fill?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="ic" aria-hidden="true">
      <path d={PATHS[n]} fill={fill ? "currentColor" : "none"} />
    </svg>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <span className="stars" aria-label={`${n} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <i key={i} className={i <= n ? "on" : ""}>★</i>
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ poster art (no images needed) */
const PAL: [string, string][] = [
  ["#861f2d", "#2a1214"], ["#2a1c1a", "#7a1c2a"], ["#b28a48", "#861f2d"],
  ["#17110f", "#3b2724"], ["#e7d9cc", "#b28a48"], ["#3b2724", "#b28a48"],
];
const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

function Glyph({ cat }: { cat: Category }) {
  switch (cat) {
    case "Characters":
      return (<svg viewBox="0 0 100 100"><circle cx="50" cy="36" r="16" /><path d="M20 86c0-18 13-28 30-28s30 10 30 28" /></svg>);
    case "OTT":
      return (<svg viewBox="0 0 100 100"><rect x="14" y="22" width="72" height="48" rx="6" /><path d="M43 36l16 10-16 10z" /><path d="M32 82h36" /></svg>);
    case "Short films":
      return (<svg viewBox="0 0 100 100"><rect x="10" y="30" width="24" height="40" rx="3" /><rect x="38" y="30" width="24" height="40" rx="3" opacity=".7" /><rect x="66" y="30" width="24" height="40" rx="3" opacity=".4" /><path d="M10 22h80M10 78h80" strokeDasharray="3 4" /></svg>);
    case "Adaptation":
      return (<svg viewBox="0 0 100 100"><rect x="12" y="20" width="32" height="56" rx="2" /><path d="M19 32h18M19 41h18M19 50h11" /><path d="M50 48h10m-4-4l4 4-4 4" /><rect x="64" y="30" width="26" height="36" rx="2" /><circle cx="77" cy="48" r="6" /></svg>);
    default:
      return (<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="34" /><circle cx="50" cy="50" r="5" />{[0, 72, 144, 216, 288].map((a) => (<circle key={a} cx={50 + Math.cos((a * Math.PI) / 180) * 19} cy={50 + Math.sin((a * Math.PI) / 180) * 19} r="6" />))}</svg>);
  }
}

function Art({ piece, className = "" }: { piece: Pick<Piece, "id" | "category" | "image">; className?: string }) {
  const [a, b] = PAL[hash(piece.id) % PAL.length];
  const cream = a === "#e7d9cc";
  return (
    <div className={`art ${className}`} style={{ "--a": a, "--b": b, "--ac": cream ? "#861f2d" : "#d8b976" } as CSSProperties}>
      {piece.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={piece.image} alt="" loading="lazy" draggable={false} />
      ) : (
        <Glyph cat={piece.category} />
      )}
    </div>
  );
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------------ cards + rails */
interface CardProps {
  p: Piece; onOpen: (p: Piece) => void; isSaved: boolean; onSave: (id: string) => void; progress?: number;
}

function Card({ p, onOpen, isSaved, onSave, progress = 0 }: CardProps) {
  return (
    <article className="card">
      <button type="button" className="cardMain" onClick={() => onOpen(p)} aria-label={`Read ${p.title}`}>
        <Art piece={p} />
        <span className="cardCat">{p.category}</span>
        <span className="cardInfo">
          <strong>{p.title}</strong>
          <span className="cardMore"><span><span className="cardExcerpt">{p.excerpt}</span></span></span>
          <em>{p.format} · {p.readMins} min read</em>
        </span>
        {progress > 0.03 && progress < 0.97 && <i className="cardBar"><b style={{ width: `${progress * 100}%` }} /></i>}
      </button>
      <button type="button" className={`saveBtn ${isSaved ? "on" : ""}`} onClick={() => onSave(p.id)}
        aria-pressed={isSaved} aria-label={isSaved ? "Remove from My list" : "Add to My list"}>
        <Icon n="list" fill={isSaved} />
      </button>
    </article>
  );
}

function Rail(props: { title: string; items: Piece[] } & Omit<CardProps, "p" | "isSaved" | "progress"> & { saved: string[]; progress: Record<string, number> }) {
  const { title, items, saved, progress, onOpen, onSave } = props;
  const ref = useRef<HTMLDivElement>(null);
  const by = (dir: number) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.85, behavior: "smooth" });
  if (!items.length) return null;
  return (
    <section className="rail reveal">
      <header>
        <h2>{title}</h2>
        <div className="arrows">
          <button type="button" onClick={() => by(-1)} aria-label={`Scroll ${title} left`}><Icon n="left" /></button>
          <button type="button" onClick={() => by(1)} aria-label={`Scroll ${title} right`}><Icon n="right" /></button>
        </div>
      </header>
      <div className="track" ref={ref}>
        {items.map((p) => (
          <Card key={p.id} p={p} onOpen={onOpen} onSave={onSave} isSaved={saved.includes(p.id)} progress={progress[p.id]} />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ hero */
function Hero({ items, onOpen, saved, onSave }: { items: Piece[]; onOpen: (p: Piece) => void; saved: string[]; onSave: (id: string) => void }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const root = useRef<HTMLElement>(null);
  const cur = items[i % items.length];

  useEffect(() => {
    if (paused || items.length < 2) return;
    const t = setTimeout(() => setI((v) => (v + 1) % items.length), 7000);
    return () => clearTimeout(t);
  }, [i, paused, items.length]);

  useEffect(() => {
    const d = reduced() ? 0 : 1;
    const ctx = gsap.context(() => {
      gsap.fromTo(".heroText > *", { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 * d, stagger: 0.08 * d, ease: "power3.out" });
      gsap.fromTo(".heroArt", { scale: 1.08, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.2 * d, ease: "power3.out" });
    }, root);
    return () => ctx.revert();
  }, [i]);

  if (!cur) return null;
  const isSaved = saved.includes(cur.id);

  return (
    <section className="hero" ref={root} onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
      <Art piece={cur} className="heroArt" />
      <div className="heroText">
        <span className="badge">Featured · {cur.category}</span>
        <h1>{cur.title}</h1>
        <div className="meta">
          {cur.rating ? <Stars n={cur.rating} /> : null}
          <span>{cur.format}</span><span>{cur.readMins} min read</span><span>{fmtDate(cur.date)}</span>
        </div>
        <p>{cur.excerpt}</p>
        <div className="heroActions">
          <button type="button" className="cta" onClick={() => onOpen(cur)}><Icon n="play" fill /> Read now</button>
          <button type="button" className={`ghost ${isSaved ? "on" : ""}`} onClick={() => onSave(cur.id)}>
            <Icon n="list" fill={isSaved} /> {isSaved ? "In my list" : "My list"}
          </button>
        </div>
      </div>

      <div className="heroDots" role="tablist" aria-label="Featured pieces">
        {items.map((p, idx) => (
          <button key={p.id} type="button" role="tab" aria-selected={idx === i} aria-label={p.title}
            className={idx === i ? "on" : ""} onClick={() => setI(idx)}>
            <b style={{ animationPlayState: paused ? "paused" : "running" }} key={idx === i ? `a${i}` : "x"} />
          </button>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ reader */
interface ReaderProps {
  p: Piece; related: Piece[]; startAt: number; isSaved: boolean; isLiked: boolean; mine: boolean;
  onClose: (pct: number) => void; onSave: (id: string) => void; onLike: (id: string) => void;
  onDelete: (id: string) => void; onOpen: (p: Piece) => void;
}

function Reader({ p, related, startAt, isSaved, isLiked, mine, onClose, onSave, onLike, onDelete, onOpen }: ReaderProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const pct = useRef(startAt);

  const close = useCallback(() => onClose(pct.current), [onClose]);

  useEffect(() => {
    const el = scroller.current;
    if (el) {
      el.scrollTop = 0;
      pct.current = 0;
      if (bar.current) bar.current.style.transform = "scaleX(0)";
      if (startAt > 0.03 && startAt < 0.97) {
        requestAnimationFrame(() => { el.scrollTop = startAt * (el.scrollHeight - el.clientHeight); });
      }
    }
    const d = reduced() ? 0 : 1;
    gsap.fromTo(".reader", { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 0.55 * d, ease: "power3.out" });
    gsap.fromTo(".readerHead > *", { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.8 * d, stagger: 0.07 * d, ease: "power3.out", delay: 0.15 * d });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [close]);

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    pct.current = max > 0 ? Math.min(1, el.scrollTop / max) : 1;
    if (bar.current) bar.current.style.transform = `scaleX(${pct.current})`;
  };

  return (
    <div className="reader" role="dialog" aria-modal="true" aria-label={p.title}>
      <div className="readerBar" ref={bar} />
      <button type="button" className="readerClose" onClick={close} aria-label="Close"><Icon n="close" /></button>

      <div className="readerScroll" ref={scroller} onScroll={onScroll}>
        <div className="readerBanner"><Art piece={p} /></div>

        <article className="prose">
          <header className="readerHead">
            <span className="badge">{p.category} · {p.format}</span>
            <h1>{p.title}</h1>
            <div className="meta">
              {p.rating ? <Stars n={p.rating} /> : null}
              <span>{p.readMins} min read</span><span>{fmtDate(p.date)}</span>
            </div>
            <p className="lede">{p.excerpt}</p>
          </header>

          <div className="body">{p.body.map((para, idx) => <p key={idx}>{para}</p>)}</div>

          {p.tags.length > 0 && <div className="tags">{p.tags.map((t) => <span key={t}>#{t}</span>)}</div>}

          <div className="readerActions">
            <button type="button" className={`ghost ${isLiked ? "on" : ""}`} onClick={() => onLike(p.id)} aria-pressed={isLiked}>
              <Icon n="heart" fill={isLiked} /> {isLiked ? "Appreciated" : "Appreciate"}
            </button>
            <button type="button" className={`ghost ${isSaved ? "on" : ""}`} onClick={() => onSave(p.id)} aria-pressed={isSaved}>
              <Icon n="list" fill={isSaved} /> {isSaved ? "In my list" : "Save to my list"}
            </button>
            {mine && (
              <button type="button" className="ghost danger" onClick={() => { if (confirm("Delete this piece?")) onDelete(p.id); }}>
                <Icon n="trash" /> Delete
              </button>
            )}
          </div>
        </article>

        {related.length > 0 && (
          <section className="more">
            <h2>Keep reading</h2>
            <div className="moreGrid">
              {related.map((r) => (
                <button key={r.id} type="button" className="moreItem" onClick={() => onOpen(r)}>
                  <Art piece={r} />
                  <span><small>{r.category}</small><strong>{r.title}</strong><em>{r.readMins} min read</em></span>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ composer */
function Composer({ onClose, onPublish }: { onClose: () => void; onPublish: (p: Piece) => void }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("Movies");
  const [format, setFormat] = useState<Format>("Opinion");
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");

  const words = body.trim().split(/\s+/).filter(Boolean).length;
  const valid = title.trim().length > 2 && words >= 20;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    gsap.fromTo(".composer", { x: 80, opacity: 0 }, { x: 0, opacity: 1, duration: reduced() ? 0 : 0.5, ease: "power3.out" });
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  const publish = () => {
    if (!valid) return;
    onPublish({
      id: `me-${Date.now()}`,
      title: title.trim(), category, format,
      excerpt: excerpt.trim() || body.trim().replace(/\s+/g, " ").slice(0, 150) + (body.length > 150 ? "…" : ""),
      body: body.split(/\n+/).map((s) => s.trim()).filter(Boolean),
      tags: tags.split(",").map((t) => t.trim().replace(/^#/, "")).filter(Boolean).slice(0, 6),
      rating: format === "Review" && rating ? rating : undefined,
      readMins: wordsToMins(body),
      date: new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <div className="scrim" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="composer" role="dialog" aria-modal="true" aria-label="Write a piece">
        <header>
          <h2>Write a piece</h2>
          <button type="button" className="iconBtn" onClick={onClose} aria-label="Close"><Icon n="close" /></button>
        </header>

        <div className="composerGrid">
          <div className="form">
            <label>Title
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Why the quiet ending works" maxLength={90} />
            </label>

            <div className="row">
              <label>Topic
                <select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label>Format
                <select value={format} onChange={(e) => setFormat(e.target.value as Format)}>
                  {FORMATS.map((f) => <option key={f}>{f}</option>)}
                </select>
              </label>
            </div>

            {format === "Review" && (
              <div className="ratingPick" role="radiogroup" aria-label="Rating">
                <span>Rating</span>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" role="radio" aria-checked={rating === n} className={n <= rating ? "on" : ""}
                    onClick={() => setRating(rating === n ? 0 : n)} aria-label={`${n} stars`}>★</button>
                ))}
              </div>
            )}

            <label>Short summary <small>(optional, shown on the card)</small>
              <input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} maxLength={160} placeholder="One line that makes someone want to read it" />
            </label>

            <label>Your writing <small>{words} words · {wordsToMins(body)} min read · new line = new paragraph</small>
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={10} placeholder="Write your idea, opinion or analysis…" />
            </label>

            <label>Tags <small>(comma separated)</small>
              <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="streaming, characters, adaptation" />
            </label>
          </div>

          <aside className="preview" aria-label="Card preview">
            <span className="previewLabel">Card preview</span>
            <div className="previewCard">
              <Art piece={{ id: title || category, category }} />
              <span className="cardCat">{category}</span>
              <span className="cardInfo"><strong>{title || "Your title"}</strong><em>{format} · {wordsToMins(body)} min read</em></span>
            </div>
            <p className="hint">Pieces are saved in this browser. Connect a database later to publish for every reader.</p>
          </aside>
        </div>

        <footer>
          <button type="button" className="ghost" onClick={onClose}>Cancel</button>
          <button type="button" className="cta" onClick={publish} disabled={!valid}>Publish</button>
        </footer>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ page */
const RAIL_TITLES: Record<Category, string> = {
  Movies: "Movies & cinema", Characters: "Characters", OTT: "OTT & streaming",
  "Short films": "Short films", Adaptation: "Literature → Screen",
};

export default function Dashboard() {
  const [mine, setMine] = useState<Piece[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [liked, setLiked] = useState<string[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [ready, setReady] = useState(false);

  const [cat, setCat] = useState<Category | "All">("All");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"home" | "list">("home");
  const [reading, setReading] = useState<Piece | null>(null);
  const [composing, setComposing] = useState(false);
  const [toast, setToast] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const searchRef = useRef<HTMLInputElement>(null);

  /* load + persist */
  useEffect(() => {
    setMine(load<Piece[]>(STORAGE.pieces, []));
    setSaved(load<string[]>(STORAGE.saved, []));
    setLiked(load<string[]>(STORAGE.liked, []));
    setProgress(load<Record<string, number>>(STORAGE.progress, {}));
    setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
    setReady(true);
  }, []);
  useEffect(() => { if (ready) save(STORAGE.pieces, mine); }, [mine, ready]);
  useEffect(() => { if (ready) save(STORAGE.saved, saved); }, [saved, ready]);
  useEffect(() => { if (ready) save(STORAGE.liked, liked); }, [liked, ready]);
  useEffect(() => { if (ready) save(STORAGE.progress, progress); }, [progress, ready]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  const onSave = useCallback((id: string) => setSaved((s) => toggle(s, id)), []);
  const onLike = useCallback((id: string) => setLiked((s) => toggle(s, id)), []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    const apply = () => {
      document.documentElement.dataset.theme = next;
      setTheme(next);
      try { localStorage.setItem("theme", next); } catch { /* ignore */ }
    };
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    if (doc.startViewTransition && !reduced()) doc.startViewTransition(apply); else apply();
  };

  /* data */
  const all = useMemo(() => [...mine, ...SEED].sort((a, b) => b.date.localeCompare(a.date)), [mine]);
  const q = query.trim().toLowerCase();
  const browsing = q !== "" || cat !== "All" || view === "list";

  const results = useMemo(
    () =>
      all.filter(
        (p) =>
          (view !== "list" || saved.includes(p.id)) &&
          (cat === "All" || p.category === cat) &&
          (!q || [p.title, p.excerpt, p.category, p.format, p.tags.join(" ")].join(" ").toLowerCase().includes(q))
      ),
    [all, cat, q, view, saved]
  );

  const featured = useMemo(() => {
    const f = all.filter((p) => p.featured);
    return (f.length ? f : all).slice(0, 4);
  }, [all]);

  const continueItems = all.filter((p) => (progress[p.id] ?? 0) > 0.03 && (progress[p.id] ?? 0) < 0.97);
  const savedItems = all.filter((p) => saved.includes(p.id));

  /* reveal rails as they scroll into view */
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".ott .reveal:not(.in)");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
      { rootMargin: "0px 0px -6% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [browsing, ready, all.length, results.length, continueItems.length, savedItems.length]);

  const open = useCallback((p: Piece) => setReading(p), []);
  const closeReader = useCallback((pct: number) => {
    setReading((cur) => {
      if (cur) setProgress((pr) => ({ ...pr, [cur.id]: pct > 0.97 ? 1 : Math.round(pct * 100) / 100 }));
      return null;
    });
  }, []);

  const related = reading
    ? [...all.filter((p) => p.id !== reading.id && p.category === reading.category), ...all.filter((p) => p.id !== reading.id && p.category !== reading.category)].slice(0, 3)
    : [];

  const reset = () => { setView("home"); setCat("All"); setQuery(""); };

  const railProps = { saved, progress, onOpen: open, onSave };
  const heading = view === "list" ? "My list" : q ? `Results for “${query.trim()}”` : cat !== "All" ? RAIL_TITLES[cat] : "All pieces";

  return (
    <div className="ott">
      {/* ---------------- sidebar ---------------- */}
      <aside className="side">
        <Link href="/" className="logo" aria-label="Screen / Studies home">S<span>/</span>S</Link>
        <nav>
          <button type="button" className={!browsing ? "on" : ""} onClick={reset}><Icon n="home" /><span>Home</span></button>
          <button type="button" onClick={() => { setView("home"); searchRef.current?.focus(); }}><Icon n="search" /><span>Search</span></button>
          <button type="button" className={view === "list" ? "on" : ""} onClick={() => { setView("list"); setCat("All"); setQuery(""); }}>
            <Icon n="list" /><span>My list</span>{saved.length > 0 && <b>{saved.length}</b>}
          </button>
          <button type="button" onClick={() => setComposing(true)}><Icon n="pen" /><span>Write</span></button>
        </nav>
        <button type="button" className="themeBtn" onClick={toggleTheme} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
          <Icon n={theme === "dark" ? "sun" : "moon"} /><span>{theme === "dark" ? "Light" : "Dark"}</span>
        </button>
      </aside>

      {/* ---------------- main ---------------- */}
      <main className="main">
        <header className="top">
          <div className="chips" role="tablist" aria-label="Topics">
            {(["All", ...CATEGORIES] as const).map((c) => (
              <button key={c} type="button" role="tab" aria-selected={cat === c} className={`chip ${cat === c ? "on" : ""}`}
                onClick={() => { setCat(c); if (view === "list") setView("home"); }}>
                {c}
              </button>
            ))}
          </div>
          <label className="search">
            <Icon n="search" />
            <input ref={searchRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search movies, characters, OTT…" aria-label="Search pieces" />
            {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><Icon n="close" /></button>}
          </label>
        </header>

        {!browsing && <Hero items={featured} onOpen={open} saved={saved} onSave={onSave} />}

        <div className="content">
          {browsing ? (
            <section className="results">
              <header className="resultsHead">
                <h2>{heading}</h2>
                <span>{results.length} {results.length === 1 ? "piece" : "pieces"}</span>
              </header>
              {results.length ? (
                <div className="grid">
                  {results.map((p) => (
                    <div key={p.id} className="gridCell reveal">
                      <Card p={p} onOpen={open} onSave={onSave} isSaved={saved.includes(p.id)} progress={progress[p.id]} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty">
                  <strong>{view === "list" ? "Your list is empty" : "Nothing matches that yet"}</strong>
                  <p>{view === "list" ? "Tap the bookmark on any piece to keep it here." : "Try another word, or clear the search."}</p>
                  <button type="button" className="ghost" onClick={reset}>Back to home</button>
                </div>
              )}
            </section>
          ) : (
            <>
              <Rail title="Continue reading" items={continueItems} {...railProps} />
              <Rail title="Latest opinions" items={all.slice(0, 8)} {...railProps} />
              {CATEGORIES.map((c) => (
                <Rail key={c} title={RAIL_TITLES[c]} items={all.filter((p) => p.category === c)} {...railProps} />
              ))}
              <Rail title="My list" items={savedItems} {...railProps} />
            </>
          )}
        </div>

        <footer className="foot">
          <span>Screen / Studies</span>
          <span>Cinema · OTT · Characters · Short films</span>
          <button type="button" className="ghost" onClick={() => setComposing(true)}><Icon n="pen" /> Write a piece</button>
        </footer>
      </main>

      {reading && (
        <Reader
          p={reading} related={related} startAt={progress[reading.id] ?? 0}
          isSaved={saved.includes(reading.id)} isLiked={liked.includes(reading.id)}
          mine={reading.id.startsWith("me-")}
          onClose={closeReader} onSave={onSave} onLike={onLike} onOpen={open}
          onDelete={(id) => { setMine((m) => m.filter((x) => x.id !== id)); setReading(null); setToast("Piece deleted"); }}
        />
      )}

      {composing && (
        <Composer
          onClose={() => setComposing(false)}
          onPublish={(p) => { setMine((m) => [p, ...m]); setComposing(false); reset(); setToast("Published. It's now on your dashboard."); }}
        />
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}