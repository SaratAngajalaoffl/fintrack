/** [DiceBear Thumbs](https://www.dicebear.com/styles/thumbs/) — CC0 avatar style. */
const DICEBEAR_THUMBS_SVG = "https://api.dicebear.com/9.x/thumbs/svg" as const;

/**
 * Stable avatar URL for a seed (e.g. normalized email). Size is the SVG viewport in px.
 */
export function dicebearThumbsAvatarUrl(seed: string, size = 64): string {
  const safe = seed.trim().slice(0, 256);
  const params = new URLSearchParams({
    seed: safe || "anonymous",
    size: String(size),
  });
  return `${DICEBEAR_THUMBS_SVG}?${params.toString()}`;
}
