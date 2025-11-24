// services/api.ts
// Trakt + OMDb integration for index/search
// Ensure EXPO_PUBLIC_OMDB_API_KEY and EXPO_PUBLIC_TRAKT_CLIENT_ID are set (no trailing spaces)

const OMDB_KEY = process.env.EXPO_PUBLIC_OMDB_API_KEY;
const TRAKT_CLIENT_ID_RAW = process.env.EXPO_PUBLIC_TRAKT_CLIENT_ID;
const TRAKT_CLIENT_ID = typeof TRAKT_CLIENT_ID_RAW === "string" ? TRAKT_CLIENT_ID_RAW.trim() : TRAKT_CLIENT_ID_RAW;

export const OMDB_CONFIG = {
  BASE_URL: "https://www.omdbapi.com",
  API_KEY: OMDB_KEY,
  headers: { accept: "application/json" },
};

const TRAKT_BASE = "https://api.trakt.tv";
const TRAKT_HEADERS = (clientId?: string) => ({
  "Content-Type": "application/json",
  "trakt-api-version": "2",
  "trakt-api-key": clientId || "",
});

// small helper: fetch + safe json parse, returns null on non-JSON or network error
async function fetchJson(url: string, options?: any) {
  try {
    const res = await fetch(url, options);
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      console.warn("Non-JSON response for", url, "status", res.status, "body:", text.slice(0, 400));
      return null;
    }
  } catch (e) {
    console.warn("fetchJson error", url, e);
    return null;
  }
}

// concurrency-bounded mapper (simple)
async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (t: T) => Promise<R | null>) {
  const results: (R | null)[] = [];
  const executing: Promise<void>[] = [];

  for (const item of items) {
    const p = Promise.resolve()
      .then(() => fn(item))
      .then((res) => {
        results.push(res ?? null);
      })
      .catch(() => {
        results.push(null);
      });

    executing.push(p);

    if (executing.length >= limit) {
      await Promise.race(executing);
      // we don't aggressively clean up executing array here; it's fine for modest sizes
    }
  }

  await Promise.all(executing);
  return results;
}

// fetch OMDb detail by imdbID (returns parsed JSON or null)
async function fetchOmdbDetail(imdbID: string) {
  if (!OMDB_CONFIG.API_KEY) return null;
  const url = `${OMDB_CONFIG.BASE_URL}/?apikey=${OMDB_CONFIG.API_KEY}&i=${encodeURIComponent(imdbID)}&plot=short`;
  const json = await fetchJson(url, { headers: OMDB_CONFIG.headers });
  if (!json || json.Response === "False") return null;
  return json;
}

// helper to normalise a trakt poster string (adds https: if needed)
function normalizeTraktImage(img?: string | string[] | null) {
  // trakt sometimes returns arrays or a string; we take first if array
  let val: string | undefined;
  if (!img) return null;
  if (Array.isArray(img)) val = img[0];
  else val = img as string;

  if (!val) return null;
  // ensure protocol
  if (val.startsWith("http://") || val.startsWith("https://")) return val;
  // trakt responses often start with media.trakt.tv/... so prefix with https://
  return `https://${val.replace(/^\/+/, "")}`;
}

/**
 * fetchMovies:
 * - If query provided: use OMDb search (page=1) + OMDb detail to get poster/rating
 * - If no query: use Trakt /movies/popular to get a list and prefer Trakt poster, fallback to OMDb detail by imdbID
 *
 * Returns: { results: Movie[], totalResults: number }
 */
export const fetchMovies = async ({ query }: { query: string | null }) => {
  // runtime checks
  if (!OMDB_CONFIG.API_KEY) {
    console.error("OMDb API key missing at runtime. Set EXPO_PUBLIC_OMDB_API_KEY and restart Metro.");
    return { results: [], totalResults: 0 };
  }

  const hasQuery = !!(query && query.trim());

  // ---- CASE A: Query provided -> OMDb search (page 1) ----
  if (hasQuery) {
    const q = query!.trim();
    const searchUrl = `${OMDB_CONFIG.BASE_URL}/?apikey=${OMDB_CONFIG.API_KEY}&s=${encodeURIComponent(q)}&type=movie&page=1`;
    const searchJson = await fetchJson(searchUrl, { headers: OMDB_CONFIG.headers });

    if (!searchJson || searchJson.Response === "False") {
      return { results: [], totalResults: 0 };
    }

    const searchItems: any[] = Array.isArray(searchJson.Search) ? searchJson.Search : [];
    const totalFromApi = searchJson.totalResults ? parseInt(searchJson.totalResults, 10) : searchItems.length;

    // fetch OMDb details for each search item to get poster + rating (bounded concurrency)
    const details = await mapWithConcurrency(searchItems, 5, (m: any) => fetchOmdbDetail(m.imdbID));

    const mapped = (details.filter(Boolean) as any[]).map((d) => ({
      id: d.imdbID,
      title: d.Title,
      year: d.Year,
      poster: d.Poster && d.Poster !== "N/A" ? d.Poster : null,
      rating: d.imdbRating && d.imdbRating !== "N/A" ? d.imdbRating : null,
      type: d.Type,
    }));

    return { results: mapped, totalResults: totalFromApi ?? mapped.length };
  }

  // ---- CASE B: No query -> Trakt popular -> OMDb fallback for missing posters ----
  // If Trakt client id missing, fallback to multi-page OMDb search ('man')
  if (!TRAKT_CLIENT_ID) {
    console.warn("TRAKT_CLIENT_ID missing; falling back to OMDb multi-page 'man' search (up to 50 items).");

    // fetch 5 pages of OMDb 'man'
    const pages = 5;
    const pageUrls = Array.from({ length: pages }, (_, i) =>
      `${OMDB_CONFIG.BASE_URL}/?apikey=${OMDB_CONFIG.API_KEY}&s=${encodeURIComponent("man")}&type=movie&page=${i + 1}`
    );

    const pageJsons = await Promise.all(pageUrls.map((u) => fetchJson(u)));
    const successful = pageJsons.filter((p) => p && p.Response === "True");
    const ids = successful.flatMap((p) => (Array.isArray(p.Search) ? p.Search.map((s: any) => s.imdbID) : []));
    const uniqueIds = Array.from(new Set(ids)).slice(0, 50);

    const details = await mapWithConcurrency(uniqueIds, 5, (id) => fetchOmdbDetail(id));
    const mapped = (details.filter(Boolean) as any[]).map((d) => ({
      id: d.imdbID,
      title: d.Title,
      year: d.Year,
      poster: d.Poster && d.Poster !== "N/A" ? d.Poster : null,
      rating: d.imdbRating && d.imdbRating !== "N/A" ? d.imdbRating : null,
      type: d.Type,
    }));

    return { results: mapped, totalResults: mapped.length };
  }

  // call Trakt to get popular movies
  const traktLimit = 50;
  const traktUrl = `${TRAKT_BASE}/movies/popular?limit=${traktLimit}`;

  // debug logs (visible in Metro/console)
  console.log("fetchMovies(): calling Trakt:", traktUrl);
  console.log("fetchMovies(): TRAKT_CLIENT_ID present:", !!TRAKT_CLIENT_ID);

  const traktJson = await fetchJson(traktUrl, { headers: TRAKT_HEADERS(TRAKT_CLIENT_ID) });

  if (!Array.isArray(traktJson) || traktJson.length === 0) {
    console.warn("Trakt call failed or returned empty; falling back to OMDb multi-page 'man' search.");
    // fallback to OMDb multi-page (same as above)
    const pages = 5;
    const pageUrls = Array.from({ length: pages }, (_, i) =>
      `${OMDB_CONFIG.BASE_URL}/?apikey=${OMDB_CONFIG.API_KEY}&s=${encodeURIComponent("man")}&type=movie&page=${i + 1}`
    );

    const pageJsons = await Promise.all(pageUrls.map((u) => fetchJson(u)));
    const successful = pageJsons.filter((p) => p && p.Response === "True");
    const ids = successful.flatMap((p) => (Array.isArray(p.Search) ? p.Search.map((s: any) => s.imdbID) : []));
    const uniqueIds = Array.from(new Set(ids)).slice(0, traktLimit);

    const details = await mapWithConcurrency(uniqueIds, 5, (id) => fetchOmdbDetail(id));
    const mapped = (details.filter(Boolean) as any[]).map((d) => ({
      id: d.imdbID,
      title: d.Title,
      year: d.Year,
      poster: d.Poster && d.Poster !== "N/A" ? d.Poster : null,
      rating: d.imdbRating && d.imdbRating !== "N/A" ? d.imdbRating : null,
      type: d.Type,
    }));

    return { results: mapped, totalResults: mapped.length };
  }

  // Extract imdb IDs and also keep trakt poster when available
  // Trakt returns elements where either top-level .ids.imdb or .movie.ids.imdb (depending on endpoint shape)
  const traktItems = traktJson.map((it: any) => {
    // support both shapes
    const movie = it.movie ?? it;
    const imdb = movie?.ids?.imdb ?? null;
    const title = movie?.title ?? movie?.title;
    const year = movie?.year ?? movie?.released?.slice(0, 4);
    // Try to find a poster in images.poster array or poster property
    const posterRaw = movie?.images?.poster?.[0] ?? movie?.images?.poster ?? movie?.images?.thumb?.[0] ?? movie?.images?.thumb;
    const posterUrl = normalizeTraktImage(posterRaw);
    return { imdb, title, year, posterUrl, traktRaw: movie };
  });

  // filter only those with imdb ids
  const imdbIds = Array.from(new Set(traktItems.map((t) => t.imdb).filter(Boolean))).slice(0, traktLimit);

  // fetch OMDb details only for items that either lack poster or where we also want rating from OMDb
  // build list of ids that need OMDb detail (if trakt item had no poster or we want OMDb rating)
  const needOmdbFor = traktItems
    .filter((t) => t.imdb && !t.posterUrl) // no poster from trakt
    .map((t) => t.imdb)
    .slice(0, traktLimit);

  // fetch OMDb details for the needed ids (bounded concurrency)
  const omdbDetailsForMissing = await mapWithConcurrency(needOmdbFor, 5, (id) => fetchOmdbDetail(id));
  const omdbById = new Map<string, any>();
  omdbDetailsForMissing.forEach((d) => {
    if (d && d.imdbID) omdbById.set(d.imdbID, d);
  });

  // Also fetch OMDb ratings for all ids? We prefer trakt rating if present; if you want OMDb rating override, adapt here.
  // Build final mapped array by iterating traktItems in original order but filter by imdbIds
  const final: any[] = [];
  for (const t of traktItems) {
    if (!t.imdb) continue;
    if (final.length >= traktLimit) break;
    // prefer trakt posterUrl if exists, else OMDb Poster
    const omdbDetail = omdbById.get(t.imdb) ?? null;
    const poster = t.posterUrl ?? (omdbDetail && omdbDetail.Poster && omdbDetail.Poster !== "N/A" ? omdbDetail.Poster : null);
    // prefer OMDb rating if available; else use trakt rating (trakt has numeric .rating)
    let rating = null;
    if (omdbDetail && omdbDetail.imdbRating && omdbDetail.imdbRating !== "N/A") rating = omdbDetail.imdbRating;
    else if (t.traktRaw && typeof t.traktRaw.rating !== "undefined") rating = String(Math.round((t.traktRaw.rating ?? 0) * 10) / 10);

    final.push({
      id: t.imdb,
      title: t.title ?? (omdbDetail ? omdbDetail.Title : "Untitled"),
      year: t.year ?? (omdbDetail ? omdbDetail.Year : undefined),
      poster,
      rating,
      type: "movie",
    });
  }

  return { results: final, totalResults: final.length };
};
