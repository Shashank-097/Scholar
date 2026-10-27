"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

/* Original cinema illustrations for the four areas (no third-party artwork).
   Pass `image` to use a real photo instead. */

const GOLD = "#d8b976";
const AMBER = "#b28a48";
const WINE = "#861f2d";
const CREAM = "#fff2df";
const INK = "#120d0b";

function Frame({ id, c1, c2, children }: { id: string; c1: string; c2: string; children: ReactNode }) {
  return (
    <svg className="areaArt" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={`g-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c1} />
          <stop offset="1" stopColor={c2} />
        </linearGradient>
        <radialGradient id={`b-${id}`} cx="0.5" cy="0.38" r="0.62">
          <stop offset="0" stopColor="#f4dca0" stopOpacity="0.38" />
          <stop offset="1" stopColor="#f4dca0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#g-${id})`} />
      <rect width="400" height="300" fill={`url(#b-${id})`} />
      {children}
    </svg>
  );
}

/* a strip of film with perforations, drawn across the bottom */
function Strip({ y = 246, rot = -3 }: { y?: number; rot?: number }) {
  return (
    <g transform={`rotate(${rot} 200 ${y + 22})`}>
      <rect x="-30" y={y} width="460" height="44" fill={INK} />
      <line x1="-30" y1={y + 7} x2="430" y2={y + 7} stroke={CREAM} strokeWidth="5" strokeDasharray="7 9" opacity=".5" />
      <line x1="-30" y1={y + 37} x2="430" y2={y + 37} stroke={CREAM} strokeWidth="5" strokeDasharray="7 9" opacity=".5" />
      {[10, 92, 174, 256, 338].map((x, i) => (
        <rect key={x} x={x} y={y + 13} width="62" height="18" rx="2" fill={i % 2 ? AMBER : GOLD} opacity={0.35 + (i % 3) * 0.15} />
      ))}
    </g>
  );
}

function Papers() {
  return (
    <Frame id="papers" c1="#2a1214" c2="#861f2d">
      <g className="aFloat">
        <g transform="rotate(-11 200 140)">
          <rect x="118" y="44" width="136" height="176" rx="6" fill="#e7d9cc" opacity=".5" />
        </g>
        <g transform="rotate(7 200 140)">
          <rect x="140" y="38" width="136" height="176" rx="6" fill="#e7d9cc" opacity=".72" />
        </g>
        <g transform="rotate(-2 200 140)">
          <rect x="128" y="34" width="144" height="184" rx="6" fill={CREAM} />
          <rect x="144" y="52" width="70" height="12" rx="2" fill={WINE} />
          {[80, 96, 112, 128, 144, 160].map((y, i) => (
            <rect key={y} x="144" y={y} width={i % 3 === 2 ? 70 : 112} height="6" rx="2" fill="#211714" opacity=".28" />
          ))}
          <rect x="144" y="180" width="38" height="22" rx="2" fill={AMBER} opacity=".8" />
        </g>
      </g>
      <g className="aFloat2">
        <circle cx="290" cy="180" r="36" fill="rgba(244,220,160,.12)" stroke={GOLD} strokeWidth="5" />
        <line x1="316" y1="206" x2="346" y2="238" stroke={GOLD} strokeWidth="9" strokeLinecap="round" />
      </g>
      <Strip />
    </Frame>
  );
}

function Ott() {
  return (
    <Frame id="ott" c1="#2a1c1a" c2="#7a1c2a">
      <g className="aFloat">
        <rect x="86" y="46" width="228" height="140" rx="12" fill={INK} stroke={GOLD} strokeWidth="3" />
        <rect x="98" y="58" width="204" height="116" rx="6" fill="#3b1a1c" />
        <circle className="aPulse" cx="200" cy="116" r="30" fill={GOLD} opacity=".92" />
        <path d="M191 100l26 16-26 16z" fill={INK} />
        <path d="M170 202h60" stroke={GOLD} strokeWidth="5" strokeLinecap="round" />
        <path d="M200 186v16" stroke={GOLD} strokeWidth="5" />
      </g>
      {[0, 1, 2].map((i) => (
        <path key={i} className="aWave" style={{ animationDelay: `${i * 0.5}s` }} d={`M${332 + i * 16} ${96 - i * 14}a${34 + i * 16} ${34 + i * 16} 0 0 1 0 ${68 + i * 28}`} fill="none" stroke={GOLD} strokeWidth="4" strokeLinecap="round" />
      ))}
      <g className="aSlide">
        {[18, 90, 162, 234, 306, 378].map((x, i) => (
          <rect key={x} x={x} y="222" width="58" height="42" rx="5" fill={i % 2 ? AMBER : WINE} opacity={0.5 + (i % 3) * 0.17} stroke={CREAM} strokeOpacity=".25" />
        ))}
      </g>
    </Frame>
  );
}

function Adaptation() {
  return (
    <Frame id="adapt" c1="#3b2724" c2="#861f2d">
      <g className="aFloat">
        <path d="M36 92l86 14v118L36 210z" fill={CREAM} opacity=".92" />
        <path d="M208 92l-86 14v118l86-14z" fill="#e7d9cc" />
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <rect x={50} y={116 + i * 17} width={56} height="5" rx="2" fill="#211714" opacity=".3" />
            <rect x={136} y={118 + i * 17} width={56} height="5" rx="2" fill="#211714" opacity=".3" />
          </g>
        ))}
      </g>
      <path className="aDash" d="M214 150C236 120 252 120 268 138" fill="none" stroke={GOLD} strokeWidth="4" strokeLinecap="round" strokeDasharray="8 10" />
      <path d="M262 124l14 16-20 4z" fill={GOLD} />
      <g className="aFloat2">
        <rect x="262" y="84" width="124" height="96" rx="8" fill={INK} stroke={GOLD} strokeWidth="3" />
        <circle cx="352" cy="112" r="11" fill={GOLD} opacity=".9" />
        <path d="M262 168l36-34 28 24 22-16 38 26v12a8 8 0 0 1-8 8H270a8 8 0 0 1-8-8z" fill={WINE} />
        {[270, 292, 314, 336, 358].map((x) => (<rect key={x} x={x} y="88" width="10" height="5" rx="1" fill={CREAM} opacity=".5" />))}
      </g>
      <Strip y={252} rot={2} />
    </Frame>
  );
}

function Society() {
  const heads = [46, 96, 146, 196, 246, 296, 346];
  return (
    <Frame id="society" c1="#17110f" c2="#3b2724">
      <g className="aFloat">
        <path d="M110 126L60 12h280L290 126z" fill="#f4dca0" opacity=".13" />
        <rect x="104" y="30" width="192" height="98" rx="6" fill="#241a17" stroke={GOLD} strokeWidth="3" />
        <rect x="114" y="40" width="172" height="78" rx="3" fill={CREAM} opacity=".9" />
        <circle cx="200" cy="79" r="22" fill="none" stroke={WINE} strokeWidth="5" />
        <path d="M193 68l18 11-18 11z" fill={WINE} />
      </g>
      <g className="aFloat2">
        <path d="M40 150h70a10 10 0 0 1 10 10v22a10 10 0 0 1-10 10H70l-14 14v-14H40a10 10 0 0 1-10-10v-22a10 10 0 0 1 10-10z" fill={GOLD} opacity=".85" />
        <path d="M300 168h64a10 10 0 0 1 10 10v20a10 10 0 0 1-10 10h-8v14l-14-14h-42a10 10 0 0 1-10-10v-20a10 10 0 0 1 10-10z" fill={AMBER} opacity=".8" />
      </g>
      {heads.map((x, i) => (
        <g key={x} opacity={0.5 + (i % 2) * 0.2}>
          <circle cx={x} cy={228 + (i % 2) * 8} r="15" fill={INK} />
          <path d={`M${x - 30} 300c0-28 14-44 30-44s30 16 30 44z`} fill={INK} />
        </g>
      ))}
      {[22, 72, 122, 172, 222, 272, 322, 372].map((x, i) => (
        <g key={x}>
          <circle cx={x} cy={262 + (i % 2) * 6} r="17" fill="#000" opacity=".82" />
          <path d={`M${x - 34} 310c0-30 16-46 34-46s34 16 34 46z`} fill="#000" opacity=".9" />
        </g>
      ))}
    </Frame>
  );
}

function Art({ index }: { index: number }) {
  switch (index) {
    case 0: return <Papers />;
    case 1: return <Ott />;
    case 2: return <Adaptation />;
    default: return <Society />;
  }
}

/* Real posters as a fanned collage. Missing files drop out; if none load, the drawn art shows. */
export default function AreaArt({ index, posters = [] }: { index: number; posters?: string[] }) {
  const [failed, setFailed] = useState<string[]>([]);
  const ok = posters.filter((src) => !failed.includes(src)).slice(0, 3);

  // Slideshow: every few seconds the stack rotates so a different poster comes to the front.
  // Each card starts at a different moment, and it pauses while the pointer is on the card.
  const [shift, setShift] = useState(0);
  const wall = useRef<HTMLDivElement>(null);
  const count = ok.length;
  useEffect(() => {
    if (count < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      timer = setInterval(() => {
        if (document.hidden) return;
        if (wall.current?.closest(".researchCard")?.matches(":hover")) return;
        setShift((v) => v + 1);
      }, 3600);
    }, index * 900);
    return () => { clearTimeout(start); if (timer) clearInterval(timer); };
  }, [count, index]);

  return (
    <>
      {/* hidden probes detect missing files without showing a broken image */}
      {posters.map((src) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={src} src={src} alt="" aria-hidden="true" style={{ display: "none" }} onError={() => setFailed((f) => (f.includes(src) ? f : [...f, src]))} />
      ))}
      {ok.length === 0 ? (
        <Art index={index} />
      ) : (
        <div ref={wall} className={`posterWall n${ok.length}`}>
          {ok.map((src, k) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} className={`wallPoster w${(((k - shift) % ok.length) + ok.length) % ok.length}`} src={src} alt="" loading="lazy" draggable={false} />
          ))}
        </div>
      )}
    </>
  );
}