// In-memory cache for Wikipedia thumbnail URLs
const wikiImageCache = new Map<string, string | null>();
const pendingRequests = new Map<string, Promise<string | null>>();

/**
 * Fetch a high-quality authentic thumbnail from Wikipedia/Wikimedia Commons
 * for an attraction name with graceful fallback and memory caching.
 */
export async function fetchWikiAttractionImage(
  name: string,
  lang: string = 'de'
): Promise<string | null> {
  if (!name || typeof name !== 'string') return null;

  // Clean noise terms
  const cleanName = name
    .replace(/\(.*?\)/g, '')
    .replace(/^(Besuch|Ausflug|Führung|Tour|Erlebnis)\s+(an\s+der|am|in\s+der|im|zu|zum|zur)?/i, '')
    .trim();

  if (cleanName.length < 3) return null;

  const cacheKey = `${lang}:${cleanName.toLowerCase()}`;
  if (wikiImageCache.has(cacheKey)) {
    return wikiImageCache.get(cacheKey) || null;
  }

  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey)!;
  }

  const promise = (async () => {
    try {
      const endpoint = `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${encodeURIComponent(
        cleanName
      )}&gsrlimit=1&prop=pageimages&pithumbsize=800&origin=*`;

      const response = await fetch(endpoint, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        wikiImageCache.set(cacheKey, null);
        return null;
      }

      const data = await response.json();
      const pages = data?.query?.pages;
      if (pages) {
        const pageId = Object.keys(pages)[0];
        const thumb = pages[pageId]?.thumbnail?.source;
        if (thumb && typeof thumb === 'string') {
          wikiImageCache.set(cacheKey, thumb);
          return thumb;
        }
      }

      // If not found in primary lang and primary lang was not 'en', try English Wikipedia
      if (lang !== 'en') {
        const enEndpoint = `https://en.wikipedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${encodeURIComponent(
          cleanName
        )}&gsrlimit=1&prop=pageimages&pithumbsize=800&origin=*`;

        const enRes = await fetch(enEndpoint, { headers: { 'Accept': 'application/json' } });
        if (enRes.ok) {
          const enData = await enRes.json();
          const enPages = enData?.query?.pages;
          if (enPages) {
            const enPageId = Object.keys(enPages)[0];
            const enThumb = enPages[enPageId]?.thumbnail?.source;
            if (enThumb && typeof enThumb === 'string') {
              wikiImageCache.set(cacheKey, enThumb);
              return enThumb;
            }
          }
        }
      }

      wikiImageCache.set(cacheKey, null);
      return null;
    } catch {
      wikiImageCache.set(cacheKey, null);
      return null;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  })();

  pendingRequests.set(cacheKey, promise);
  return promise;
}
