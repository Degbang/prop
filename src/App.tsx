import React, { useEffect, useMemo, useRef, useState } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import confetti from "canvas-confetti";
import emailjs from "@emailjs/browser";
import { Heart, Sparkles, Mail, CheckCircle2, ChevronRight, HandHeart } from "lucide-react";
import { PHOTOS, SONG } from "./lib/path";

/* ------------------- CONFIG ------------------- */
const CONFIG = {
  HER: "Lucynda",
  YOU: "Alfred",
  VENUE: "Neem Grill",
  THEME: {
    bg: "from-[#fffaf6] via-[#fff4f6] to-[#f7f0ff]",
    ink: "#121826",
  },
  EMAILS: ["naasakua3@gmail.com", "domegilalfred@gmail.com"],
  EMAILJS: {
    PUBLIC_KEY: "RNZu31Q6C21MqPPKQ",
    SERVICE_ID: "service_rnwta2d",
    TEMPLATE_ID: "template_z56uphp",
  },
};

/* ------------------- LIGHT UI ------------------- */
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
};
function Button({ variant = "primary", size = "md", className = "", type = "button", ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-full";
  const sizes = { sm: "h-8 px-3 text-sm", md: "h-10 px-4 text-sm", lg: "h-11 px-6 text-base" }[size];
  const variants = {
    primary: "text-white bg-gradient-to-br from-[#9cc2ff] to-[#7aa6ff] hover:brightness-[1.05] active:brightness-95",
    secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200",
    ghost: "bg-transparent hover:bg-white/50",
  }[variant];
  return <button type={type} className={`${base} ${sizes} ${variants} ${className}`} {...props} />;
}
function Card(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className = "", ...rest } = props;
  return <div className={`rounded-2xl border border-slate-200/70 bg-white/70 shadow-lg ${className}`} {...rest} />;
}
function CardHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className = "", ...rest } = props;
  return <div className={`px-6 pt-6 pb-2 ${className}`} {...rest} />;
}
function CardTitle(props: React.HTMLAttributes<HTMLHeadingElement>) {
  const { className = "", ...rest } = props;
  return <h3 className={`text-xl font-semibold ${className}`} {...rest} />;
}
function CardContent(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className = "", ...rest } = props;
  return <div className={`px-6 pb-6 pt-2 ${className}`} {...rest} />;
}

function shuffleArray<T>(arr: T[]) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const API_BASE = (
  import.meta.env.VITE_API_BASE || "https://prop-cheer-api.ohemaa-prop.workers.dev"
).replace(/\/$/, "");

async function apiFetch(path: string, timeoutMs = 1200) {
  if (!API_BASE) throw new Error("missing api base");
  return await fetchJsonWithTimeout(`${API_BASE}${path}`, {}, timeoutMs);
}

/* ------------------- AUDIO ------------------- */
function useAudio(src: string) {
  const [playing, setPlaying] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    const el = new Audio(src);
    el.preload = "auto";
    el.crossOrigin = "anonymous";
    audio.current = el;
    return () => {
      el.pause();
      el.src = "";
      audio.current = null;
    };
  }, [src]);
  const play = async () => {
    try {
      await audio.current?.play();
      setPlaying(true);
    } catch {}
  };
  return { play, playing };
}

/* ------------------- LAYOUT ------------------- */
function GradientBG({ children }: { children: React.ReactNode }) {
  return (
    <div className={`min-h-svh w-screen overflow-x-hidden bg-gradient-to-br ${CONFIG.THEME.bg}`} style={{ color: CONFIG.THEME.ink }}>
      {/* soft textures for vibe */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.08] mix-blend-multiply"
        style={{
          backgroundImage:
            "radial-gradient(40rem_40rem_at_20%_10%,#fff_0,transparent_60%),radial-gradient(46rem_46rem_at_80%_0%,#fff_0,transparent_55%)",
        }}
      />
      <main className="relative flex min-h-svh flex-col">{children}</main>
    </div>
  );
}
function Section({ children, id, center = true }: { children: React.ReactNode; id?: string; center?: boolean }) {
  return (
    <section id={id} className={`relative flex-1 py-10 min-h-[calc(100svh-56px)] ${center ? "grid place-items-center" : ""}`}>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}
function TopNav() {
  return (
    <nav className="sticky top-0 z-40 backdrop-blur bg-white/40 ring-1 ring-slate-200/60">
      <div className="mx-auto w-full max-w-6xl h-14 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#9cc2ff] to-[#7aa6ff] grid place-items-center text-white shadow-inner">
            <Heart className="w-4 h-4" />
          </div>
          <span className="text-sm text-slate-700/80">
            {CONFIG.YOU} → {CONFIG.HER}
          </span>
        </Link>
        <div className="flex items-center gap-5 text-sm text-slate-700/80">
          <Link to="memories" className="hover:underline">Memories</Link>
          <Link to="offer" className="hover:underline">Offer</Link>
          <Link to="valentine" className="hover:underline">Valentine</Link>
          <Link to="cheer" className="hover:underline"> Cheer up Corner</Link>
        </div>
      </div>
    </nav>
  );
}

/* ------------------- VALENTINE ------------------- */
const LOVE_NOTES_BODY = [
  "I love your boobs — they’re beautiful and perfectly you.",
  "I love your breasts; soft, warm, and comforting.",
  "I love your chest; it feels like home.",
  "I love your bosom; it’s the sweetest place to rest.",
  "I love your curves; every inch is lovely.",
  "I love your milkers; they make me blush.",
  "I love your twins; I smile every time.",
  "I love your tatas; they’re adorable.",
  "I love your knockers; they’re irresistible.",
  "I love your tits; they’re gorgeous.",
];

const LOVE_NOTES_EXTRA = [
  "I love your smile; it makes everything softer.",
  "I love your dimple; it’s my favorite little detail.",
  "I love your thunderbolt energy; it sparks me alive.",
  "I love your throat and neck; so delicate and beautiful.",
  "I love your soft belly; it feels like home.",
  "I love your kind self; you’re gentle with people.",
  "I love your motherly nature; it’s warm and steady.",
  "YOU ARE SO FUNNY.",
  "I love your eyes; they calm me.",
  "I love your laugh; it turns my day around.",
];

function ValentinePage() {
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (!accepted) return;
    confetti({ particleCount: 160, spread: 90, origin: { y: 0.6 }, scalar: 0.9 });
  }, [accepted]);

  if (accepted) {
    return (
      <Section>
        <div className="grid gap-6 w-full max-w-3xl mx-auto">
          <Card className="bg-rose-50/70 border-rose-200/70 shadow-xl">
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Yay. She said yes. 💙</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700/90">
                Thank you, love. I’ll make it soft, sweet, and a little bit magical. There there. I’ve got you.
                Please bear with me and be patient with me as I learn to love you even better.
              </p>
              <div className="mt-4 flex gap-3">
                <Button onClick={() => setAccepted(false)} variant="secondary">Read it again</Button>
              </div>
            </CardContent>
          </Card>
          <PrayerBlock />
        </div>
      </Section>
    );
  }

  return (
    <Section>
      <Card className="bg-rose-50/70 border-rose-200/70 shadow-xl">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Will you be my Valentine?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700/90 leading-relaxed">
            Hey Lucynda, I know I can be annoying, but I’m trying and God knows my heart. I am trying to love you
            more each day. I really don’t mean to upset you or make you mad. It’s the devil’s fault, I promise. 😉
            I love you, and I want to ask you to be my Valentine.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" onClick={() => setAccepted(true)}>
              <Sparkles className="w-4 h-4 mr-2" />
              Yes, I’ll be your Valentine
            </Button>
          </div>
        </CardContent>
      </Card>
    </Section>
  );
}

/* ------------------- CHEER UP CORNER ------------------- */
const ytSearch = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

const MOODS = [
  {
    id: "sad",
    label: "Sad",
    quote: "You are allowed to be soft today.",
    msg: "Hey love, I’m here. You don’t have to carry it alone. Let me sit with you and make the world quiet for a while.",
    action: "Take 3 slow breaths. I’ll wait right here.",
    verseRef: "Psalm 34:18",
    verseFallback: "The Lord is near to the brokenhearted and saves the crushed in spirit.",
    songQueries: [
      "Adele Easy On Me",
      "Stormzy Blinded By Your Grace Pt. 2",
      "gospel worship comfort",
      "RAYE Escapism",
    ],
    songs: [
      { title: "Easy On Me", artist: "Adele", url: ytSearch("Adele Easy On Me") },
      { title: "Blinded By Your Grace, Pt. 2", artist: "Stormzy", url: ytSearch("Stormzy Blinded By Your Grace Pt. 2") },
    ],
  },
  {
    id: "tired",
    label: "Tired",
    quote: "Rest is holy. You are not falling behind.",
    msg: "Your body is wise, and it’s asking for gentleness. I’ll bring you water, snacks, and peace.",
    action: "Close your eyes for 10 seconds and unclench your jaw.",
    verseRef: "Matthew 11:28",
    verseFallback: "Come to me, all who labor and are heavy laden, and I will give you rest.",
    songQueries: [
      "Kirk Franklin I Smile",
      "Maverick City Music Jireh",
      "gospel chill worship",
      "Adele Someone Like You",
    ],
    songs: [
      { title: "I Smile", artist: "Kirk Franklin", url: ytSearch("Kirk Franklin I Smile") },
      { title: "Jireh", artist: "Maverick City Music", url: ytSearch("Maverick City Music Jireh") },
    ],
  },
  {
    id: "anxious",
    label: "Anxious",
    quote: "Your heart is safe with me.",
    msg: "There there. Let’s name what’s heavy and leave the rest for later. I’m still right here, still yours.",
    action: "Inhale for 4, hold for 4, exhale for 6. Repeat 3 times.",
    verseRef: "Philippians 4:6-7",
    verseFallback: "Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God.",
    songQueries: [
      "Hillsong United Oceans",
      "RAYE Escapism",
      "gospel peace worship",
      "Adele Hold On",
    ],
    songs: [
      { title: "Oceans (Where Feet May Fail)", artist: "Hillsong United", url: ytSearch("Hillsong United Oceans") },
      { title: "Escapism.", artist: "RAYE", url: ytSearch("RAYE Escapism") },
    ],
  },
  {
    id: "overwhelmed",
    label: "Overwhelmed",
    quote: "One thing at a time. I’ll carry the next one.",
    msg: "We can shrink the day together. Give me one tiny task and I’ll do it with you.",
    action: "Pick just one small thing. That is enough.",
    verseRef: "Isaiah 41:10",
    verseFallback: "Fear not, for I am with you; be not dismayed, for I am your God; I will strengthen you, I will help you.",
    songQueries: [
      "Elevation Worship Do It Again",
      "Lucas Graham Love Someone",
      "gospel encouragement",
      "Adele Skyfall",
    ],
    songs: [
      { title: "Do It Again", artist: "Elevation Worship", url: ytSearch("Elevation Worship Do It Again") },
      { title: "Love Someone", artist: "Lucas Graham", url: ytSearch("Lucas Graham Love Someone") },
    ],
  },
  {
    id: "lonely",
    label: "Lonely",
    quote: "I’m never far, even when I’m not there.",
    msg: "Text me. Call me. I want to hear your voice. You are loved, loudly and daily.",
    action: "Send me one word. I’ll reply with five.",
    verseRef: "Deuteronomy 31:8",
    verseFallback: "It is the Lord who goes before you. He will be with you; he will not leave you or forsake you.",
    songQueries: [
      "Adele Hello",
      "Lucas Graham 7 Years",
      "gospel hope worship",
      "Stormzy Hide & Seek",
    ],
    songs: [
      { title: "Hello", artist: "Adele", url: ytSearch("Adele Hello") },
      { title: "7 Years", artist: "Lucas Graham", url: ytSearch("Lucas Graham 7 Years") },
    ],
  },
  {
    id: "mad",
    label: "Mad",
    quote: "Your feelings are valid, even when they’re loud.",
    msg: "If I’m the reason, I’m sorry. I’ll do better. If not, I’m here to listen and hold you.",
    action: "Clench your fists for 5 seconds, then let go. Again, twice.",
    verseRef: "James 1:19",
    verseFallback: "Let every person be quick to hear, slow to speak, slow to anger.",
    songQueries: [
      "Stormzy Big For Your Boots",
      "Tasha Cobbs Leonard Break Every Chain",
      "gospel power praise",
      "Adele Rolling in the Deep",
    ],
    songs: [
      { title: "Big For Your Boots", artist: "Stormzy", url: ytSearch("Stormzy Big For Your Boots") },
      { title: "Break Every Chain", artist: "Tasha Cobbs Leonard", url: ytSearch("Tasha Cobbs Leonard Break Every Chain") },
    ],
  },
];

const MOOD_VARIANTS: Record<string, { msgs: string[]; actions: string[]; quotes: string[] }> = {
  sad: {
    quotes: [
      "Your softness is not weakness.",
      "It’s okay to feel everything.",
    ],
    msgs: [
      "Hey love, I’m here. You don’t have to carry it alone. Let me sit with you and make the world quiet for a while.",
      "If today is heavy, let me carry a little of it. We can just breathe and be still.",
    ],
    actions: [
      "Take 3 slow breaths. I’ll wait right here.",
      "Put on a soft song and sip some water.",
    ],
  },
  tired: {
    quotes: [
      "Rest is still love.",
      "You’re not behind. You’re human.",
    ],
    msgs: [
      "Your body is wise, and it’s asking for gentleness. I’ll bring you water, snacks, and peace.",
      "No pressure today. Rest is still love, and you’re not falling behind.",
    ],
    actions: [
      "Close your eyes for 10 seconds and unclench your jaw.",
      "Stretch your shoulders and roll your neck slowly.",
    ],
  },
  anxious: {
    quotes: [
      "Breathe. You are safe with me.",
      "We can take this one breath at a time.",
    ],
    msgs: [
      "There there. Let’s name what’s heavy and leave the rest for later. I’m still right here, still yours.",
      "Let’s shrink the worry to one sentence, then breathe together.",
    ],
    actions: [
      "Inhale for 4, hold for 4, exhale for 6. Repeat 3 times.",
      "Name 5 things you can see, 4 you can touch, 3 you can hear.",
    ],
  },
  overwhelmed: {
    quotes: [
      "One small win is still a win.",
      "We can do the next tiny thing together.",
    ],
    msgs: [
      "We can shrink the day together. Give me one tiny task and I’ll do it with you.",
      "We only need one small win right now. Just one.",
    ],
    actions: [
      "Pick just one small thing. That is enough.",
      "Write 3 tiny bullet points, then pause.",
    ],
  },
  lonely: {
    quotes: [
      "You are loved, loudly and daily.",
      "I’m with you even when I’m not there.",
    ],
    msgs: [
      "Text me. Call me. I want to hear your voice. You are loved, loudly and daily.",
      "I’m with you in spirit. I want to be the first person you hear from.",
    ],
    actions: [
      "Send me one word. I’ll reply with five.",
      "Step outside for 2 minutes and breathe.",
    ],
  },
  mad: {
    quotes: [
      "Your feelings are valid.",
      "Let’s breathe, then talk.",
    ],
    msgs: [
      "If I’m the reason, I’m sorry. I’ll do better. If not, I’m here to listen and hold you.",
      "Tell me what hurt. I want to understand, not argue.",
    ],
    actions: [
      "Clench your fists for 5 seconds, then let go. Again, twice.",
      "Slow exhale, drop your shoulders, and unclench your jaw.",
    ],
  },
};

type JokeKind = "dad" | "funny" | "riddle" | "nerdy";

const FALLBACK_JOKES: Record<Exclude<JokeKind, "riddle">, string[]> = {
  dad: [
    "I’m reading a book about anti‑gravity. It’s impossible to put down.",
    "I used to play piano by ear, but now I use my hands.",
    "Why don’t eggs tell jokes? They’d crack each other up.",
  ],
  funny: [
    "I told my computer I needed a break. It said, “No problem, I’ll go to sleep.”",
    "Why did the scarecrow win an award? Because he was outstanding in his field.",
    "I tried to catch fog yesterday. Mist.",
  ],
  nerdy: [
    "A SQL query walks into a bar, walks up to two tables and asks: “Can I join you?”",
    "There are 10 kinds of people: those who understand binary and those who don’t.",
    "I would tell you a UDP joke, but you might not get it.",
  ],
};

const FALLBACK_RIDDLES = [
  { q: "What has a heart that doesn’t beat?", a: "An artichoke." },
  { q: "What gets wetter the more it dries?", a: "A towel." },
  { q: "What has keys but can’t open locks?", a: "A piano." },
];

async function fetchJsonWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 900) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    if (!res.ok) throw new Error("bad response");
    return await res.json();
  } finally {
    clearTimeout(id);
  }
}

function CheerUpPage() {
  const [moodId, setMoodId] = useState<string | null>(null);
  const [moodNonce, setMoodNonce] = useState(0);
  const [verse, setVerse] = useState<{ reference: string; text: string } | null>(null);
  const [verseLoading, setVerseLoading] = useState(false);
  const [verseNote, setVerseNote] = useState("");
  const [songPick, setSongPick] = useState<{ title: string; artist: string; url: string } | null>(null);
  const [moodCopy, setMoodCopy] = useState<{ msg: string; action: string } | null>(null);
  const [encouragement, setEncouragement] = useState<{ text: string; author?: string } | null>(null);
  const [encourageLoading, setEncourageLoading] = useState(false);
  const [quotePick, setQuotePick] = useState<string | null>(null);

  const [jokeKind, setJokeKind] = useState<JokeKind>("dad");
  const [joke, setJoke] = useState<{ kind: JokeKind; text: string; answer?: string } | null>(null);
  const [jokeLoading, setJokeLoading] = useState(false);
  const [jokeError, setJokeError] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);

  const [loveNoteIdx, setLoveNoteIdx] = useState<number | null>(null);
  const loveNotesBody = useMemo(() => shuffleArray(LOVE_NOTES_BODY), []);
  const loveNotesExtra = useMemo(() => shuffleArray(LOVE_NOTES_EXTRA), []);
  const loveNote =
    loveNoteIdx === null
      ? null
      : loveNoteIdx < loveNotesBody.length
        ? loveNotesBody[loveNoteIdx]
        : loveNotesExtra[(loveNoteIdx - loveNotesBody.length) % loveNotesExtra.length];

  const mood = MOODS.find((m) => m.id === moodId);
  const jokeHistoryRef = useRef<string[]>([]);
  const lastQuoteRef = useRef<Record<string, string>>({});
  const lastMsgRef = useRef<Record<string, string>>({});
  const lastActionRef = useRef<Record<string, string>>({});
  const lastSongRef = useRef<Record<string, string>>({});
  const lastAdviceRef = useRef<string | null>(null);
  const quotePoolRef = useRef<Array<{ text?: string; author?: string }> | null>(null);

  const pickRandom = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
  const pickDifferent = (arr: string[], last?: string) => {
    if (!arr.length) return "";
    if (arr.length === 1) return arr[0];
    let next = pickRandom(arr);
    if (last && next === last) {
      const idx = arr.indexOf(next);
      next = arr[(idx + 1) % arr.length];
    }
    return next;
  };

  useEffect(() => {
    if (!mood) {
      setVerse(null);
      setVerseNote("");
      setSongPick(null);
      setMoodCopy(null);
      setEncouragement(null);
      setQuotePick(null);
      return;
    }

    const variants = MOOD_VARIANTS[mood.id];
    setSongPick(null);
    const msg = pickDifferent(variants?.msgs?.length ? variants.msgs : [mood.msg], lastMsgRef.current[mood.id]);
    const action = pickDifferent(variants?.actions?.length ? variants.actions : [mood.action], lastActionRef.current[mood.id]);
    const quote = pickDifferent(variants?.quotes?.length ? variants.quotes : [mood.quote], lastQuoteRef.current[mood.id]);
    lastMsgRef.current[mood.id] = msg;
    lastActionRef.current[mood.id] = action;
    lastQuoteRef.current[mood.id] = quote;
    setMoodCopy({ msg, action });
    setQuotePick(quote);

    let active = true;
    const loadVerse = async () => {
      setVerseLoading(true);
      setVerseNote("");
      try {
        const data = await apiFetch(`/verse?ref=${encodeURIComponent(mood.verseRef)}`, 1600);
        const text = String(data?.text || "").replace(/\s+/g, " ").trim();
        const reference = String(data?.reference || mood.verseRef).trim();
        if (active) setVerse({ reference, text: text || mood.verseFallback });
      } catch {
        if (!active) return;
        setVerse({ reference: mood.verseRef, text: mood.verseFallback });
        setVerseNote("Verse endpoint unavailable. Showing a local verse.");
      } finally {
        if (active) setVerseLoading(false);
      }
    };

    const loadEncouragement = async () => {
      setEncourageLoading(true);
      try {
        const data = await apiFetch("/quote", 1200);
        const text = String(data?.text || "").trim();
        const author = String(data?.author || "").trim();
        if (active && text && text !== lastAdviceRef.current) {
          lastAdviceRef.current = text;
          setEncouragement({ text, author: author || undefined });
          return;
        }
      } catch {
        // ignore, try next source
      }

      try {
        if (!quotePoolRef.current) {
          const data = await apiFetch("/quote/list", 1600);
          quotePoolRef.current = Array.isArray(data) ? data : [];
        }
        const pool = quotePoolRef.current || [];
        const pick = pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
        const text = String(pick?.text || "").trim();
        const author = String(pick?.author || "").trim();
        if (active && text) {
          setEncouragement({ text, author: author || undefined });
          return;
        }
      } catch {
        // fall through to local line
      } finally {
        if (active) setEncourageLoading(false);
      }
    };

    const loadSong = async () => {
      try {
        const query = pickRandom(mood.songQueries);
        const data = await apiFetch(`/song?q=${encodeURIComponent(query)}`, 1200);
        const artist = String(data?.artist || "").trim();
        const title = String(data?.title || "").trim();
        const key = `${artist} - ${title}`;
        if (artist && title) {
          if (lastSongRef.current[mood.id] === key && mood.songs.length) {
            setSongPick(pickRandom(mood.songs));
            return;
          }
          lastSongRef.current[mood.id] = key;
          setSongPick({
            artist,
            title,
            url: ytSearch(`${artist} ${title}`),
          });
          return;
        }
        setSongPick(pickRandom(mood.songs));
      } catch {
        setSongPick(pickRandom(mood.songs));
      }
    };

    loadVerse();
    loadEncouragement();
    loadSong();
    return () => {
      active = false;
    };
  }, [moodId, moodNonce]);

  useEffect(() => {
    setShowAnswer(false);
  }, [jokeKind]);

  const rememberJoke = (key: string) => {
    jokeHistoryRef.current = [key, ...jokeHistoryRef.current].slice(0, 50);
  };

  const fetchJoke = async (kind: JokeKind) => {
    setJokeLoading(true);
    setJokeError("");
    const attempts = 3;
    const normalize = (t: string) => t.replace(/\s+/g, " ").trim();

    try {
      for (let attempt = 0; attempt < attempts; attempt++) {
        let text = "";
        let answer: string | undefined;

        if (kind === "riddle") {
          const data = await apiFetch(`/joke?type=riddle`, 1200);
          text = normalize(String(data?.question || data?.text || "Riddle time!"));
          answer = normalize(String(data?.answer || data?.solution || "")) || undefined;
        } else {
          const data = await apiFetch(`/joke?type=${encodeURIComponent(kind)}`, 1200);
          text = normalize(String(data?.text || ""));
        }

        if (!text && !answer) throw new Error("empty");
        const key = `${text}||${answer || ""}`;
        if (!jokeHistoryRef.current.includes(key) || attempt === attempts - 1) {
          setJoke({ kind, text, answer });
          rememberJoke(key);
          break;
        }
      }
    } catch {
      if (kind === "riddle") {
        const r = pickRandom(FALLBACK_RIDDLES);
        setJoke({ kind, text: r.q, answer: r.a });
      } else {
        const list = FALLBACK_JOKES[kind];
        const text = pickRandom(list);
        setJoke({ kind, text });
      }
      setJokeError("Couldn’t reach the jokes endpoint. Here’s a local one.");
    } finally {
      setJokeLoading(false);
    }
  };

  const getJoke = () => {
    setShowAnswer(false);
    fetchJoke(jokeKind);
  };

  return (
    <Section>
      <div className="grid gap-6 w-full max-w-6xl mx-auto md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Cheer‑up corner</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700/90">
              If you’re sad or heavy, tell me the mood and I’ll hold your heart for a minute.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <Button
                  key={m.id}
                  variant={m.id === moodId ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => {
                    setMoodId(m.id);
                    setMoodNonce((n) => n + 1);
                  }}
                >
                  {m.label}
                </Button>
              ))}
            </div>

            {mood && (
              <div className="mt-5 rounded-xl border border-slate-200/70 bg-white/70 p-4">
                <p className="text-sm text-slate-500">“{encouragement?.text || quotePick || mood.quote}”</p>
                {encouragement?.author && (
                  <p className="text-xs text-slate-400 mt-1">— {encouragement.author}</p>
                )}
                {encourageLoading && <p className="text-xs text-slate-400 mt-1">Fetching a fresh encouragement…</p>}

                <p className="mt-2 text-slate-800">{moodCopy?.msg || mood.msg}</p>
                <p className="mt-3 text-sm text-slate-600"><b>Try this:</b> {moodCopy?.action || mood.action}</p>

                {songPick && (
                  <div className="mt-4 rounded-lg border border-slate-200/60 bg-slate-50/70 p-3">
                    <p className="text-xs text-slate-500">Song for this mood</p>
                    <a className="text-sm text-blue-600 hover:underline" href={songPick.url} target="_blank" rel="noreferrer">
                      {songPick.artist} — {songPick.title}
                    </a>
                  </div>
                )}
                {!songPick && (
                  <div className="mt-4 rounded-lg border border-slate-200/60 bg-slate-50/70 p-3">
                    <p className="text-xs text-slate-500">Song for this mood</p>
                    <p className="text-sm text-slate-600">Picking a song…</p>
                  </div>
                )}

                <div className="mt-4 rounded-lg border border-slate-200/60 bg-slate-50/70 p-3">
                  <p className="text-xs text-slate-500">Verse for you</p>
                  {verseLoading && <p className="text-sm text-slate-600">Fetching a verse…</p>}
                  {!verseLoading && verse && (
                    <p className="text-sm text-slate-800">
                      <b>{verse.reference}</b> — {verse.text}
                    </p>
                  )}
                  {verseNote && <p className="mt-1 text-xs text-amber-700">{verseNote}</p>}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Make me laugh</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700/90">Pick a style, then tap to fetch a joke or a riddle. It’s about to get nerdy.</p>
            <div className="mt-4 flex flex-wrap gap-2">
                {[
                  { id: "dad", label: "Dad joke" },
                  { id: "funny", label: "Funny joke" },
                  { id: "riddle", label: "Riddle" },
                  { id: "nerdy", label: "Nerdy" },
                ].map((opt) => (
                <Button
                  key={opt.id}
                  variant={opt.id === jokeKind ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setJokeKind(opt.id as JokeKind)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-3 items-center">
              <Button onClick={getJoke} disabled={jokeLoading}>
                <Sparkles className="w-4 h-4 mr-2" /> {jokeLoading ? "Fetching…" : (jokeKind === "riddle" ? "Give me a riddle" : "Make me laugh")}
              </Button>
              {jokeError && <span className="text-xs text-amber-700">{jokeError}</span>}
            </div>
            {joke && (
              <div className="mt-4 rounded-xl border border-slate-200/70 bg-white/70 p-4">
                <p className="text-slate-800">{joke.text}</p>
                {joke.kind === "riddle" && joke.answer && !showAnswer && (
                  <div className="mt-3">
                    <Button variant="secondary" size="sm" onClick={() => setShowAnswer(true)}>
                      Reveal answer
                    </Button>
                  </div>
                )}
                {joke.kind === "riddle" && joke.answer && showAnswer && (
                  <p className="mt-2 text-slate-700"><b>Answer:</b> {joke.answer}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-2xl">A little love note</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700/90">Click me and I’ll tell you what I love about you.</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button
                variant="secondary"
                onClick={() => setLoveNoteIdx((i) => (i === null ? 0 : i + 1))}
              >
                Click me
              </Button>
              {loveNote && <p className="text-slate-800">{loveNote}</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </Section>
  );
}


/* ------------------- PAGES (FLOW) ------------------- */
function HeroPage({ onBegin, audioCtl }: { onBegin: () => void; audioCtl: ReturnType<typeof useAudio> }) {
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  return (
    <Section>
      <div className="grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#9cc2ff] to-[#7aa6ff] grid place-items-center shadow-inner text-white">
              <Heart className="w-5 h-5" />
            </div>
            <p className="text-sm text-slate-700/80">Welcome</p>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: reduce ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-serif text-4xl sm:text-5xl md:text-6xl leading-tight text-slate-900 mt-6"
          >
            Hi {CONFIG.HER}, may I borrow a moment of your heart?
          </motion.h1>
          <p className="mt-4 text-slate-700/80 leading-relaxed max-w-prose">
            I built a tiny place on the internet, quiet, warm, and honest. Just for you. Let me walk you through some memories, a poem, and a question that’s been smiling in my chest.
          </p>
          <div className="mt-7">
            <Button
              onClick={async () => {
                await audioCtl.play();
                onBegin();
                navigate("memories"); // → Memories
              }}
            >
              <Sparkles className="w-4 h-4 mr-2" /> Begin
            </Button>
          </div>
          <p className="mt-3 text-xs text-slate-500">Music will start when you tap Begin.</p>
        </div>
        <motion.div initial={{ opacity: 0, scale: reduce ? 1 : 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
          <div className="relative rounded-2xl p-1 bg-white/70 shadow-xl ring-1 ring-slate-200/70 w-full max-w-md mx-auto">
            <div className="rounded-xl overflow-hidden grid grid-cols-3 grid-rows-2 gap-1">
              {PHOTOS.slice(0, 6).map((src, i) => (
                <img key={i} src={src} alt="memory" loading="eager" decoding="async" className="aspect-[3/4] w-full object-cover" />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}

function GalleryPage() {
  const [openSrc, setOpenSrc] = useState<string | null>(null);
  const navigate = useNavigate();
  const items = useMemo(
    () =>
      PHOTOS.map((src, i) => ({
        id: `builtin-${i}`, src,
        label: i % 3 === 0 ? "favorite" : i % 4 === 0 ? "your laugh" : undefined,
      })),
    []
  );

  return (
    <Section>
      <Card>
        <CardHeader><CardTitle className="font-serif text-2xl">Little gallery of us</CardTitle></CardHeader>
        <CardContent>
          <p className="text-slate-700/80 mb-4">A few snapshots I love. Tap any photo to view it larger.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {items.map((it) => (
              <div key={it.id} className="relative group">
                <button onClick={() => setOpenSrc(it.src)} className="relative block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7aa6ff] rounded-xl">
                  <img src={it.src} alt={it.label || "memory"} loading="lazy" decoding="async"
                       className="aspect-[3/4] w-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-[1.02]" />
                  {it.label && (
                    <span className="pointer-events-none absolute bottom-2 left-2 text-[10px] px-2 py-0.5 rounded-full bg-white/85 text-slate-700 shadow">
                      {it.label}
                    </span>
                  )}
                </button>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={() => navigate("../letter")}>
              Continue <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* simple lightbox */}
      {openSrc && (
        <div className="fixed inset-0 bg-black/60 grid place-items-center p-4 z-50" onClick={() => setOpenSrc(null)}>
          <img src={openSrc} alt="moment large" className="w-full max-w-3xl h-auto rounded-xl shadow-2xl" />
        </div>
      )}
    </Section>
  );
}

function LoveLetterPage() {
  const lines = useMemo(
    () => [
      "Trap my heart, melt my lips. Make me yours with just a kiss.",
      "The air I breath, the Love I need",
      "In your eyes, my soul is freed.",
      "Hold me close, be my peace.",
      "Make me feel that joy you bring.",
      "Oh Love how much I yearn.",
      "In your arms I find my home",
      "With you I'll never be alone.",
      "A silent promise that is ours to keep.",
      "Talk to me, I'll be your sheep",
      "Doing your bid, helping you wet the sheets.",
    ],
    []
  );
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(reduce ? lines.length : 0);
  const navigate = useNavigate();

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setIdx((v) => Math.min(lines.length, v + 1)), 1200);
    return () => clearInterval(id);
  }, [reduce, lines.length]);

  return (
    <Section>
      <div className="relative rounded-3xl p-6 sm:p-8 bg-white/70 backdrop-blur ring-1 ring-slate-200/70 shadow-xl w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-3xl">For you, Ohemaa</h2>
          <HandHeart className="w-5 h-5 text-rose-500" />
        </div>
        <p className="mt-1 text-slate-600">This is something we made together — cheers to making more beautiful things till we are old.</p>
        <div className="mt-4 space-y-3">
          {(reduce ? lines : lines.slice(0, idx)).map((t, i) => (
            <motion.p key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-lg leading-7 text-slate-800">
              {t}
            </motion.p>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={() => navigate("../offer")}>
            Onward <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </Section>
  );
}

function OfferPage() {
  const navigate = useNavigate();
  return (
    <Section>
      <Card>
        <CardHeader><CardTitle className="font-serif text-2xl">Offer of Partnership</CardTitle></CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2 text-sm text-slate-700/90">
              <p><span className="font-semibold">Position:</span> Girlfriend & Co-Pilot</p>
              <p><span className="font-semibold">Hiring Manager:</span> {CONFIG.YOU}</p>
              <p><span className="font-semibold">Team:</span> Food • Music • God • Laughter</p>
              <p><span className="font-semibold">Compensation:</span> Unlimited hugs, inside jokes, and biweekly pizza nights</p>
              <p><span className="font-semibold">Benefits:</span> Morning texts, prayer walks, surprise snacks, shoulder rubs</p>
              <p><span className="font-semibold">Start Date:</span> Upon acceptance</p>
              <p><span className="font-semibold">Location:</span> Wherever you are</p>
            </div>
            <div className="rounded-xl p-4 bg-rose-50/70 ring-1 ring-rose-100">
              <p className="text-slate-800 leading-relaxed">
                We believe you’re an exceptional culture add—kind, romantic, and steady. If you accept, we’ll nurture a home that’s warm and sincere; where faith, music, and food linger like gentle light.
              </p>
              <p className="mt-3 text-slate-800 leading-relaxed">To proceed, continue to the next page.</p>
              <div className="mt-4">
                <Button onClick={() => navigate("../question")}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Continue
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Section>
  );
}

function RingSVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#caa76a" />
          <stop offset="100%" stopColor="#f5e7c6" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="60" fill="none" stroke="url(#g)" strokeWidth="6" strokeLinecap="round" />
      <path d="M100 40 L120 20 L140 40" fill="none" stroke="#e6d7a8" strokeWidth="5" />
    </svg>
  );
}
function QuestionPage({ onYes }: { onYes: () => void }) {
  const reduce = useReducedMotion();
  const [ummCount, setUmmCount] = useState(0);
  const lines = [
    "Haha, adorable stalling — but the only correct answer is YES 😌",
    "We’ll be here for days if you don’t say yes 😂",
    "Public service announcement: this button only delays happiness. Try the blue one 👉",
    "Alright, last try… the “Umm…” button has gone on strike. YES? 😇",
  ];
  const msg = ummCount > 0 ? lines[Math.min(ummCount - 1, lines.length - 1)] : "";

  useEffect(() => {
    const id = setTimeout(() => {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 }, scalar: 0.8 });
    }, 600);
    return () => clearTimeout(id);
  }, []);

  return (
    <Section center>
      <div className="rounded-3xl p-8 bg-white/70 ring-1 ring-slate-200/70 shadow-xl text-center w/full max-w-xl mx-auto">
        <motion.div initial={{ opacity: 0, y: reduce ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="mx-auto w-40 h-40 mb-4">
            <motion.div initial={{ strokeDasharray: 400, strokeDashoffset: 400 }} animate={{ strokeDashoffset: 0 }} transition={{ duration: reduce ? 0 : 1.8, ease: "easeInOut" }}>
              <RingSVG className="w-40 h-40" />
            </motion.div>
          </div>
          <h3 className="font-serif text-3xl">Lucynda, will you be my girlfriend?</h3>
          <p className="mt-2 text-slate-700">Pick the only correct answer below 🥰</p>
          {msg && <p className="mt-3 text-rose-500/90 text-sm">{msg}</p>}
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button size="lg" className="px-8" onClick={onYes}>YES</Button>
            <motion.button
              type="button"
              onClick={() => setUmmCount((c) => c + 1)}
              className="h-11 px-6 rounded-full bg-slate-100 text-slate-800 font-medium shadow-sm hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              animate={ummCount > 0 ? { x: [0, -6, 6, -6, 6, 0] } : undefined}
              transition={{ duration: 0.35 }}
            >
              {ummCount >= lines.length ? "…fine, YES it is 😇" : "Umm…"}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}

function Certificate({ her, you }: { her: string; you: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const c = document.createElement("canvas");
    c.width = 1600; c.height = 1000;
    const ctx = c.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 0, 0, c.height);
    g.addColorStop(0, "#fffaf2"); g.addColorStop(1, "#f6f0e6");
    ctx.fillStyle = g; ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#1a2433"; ctx.font = "700 54px ui-serif, Georgia, serif";
    ctx.fillText("Certificate of Delightful Agreement", 270, 180);
    ctx.fillStyle = "#0f172a"; ctx.font = "700 96px ui-serif, Georgia, serif";
    ctx.fillText(`${her} ♡ ${you}`, 430, 350);
    ctx.font = "400 38px ui-sans-serif, system-ui";
    ctx.fillText(`Date: ${new Date().toLocaleString()}`, 430, 420);
    ctx.fillText("Terms: Smiles, kindness, and inside jokes forever.", 430, 470);
    ctx.font = "italic 40px ui-serif, Georgia, serif"; ctx.fillText("Love is patient and kind.", 430, 540);
    const hearts = ["💖", "💛", "💜", "💚"];
    for (let i = 0; i < 40; i++) ctx.fillText(hearts[i % hearts.length], Math.random() * c.width, Math.random() * c.height);
    setUrl(c.toDataURL("image/png"));
  }, []);
  return (
    <div className="rounded-2xl p-6 bg-white/70 ring-1 ring-slate-200/70 shadow-lg text-center">
      <h4 className="font-serif text-2xl mb-2">We’re official — congratulations!</h4>
      <p className="text-slate-700">Download your cute certificate and let’s tell the world (or just keep it between us). 😊</p>
      {url && (
        <a href={url} download={`${her}-${you}-certificate.png`} className="inline-block mt-4">
          <Button><DownloadIcon className="w-4 h-4 mr-2" />Download certificate</Button>
        </a>
      )}
    </div>
  );
}
function PrayerBlock() {
  return (
    <div className="rounded-2xl p-6 bg-white/70 ring-1 ring-slate-200/70 shadow-lg">
      <h4 className="font-serif text-2xl mb-2">A quiet verse</h4>
      <p className="text-slate-700 leading-relaxed italic">
        “Love is patient and kind; love does not envy or boast; it is not arrogant or rude… Love never ends.” — 1 Corinthians 13
      </p>
      <p className="text-slate-700/80 mt-3">May God keep us gentle and joyful, quick to forgive, slow to anger, rich in grace. Amen.</p>
    </div>
  );
}
function CelebrationPage() {
  return (
    <Section>
      <div className="grid gap-6 w-full max-w-3xl mx-auto">
        <Certificate her={CONFIG.HER} you={CONFIG.YOU} />
        <PrayerBlock />
        <div className="rounded-2xl p-6 bg-white/70 ring-1 ring-slate-200/70 shadow-lg grid sm:grid-cols-2 gap-3 items-center">
          <a
            className="inline-flex items-center justify-center h-10 px-4 text-sm font-medium rounded-full bg-gradient-to-br from-[#9cc2ff] to-[#7aa6ff] text-white hover:brightness-[1.05] active:brightness-95"
            href={`mailto:${CONFIG.EMAILS.join(",")}?subject=${encodeURIComponent(`Confirmation: ${CONFIG.HER} said YES to ${CONFIG.YOU}`)}&body=${encodeURIComponent(
              `Dear ${CONFIG.HER} & ${CONFIG.YOU},\n\n${CONFIG.HER} said YES to being ${CONFIG.YOU}'s girlfriend.\nAgreement made with laughter and love.\n\nSigned,\n${CONFIG.YOU} 💙 ${CONFIG.HER}\n\nDate: ${new Date().toLocaleString()}`
            )}`}
          >
            <Mail className="w-4 h-4 mr-2" />
            Open email draft
          </a>
          <Button variant="secondary" onClick={() => window.print()}>Print this page</Button>
        </div>
      </div>
    </Section>
  );
}

/* ------------------- ROOT ------------------- */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  const audioCtl = useAudio(SONG);

  useEffect(() => { emailjs.init(CONFIG.EMAILJS.PUBLIC_KEY); }, []);

  const navigate = useNavigate();
  const onYes = async () => {
    confetti({ particleCount: 240, spread: 100, origin: { y: 0.6 } });
    try {
      await emailjs.send(CONFIG.EMAILJS.SERVICE_ID, CONFIG.EMAILJS.TEMPLATE_ID, {
        to_email: CONFIG.EMAILS.join(", "),
        you: CONFIG.HER,
        me: CONFIG.YOU,
        subject_line: `${CONFIG.HER} said YES to ${CONFIG.YOU} 💙`,
        date: new Date().toLocaleString(),
        reply_to: CONFIG.EMAILS[0] || "",
        offer_position: "Girlfriend & Co-Pilot",
        offer_team: "Food • Music • God • Laughter",
        offer_benefits: "Morning texts, prayer walks, surprise snacks, shoulder rubs",
      });
    } catch {}
    navigate("/after", { replace: true }); // SPA-safe with basename
  };

  return (
    <GradientBG>
      <ScrollToTop />
      <TopNav />
      <AnimatePresence mode="wait">
        <Routes>
          {/* PROPOSAL FLOW */}
          <Route index element={<HeroPage onBegin={() => {}} audioCtl={audioCtl} />} />
          <Route path="memories" element={<GalleryPage />} />
          <Route path="letter" element={<LoveLetterPage />} />
          <Route path="offer" element={<OfferPage />} />
          <Route path="valentine" element={<ValentinePage />} />
          <Route path="cheer" element={<CheerUpPage />} />
          <Route path="question" element={<QuestionPage onYes={onYes} />} />
          <Route path="after" element={<CelebrationPage />} />
          <Route path="*" element={<HeroPage onBegin={() => {}} audioCtl={audioCtl} />} />
        </Routes>
      </AnimatePresence>
      <footer className="h-10" />
    </GradientBG>
  );
}

/* ------------------- HELPERS ------------------- */
function DownloadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
