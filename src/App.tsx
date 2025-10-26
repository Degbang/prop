import React, { useEffect, useMemo, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import confetti from "canvas-confetti";
import emailjs from "@emailjs/browser";
import {
  Heart, Sparkles, Mail, CheckCircle2, ChevronRight, HandHeart,
  Plus, Trash2, Check
} from "lucide-react";

/* ------------------- CONFIG ------------------- */
const CONFIG = {
  HER: "Lucynda",
  YOU: "Alfred",
  THEME: {
    bg: "from-[#fffaf6] via-[#fff4f6] to-[#f7f0ff]",
    ink: "#121826",
  },
  PHOTOS: [
    "/images/1.jpg","/images/2.jpg","/images/3.jpg","/images/4.jpg",
    "/images/5.jpg","/images/6.jpg","/images/7.jpg","/images/8.jpg",
  ],
  AUDIO_URL: "/audio/song.mp3",
  EMAILS: ["sirimaalo@gmail.com", "domegilalfred@gmail.com"],
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
function Button({ variant = "primary", size = "md", className = "", ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-full";
  const sizes = { sm: "h-8 px-3 text-sm", md: "h-10 px-4 text-sm", lg: "h-11 px-6 text-base" }[size];
  const variants = {
    primary: "text-white bg-gradient-to-br from-[#9cc2ff] to-[#7aa6ff] hover:brightness-[1.05] active:brightness-95",
    secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200",
    ghost: "bg-transparent hover:bg-white/50",
  }[variant];
  return <button className={`${base} ${sizes} ${variants} ${className}`} {...props} />;
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
function Lightbox({ open, onClose, children }:{
  open: boolean; onClose:()=>void; children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl overflow-hidden max-w-3xl w-full" onClick={(e)=>e.stopPropagation()}>{children}</div>
    </div>
  );
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
    return () => { el.pause(); el.src = ""; audio.current = null; };
  }, [src]);
  const play = async () => { try { await audio.current?.play(); setPlaying(true); } catch {} };
  return { play, playing };
}

/* ------------------- LAYOUT ------------------- */
function GradientBG({ children }: { children: React.ReactNode }) {
  return (
    <div className={`min-h-svh w-full bg-gradient-to-br ${CONFIG.THEME.bg} text-slate-800`} style={{ color: CONFIG.THEME.ink }}>
      <div className="pointer-events-none fixed inset-0 opacity-[0.08] mix-blend-multiply" style={{ backgroundImage:
        "radial-gradient(40rem_40rem_at_20%_10%,#fff_0,transparent_60%),radial-gradient(46rem_46rem_at_80%_0%,#fff_0,transparent_55%)" }} />
      <div className="pointer-events-none fixed inset-0 opacity-[0.05]" style={{ backgroundImage:
        "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"140\" height=\"140\"><filter id=\"n\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.8\" numOctaves=\"2\" stitchTiles=\"stitch\"/></filter><rect width=\"100%\" height=\"100%\" filter=\"url(%23n)\" opacity=\"0.9\"/></svg>')" }} />
      <div className="relative flex min-h-svh flex-col">{children}</div>
    </div>
  );
}
function Section({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="relative grow grid place-items-center py-10">
      <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8">{children}</div>
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
          <span className="text-sm text-slate-700/80">{CONFIG.YOU} → {CONFIG.HER}</span>
        </Link>
        <div className="flex items-center gap-5 text-sm text-slate-700/80">
          <Link to="/memories" className="hover:underline">Memories</Link>
          <Link to="/offer" className="hover:underline">Offer</Link>
          <Link to="/feedback" className="hover:underline">Feedback</Link>
          <Link to="/todo" className="hover:underline">To-Do</Link>
        </div>
      </div>
    </nav>
  );
}

/* ------------------- PAGES ------------------- */
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
            I built a tiny place on the internet—quiet, warm, and honest—just for you.
            Let me walk you through some memories, a poem, and a question that’s been
            smiling in my chest.
          </p>
          <div className="mt-7">
            <Button onClick={async () => { await audioCtl.play(); onBegin(); navigate("/memories"); }}>
              <Sparkles className="w-4 h-4 mr-2" /> Begin
            </Button>
          </div>
          <p className="mt-3 text-xs text-slate-500">Music will start when you tap Begin.</p>
        </div>
        <motion.div initial={{ opacity: 0, scale: reduce ? 1 : 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
          <div className="relative rounded-2xl p-1 bg-white/70 shadow-xl ring-1 ring-slate-200/70 w-full max-w-md mx-auto">
            <div className="rounded-xl overflow-hidden grid grid-cols-3 grid-rows-2 gap-1">
              {CONFIG.PHOTOS.slice(0,6).map((src, i) => (
                <img key={i} src={src} alt="memory" loading="eager" decoding="async" className="aspect-[3/4] w-full object-cover" />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}

/* ---------- IndexedDB helpers for Memories ---------- */
type DBPhoto = { id: string; label?: string; createdAt: number; blob: Blob };
type MemoryItem = { id: string; label?: string; createdAt: number; src: string; uploaded: boolean; _revoke?: () => void };

const DB_NAME = "memoriesDB";
const DB_STORE = "photos";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(DB_STORE)) {
        const store = db.createObjectStore(DB_STORE, { keyPath: "id" });
        store.createIndex("createdAt", "createdAt");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function dbAddPhotos(files: File[], label?: string) {
  const db = await openDB();
  const tx = db.transaction(DB_STORE, "readwrite");
  const store = tx.objectStore(DB_STORE);
  for (const f of files) {
    const rec: DBPhoto = { id: crypto.randomUUID(), label, createdAt: Date.now(), blob: f };
    store.put(rec);
  }
await new Promise<void>((resolve, reject) => {
  tx.oncomplete = () => resolve();
  tx.onerror = () => reject(tx.error || new Error("IDB tx error"));
});  db.close();
}
async function dbGetAllPhotos(): Promise<DBPhoto[]> {
  const db = await openDB();
  const tx = db.transaction(DB_STORE, "readonly");
  const store = tx.objectStore(DB_STORE);
  const idx = store.index("createdAt");
  const out: DBPhoto[] = [];
  const req = idx.openCursor(null, "prev");
  return await new Promise((resolve) => {
    req.onsuccess = () => {
      const cur = req.result;
      if (cur) { out.push(cur.value as DBPhoto); cur.continue(); }
      else { resolve(out); db.close(); }
    };
    req.onerror = () => { resolve([]); db.close(); };
  });
}
async function dbDeletePhoto(id: string) {
  const db = await openDB();
  const tx = db.transaction(DB_STORE, "readwrite");
  tx.objectStore(DB_STORE).delete(id);

  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error("IDB tx error"));
  });
  db.close();
}

/* ------------------- MEMORIES (scrapbook) ------------------- */
function GalleryPage() {
  const [openSrc, setOpenSrc] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [items, setItems] = useState<MemoryItem[]>([]);

  // build list from CONFIG.PHOTOS + IndexedDB uploads
  useEffect(() => {
    let revoked: (() => void)[] = [];
    (async () => {
      const builtIn: MemoryItem[] = CONFIG.PHOTOS.map((src, i) => ({
        id: `builtin-${i}`,
        src,
        label: i % 3 === 0 ? "favorite" : i % 4 === 0 ? "your laugh" : undefined,
        createdAt: i,
        uploaded: false,
      }));

      const uploaded = await dbGetAllPhotos();
      const mapped: MemoryItem[] = uploaded.map(p => {
        const url = URL.createObjectURL(p.blob);
        const revoke = () => URL.revokeObjectURL(url);
        revoked.push(revoke);
        return { id: p.id, src: url, label: p.label, createdAt: p.createdAt, uploaded: true, _revoke: revoke };
      });

      const all = [...mapped, ...builtIn].sort((a,b)=>b.createdAt - a.createdAt);
      setItems(all);
    })();

    return () => { revoked.forEach(fn=>fn()); };
  }, []);

  const addPhotos = async () => {
    const files = Array.from(fileRef.current?.files || []);
    if (!files.length) return;
    await dbAddPhotos(files, label.trim() || undefined);
    // refresh view
    setLabel("");
    if (fileRef.current) fileRef.current.value = "";
    // reload uploaded portion
    const uploaded = await dbGetAllPhotos();
    const mapped: MemoryItem[] = uploaded.map(p => {
      const url = URL.createObjectURL(p.blob);
      return { id: p.id, src: url, label: p.label, createdAt: p.createdAt, uploaded: true, _revoke: () => URL.revokeObjectURL(url) };
    });
    const builtIn = items.filter(i=>!i.uploaded);
    const all = [...mapped, ...builtIn].sort((a,b)=>b.createdAt - a.createdAt);
    setItems(prev => {
      // revoke any old object URLs from previous uploaded list
      prev.forEach(i => i.uploaded && i._revoke?.());
      return all;
    });
  };

  const removeItem = async (id: string) => {
    const it = items.find(x=>x.id===id);
    if (it?.uploaded) await dbDeletePhoto(id);
    it?._revoke?.();
    setItems(cur => cur.filter(x=>x.id!==id));
  };

  const navigate = useNavigate();

  return (
    <Section>
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Little gallery of us</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700/80 mb-4">
            Add photos (and a tiny label) to our scrapbook. Tap any photo to view it larger.
          </p>

          {/* Uploader */}
          <div className="rounded-xl border border-slate-200 bg-white/70 p-3 mb-4 grid sm:grid-cols-[1fr_auto_auto] gap-2 items-center">
            <input
              type="text"
              value={label}
              onChange={(e)=>setLabel(e.target.value)}
              className="h-10 rounded-md border border-slate-200 bg-white px-3"
              placeholder="Optional label (e.g., beach day, your laugh)…"
            />
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*"
              // @ts-ignore capture is valid HTML attribute on some browsers
              capture="environment"
              className="h-10"
            />
            <Button onClick={addPhotos}><Plus className="w-4 h-4 mr-1"/>Add</Button>
            <div className="sm:col-span-3 text-xs text-slate-500">
              Photos are stored locally on this device (IndexedDB). They won’t sync across devices.
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {items.map((it) => (
              <div key={it.id} className="relative group">
                <button
                  onClick={()=>setOpenSrc(it.src)}
                  className="relative block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7aa6ff] rounded-xl"
                >
                  <img
                    src={it.src}
                    alt={it.label || "memory"}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[3/4] w-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  {it.label && (
                    <span className="pointer-events-none absolute bottom-2 left-2 text-[10px] px-2 py-0.5 rounded-full bg-white/85 text-slate-700 shadow">
                      {it.label}
                    </span>
                  )}
                </button>
                {it.uploaded && (
                  <button
                    onClick={()=>removeItem(it.id)}
                    className="absolute top-2 right-2 z-10 rounded-full bg-white/85 p-1 text-slate-600 hover:text-rose-600 shadow"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4"/>
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={() => navigate("/letter")}>
              Continue <ChevronRight className="w-4 h-4 ml-2"/>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Lightbox open={!!openSrc} onClose={() => setOpenSrc(null)}>
        {openSrc && <img src={openSrc} alt="moment large" className="w-full h-auto" />}
      </Lightbox>
    </Section>
  );
}

/* ------------------- POEM ------------------- */
function LoveLetterPage() {
  const lines = useMemo(()=>[
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
    "Doing your bid, helping you wet the sheets."
  ],[]);
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(reduce ? lines.length : 0);
  const navigate = useNavigate();

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(()=>setIdx(v=>Math.min(lines.length, v+1)), 1200);
    return ()=>clearInterval(id);
  }, [reduce, lines.length]);

  return (
    <Section>
      <div className="relative rounded-3xl p-6 sm:p-8 bg-white/70 backdrop-blur ring-1 ring-slate-200/70 shadow-xl w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-3xl">For you, Ohemaa</h2>
          <HandHeart className="w-5 h-5 text-rose-500" />
        </div>
        <p className="mt-1 text-slate-600">
          This is something we made together — cheers to making more beautiful things till we are old.
        </p>
        <div className="mt-4 space-y-3">
          {reduce
            ? lines.map((t,i)=><p key={i} className="text-lg leading-7 text-slate-800">{t}</p>)
            : lines.slice(0,idx).map((t,i)=>(
                <motion.p key={i} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{duration:0.5}} className="text-lg leading-7 text-slate-800">{t}</motion.p>
              ))
          }
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={()=>navigate("/offer")}>
            Onward <ChevronRight className="w-4 h-4 ml-2"/>
          </Button>
        </div>
      </div>
    </Section>
  );
}

/* ------------------- OFFER / QUESTION / AFTER ------------------- */
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
                We believe you’re an exceptional culture add—kind, romantic, and steady.
                If you accept, we’ll nurture a home that’s warm and sincere; where faith,
                music, and food linger like gentle light.
              </p>
              <p className="mt-3 text-slate-800 leading-relaxed">To proceed, continue to the next page.</p>
              <div className="mt-4">
                <Button onClick={()=>navigate("/question")}><CheckCircle2 className="w-4 h-4 mr-2"/>Continue</Button>
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
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#caa76a"/><stop offset="100%" stopColor="#f5e7c6"/></linearGradient></defs>
      <circle cx="100" cy="100" r="60" fill="none" stroke="url(#g)" strokeWidth="6" strokeLinecap="round"/>
      <path d="M100 40 L120 20 L140 40" fill="none" stroke="#e6d7a8" strokeWidth="5" />
    </svg>
  );
}
function QuestionPage({ onYes }: { onYes: () => void }) {
  const reduce = useReducedMotion();
  useEffect(()=>{ const id=setTimeout(()=>{ confetti({ particleCount: 50, spread: 60, origin:{y:0.6}, scalar:0.8 }); },600); return ()=>clearTimeout(id); },[]);
  return (
    <Section>
      <div className="rounded-3xl p-8 bg-white/70 ring-1 ring-slate-200/70 shadow-xl text-center w-full max-w-xl mx-auto">
        <motion.div initial={{opacity:0,y:reduce?0:8}} animate={{opacity:1,y:0}} transition={{duration:0.6}}>
          <div className="mx-auto w-40 h-40 mb-4">
            <motion.div initial={{strokeDasharray:400, strokeDashoffset:400}} animate={{strokeDashoffset:0}} transition={{duration:reduce?0:1.8, ease:"easeInOut"}}>
              <RingSVG className="w-40 h-40"/>
            </motion.div>
          </div>
          <h3 className="font-serif text-3xl">{CONFIG.HER}, will you be my girlfriend?</h3>
          <p className="mt-2 text-slate-700">Pick the only correct answer below 🥰</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button size="lg" className="px-8" onClick={onYes}>YES</Button>
            <Button size="lg" variant="secondary">Umm…</Button>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}
function Certificate({ her, you }: { her: string; you: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const c=document.createElement("canvas"); c.width=1600; c.height=1000;
    const ctx=c.getContext("2d")!;
    const g=ctx.createLinearGradient(0,0,0,c.height); g.addColorStop(0,"#fffaf2"); g.addColorStop(1,"#f6f0e6");
    ctx.fillStyle=g; ctx.fillRect(0,0,c.width,c.height);
    ctx.fillStyle="#1a2433"; ctx.font="700 54px ui-serif, Georgia, serif";
    ctx.fillText("Certificate of Delightful Agreement",270,180);
    ctx.fillStyle="#0f172a"; ctx.font="700 96px ui-serif, Georgia, serif";
    ctx.fillText(`${her} ♡ ${you}`,430,350);
    ctx.font="400 38px ui-sans-serif, system-ui";
    ctx.fillText(`Date: ${new Date().toLocaleString()}`,430,420);
    ctx.fillText("Terms: Smiles, kindness, and inside jokes forever.",430,470);
    ctx.font="italic 40px ui-serif, Georgia, serif"; ctx.fillText("Love is patient and kind.",430,540);
    const hearts=["💖","💛","💜","💚"]; for(let i=0;i<40;i++) ctx.fillText(hearts[i%hearts.length],Math.random()*c.width,Math.random()*c.height);
    setUrl(c.toDataURL("image/png"));
  },[]);
  return (
    <div className="rounded-2xl p-6 bg-white/70 ring-1 ring-slate-200/70 shadow-lg text-center">
      <h4 className="font-serif text-2xl mb-2">We’re official — congratulations!</h4>
      <p className="text-slate-700">Download your cute certificate and let’s tell the world (or just keep it between us). 😊</p>
      {url && (
        <a href={url} download={`${her}-${you}-certificate.png`} className="inline-block mt-4">
          <Button><DownloadIcon className="w-4 h-4 mr-2"/>Download certificate</Button>
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
        <Certificate her={CONFIG.HER} you={CONFIG.YOU}/>
        <PrayerBlock/>
        <div className="rounded-2xl p-6 bg-white/70 ring-1 ring-slate-200/70 shadow-lg grid sm:grid-cols-2 gap-3 items-center">
          <a
            className="inline-flex items-center justify-center h-10 px-4 text-sm font-medium rounded-full bg-gradient-to-br from-[#9cc2ff] to-[#7aa6ff] text-white hover:brightness-[1.05] active:brightness-95"
            href={`mailto:${CONFIG.EMAILS.join(",")}?subject=${encodeURIComponent(`Confirmation: ${CONFIG.HER} said YES to ${CONFIG.YOU}`)}&body=${encodeURIComponent(
              `Dear ${CONFIG.HER} & ${CONFIG.YOU},\n\n${CONFIG.HER} said YES to being ${CONFIG.YOU}'s girlfriend.\nAgreement made with laughter and love.\n\nSigned,\n${CONFIG.YOU} 💙 ${CONFIG.HER}\n\nDate: ${new Date().toLocaleString()}`
            )}`}
          >
            <Mail className="w-4 h-4 mr-2"/>Open email draft
          </a>
          <Button variant="secondary" onClick={()=>window.print()}>Print this page</Button>
        </div>
      </div>
    </Section>
  );
}

/* ------------------- FEEDBACK (no notification) ------------------- */
type FeedbackItem = { id: string; kind: "Applause"|"Appreciation"|"Complaint"; message: string; who?: string; at: number };
function FeedbackPage() {
  const [kind, setKind] = useState<FeedbackItem["kind"]>("Applause");
  const [message, setMessage] = useState("");
  const [who, setWho] = useState("");
  const [items, setItems] = useState<FeedbackItem[]>(() => {
    try { return JSON.parse(localStorage.getItem("proposal_feedback")||"[]"); } catch { return []; }
  });

  const submit = () => {
    if (!message.trim()) return;
    const item: FeedbackItem = { id: crypto.randomUUID(), kind, message: message.trim(), who: who.trim() || undefined, at: Date.now() };
    const next = [item, ...items];
    setItems(next);
    localStorage.setItem("proposal_feedback", JSON.stringify(next));
    setMessage(""); setWho("");
  };

  return (
    <Section>
      <div className="grid md:grid-cols-2 gap-6 w-full max-w-5xl mx-auto">
        <Card>
          <CardHeader><CardTitle className="font-serif text-2xl">Leave feedback</CardTitle></CardHeader>
          <CardContent>
            <label className="block text-sm text-slate-600 mb-1">Type</label>
            <select value={kind} onChange={e=>setKind(e.target.value as FeedbackItem["kind"])} className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 mb-3">
              <option>Applause</option>
              <option>Appreciation</option>
              <option>Complaint</option>
            </select>

            <label className="block text-sm text-slate-600 mb-1">Message</label>
            <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={5} className="w-full rounded-md border border-slate-200 bg-white p-3 mb-3" placeholder="Type your thoughts..." />

            <label className="block text-sm text-slate-600 mb-1">Your name or email (optional)</label>
            <input value={who} onChange={e=>setWho(e.target.value)} className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 mb-4" />

            <Button onClick={submit}><Sparkles className="w-4 h-4 mr-2"/>Submit</Button>
            <p className="text-xs text-slate-500 mt-2">Saved locally on this device.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-serif text-2xl">All reports</CardTitle></CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="text-slate-700/80">No reports yet.</p>
            ) : (
              <ul className="space-y-3">
                {items.map(it=>(
                  <li key={it.id} className="rounded-lg border border-slate-200 bg-white/70 p-3">
                    <div className="text-xs text-slate-500">{new Date(it.at).toLocaleString()} • {it.kind}{it.who ? ` • ${it.who}` : ""}</div>
                    <div className="mt-1 text-slate-800">{it.message}</div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </Section>
  );
}

/* ------------------- TO-DO ------------------- */
type Todo = { id: string; text: string; done: boolean; at: number };
function TodoPage() {
  const [text, setText] = useState("");
  const [list, setList] = useState<Todo[]>(() => {
    try { return JSON.parse(localStorage.getItem("proposal_todos")||"[]"); } catch { return []; }
  });
  const save = (next: Todo[]) => { setList(next); localStorage.setItem("proposal_todos", JSON.stringify(next)); };
  const add = () => { const t = text.trim(); if(!t) return; save([{ id: crypto.randomUUID(), text: t, done: false, at: Date.now() }, ...list]); setText(""); };
  const toggle = (id: string) => save(list.map(i=>i.id===id?{...i,done:!i.done}:i));
  const remove = (id: string) => save(list.filter(i=>i.id!==id));

  return (
    <Section>
      <div className="w-full max-w-xl mx-auto">
        <Card>
          <CardHeader><CardTitle className="font-serif text-2xl">Our To-Do</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()}
                     className="flex-1 h-10 rounded-md border border-slate-200 bg-white px-3" placeholder="Add something sweet..." />
              <Button onClick={add}><Plus className="w-4 h-4 mr-1"/>Add</Button>
            </div>
            <ul className="mt-4 space-y-2">
              {list.length===0 && <li className="text-slate-700/80">Nothing yet. Add your first one!</li>}
              {list.map(item=>(
                <li key={item.id} className="flex items-center justify-between rounded-md bg-white/70 border border-slate-200 px-3 py-2">
                  <button onClick={()=>toggle(item.id)} className={`inline-flex items-center gap-2 ${item.done?'text-slate-500 line-through':''}`}>
                    <span className={`grid place-items-center w-6 h-6 rounded-full border ${item.done?'bg-green-50 border-green-200':'border-slate-300'}`}>
                      {item.done && <Check className="w-4 h-4 text-green-600" />}
                    </span>
                    {item.text}
                  </button>
                  <button onClick={()=>remove(item.id)} className="text-slate-500 hover:text-rose-600"><Trash2 className="w-4 h-4"/></button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </Section>
  );
}

/* ------------------- ROOT ------------------- */
export default function App() {
  const audioCtl = useAudio(CONFIG.AUDIO_URL);
  useEffect(()=>{ emailjs.init(CONFIG.EMAILJS.PUBLIC_KEY); },[]);

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
    window.history.pushState({}, "", "/after");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <BrowserRouter>
      <GradientBG>
        <TopNav/>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<HeroPage onBegin={()=>{}} audioCtl={audioCtl} />} />
            <Route path="/memories" element={<GalleryPage />} />
            <Route path="/letter" element={<LoveLetterPage />} />
            <Route path="/offer" element={<OfferPage />} />
            <Route path="/question" element={<QuestionPage onYes={onYes} />} />
            <Route path="/after" element={<CelebrationPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/todo" element={<TodoPage />} />
            <Route path="*" element={<HeroPage onBegin={()=>{}} audioCtl={audioCtl} />} />
          </Routes>
        </AnimatePresence>
        <footer className="h-10" />
      </GradientBG>
    </BrowserRouter>
  );
}

/* ------------------- HELPERS ------------------- */
function DownloadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );
}
