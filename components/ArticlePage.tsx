"use client";

import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import AreaArt from "./AreaArt";
import { AREA_META } from "./areas";
import { SiteFooter, SiteNav } from "./SiteChrome";
import { useLang } from "./LanguageProvider";
import "./article-enhance.css";

gsap.registerPlugin(ScrollTrigger);

// Small UI labels kept here so translations.ts does not need to change.
const UI = {
  en: { minRead: "min read", contents: "In this article", copy: "Copy link", copied: "Link copied", top: "Back to top", keys: "Use ← → to switch areas", read: "Read", of: "of" },
  hi: { minRead: "मिनट में पढ़ें", contents: "इस लेख में", copy: "लिंक कॉपी करें", copied: "लिंक कॉपी हो गया", top: "ऊपर जाएँ", keys: "क्षेत्र बदलने के लिए ← → दबाएँ", read: "पढ़ा", of: "में से" },
} as const;

/** Reading page for one area of inquiry. Content comes from `areas[i].article` in translations.ts:
    `lede` is the opening line, `body` is a list of paragraphs.
    Start a paragraph with "## " for a heading, or "> " for a pull quote. */
export default function ArticlePage({ slug }: { slug: string }) {
  const { t, lang } = useLang();
  const ui = UI[lang];
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const i = AREA_META.findIndex((m) => m.slug === slug);
  const area = i >= 0 ? t.areas[i] : null;
  const count = t.areas.length;
  const prevIdx = (i + count - 1) % count;
  const nextIdx = (i + 1) % count;

  // reading time + table of contents, recalculated when the language changes
  const { mins, headings } = useMemo(() => {
    if (!area) return { mins: 1, headings: [] as { k: number; text: string }[] };
    const { lede, body } = area.article;
    const words = [lede || area.text, ...body].join(" ").split(/\s+/).filter(Boolean).length;
    return {
      mins: Math.max(1, Math.ceil(words / (lang === "hi" ? 170 : 210))),
      headings: body.flatMap((p, k) => (p.startsWith("## ") ? [{ k, text: p.slice(3) }] : [])),
    };
  }, [area, lang]);

  /* ---------- smooth scrolling (same feel as the homepage) ---------- */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95, smoothWheel: true });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  /* ---------- motion: hero entrance + parallax, paragraphs reveal as you read, reading progress ----------
     Every target is looked up first, so nothing animates (or warns) if an element is absent. */
  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const pick = (sel: string) => gsap.utils.toArray<HTMLElement>(sel, el);
      const media = pick(".articleHeroMedia > *"); // whatever AreaArt renders (svg, img, div)
      const words = pick(".articleHero h1 .w > span");
      const heroLines = pick(".articleHeroText .articleReveal:not(h1)");
      const parallax = pick(".articleHeroMedia");
      const reveals = pick(".articleBody .articleReveal");
      const quotes = pick(".articleBody blockquote");

      if (media.length) gsap.from(media, { scale: 1.14, duration: 1.8, ease: "power3.out" });
      const tl = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.15 });
      if (heroLines.length) tl.from(heroLines, { opacity: 0, y: 24, duration: 0.8, stagger: 0.09 });
      if (words.length) tl.from(words, { yPercent: 115, duration: 1, stagger: 0.07 }, 0.2);

      if (parallax.length) {
        gsap.to(parallax, {
          yPercent: 14, ease: "none",
          scrollTrigger: { trigger: ".articleHero", start: "top top", end: "bottom top", scrub: true },
        });
        gsap.to(".articleHeroText", {
          yPercent: -12, opacity: 0.15, ease: "none",
          scrollTrigger: { trigger: ".articleHero", start: "35% top", end: "bottom top", scrub: true },
        });
      }
      if (reveals.length) {
        gsap.set(reveals, { opacity: 0, y: 28 });
        ScrollTrigger.batch(reveals, {
          start: "top 92%",
          once: true,
          onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, ease: "power3.out" }),
        });
      }
      // pull quotes draw their accent line as they arrive
      quotes.forEach((q) =>
        gsap.fromTo(q, { "--bar": 0 }, {
          "--bar": 1, duration: 1.2, ease: "power3.out",
          scrollTrigger: { trigger: q, start: "top 85%", once: true },
        })
      );
      // reading progress -> --read (0..1) on the layout; the contents list and mobile bar use it
      const layout = pick(".articleLayout")[0];
      if (layout) {
        ScrollTrigger.create({
          trigger: ".articleBody", start: "top 70%", end: "bottom 70%",
          onUpdate: (self) => layout.style.setProperty("--read", self.progress.toFixed(3)),
        });
      }
    }, el);

    return () => ctx.revert();
  }, [slug, lang]);

  /* ---------- highlight the heading you are reading in the contents list ---------- */
  useEffect(() => {
    if (headings.length < 2) return;
    const els = headings.map((h) => document.getElementById(`sec-${h.k}`)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number(e.target.id.replace("sec-", "")));
        }),
      { rootMargin: "-20% 0px -65% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [headings, slug]);

  /* ---------- keyboard: ← previous area, → next area ---------- */
  useEffect(() => {
    if (i < 0) return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (e.metaKey || e.ctrlKey || e.altKey || /input|textarea|select/i.test(el.tagName) || el.isContentEditable) return;
      if (e.key === "ArrowLeft") router.push(`/work/${AREA_META[prevIdx].slug}`);
      if (e.key === "ArrowRight") router.push(`/work/${AREA_META[nextIdx].slug}`);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [i, prevIdx, nextIdx, router]);

  if (!area) notFound();

  const { lede, body } = area.article;
  const prev = t.areas[prevIdx];
  const next = t.areas[nextIdx];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* clipboard blocked: ignore */
    }
  };

  const scrollTo = (target: string | number) => {
    const lenis = lenisRef.current;
    if (lenis) lenis.scrollTo(target, { duration: 1.2, offset: typeof target === "string" ? -90 : 0, easing: (x: number) => 1 - Math.pow(1 - x, 4) });
    else if (typeof target === "number") window.scrollTo({ top: target, behavior: "smooth" });
    else document.querySelector(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // title split into words so each can slide up from behind a mask
  const titleWords = area.title.split(" ");

  return (
    <div className="site articlePage" ref={root}>
      <SiteNav />

      <header className="articleHero">
        <div className="articleHeroMedia" aria-hidden="true">
          <AreaArt index={i} posters={AREA_META[i].posters} />
        </div>
        <div className="articleHeroText">
          <Link href="/#my-work" className="articleBack articleReveal">← {t.areasUi.back}</Link>
          <div className="articleKicker articleReveal"><strong>{area.n}</strong><span>{area.cat}</span></div>
          <h1 aria-label={area.title}>
            {titleWords.map((w, k) => (
              <span className="w" key={k} aria-hidden="true"><span>{w}</span>{k < titleWords.length - 1 ? " " : ""}</span>
            ))}
          </h1>
          <div className="articleMeta articleReveal">
            <span>{mins} {ui.minRead}</span>
            <button type="button" onClick={copyLink} aria-live="polite">
              {copied ? `✓ ${ui.copied}` : `⧉ ${ui.copy}`}
            </button>
          </div>
        </div>
        <div className="heroScroll" aria-hidden="true"><i /></div>
      </header>

      <div className={`articleLayout ${headings.length > 1 ? "hasToc" : ""}`}>
        {headings.length > 1 && (
          <aside className="articleToc" aria-label={ui.contents}>
            <strong>{ui.contents}</strong>
            <ol>
              {headings.map((h) => (
                <li key={h.k}>
                  <button type="button" className={active === h.k ? "on" : ""}
                    aria-current={active === h.k ? "true" : undefined} onClick={() => scrollTo(`#sec-${h.k}`)}>
                    {h.text}
                  </button>
                </li>
              ))}
            </ol>
            <div className="tocBar" aria-hidden="true"><i /></div>
          </aside>
        )}

        <article className="articleBody">
          <p className="articleLede articleReveal">{lede || area.text}</p>

          {body.length > 0 ? (
            body.map((p, k) =>
              p.startsWith("## ") ? (
                <h2 key={k} id={`sec-${k}`} className="articleReveal">{p.slice(3)}</h2>
              ) : p.startsWith("> ") ? (
                <blockquote key={k} className="articleReveal"><p>{p.slice(2)}</p></blockquote>
              ) : (
                <p key={k} className="articleReveal">{p}</p>
              )
            )
          ) : (
            <p className="articleSoon articleReveal">{t.areasUi.soon}</p>
          )}
          <div className="articleEnd" aria-hidden="true"><span /><b>✦</b><span /></div>
        </article>
      </div>

      <nav className="articlePager" aria-label="Areas of inquiry">
        <Link href={`/work/${AREA_META[prevIdx].slug}`} className="prev">
          <div className="pagerMedia" aria-hidden="true"><AreaArt index={prevIdx} posters={AREA_META[prevIdx].posters} /></div>
          <small>← {t.areasUi.prev}</small>
          <span>{prev.title}</span>
        </Link>
        <Link href={`/work/${AREA_META[nextIdx].slug}`} className="next">
          <div className="pagerMedia" aria-hidden="true"><AreaArt index={nextIdx} posters={AREA_META[nextIdx].posters} /></div>
          <small>{t.areasUi.next} →</small>
          <span>{next.title}</span>
        </Link>
      </nav>

      <div className="articleFoot">
        <span>{ui.keys}</span>
        <button type="button" onClick={() => scrollTo(0)}>↑ {ui.top}</button>
      </div>

      <SiteFooter />
    </div>
  );
}