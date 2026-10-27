import type { Metadata } from "next";
import "./globals.css";
import "./i18n.css";
import LanguageProvider from "../components/LanguageProvider";

export const metadata: Metadata = {
  title: "Screen / Studies — Cinema & OTT Research",
  description: "Research on cinema, OTT, adaptation, representation and digital screen culture.",
};

// Runs before first paint so there is no light/dark flash.
// Uses the saved choice, otherwise the device preference. Change the fallback here if you want a fixed default.
const themeInit = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}