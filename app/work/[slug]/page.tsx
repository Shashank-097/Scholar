// Route: /work/<slug>. Components live in /components.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticlePage from "../../../components/ArticlePage";
import { AREA_META } from "../../../components/areas";
import { dict } from "../../../lib/translations";

export const dynamicParams = false;

export function generateStaticParams() {
  return AREA_META.map((m) => ({ slug: m.slug }));
}

type Props = { params: Promise<{ slug: string }> };

// Each area gets its own title and description for the browser tab, search results and link previews.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const i = AREA_META.findIndex((m) => m.slug === slug);
  if (i < 0) return {};

  const area = dict.en.areas[i];
  const title = `${area.title} · Anantika – The Screen Journal`;
  const description = area.article.lede || area.text;

  return {
    title,
    description,
    openGraph: { title, description, type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  if (!AREA_META.some((m) => m.slug === slug)) notFound();
  return <ArticlePage slug={slug} />;
}