"use client";

import { useEffect } from "react";
import type { CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SiteFooter, SiteNav } from "../../components/SiteChrome";
import { useLang } from "../../components/LanguageProvider";

gsap.registerPlugin(ScrollTrigger);

const HUES = [262, 340, 18, 190];

export default function AboutPage() {
  const { t } = useLang();
  const a = t.about;

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(".aboutHero > *", { opacity: 0, y: 36, duration: 1, stagger: 0.12, ease: "power3.out", delay: 0.15 });
      gsap.set(".pillar", { opacity: 0, y: 50 });
      ScrollTrigger.batch(".pillar", {
        start: "top 88%",
        onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: "power3.out" }),
      });
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) =>
        gsap.fromTo(el, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 86%" } })
      );
    });
    return () => mm.revert();
  }, []);

  return (
    <div className="site">
      <SiteNav />

      <section className="aboutHero">
        <div className="eyebrowPill">{a.label}</div>
        <h1>{a.title}</h1>
        <p className="lead">{a.lead}</p>
        <div className="chips" aria-label={a.insideTitle}>
          {a.inside.map((c) => <span key={c}>{c}</span>)}
        </div>
      </section>

      <section className="pillars">
        {a.pillars.map((p, i) => (
          <article key={i} className="pillar" style={{ "--h": HUES[i] } as CSSProperties}>
            <b>{String(i + 1).padStart(2, "0")}</b>
            <h3>{p.title}</h3>
            <p>{p.text}</p>
          </article>
        ))}
      </section>

      <section className="approach" data-reveal>
        <h2>{a.approachTitle}</h2>
        <div>
          {a.approach.map((p, i) => <p key={i} className={i === 0 ? "first" : ""}>{p}</p>)}
        </div>
      </section>

      <section className="quote" data-reveal>
        <blockquote>{a.closing}</blockquote>
        <div className="chips">
          <small>{a.forTitle}</small>
          {a.forWho.map((w) => <span key={w}>{w}</span>)}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}