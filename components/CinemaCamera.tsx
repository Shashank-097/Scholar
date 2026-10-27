"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import gsap from "gsap";

interface CinemaCameraProps {
  colored?: boolean;
  onToggle?: () => void;
  hintOn?: string;
  hintOff?: string;
  /** "Label - tagline" strings, one per poster (en dash, em dash or hyphen). */
  categories?: string[];
  /** Poster image per category (same order). A missing file falls back to the drawn art. */
  images?: string[];
}

/* Poster text comes from the `categories` prop ("Label - tagline"), so it follows the site language.
   To use real artwork, add `image: "/assets/posters/your-file.jpg"` to any entry. */
interface Poster {
  id: string;
  p1: string; // gradient start
  p2: string; // gradient end
  text: string; // title colour
  art: string; // line-art colour
  image?: string;
}

// Order matches the categories: Adaptations, OTT, Documentary, Drama, Thriller
const POSTERS: Poster[] = [
  { id: "paper-moons", p1: "#e7d9cc", p2: "#b28a48", text: "#211714", art: "#861f2d" },
  { id: "binge", p1: "#2a1c1a", p2: "#7a1c2a", text: "#fff2df", art: "#d8b976" },
  { id: "frame-by-frame", p1: "#17110f", p2: "#3b2724", text: "#fff2df", art: "#b28a48" },
  { id: "last-reel", p1: "#861f2d", p2: "#2a1214", text: "#fff2df", art: "#d8b976" },
  { id: "autoplay", p1: "#b28a48", p2: "#861f2d", text: "#fff8f1", art: "#fff2df" },
];

const DEFAULT_CATEGORIES = [
  "Adaptations - page to frame",
  "Ott – beyond episodes",
  "Documentary – unfiltered reality",
  "Drama – human acts",
  "Thriller – hidden layers",
];

function splitCategory(c: string): { label: string; title: string } {
  const m = c.match(/^(.*?)\s+[-–—]\s+(.*)$/);
  return m ? { label: m[1], title: m[2] } : { label: c, title: c };
}

const MID = (POSTERS.length - 1) / 2;
const HOLES = [0, 60, 120, 180, 240, 300];

function PosterArt({ id }: { id: string }) {
  const common = { className: "posterArt", viewBox: "0 0 100 64", "aria-hidden": true } as const;
  switch (id) {
    case "paper-moons":
      return (
        <svg {...common}>
          <rect x="18" y="10" width="34" height="44" rx="2" />
          <path d="M25 21h20M25 29h20M25 37h13" />
          <rect x="46" y="18" width="36" height="32" rx="2" />
          <circle cx="64" cy="34" r="8" />
        </svg>
      );
    case "binge":
      return (
        <svg {...common}>
          <path d="M20 14l22 18-22 18z" />
          <path d="M42 14l22 18-22 18z" opacity=".65" />
          <path d="M64 14l22 18-22 18z" opacity=".35" />
        </svg>
      );
    case "last-reel":
      return (
        <svg {...common}>
          <circle cx="50" cy="32" r="24" />
          <circle cx="50" cy="32" r="4" />
          {[0, 72, 144, 216, 288].map((a) => (
            <circle key={a} cx={50 + Math.cos((a * Math.PI) / 180) * 14} cy={32 + Math.sin((a * Math.PI) / 180) * 14} r="4" />
          ))}
        </svg>
      );
    case "frame-by-frame":
      return (
        <svg {...common}>
          <rect x="8" y="14" width="24" height="36" rx="2" />
          <rect x="38" y="14" width="24" height="36" rx="2" opacity=".7" />
          <rect x="68" y="14" width="24" height="36" rx="2" opacity=".4" />
          <path d="M8 8h84M8 56h84" strokeDasharray="3 4" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="50" cy="32" r="9" />
          <circle cx="50" cy="32" r="17" opacity=".6" />
          <circle cx="50" cy="32" r="25" opacity=".3" />
        </svg>
      );
  }
}

export default function CinemaCamera({
  colored,
  onToggle,
  hintOn = "Now showing · click to close",
  hintOff = "Click to develop",
  categories = DEFAULT_CATEGORIES,
  images = [],
}: CinemaCameraProps) {
  // Controlled when `colored` is passed, otherwise manages its own state.
  const [internal, setInternal] = useState(false);
  const isActive = colored ?? internal;
  const [selected, setSelected] = useState(2);
  const [broken, setBroken] = useState<string[]>([]);

  const rootRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<SVGCircleElement>(null);
  const reelA = useRef<SVGGElement>(null);
  const reelB = useRef<SVGGElement>(null);
  const spins = useRef<gsap.core.Tween[]>([]);
  const idle = useRef<gsap.core.Tween[]>([]);
  const first = useRef(true);

  /* ---------- idle motion: reels + gentle float, paused when off-screen ---------- */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    spins.current = [
      gsap.to(reelA.current, { rotation: 360, svgOrigin: "135 70", duration: 9, repeat: -1, ease: "none" }),
      gsap.to(reelB.current, { rotation: -360, svgOrigin: "215 70", duration: 9, repeat: -1, ease: "none" }),
    ];
    // The float lives on a wrapper (not the filtered SVG), so it stays on the GPU.
    idle.current = [
      gsap.to(rigRef.current, { y: -8, duration: 3.2, yoyo: true, repeat: -1, ease: "sine.inOut" }),
    ];

    const all = [...spins.current, ...idle.current];
    const io = new IntersectionObserver(
      ([entry]) => all.forEach((t) => (entry.isIntersecting ? t.resume() : t.pause())),
      { threshold: 0 }
    );
    if (rootRef.current) io.observe(rootRef.current);

    return () => {
      io.disconnect();
      all.forEach((t) => t.kill());
    };
  }, []);

  /* ---------- reels speed up when active ---------- */
  useEffect(() => {
    spins.current.forEach((t) =>
      gsap.to(t, { timeScale: isActive ? 3.5 : 1, duration: 0.9, ease: "power2.out" })
    );
  }, [isActive]);

  /* ---------- poster fan: deploys from the camera, retracts on second click ---------- */
  useEffect(() => {
    const deck = deckRef.current;
    const caption = captionRef.current;
    if (!deck || !caption) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cards = gsap.utils.toArray<HTMLElement>(".poster", deck);

    // scale the whole fan to the camera width so it fits small screens
    const k = Math.max(0.72, Math.min(1, (rootRef.current?.clientWidth ?? 430) / 430));
    deck.style.setProperty("--k", String(k));

    const spread = 80 * k;
    const rise = 96 * k;
    const drop = 12 * k;
    const tilt = 12;

    let tl: gsap.core.Timeline | null = null;

    if (isActive) {
      gsap.set(deck, { visibility: "visible" });
      tl = gsap.timeline();
      tl.fromTo(
        cards,
        { x: 0, y: 70, rotation: 0, scale: 0.35, autoAlpha: 0 },
        {
          x: (i: number) => (i - MID) * spread,
          y: (i: number) => -rise - Math.abs(i - MID) * drop,
          rotation: (i: number) => (i - MID) * tilt,
          scale: 1,
          autoAlpha: 1,
          duration: reduce ? 0 : 1.15,
          ease: "back.out(1.5)",
          stagger: { each: 0.08, from: "center" },
        }
      ).fromTo(
        caption,
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: reduce ? 0 : 0.7, ease: "power3.out" },
        reduce ? 0 : "-=0.55"
      );
    } else if (!first.current) {
      tl = gsap.timeline({ onComplete: () => { gsap.set(deck, { visibility: "hidden" }); } });
      tl.to(caption, { autoAlpha: 0, y: 8, duration: reduce ? 0 : 0.3, ease: "power2.in" }, 0).to(
        cards,
        {
          x: 0, y: 70, rotation: 0, scale: 0.35, autoAlpha: 0,
          duration: reduce ? 0 : 0.6, ease: "power3.in",
          stagger: { each: 0.05, from: "edges" },
        },
        0
      );
    }
    first.current = false;

    return () => { tl?.kill(); };
  }, [isActive]);

  const handleClick = () => {
    setInternal((v) => !v);
    onToggle?.();

    gsap.fromTo(rigRef.current, { scale: 0.96 }, { scale: 1, duration: 0.8, ease: "back.out(2.2)" });
    if (!isActive && flashRef.current) {
      // lens flash when the camera switches on
      gsap.fromTo(
        flashRef.current,
        { opacity: 0.9, scale: 0.3, svgOrigin: "380 192" },
        { opacity: 0, scale: 2.8, svgOrigin: "380 192", duration: 0.9, ease: "power2.out" }
      );
    }
  };

  const renderReel = (ref: React.RefObject<SVGGElement | null>, cx: number, cy: number) => (
    <g ref={ref}>
      <circle className="reelDisc" cx={cx} cy={cy} r="36" />
      <circle className="reelRim" cx={cx} cy={cy} r="31" />
      {HOLES.map((a) => (
        <circle
          key={a}
          className="reelHole"
          cx={cx + Math.cos((a * Math.PI) / 180) * 22}
          cy={cy + Math.sin((a * Math.PI) / 180) * 22}
          r="7"
        />
      ))}
      <circle className="reelHub" cx={cx} cy={cy} r="9" />
    </g>
  );

  const items = POSTERS.map((p, i) => ({ ...p, image: images[i] && !broken.includes(images[i]) ? images[i] : undefined, ...splitCategory(categories[i] ?? "") }));
  const current = items[selected];

  return (
    <div ref={rootRef} className={`cinemaCamera ${isActive ? "isActive" : ""}`}>
      <div className="cameraGlow" />

      {/* posters rise out of the camera (sits behind the SVG so they emerge from the magazine) */}
      <div ref={deckRef} className="posterDeck" aria-hidden={!isActive}>
        {items.map((p, i) => (
          <button
            key={p.id}
            type="button"
            className={`poster ${i === selected ? "selected" : ""}`}
            tabIndex={isActive ? 0 : -1}
            aria-label={`${p.label} — ${p.title}`}
            aria-pressed={i === selected}
            onClick={() => setSelected(i)}
            onPointerEnter={(e) => e.pointerType === "mouse" && setSelected(i)}
            onFocus={() => setSelected(i)}
            style={{ "--p1": p.p1, "--p2": p.p2, "--pt": p.text, "--pa": p.art } as CSSProperties}
          >
            <span className="posterFace">
              {p.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="posterImg" src={p.image} alt="" loading="lazy" draggable={false} onError={() => setBroken((b) => [...b, p.image as string])} />
              ) : (
                <>
                  <small className="posterLabel">{p.label}</small>
                  <PosterArt id={p.id} />
                </>
              )}
              <strong className="posterTitle">{p.title}</strong>
            </span>
          </button>
        ))}
      </div>

      <div ref={rigRef} className="cameraRig">
        <button
          type="button"
          className="cameraButton"
          onClick={handleClick}
          aria-pressed={isActive}
          aria-label={isActive ? hintOn : hintOff}
        >
          <svg className="cameraSvg" viewBox="0 0 450 340" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <linearGradient id="camBody" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#40352f" />
                <stop offset="100%" stopColor="#0d0a09" />
              </linearGradient>
              <radialGradient id="camLens" cx="0.35" cy="0.35">
                <stop offset="0%" stopColor="#f6e6b8" />
                <stop offset="40%" stopColor="#b28a48" />
                <stop offset="100%" stopColor="#1a1411" />
              </radialGradient>
              <linearGradient id="camBeam" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#f4dca0" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#f4dca0" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* projector beam */}
            <polygon className="camBeam" points="386,192 640,60 640,324" fill="url(#camBeam)" />

            {/* film reels (behind the body) */}
            {renderReel(reelA, 135, 70)}
            {renderReel(reelB, 215, 70)}

            {/* film running from reels into the magazine */}
            <path className="camFilm" d="M99 76 C 92 98, 98 104, 112 104 M251 76 C 258 98, 252 104, 238 104" />

            {/* magazine base */}
            <rect className="camPart" x="95" y="100" width="160" height="30" rx="8" />
            <path className="camVent" d="M115 112h120M115 119h120" />

            {/* body */}
            <rect className="camBody" x="60" y="128" width="230" height="128" rx="16" fill="url(#camBody)" />
            <rect className="camAccent" x="60" y="128" width="230" height="9" rx="4" />
            <path className="camShine" d="M76 142h198" />
            <rect className="camPanel" x="80" y="152" width="56" height="74" rx="7" />
            <circle className="camDotA" cx="108" cy="177" r="9" />
            <circle className="camDotB" cx="108" cy="203" r="9" />
            <circle className="recLight" cx="268" cy="150" r="4.5" />
            <path className="camVent" d="M156 160h100M156 170h100M156 180h100" />

            {/* lens barrel + hood + glass */}
            <rect className="camPart" x="290" y="158" width="62" height="68" rx="8" />
            <rect className="camPart" x="348" y="148" width="30" height="88" rx="6" />
            <ellipse className="camGlass" cx="380" cy="192" rx="9" ry="36" fill="url(#camLens)" />
            <ellipse className="lensRing" cx="380" cy="192" rx="5.5" ry="24" />
            <ellipse className="lensShine" cx="377" cy="178" rx="2.4" ry="9" />
            <circle className="lensCore" cx="320" cy="192" r="12" />
            <circle ref={flashRef} className="lensFlash" cx="380" cy="192" r="22" opacity="0" />

            {/* tripod, centred under the body */}
            <rect className="camPart" x="120" y="256" width="110" height="12" rx="5" />
            <path className="camLeg" d="M150 268 L112 322 M200 268 L238 322 M175 268 V326" />
          </svg>

          <span className="cameraHint">{isActive ? hintOn : hintOff}</span>
        </button>
      </div>

      <div className="cameraShadow" />

      {/* caption for the selected poster */}
      <div ref={captionRef} className="posterCaption" aria-live="polite">
        <div key={current.id} className="captionBody">
          <span className="captionCount">
            {String(selected + 1).padStart(2, "0")} / {String(POSTERS.length).padStart(2, "0")} · {current.label}
          </span>
          <h4>{current.title}</h4>
        </div>
      </div>
    </div>
  );
}