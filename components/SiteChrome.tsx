"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLang } from "./LanguageProvider";

type Theme = "light" | "dark";

/** Same sun/moon toggle as the homepage; reads the theme the <head> script already applied. */
export function ThemeToggle() {
  const { t } = useLang();
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  }, []);

  const toggle = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const apply = () => {
      document.documentElement.dataset.theme = next;
      setTheme(next);
      try { localStorage.setItem("theme", next); } catch {}
    };
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    if (doc.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      doc.startViewTransition(apply);
    } else apply();
  }, [theme]);

  return (
    <button type="button" className="themeToggle" onClick={toggle}
      aria-label={theme === "dark" ? t.home.nav.toLight : t.home.nav.toDark} aria-pressed={theme === "dark"}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle className="sunCore" cx="12" cy="12" r="4.2" />
        <g className="sunRays">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line key={a} x1="12" y1="2.6" x2="12" y2="5" transform={`rotate(${a} 12 12)`} />
          ))}
        </g>
        <path className="moonCut" d="M16.5 4.5a8.5 8.5 0 1 0 3 13.2A7.5 7.5 0 0 1 16.5 4.5z" />
      </svg>
    </button>
  );
}

export function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="lang" role="group" aria-label="Language">
      <button type="button" className={lang === "en" ? "on" : ""} aria-pressed={lang === "en"} onClick={() => setLang("en")}>EN</button>
      <button type="button" className={lang === "hi" ? "on" : ""} aria-pressed={lang === "hi"} onClick={() => setLang("hi")}>हिं</button>
    </div>
  );
}

/** Nav for inner pages (About). The homepage keeps its own nav so its Lenis scrolling and highlights still work. */
export function SiteNav() {
  const { t } = useLang();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const nav = useRef<HTMLElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let last = 0;
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      nav.current?.classList.toggle("scrolled", y > 40);
      nav.current?.classList.toggle("hide", y > last && y > 240);
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const items: [string, string][] = [
    ["/", t.nav.home], ["/about", t.nav.about], ["/#my-work", t.nav.work],
    ["/#blogs", t.home.nav.blogs], ["/#resources", t.home.nav.resources], ["/#contact", t.nav.contact],
  ];

  return (
    <>
      <div className="grain" />
      <div className="progress" ref={bar} />
      <header className="nav" ref={nav}>
        <Link href="/" className="brand" aria-label={t.home.nav.goHome}>Screen<span>/</span>Studies</Link>

        <nav className={`links ${open ? "open" : ""}`}>
          {items.map(([href, label]) => (
            <Link key={href} href={href} className={path === href ? "active" : ""} onClick={() => setOpen(false)}>{label}</Link>
          ))}
        </nav>

        <div className="navTools">
          <LangToggle />
          <ThemeToggle />
          <button type="button" className="menu" onClick={() => setOpen((v) => !v)}
            aria-label={t.home.nav.toggleMenu} aria-expanded={open}>
            {open ? t.nav.close : t.nav.menu}
          </button>
        </div>
      </header>
    </>
  );
}

export function SiteFooter() {
  const { t } = useLang();
  return (
    <footer className="simpleFoot">
      <span>{t.footer.copy}</span>
      <span>{t.footer.tags}</span>
      <button type="button" className="btn text" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        {t.footer.top}
      </button>
    </footer>
  );
}