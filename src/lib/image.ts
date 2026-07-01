/**
 * Some creator thumbnails are flaky across environments, especially
 * YouTube-hosted avatars. Keep the URL helper focused on the proxy
 * fallback so callers can try the original source first.
 */
export function safeImageUrl(url: string): string {
  if (!url) return url;
  if (url.includes("yt3.googleusercontent.com") || url.includes("ytimg.com")) {
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=200&h=200&fit=cover&output=webp`;
  }
  return url;
}
