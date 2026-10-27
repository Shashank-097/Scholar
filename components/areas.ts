/* One entry per card in `areas` (same order). `slug` is the article URL: /work/<slug>.
   `posters`: up to 3 real poster files per area. Put them in /public/assets/posters/ and list them
   here. Any file that is missing falls back to the drawn artwork, so you can add them one by one. */
export interface AreaMeta {
  slug: string;
  posters: string[];
}

export const AREA_META: AreaMeta[] = [
  { slug: "papers-and-publications", posters: ["/assets/posters/papers-1.jpg", "/assets/posters/papers-2.jpg", "/assets/posters/papers-3.jpg"] },
  { slug: "critical-analysis", posters: ["/assets/posters/ott-1.jpg", "/assets/posters/ott-2.jpg", "/assets/posters/ott-3.jpg"] },
  { slug: "literature-to-screen", posters: ["/assets/posters/adapt-1.jpg", "/assets/posters/adapt-2.jpg", "/assets/posters/adapt-3.jpg"] },
  { slug: "language-and-culture", posters: ["/assets/posters/society-1.jpg", "/assets/posters/society-2.jpg", "/assets/posters/society-3.jpg"] },
];

/* Camera posters, in order: Adaptations, OTT, Documentary, Drama, Thriller */
export const CAMERA_POSTERS = [
  "/assets/posters/camera-adaptations.jpg",
  "/assets/posters/camera-ott.jpg",
  "/assets/posters/camera-documentary.jpg",
  "/assets/posters/camera-drama.jpg",
  "/assets/posters/camera-thriller.jpg",
];