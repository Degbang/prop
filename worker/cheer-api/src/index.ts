type Quote = { text: string; author?: string };

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const FALLBACK_QUOTES: Quote[] = [
  { text: "You are allowed to be soft today." },
  { text: "One small step is still a step." },
  { text: "Breathe. You are safe." },
  { text: "You are loved, loudly and daily." },
  { text: "Rest is still love." },
];

const FALLBACK_JOKES = {
  dad: [
    "I’m reading a book about anti‑gravity. It’s impossible to put down.",
    "Why don’t eggs tell jokes? They’d crack each other up.",
    "I used to play piano by ear, but now I use my hands.",
  ],
  funny: [
    "I told my computer I needed a break. It said, “No problem, I’ll go to sleep.”",
    "Why did the scarecrow win an award? Because he was outstanding in his field.",
    "I tried to catch fog yesterday. Mist.",
  ],
  nerdy: [
    "There are 10 kinds of people: those who understand binary and those who don’t.",
    "A SQL query walks into a bar and asks, “Can I join you?”",
    "I would tell you a UDP joke, but you might not get it.",
  ],
  hr: [
    "HR rule #1: If you didn’t document it, it didn’t happen.",
    "Out‑of‑office message: I’m currently avoiding meetings and thriving.",
    "Performance review: exceeds expectations in snack consumption.",
  ],
};

const FALLBACK_RIDDLES = [
  { question: "What has a heart that doesn’t beat?", answer: "An artichoke." },
  { question: "What gets wetter the more it dries?", answer: "A towel." },
  { question: "What has keys but can’t open locks?", answer: "A piano." },
];

const SONG_FALLBACKS: Record<string, Array<{ artist: string; title: string }>> = {
  adele: [
    { artist: "Adele", title: "Easy On Me" },
    { artist: "Adele", title: "Hello" },
    { artist: "Adele", title: "Hold On" },
  ],
  stormzy: [
    { artist: "Stormzy", title: "Blinded By Your Grace, Pt. 2" },
    { artist: "Stormzy", title: "Big For Your Boots" },
    { artist: "Stormzy", title: "Hide & Seek" },
  ],
  raye: [
    { artist: "RAYE", title: "Escapism." },
    { artist: "RAYE", title: "Oscar Winning Tears." },
  ],
  "lucas graham": [
    { artist: "Lucas Graham", title: "7 Years" },
    { artist: "Lucas Graham", title: "Love Someone" },
  ],
  gospel: [
    { artist: "Kirk Franklin", title: "I Smile" },
    { artist: "Maverick City Music", title: "Jireh" },
    { artist: "Tasha Cobbs Leonard", title: "Break Every Chain" },
  ],
  worship: [
    { artist: "Hillsong United", title: "Oceans (Where Feet May Fail)" },
    { artist: "Elevation Worship", title: "Do It Again" },
  ],
  default: [
    { artist: "Adele", title: "Easy On Me" },
    { artist: "Stormzy", title: "Blinded By Your Grace, Pt. 2" },
    { artist: "Lucas Graham", title: "7 Years" },
  ],
};

let quoteCache: Quote[] | null = null;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

async function fetchJson(url: string, timeoutMs = 3500, init: RequestInit = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    if (!res.ok) throw new Error("bad response");
    return await res.json();
  } finally {
    clearTimeout(id);
  }
}

function pickRandom<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function getQuote() {
  try {
    const data = await fetchJson(`https://api.adviceslip.com/advice?ts=${Date.now()}`, 2500);
    const text = String(data?.slip?.advice || "").trim();
    if (text) return { text };
  } catch {}

  try {
    const data = await fetchJson("https://api.quotable.io/random?tags=wisdom|inspirational|faith&maxLength=120", 3000);
    const text = String(data?.content || "").trim();
    const author = String(data?.author || "").trim();
    if (text) return { text, author: author || undefined };
  } catch {}

  return pickRandom(FALLBACK_QUOTES);
}

async function getQuoteList() {
  if (quoteCache?.length) return quoteCache;
  try {
    const data = await fetchJson("https://type.fit/api/quotes", 4000);
    if (Array.isArray(data)) {
      quoteCache = data
        .map((q) => ({ text: String(q?.text || "").trim(), author: String(q?.author || "").trim() || undefined }))
        .filter((q) => q.text);
      if (quoteCache.length) return quoteCache;
    }
  } catch {}
  quoteCache = FALLBACK_QUOTES;
  return quoteCache;
}

async function getVerse(ref: string) {
  const url = `https://labs.bible.org/api/?passage=${encodeURIComponent(ref)}&type=json&formatting=plain`;
  const data = await fetchJson(url, 3500);
  const first = Array.isArray(data) ? data[0] : null;
  const text = String(first?.text || "").replace(/\s+/g, " ").trim();
  const reference = first ? `${first.bookname} ${first.chapter}:${first.verse}` : ref;
  return { reference, text };
}

function pickFallbackSong(query: string) {
  const q = query.toLowerCase();
  const keys = Object.keys(SONG_FALLBACKS).filter((k) => k !== "default");
  for (const key of keys) {
    if (q.includes(key)) return pickRandom(SONG_FALLBACKS[key]);
  }
  return pickRandom(SONG_FALLBACKS.default);
}

async function getSong(query: string) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=25`;
  const data = await fetchJson(url, 3500);
  const results = Array.isArray(data?.results) ? data.results : [];
  const pick = results.length ? pickRandom(results) : null;
  const artist = String(pick?.artistName || "").trim();
  const title = String(pick?.trackName || "").trim();
  if (!artist || !title) return null;
  return { artist, title };
}

async function getJoke(type: string) {
  if (type === "dad") {
    const data = await fetchJson("https://icanhazdadjoke.com/", 2500, {
      headers: { Accept: "application/json" },
    });
    const text = String(data?.joke || "").trim();
    return { text };
  }
  if (type === "funny") {
    const data = await fetchJson("https://official-joke-api.appspot.com/jokes/random", 3000);
    const setup = String(data?.setup || "").trim();
    const punchline = String(data?.punchline || "").trim();
    return { text: [setup, punchline].filter(Boolean).join(" ") };
  }
  if (type === "nerdy") {
    const data = await fetchJson("https://v2.jokeapi.dev/joke/Programming?type=single&safe-mode", 3000);
    return { text: String(data?.joke || "").trim() };
  }
  if (type === "hr") {
    const term = pickRandom(["office", "meeting", "boss", "employee", "interview", "resume"]);
    const data = await fetchJson(
      `https://v2.jokeapi.dev/joke/Miscellaneous?type=single&safe-mode&contains=${encodeURIComponent(term)}`,
      3000
    );
    if (data?.error) throw new Error("no results");
    return { text: String(data?.joke || "").trim() };
  }
  if (type === "riddle") {
    const data = await fetchJson("https://riddles-api.vercel.app/random", 3000);
    const question = String(data?.riddle || data?.question || "").trim();
    const answer = String(data?.answer || data?.solution || "").trim();
    return { question, answer };
  }
  return { text: pickRandom(FALLBACK_JOKES.dad) };
}

export default {
  async fetch(request: Request) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method !== "GET") {
      return json({ error: "Method not allowed" }, 405);
    }

    try {
      switch (url.pathname.replace(/\/+$/, "")) {
        case "":
        case "/":
        case "/health":
          return json({ ok: true });
        case "/quote":
          return json(await getQuote());
        case "/quote/list":
          return json(await getQuoteList());
        case "/verse": {
          const ref = url.searchParams.get("ref") || "Psalm 34:18";
          return json(await getVerse(ref));
        }
        case "/song": {
          const q = url.searchParams.get("q") || "gospel worship";
          try {
            const song = await getSong(q);
            if (song?.artist && song?.title) return json(song);
          } catch {}
          return json(pickFallbackSong(q));
        }
        case "/joke": {
          const type = (url.searchParams.get("type") || "dad").toLowerCase();
          try {
            return json(await getJoke(type));
          } catch {
            if (type === "riddle") return json(pickRandom(FALLBACK_RIDDLES));
            const list = (FALLBACK_JOKES as Record<string, string[]>)[type] || FALLBACK_JOKES.dad;
            return json({ text: pickRandom(list) });
          }
        }
        default:
          return json({ error: "Not found" }, 404);
      }
    } catch (err) {
      return json({ error: "Upstream error" }, 502);
    }
  },
};
