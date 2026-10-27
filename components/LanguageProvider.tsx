"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { dict } from "../lib/translations";
import type { Dict, Lang } from "../lib/translations";

interface LangContext { lang: Lang; t: Dict; setLang: (l: Lang) => void }

const Ctx = createContext<LangContext>({ lang: "en", t: dict.en, setLang: () => {} });

export const useLang = () => useContext(Ctx);

export default function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // restore the saved choice after hydration (keeps server and client markup identical)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("lang");
      if (saved === "en" || saved === "hi") setLangState(saved);
    } catch {}
  }, []);

  // CSS uses html[lang="hi"] to switch to Devanagari-friendly typography
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("lang", l); } catch {}
  };

  return <Ctx.Provider value={{ lang, t: dict[lang], setLang }}>{children}</Ctx.Provider>;
}