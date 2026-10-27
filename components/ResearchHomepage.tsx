"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import type React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis"; // npm i lenis
import CinemaCamera from "./CinemaCamera";
import AreaArt from "./AreaArt";
import { AREA_META, CAMERA_POSTERS } from "./areas";
import { LangToggle, ThemeToggle } from "./SiteChrome";
import { useLang } from "./LanguageProvider";

gsap.registerPlugin(ScrollTrigger);

// on-page sections that the nav highlights while scrolling ("/about" is a separate page)
const SECTION_IDS = ["#home", "#my-work", "#blogs", "#resources", "#contact"];

export default function ResearchHomepage() {
  const { t, lang } = useLang();
  const h = t.home;

  const [menuOpen, setMenuOpen] = useState(false);
  const [cameraColored, setCameraColored] = useState(false);
  const [activeLink, setActiveLink] = useState("#home");
  const lenisRef = useRef<Lenis | null>(null);

  const links: [string, string][] = [
    ["#home", t.nav.home], ["/about", t.nav.about], ["#my-work", t.nav.work],
    ["#blogs", h.nav.blogs], ["#resources", h.nav.resources], ["#contact", t.nav.contact],
  ];

  // Text length changes with the language, so trigger positions must be recalculated.
  useEffect(() => {
    const id = setTimeout(() => ScrollTrigger.refresh(), 60);
    return () => clearTimeout(id);
  }, [lang]);

  // When the camera shows its posters, quiet the panel behind them so the fan reads clearly.
  const camFirst = useRef(true);
  useEffect(() => {
    if (camFirst.current) { camFirst.current = false; return; }
    gsap.to(".screen3d", { opacity: cameraColored ? 0.12 : 1, scale: cameraColored ? 0.94 : 1, duration: 0.9, ease: "power2.out", overwrite: "auto" });
    gsap.to(".floatTag", { autoAlpha: cameraColored ? 0 : 1, duration: 0.5, overwrite: "auto" });
  }, [cameraColored]);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, smoothWheel: true });
      lenisRef.current = lenis;
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      gsap
        .timeline({ defaults: { ease: "power4.out" } })
        .from(".eyebrow", { opacity: 0, y: 20, duration: 0.7 })
        .from(".lineInner", { yPercent: 115, duration: 1.1, stagger: 0.12 }, "-=0.4")
        .from(".intro, .actions", { opacity: 0, y: 24, duration: 0.8, stagger: 0.12 }, "-=0.7")
        .from(".screen3d", { opacity: 0, x: 90, rotateY: -28, duration: 1.3 }, "-=1.1")
        .from(".heroCamera", { opacity: 0, scale: 0.7, y: 50, duration: 1.2, ease: "back.out(1.5)" }, "-=0.9")
        .from(".floatTag", { opacity: 0, y: 20, duration: 0.7 }, "-=0.5");

      const hero = { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 };
      gsap.to(".heroVideo", { scale: 1.18, ease: "none", scrollTrigger: hero });
      gsap.to(".screen3d", { yPercent: -10, ease: "none", scrollTrigger: hero });
      gsap.to(".heroCamera", { yPercent: -16, ease: "none", scrollTrigger: hero });
      gsap.to(".heroCopy", { yPercent: 8, opacity: 0.35, ease: "none", scrollTrigger: hero });

      const rotY = gsap.quickTo(".tilt", "rotationY", { duration: 0.8, ease: "power3.out" });
      const rotX = gsap.quickTo(".tilt", "rotationX", { duration: 0.8, ease: "power3.out" });
      const spotX = gsap.quickTo(".spotlight", "x", { duration: 1.2, ease: "power3.out" });
      const spotY = gsap.quickTo(".spotlight", "y", { duration: 1.2, ease: "power3.out" });
      gsap.set(".tilt", { transformPerspective: 900 });
      const onMove = (e: globalThis.PointerEvent) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        rotY(nx * 16); rotX(-ny * 12); spotX(nx * 60); spotY(ny * 40);
      };
      window.addEventListener("pointermove", onMove);

      const loop = gsap.to(".marqueeTrack", { xPercent: -50, duration: 30, ease: "none", repeat: -1 });
      ScrollTrigger.create({
        onUpdate: (self) => {
          loop.timeScale(1 + Math.min(Math.abs(self.getVelocity()) / 250, 7));
          gsap.to(loop, { timeScale: 1, duration: 1.2, overwrite: true });
        },
      });

      gsap.to(".progress", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: true } });
      const nav = document.querySelector(".nav");
      ScrollTrigger.create({
        start: 0, end: "max",
        onUpdate: (self) => {
          nav?.classList.toggle("scrolled", self.scroll() > 40);
          nav?.classList.toggle("hide", self.direction === 1 && self.scroll() > 240);
        },
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) =>
        gsap.fromTo(el, { opacity: 0, y: 44 }, {
          opacity: 1, y: 0, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 86%" },
        })
      );
      gsap.set(".researchCard, .article", { opacity: 0, y: 50 });
      ScrollTrigger.batch(".researchCard, .article", {
        start: "top 88%",
        onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: "power3.out" }),
      });
      gsap.utils.toArray<HTMLElement>(".cardMedia").forEach((el) =>
        gsap.fromTo(el.firstElementChild, { yPercent: -7 }, {
          yPercent: 7, ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        })
      );
      gsap.fromTo(".featureObject", { opacity: 0, x: -60 }, {
        opacity: 1, x: 0, duration: 1.1, ease: "power3.out",
        scrollTrigger: { trigger: ".feature", start: "top 78%" },
      });
      gsap.to(".footerBig", {
        yPercent: -8, ease: "none",
        scrollTrigger: { trigger: "footer", start: "top bottom", end: "bottom bottom", scrub: 1 },
      });

      SECTION_IDS.forEach((id) =>
        ScrollTrigger.create({
          trigger: id, start: "top 55%", end: "bottom 55%",
          onToggle: (self) => self.isActive && setActiveLink(id),
        })
      );

      // Heading tracking animation (CSS forces letter-spacing: 0 for Hindi, where negative spacing breaks conjuncts)
      gsap.utils.toArray<HTMLElement>(".sectionHead h2, .featureText h2, .contact h2").forEach((el) =>
        gsap.fromTo(el, { letterSpacing: "-0.03em" }, {
          letterSpacing: "-0.055em", ease: "none",
          scrollTrigger: { trigger: el, start: "top 90%", end: "top 40%", scrub: true },
        })
      );

      return () => {
        window.removeEventListener("pointermove", onMove);
        gsap.ticker.remove(tick);
        lenis.destroy();
        lenisRef.current = null;
      };
    });

    mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const cleanups: Array<() => void> = [];

      gsap.set(".cursor", { xPercent: -50, yPercent: -50, opacity: 0 });
      const cx = gsap.quickTo(".cursor", "x", { duration: 0.35, ease: "power3.out" });
      const cy = gsap.quickTo(".cursor", "y", { duration: 0.35, ease: "power3.out" });
      const cursor = document.querySelector(".cursor");
      const move = (e: globalThis.PointerEvent) => {
        cx(e.clientX); cy(e.clientY);
        gsap.to(".cursor", { opacity: 1, duration: 0.3, overwrite: "auto" });
      };
      const over = (e: globalThis.PointerEvent) => {
        const hot = (e.target as HTMLElement).closest("a, button, .researchCard, .article");
        cursor?.classList.toggle("hot", !!hot);
      };
      const leave = () => gsap.to(".cursor", { opacity: 0, duration: 0.3 });
      window.addEventListener("pointermove", move);
      document.addEventListener("pointerover", over);
      document.documentElement.addEventListener("pointerleave", leave);
      cleanups.push(() => {
        window.removeEventListener("pointermove", move);
        document.removeEventListener("pointerover", over);
        document.documentElement.removeEventListener("pointerleave", leave);
      });

      gsap.utils.toArray<HTMLElement>(".btn.primary, .brand, .themeToggle, .menu").forEach((el) => {
        const xTo = gsap.quickTo(el, "x", { duration: 0.7, ease: "elastic.out(1, 0.55)" });
        const yTo = gsap.quickTo(el, "y", { duration: 0.7, ease: "elastic.out(1, 0.55)" });
        const onEnterMove = (e: globalThis.PointerEvent) => {
          const r = el.getBoundingClientRect();
          xTo((e.clientX - (r.left + r.width / 2)) * 0.3);
          yTo((e.clientY - (r.top + r.height / 2)) * 0.3);
        };
        const onLeave = () => { xTo(0); yTo(0); };
        el.addEventListener("pointermove", onEnterMove);
        el.addEventListener("pointerleave", onLeave);
        cleanups.push(() => {
          el.removeEventListener("pointermove", onEnterMove);
          el.removeEventListener("pointerleave", onLeave);
        });
      });

      return () => cleanups.forEach((fn) => fn());
    });

    return () => mm.revert();
  }, []);

  const scrollToSection = (id: string) => {
    setMenuOpen(false);
    const lenis = lenisRef.current;
    if (lenis) lenis.scrollTo(id, { duration: 1.3, easing: (x: number) => 1 - Math.pow(1 - x, 4) });
    else document.querySelector(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const trackPointer = (e: PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
    // gentle 3D tilt toward the pointer
    e.currentTarget.style.setProperty("--ry", `${((e.clientX - r.left) / r.width - 0.5) * 9}deg`);
    e.currentTarget.style.setProperty("--rx", `${-((e.clientY - r.top) / r.height - 0.5) * 9}deg`);
  };
  const resetTilt = (e: PointerEvent<HTMLElement>) => {
    e.currentTarget.style.setProperty("--rx", "0deg");
    e.currentTarget.style.setProperty("--ry", "0deg");
  };

  return (
    <div className={`site ${cameraColored ? "developed" : ""}`}>
      <div className="grain" />
      <div className="progress" />
      <div className="cursor" aria-hidden="true" />

      <header className="nav">
        <button type="button" className="brand" onClick={() => scrollToSection("#home")} aria-label={h.nav.goHome}>
          Screen<span>/</span>Studies
        </button>

        <nav className={`links ${menuOpen ? "open" : ""}`}>
          {links.map(([id, label]) =>
            id.startsWith("/") ? (
              <Link key={id} href={id} onClick={() => setMenuOpen(false)}>{label}</Link>
            ) : (
              <a key={id} href={id} className={activeLink === id ? "active" : ""}
                onClick={(e) => { e.preventDefault(); scrollToSection(id); }}>
                {label}
              </a>
            )
          )}
        </nav>

        <div className="navTools">
          <LangToggle />
          <ThemeToggle />
          <button type="button" className="menu" onClick={() => setMenuOpen((v) => !v)}
            aria-label={h.nav.toggleMenu} aria-expanded={menuOpen}>
            {menuOpen ? t.nav.close : t.nav.menu}
          </button>
        </div>
      </header>

      {/* HERO */}
      <section id="home" className="hero">
        <video className="heroVideo" autoPlay muted loop playsInline preload="metadata" aria-hidden="true">
          <source src="/assets/higgsfield-hero-loop.mp4" type="video/mp4" />
        </video>
        <div className="heroVideoOverlay" />

        <div className="heroContent">
          <div className="heroCopy">
            <div className="eyebrow">{h.eyebrow}</div>

            <h1>
              <span className="line"><span className="lineInner">{h.h1.a}</span></span>
              <span className="line"><span className="lineInner"><em>{h.h1.em}</em>{h.h1.b}</span></span>
              <span className="line"><span className="lineInner">{h.h1.c}</span></span>
            </h1>

            <p className="intro">{h.intro}</p>

            <div className="actions">
              <button type="button" className="btn primary" onClick={() => scrollToSection("#my-work")}>
                {t.hero.play} <span>↗</span>
              </button>
              <button type="button" className="btn text" onClick={() => scrollToSection("#resources")}>
                {t.hero.articles} <span>↓</span>
              </button>
            </div>
          </div>
        </div>

        <div className="stage">
          <div className="spotlight" />

          <div className="screen3d" aria-hidden="true">
            <div className="screenTop">{h.screen.top}</div>
            <div className="screenWord" style={{
              fontSize: "clamp(1.9rem, 4.4vw, 4.4rem)",
              lineHeight: lang === "hi" ? 1.25 : 1.02,
              letterSpacing: lang === "hi" ? 0 : "-0.02em",
              maxWidth: "100%",
              overflowWrap: "anywhere",
            }}>{h.screen.word}</div>
            <div className="screenLine">{h.screen.line}</div>
          </div>

          <div className="heroCamera">
            <div className="tilt">
              <CinemaCamera colored={cameraColored} onToggle={() => setCameraColored((v) => !v)}
                hintOff={h.cam.off} hintOn={h.cam.on} categories={h.categories} images={CAMERA_POSTERS} />
            </div>
          </div>

          <div className="floatTag">{h.screen.tag}</div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="categoryMarquee" aria-hidden="true">
        <div className="marqueeTrack">
          {[...h.marquee, ...h.marquee, ...h.marquee, ...h.marquee].map((m, i) => (
            <span className="marqueeItem" key={i}>{m} <b>✦</b></span>
          ))}
        </div>
      </section>

      {/* ABOUT (teaser, full story lives on /about) */}
      <section id="about" className="introSection">
        <div className="sectionLabel" data-reveal>{h.about.label}</div>
        <div data-reveal>
          <h2>{h.about.h2[0]}<br /><span>{h.about.h2[1]}</span></h2>
          {[h.about.p1, h.about.p2, h.about.p3].map((p, i) => p && <p key={i}>{p}</p>)}
          <Link href="/about" className="btn text">{h.about.cta} <span>↗</span></Link>
        </div>
      </section>

      {/* MY WORK */}
      <section id="my-work" className="work">
        <div className="workGlow g1" aria-hidden="true" />
        <div className="workGlow g2" aria-hidden="true" />
        <div className="sectionHead" data-reveal>
          <div>
            <div className="sectionLabel">{h.work.label}</div>
            <h2>{h.work.h2[0]}<br /><span>{h.work.h2[1]}</span></h2>
          </div>
          <p className="all">{h.work.count}</p>
        </div>

        <div className="cards">
          {t.areas.map((item, i) => (
            <Link key={item.n} href={`/work/${AREA_META[i].slug}`} onPointerMove={trackPointer} onPointerLeave={resetTilt} className="researchCard" style={{ "--i": i } as React.CSSProperties}>
              <div className="cardMedia" aria-hidden="true">
                <AreaArt index={i} posters={AREA_META[i].posters} />
              </div>
              <div className="cardBody">
                <div className="cardTop"><strong>{item.n}</strong><span>{item.cat}</span></div>
                <h3>{item.title}</h3>
                <p className="cardText">{item.text}</p>
                <span className="cardRead">{t.areasUi.read} <i>↗</i></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURE */}
      <section id="blogs" className="feature">
        <div className="featureObject">
          <div className="ring" />
          <div className="orbit" />
          <div className="miniScreen">
            <span>{h.feature.mini[0]}</span>
            <b>{h.feature.mini[1]}</b>
            <span>{h.feature.mini[2]}</span>
          </div>
        </div>

        <div className="featureText" data-reveal>
          <div className="sectionLabel">{h.feature.label}</div>
          <h2>{h.feature.h2[0]}<br /><span>{h.feature.h2[1]}</span></h2>
          <p>{h.feature.p1}</p>
          <p>{h.feature.p2}</p>
          <button type="button" className="btn text" onClick={() => scrollToSection("#resources")}>
            {h.feature.cta} <span>↗</span>
          </button>
        </div>
      </section>

      {/* ARTICLES */}
      <section id="resources" className="articles">
        <div className="sectionHead" data-reveal>
          <div>
            <div className="sectionLabel">{h.articles.label}</div>
            <h2>{h.articles.h2[0]}<br /><span>{h.articles.h2[1]}</span></h2>
            <p className="sectionIntro">{h.articles.intro}</p>
          </div>
          <p className="all">{h.articles.count}</p>
        </div>

        <div className="articleList">
          {t.slides.map((a, i) => (
            <article className="article" key={i}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <small>{a.tag}</small>
                <h3>{a.title}</h3>
                <p>{a.text}</p>
              </div>
              <b>↗</b>
            </article>
          ))}
        </div>

        {/* TODO: point this at your articles page when it exists */}
        <button type="button" className="btn text articlesCta" onClick={() => scrollToSection("#resources")}>
          {h.articles.cta} <span>↗</span>
        </button>
      </section>

      {/* CONTACT */}
      <section id="contact" className="contact">
        <div data-reveal>
          <div className="sectionLabel">{h.contactHead.label}</div>
          <h2>{h.contactHead.h2[0]}<br /><span>{h.contactHead.h2[1]}</span></h2>
          <p>{t.contact.text}</p>
          {h.contactHead.note && <p className="contactNote"><strong>{h.contactHead.note}</strong></p>}
          <a href="mailto:hello@example.com" className="btn primary">{t.contact.cta} <span>↗</span></a>
        </div>
      </section>

      <footer>
        <div className="footerBig">{h.bigFooter[0]}<br /><em>{h.bigFooter[1]}</em></div>
        <div className="footerInfo">
          <span>{t.footer.name}</span>
          <span>{t.footer.tags}</span>
          <a href="mailto:hello@example.com">hello@example.com</a>
          <small>{t.footer.copy}</small>
          <button type="button" className="btn text" onClick={() => scrollToSection("#home")}>{t.footer.top}</button>
        </div>
      </footer>
    </div>
  );
}