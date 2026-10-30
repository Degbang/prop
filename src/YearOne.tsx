import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, useReducedMotion } from "framer-motion";
import confetti from "canvas-confetti";
import { BASE } from "./lib/path";
import "./year-one.css";

const Y = `${BASE}year/`;
const ALFRED_WA = "233558014538"; // 055 801 4538, for coupon redemptions

type AudioCtl = { play: () => Promise<void>; pause: () => void; playing: boolean };

/* ------------------- THE YEAR, WITH RECEIPTS ------------------- */
/* Every bubble below is copied word for word from our WhatsApp and iMessage chats. */
type Msg = { me?: boolean; t: string; at: string; kind?: "doc" | "link" | "photos"; sub?: string };
type Day = { day: string; msgs: Msg[] };
type SceneName = "nov" | "dec" | "jan" | "feb" | "mar" | "apr" | "may" | "jun" | "jul" | "aug" | "sep" | "oct";
type Month = { m: string; y: string; scene: SceneName; love: string; line: string; chat: Day[] };

/* One thing love is, per month, after 1 Corinthians 13. */
const MONTHS: Month[] = [
  {
    m: "November", y: "2025", scene: "nov", love: "Love is intentional.",
    line: "You sent me your CV at 7:32 in the morning, and by 7:45 you had a cover letter. You let me into your plans early, and I didn’t make you wait.",
    chat: [{ day: "8 November 2025", msgs: [
      { t: "Miss Lucynda N.S Sackey CV", kind: "doc", sub: "PDF", at: "7:32 AM" },
      { me: true, t: "Lucynda_Sackey_Cover_Letter", kind: "doc", sub: "PDF", at: "7:45 AM" },
      { t: "See your big nose!", at: "3:45 PM" },
      { t: "Can you call me please", at: "3:45 PM" },
    ] }],
  },
  {
    m: "December", y: "2025", scene: "dec", love: "Love always hopes.",
    line: "I sent you the KNUST link at 9pm, and by 10:36 you had scanned every certificate I own. You were hoping for that degree with me on the very night I found it.",
    chat: [{ day: "13 December 2025", msgs: [
      { me: true, t: "MSc Cyber Security and Digital Forensics", kind: "link", sub: "idl.knust.edu.gh", at: "9:00 PM" },
      { t: "4 photos", kind: "photos", sub: "my certificates, scanned", at: "10:24 PM" },
    ] }],
  },
  {
    m: "January", y: "2026", scene: "jan", love: "Love is caring.",
    line: "This year you asked me “have you eaten?” at least 51 times. It’s such a small question, and every single time it really meant: I’m looking after you.",
    chat: [{ day: "3 January 2026", msgs: [
      { me: true, t: "Eaten?", at: "6:36 PM" },
      { t: "lol the fufu", at: "7:00 PM" },
      { t: "You?", at: "7:00 PM" },
      { me: true, t: "Not yet", at: "7:07 PM" },
      { t: "Ah why", at: "7:07 PM" },
      { t: "Please you should eat", at: "7:07 PM" },
    ] }],
  },
  {
    m: "February", y: "2026", scene: "feb", love: "Love is gentle.",
    line: "February was our hardest month, so I booked you a massage and you slept through the whole thing. Sometimes love is just making room for you to rest.",
    chat: [{ day: "27 February 2026", msgs: [
      { t: "I really really needed this", at: "1:42 PM" },
      { t: "I slept off", at: "3:13 PM" },
      { t: "lol was a woman", at: "3:30 PM" },
      { me: true, t: "woman touched you for you to sleep dier you are sus", at: "3:30 PM" },
      { t: "Bro that should tell you how tired and exhausted I was", at: "3:31 PM" },
    ] }],
  },
  {
    m: "March", y: "2026", scene: "mar", love: "Love never fails.",
    line: "One morning made you sure about the rest of our lives. I made a constipation joke first, then I said the only word that mattered: together.",
    chat: [{ day: "6 March 2026", msgs: [
      { t: "this morning made me realise I can actually spend the rest of life with you. We would be better, richer, greater and definietly happier.", at: "10:26 AM" },
      { me: true, t: "What happened this morning", at: "10:28 AM" },
      { me: true, t: "Your constipation or mine?", at: "10:28 AM" },
      { t: "😂😂😂", at: "10:36 AM" },
      { t: "Your head like a fist!", at: "10:47 AM" },
      { me: true, t: "I love you too baby", at: "10:48 AM" },
      { me: true, t: "Together", at: "10:48 AM" },
    ] }],
  },
  {
    m: "April", y: "2026", scene: "apr", love: "Love does not envy.",
    line: "A guy at your office kept stealing glances at you, and I couldn’t even be jealous. I’d stare too.",
    chat: [{ day: "22 April 2026", msgs: [
      { t: "There’s this guy at my office that keeps smiling at me and stealing glances", at: "11:05 AM" },
      { me: true, t: "Hmm. I don’t like the sound of this guy already. Keep an eye on him for me", at: "11:12 AM" },
      { me: true, t: "Is he handsome?", at: "11:12 AM" },
      { t: "Ermm well he’s not that bad looking", at: "11:14 AM" },
      { me: true, t: "I don’t blame him, if I saw you everyday im the office I’d probably also stare", at: "11:42 AM" },
    ] }],
  },
  {
    m: "May", y: "2026", scene: "may", love: "Love rejoices.",
    line: "You signed your Nestlé letter and paid your fees on the same day, and your heart was dancing. Your good news has always felt like mine.",
    chat: [{ day: "12 May 2026", msgs: [
      { t: "Appointment Letter – signed", kind: "doc", sub: "PDF", at: "11:10 AM" },
      { t: "Payment Details · KNUST Payment Portal", kind: "doc", sub: "PDF", at: "5:03 PM" },
      { t: "my heart is dancing", at: "5:04 PM" },
      { me: true, t: "sika duro anaa", at: "5:04 PM" },
      { t: "So yeah I had to do magic", at: "5:04 PM" },
      { t: "Abracadabra", at: "5:05 PM" },
    ] }],
  },
  {
    m: "June", y: "2026", scene: "jun", love: "Love is kind.",
    line: "I started sending you something sweet every morning. When I slowed down, you missed it enough to come asking: “What happened to my sweet words?”",
    chat: [
      { day: "18 June 2026", msgs: [
        { me: true, t: "Ohemaa Baby 🐥, I hope you never forget how much light you bring into my life.", at: "7:37 AM" },
      ] },
      { day: "21 June 2026", msgs: [
        { me: true, t: "You are my safe place, my person, my baby, and my reminder that love can still be soft even when life is hard. I love you deeply when you are less annoying.", at: "10:01 AM" },
      ] },
      { day: "25 June 2026", msgs: [
        { t: "What happened to my sweet words 🫩🥹", at: "10:48 AM" },
        { me: true, t: "You said I should stop", at: "10:48 AM" },
        { t: "I usually say don’t stop", at: "10:50 AM" },
      ] },
    ],
  },
  {
    m: "July", y: "2026", scene: "jul", love: "Love lives here.",
    line: "I admitted I’d never been on a beach picnic, and you didn’t laugh at me. You said “Welcome to love,” and you meant it.",
    chat: [{ day: "3 July 2026", msgs: [
      { me: true, t: "He will fry the yam there?", at: "1:12 PM" },
      { t: "You’ve never had a beach picnic?", at: "1:13 PM" },
      { me: true, t: "Im new to it", at: "1:13 PM" },
      { t: "Welcome to love 💕!!", at: "1:14 PM" },
      { me: true, t: "Feck off", at: "1:15 PM" },
      { t: "Love lives here", at: "1:16 PM" },
      { t: "You’re loved !", at: "1:16 PM" },
    ] }],
  },
  {
    m: "August", y: "2026", scene: "aug", love: "Love perseveres.",
    line: "In April I asked you not to give up when I do. In August the job ended, and you kept the job links coming. You never gave up on me.",
    chat: [
      { day: "15 April 2026", msgs: [
        { me: true, t: "If I give up I need you not to give up", at: "1:42 PM" },
      ] },
      { day: "19 August 2026", msgs: [
        { t: "We would make it work don’t worry", at: "8:40 AM" },
        { t: "Information Technology Web Developer", kind: "link", sub: "techjobsinghana.com", at: "9:50 AM" },
        { t: "Jobs and careers", kind: "link", sub: "npontu.com", at: "9:52 AM" },
        { t: "Senior Backend Engineer (Java)", kind: "link", sub: "amalitech.com", at: "11:27 AM" },
      ] },
    ],
  },
  {
    m: "September", y: "2026", scene: "sep", love: "Love is patient.",
    line: "In March your account was bleeding for that car. In September I watched you drive it, and I was genuinely impressed. Love waits for the good part.",
    chat: [
      { day: "9 March 2026", msgs: [
        { t: "My account is bleeding", at: "12:49 PM" },
        { t: "🩸", at: "12:49 PM" },
        { me: true, t: "Welcome to a new dispensation 🥂", at: "12:49 PM" },
      ] },
      { day: "5 September 2026", msgs: [
        { me: true, t: "good driving", at: "5:15 PM" },
        { me: true, t: "i was impressed", at: "5:15 PM" },
      ] },
    ],
  },
  {
    m: "October", y: "2026", scene: "oct", love: "Love always trusts.",
    line: "I sat outside an interview trying to breathe. You told me “You are good” before anyone in that room had seen me, and less than a week later there was an offer letter.",
    chat: [
      { day: "16 October 2026", msgs: [
        { me: true, t: "Seated outside calming myself down", at: "10:41 AM" },
        { t: "You’ve got this", at: "10:41 AM" },
        { t: "You are good", at: "10:41 AM" },
        { t: "And i love you", at: "10:42 AM" },
        { t: "Breath in and breath out", at: "10:48 AM" },
        { t: "Youve got this", at: "10:48 AM" },
      ] },
      { day: "22 October 2026", msgs: [
        { me: true, t: "Offer Letter Alfred Degbang", kind: "doc", sub: "PDF · 3 pages", at: "10:27 PM" },
      ] },
      { day: "23 October 2026", msgs: [
        { t: "Congratulations 🎉 again", at: "4:34 AM" },
      ] },
    ],
  },
];

/* Counted across both chats, 30 Oct 2025 to today. Pattern counts, so treat them as "at least". */
const STATS = [
  { n: 25530, label: "messages since you said yes", note: "You sent 630 more than me. Of course you did." },
  { n: 71, vs: 59, label: "“I love you”", note: "You 71, me 59. I’m catching up." },
  { n: 83, label: "“Have you eaten?”", note: "Between the two of us. That’s 83 times we said “I care” without saying it." },
  { n: 194, vs: 65, label: "“Hmm”", note: "You 194, me 65. I know what each one means now." },
  { n: 42, vs: 42, label: "“Good morning”", note: "42 each. A perfect draw." },
  { n: 4, label: "times we said “pizza”", note: "The offer letter promised biweekly pizza nights. See coupon 02." },
];

/* 1 Corinthians 13:4–8 (NIV). The phrases our year lived out are picked out in gold. */
const VERSE: [string, boolean][] = [
  ["Love is patient", true], [", ", false], ["love is kind", true], [". It ", false], ["does not envy", true],
  [", it does not boast, it is not proud. It does not dishonor others, it is not self-seeking, it is not easily angered, it keeps no record of wrongs. Love does not delight in evil but ", false],
  ["rejoices", true], [" with the truth. It always protects, ", false], ["always trusts", true], [", ", false],
  ["always hopes", true], [", always ", false], ["perseveres", true], [". ", false], ["Love never fails", true], [".", false],
];

const CLIPS = [
  { src: "clip-1", sound: true },
  { src: "clip-2", sound: false },
  { src: "clip-3", sound: false },
  { src: "clip-4", sound: true },
  { src: "clip-5", sound: true },
];

type Coupon = { id: string; no: string; title: string; fine: string; valid: string; message: (pick?: string) => string; picks?: string[] };
const COUPONS: Coupon[] = [
  {
    id: "rub", no: "01", title: "One proper shoulder rub",
    fine: "Not two minutes. Until you say stop.", valid: "Any evening",
    message: () => "Hi baby 😌 I’m redeeming my shoulder rub coupon. Clear your evening.",
  },
  {
    id: "movie", no: "02", title: "Movie night",
    fine: "You pick the film. Popcorn or pizza, your call. By the contract, the pizza is overdue.", valid: "Any night", picks: ["Popcorn", "Pizza"],
    message: (pick) => `Hi baby 🍿 I’m redeeming my movie night coupon. I’m choosing ${pick?.toLowerCase() ?? "popcorn"}, and I’m picking the film.`,
  },
  {
    id: "dinner", no: "03", title: "Dinner, on me",
    fine: "Anywhere you pick. This one is for later, from my next payday. I haven’t forgotten.", valid: "From next payday",
    message: () => "Hi baby 🍽️ Payday reminder: I’m redeeming my dinner coupon.",
  },
];

const UMM_LINES = [
  "Umm? After a whole year? 😂",
  "The YES button has been waiting since last October.",
  "Umm has gone on strike again. Some things don’t change 😌",
];

function readStore<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeStore(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

/* Her words, inside curly quotes, get set in gold. */
function Line({ text }: { text: string }) {
  return (
    <>
      {text.split(/(“[^”]*”)/).map((part, i) =>
        part.startsWith("“") ? <em key={i} className="y1-q">{part}</em> : <span key={i}>{part}</span>
      )}
    </>
  );
}

/* ------------------- SCENES ------------------- */
function SceneArt({ name }: { name: SceneName }) {
  switch (name) {
    case "nov":
      return (
        <div className="y1-seq">
          <div className="y1-frame"><span className="y1-e y1-wiggle">📄</span><span className="y1-tag">7:32am · your CV</span></div>
          <div className="y1-frame"><span className="y1-e y1-fly">✉️</span><span className="y1-tag">7:45am · your cover letter</span></div>
          <div className="y1-frame"><span className="y1-e y1-boing">👃🏾</span><span className="y1-tag">3:45pm · “See your big nose!”</span></div>
        </div>
      );
    case "dec":
      return (
        <>
          <div className="y1-papers"><span>📄</span><span>📄</span><span>📄</span><span>📄</span></div>
          <span className="y1-scanbar" />
          <span className="y1-e y1-cap">🎓</span>
          <span className="y1-tag y1-tag-bottom">10:24 to 10:36pm · 4 scans</span>
        </>
      );
    case "jan":
      return (
        <>
          <span className="y1-steam"><i /><i /><i /></span>
          <span className="y1-e y1-bowl">🍲</span>
          <span className="y1-say y1-say-l">Eaten?</span>
          <span className="y1-say y1-say-r">Please you should eat</span>
          <span className="y1-badge">×83 this year</span>
        </>
      );
    case "feb":
      return (
        <>
          <span className="y1-e y1-bob">💆🏾‍♀️</span>
          <span className="y1-zs"><i>z</i><i>z</i><i>Z</i></span>
          <span className="y1-e y1-candle">🕯️</span>
          <span className="y1-tag y1-tag-bottom">“I slept off”</span>
        </>
      );
    case "mar":
      return (
        <>
          <span className="y1-e y1-roll">🧻</span>
          <span className="y1-strip-paper"><b>together</b></span>
          <span className="y1-e y1-pop">💛</span>
        </>
      );
    case "apr":
      return (
        <>
          <span className="y1-eyes">
            <span className="y1-eye"><i className="y1-pupil" /><i className="y1-lid" /></span>
            <span className="y1-eye"><i className="y1-pupil" /><i className="y1-lid" /></span>
          </span>
          <span className="y1-tag y1-tag-bottom">“Is he handsome?”</span>
        </>
      );
    case "may":
      return (
        <>
          <span className="y1-notes"><i>♪</i><i>♫</i><i>♪</i></span>
          <span className="y1-e y1-dance">❤️</span>
          <span className="y1-stamp-chip y1-chip-l">Nestlé ✓</span>
          <span className="y1-stamp-chip y1-chip-r">Fees ✓</span>
        </>
      );
    case "jun":
      return (
        <>
          <span className="y1-e y1-sunrise">☀️</span>
          <span className="y1-notifs">
            <span className="y1-notif">Ohemaa Baby 🐥</span>
            <span className="y1-notif">You are my safe place</span>
            <span className="y1-notif is-her">What happened to my sweet words 🫩🥹</span>
          </span>
        </>
      );
    case "jul":
      return (
        <>
          <span className="y1-e y1-sun">☀️</span>
          <span className="y1-banner">Welcome to love 💕</span>
          <span className="y1-sea"><i /><i /></span>
          <span className="y1-e y1-basket">🧺</span>
          <span className="y1-e y1-yam">🍠</span>
        </>
      );
    case "aug":
      return (
        <>
          <span className="y1-rain">
            <i>🔗 npontu.com</i><i>🔗 amalitech.com</i><i>🔗 techjobsinghana</i><i>🔗 flexjobs.com</i><i>🔗 kedebah.com</i>
          </span>
          <span className="y1-sticky">you didn’t<br />give up</span>
        </>
      );
    case "sep":
      return (
        <>
          <span className="y1-tag y1-tag-top">“good driving”</span>
          <span className="y1-road"><i /></span>
          <span className="y1-e y1-car">🚗</span>
        </>
      );
    case "oct":
      return (
        <>
          <span className="y1-breathe"><i>breathe in</i><i>breathe out</i></span>
          <span className="y1-e y1-letter">💌</span>
          <span className="y1-tag y1-tag-bottom">22 Oct · offer letter</span>
        </>
      );
  }
}

function Scene({ name }: { name: SceneName }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const live = useInView(ref, { amount: 0.2 }); // pause the loops when off screen
  return (
    <div ref={ref} className={`y1-scene y1-scene-${name} ${live ? "is-live" : ""}`} aria-hidden="true">
      <SceneArt name={name} />
    </div>
  );
}

/* ------------------- CHAT (the receipts) ------------------- */
const onlyEmoji = (s: string) => /^[\p{Extended_Pictographic}‍️\s]+$/u.test(s);

function Bubble({ m }: { m: Msg }) {
  const side = m.me ? "me" : "her";
  if (m.kind === "doc" || m.kind === "link") {
    return (
      <div className={`y1-b ${side} is-file`}>
        <span className="y1-file-icon">{m.kind === "doc" ? "📄" : "🔗"}</span>
        <span className="y1-file-text"><b>{m.t}</b><small>{m.sub}</small></span>
        <time>{m.at}</time>
      </div>
    );
  }
  if (m.kind === "photos") {
    return (
      <div className={`y1-b ${side} is-photos`}>
        <span className="y1-thumbs"><i /><i /><i /><i /></span>
        <span className="y1-file-text"><b>{m.t}</b><small>{m.sub}</small></span>
        <time>{m.at}</time>
      </div>
    );
  }
  return (
    <div className={`y1-b ${side} ${onlyEmoji(m.t) ? "is-emoji" : ""}`}>
      {m.t}
      <time>{m.at}</time>
    </div>
  );
}

type Row = { type: "day"; label: string; key: string } | { type: "msg"; m: Msg; who: boolean; key: string };

function Chat({ days }: { days: Day[] }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduce = useReducedMotion();

  const rows: Row[] = [];
  days.forEach((d, di) => {
    rows.push({ type: "day", label: d.day, key: `d${di}` });
    d.msgs.forEach((m, mi) => {
      const prev = d.msgs[mi - 1];
      rows.push({ type: "msg", m, who: !prev || Boolean(prev.me) !== Boolean(m.me), key: `m${di}-${mi}` });
    });
  });

  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduce) { setShown(rows.length); return; }
    let n = 0;
    let timer = 0;
    const tick = () => {
      n += 1;
      setShown((s) => Math.max(s, n));
      const next = rows[n];
      if (!next) return;
      const wait = next.type === "day" ? 350 : 520 + Math.min(next.m.t.length * 14, 900);
      timer = window.setTimeout(tick, wait);
    };
    timer = window.setTimeout(tick, 250);
    return () => window.clearTimeout(timer);
    // rows are static per chat
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce]);

  const next = rows[shown];
  const done = shown >= rows.length;

  return (
    <div
      ref={ref}
      className="y1-chat"
      onClick={() => setShown(rows.length)}
      role="log"
      aria-label="Our messages"
    >
      {rows.slice(0, shown).map((r) =>
        r.type === "day" ? (
          <motion.span key={r.key} className="y1-day" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }}>
            {r.label}
          </motion.span>
        ) : (
          <motion.div
            key={r.key}
            className={`y1-row ${r.m.me ? "me" : "her"}`}
            initial={reduce ? false : { opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
          >
            {r.who && <span className="y1-who">{r.m.me ? "me" : "you"}</span>}
            <Bubble m={r.m} />
          </motion.div>
        )
      )}
      {!done && next?.type === "msg" && inView && (
        <div className={`y1-row ${next.m.me ? "me" : "her"}`}>
          <span className="y1-typing" aria-hidden="true"><i /><i /><i /></span>
        </div>
      )}
      {!done && inView && <span className="y1-skip">tap to skip</span>}
    </div>
  );
}

/* ------------------- NUMBERS ------------------- */
function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduce) { setV(to); return; }
    let raf = 0;
    const start = performance.now();
    const dur = 1400;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, to]);
  return <span ref={ref}>{v.toLocaleString("en-GB")}</span>;
}

/* ------------------- CLIPS ------------------- */
function Clip({ src, sound, soundOn, onToggle }: { src: string; sound: boolean; soundOn: boolean; onToggle: () => void }) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.muted = true; // React doesn't reliably set the attribute, and iOS needs it for autoplay
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? el.play().catch(() => {}) : el.pause()),
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.muted = !soundOn;
    if (soundOn) {
      el.currentTime = 0;
      el.play().catch(() => {});
    }
  }, [soundOn]);

  return (
    <figure className="y1-clip">
      <video ref={ref} src={`${Y}${src}.mp4`} poster={`${Y}${src}.jpg`} loop playsInline preload="metadata" />
      {sound && (
        <button type="button" className={`y1-sound ${soundOn ? "is-on" : ""}`} aria-pressed={soundOn} onClick={onToggle}>
          {soundOn ? "🔊 Sound on" : "🔈 Tap for sound"}
        </button>
      )}
    </figure>
  );
}

/* ------------------- PAGE ------------------- */
export default function YearOnePage({ audioCtl, onRenew }: { audioCtl: AudioCtl; onRenew: () => Promise<void> }) {
  const reduce = useReducedMotion();
  const monthRefs = useRef<(HTMLElement | null)[]>([]);
  const [reached, setReached] = useState(-1);
  const [current, setCurrent] = useState(-1);
  const [soundIdx, setSoundIdx] = useState<number | null>(null);
  const [redeemed, setRedeemed] = useState<Record<string, string>>(() => readStore("y1-redeemed", {}));
  const [picks, setPicks] = useState<Record<string, string>>({ movie: "Popcorn" });
  const [ummCount, setUmmCount] = useState(0);
  const [renewed, setRenewed] = useState<boolean>(() => readStore("y1-renewed", false));

  useEffect(() => {
    const prevTitle = document.title;
    const prevBg = document.body.style.background;
    document.title = "Year One · Ohemaa";
    document.body.style.background = "#fff7ea";
    return () => {
      document.title = prevTitle;
      document.body.style.background = prevBg;
    };
  }, []);

  // Fill the year strip as each month passes the middle of the screen.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const idx = Number((e.target as HTMLElement).dataset.idx);
          setCurrent(idx);
          setReached((r) => Math.max(r, idx));
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    monthRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const toggleSound = (i: number) => {
    setSoundIdx((cur) => {
      const next = cur === i ? null : i;
      if (next !== null) audioCtl.pause();
      return next;
    });
  };

  const redeem = (c: Coupon) => {
    const next = { ...redeemed, [c.id]: new Date().toISOString() };
    setRedeemed(next);
    writeStore("y1-redeemed", next);
    window.open(`https://wa.me/${ALFRED_WA}?text=${encodeURIComponent(c.message(picks[c.id]))}`, "_blank", "noopener");
  };
  const undo = (id: string) => {
    const next = { ...redeemed };
    delete next[id];
    setRedeemed(next);
    writeStore("y1-redeemed", next);
  };

  const renew = () => {
    if (renewed) return;
    setRenewed(true);
    writeStore("y1-renewed", true);
    confetti({ particleCount: 180, spread: 95, origin: { y: 0.7 }, colors: ["#e3aa2b", "#f8dd92", "#fff7ea", "#2e7b72", "#c2513a"] });
    onRenew();
  };

  const rise = (delay = 0) =>
    reduce
      ? {}
      : { initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-8% 0px" }, transition: { duration: 0.6, delay, ease: [0.2, 0.7, 0.2, 1] } };

  const ummMsg = ummCount > 0 ? UMM_LINES[Math.min(ummCount - 1, UMM_LINES.length - 1)] : "";

  return (
    <div className="y1">
      {/* ---------- Opening ---------- */}
      <header className="y1-hero">
        <span className="y1-hearts" aria-hidden="true"><i>♥</i><i>♥</i><i>♥</i><i>♥</i><i>♥</i></span>
        <div className="y1-hero-photo">
          <figure className="y1-polaroid">
            <span className="y1-photo-wrap">
              <span className="y1-crown" aria-hidden="true">👑</span>
              <img src={`${Y}hero.jpg`} alt="Lucynda in her yellow dress, smiling across the table" />
            </span>
            <figcaption>my Ohemaa, year one</figcaption>
          </figure>
        </div>
        <div className="y1-hero-copy">
          <p className="y1-pill">30 · 10 · 2026</p>
          <h1 className="y1-h1">
            <span className="y1-name" aria-label="Ohemaa,">
              {"Ohemaa,".split("").map((ch, i) => (
                <span key={i} aria-hidden="true" style={{ animationDelay: `${0.15 + i * 0.06}s` }}>{ch}</span>
              ))}
            </span>
            <span className="y1-h1-sub">it’s been a year.</span>
          </h1>
          <p className="y1-lede">
            A year ago you said yes to a very unserious offer letter on this website.
            This is what love looked like since then, month by month, in our own messages.
          </p>
          <div className="y1-hero-actions">
            <button type="button" className="y1-btn" onClick={() => (audioCtl.playing ? audioCtl.pause() : audioCtl.play())}>
              <span aria-hidden="true">{audioCtl.playing ? "❚❚" : "▶"}</span>
              {audioCtl.playing ? "Playing our song" : "Play our song"}
            </button>
            <span className="y1-scroll-hint" aria-hidden="true">scroll ↓</span>
          </div>
        </div>
      </header>

      {/* ---------- The year ---------- */}
      <section aria-labelledby="y1-months-title">
        <div className="y1-intro">
          <motion.p className="y1-kicker" {...rise()}>1 Corinthians 13, our version</motion.p>
          <motion.h2 id="y1-months-title" className="y1-h2" {...rise(0.05)}>What love looked like.</motion.h2>
          <motion.p className="y1-sub" {...rise(0.1)}>Twelve months, twelve things love is, and the messages that prove it. Every one is real, copied straight from our chats.</motion.p>
        </div>

        <nav className="y1-strip" aria-label="The year so far">
          <div className="y1-strip-inner">
            <ol>
              {MONTHS.map((mo, i) => (
                <li key={mo.m} className={`y1-cell ${i <= reached ? "is-on" : ""} ${i === current ? "is-now" : ""}`} aria-label={`${mo.m} ${mo.y}`}>
                  {mo.m[0]}
                </li>
              ))}
            </ol>
            <span className="y1-strip-count">{reached < 0 ? 0 : reached + 1}/12</span>
          </div>
        </nav>

        <div className="y1-months">
          {MONTHS.map((mo, i) => (
            <article key={mo.m} className="y1-card" data-idx={i} ref={(el) => { monthRefs.current[i] = el; }}>
              <motion.div className="y1-card-main" {...rise()}>
                <Scene name={mo.scene} />
                <p className="y1-card-meta"><span>{String(i + 1).padStart(2, "0")}</span>{mo.m} {mo.y}</p>
                <h3 className="y1-card-love">{mo.love}</h3>
                <p className="y1-line"><Line text={mo.line} /></p>
              </motion.div>
              <Chat days={mo.chat} />
            </article>
          ))}
        </div>

        <motion.blockquote className="y1-verse" {...rise()}>
          <p>
            {VERSE.map(([text, lived], i) => (lived ? <mark key={i}>{text}</mark> : <span key={i}>{text}</span>))}
          </p>
          <cite>1 Corinthians 13:4–8. The gold parts, we lived this year.</cite>
        </motion.blockquote>
      </section>

      {/* ---------- Numbers ---------- */}
      <section className="y1-numbers" aria-labelledby="y1-numbers-title">
        <div className="y1-intro">
          <motion.p className="y1-kicker" {...rise()}>The data</motion.p>
          <motion.h2 id="y1-numbers-title" className="y1-h2" {...rise(0.05)}>Us, in numbers.</motion.h2>
          <motion.p className="y1-sub" {...rise(0.1)}>I counted. Of course I counted.</motion.p>
        </div>
        <div className="y1-stats">
          {STATS.map((s, i) => (
            <motion.div key={s.label} className="y1-stat" {...rise(i * 0.05)}>
              <span className="y1-stat-n"><CountUp to={s.n} /></span>
              <span className="y1-stat-label">{s.label}</span>
              {s.vs !== undefined && (
                <span className="y1-versus">
                  <span style={{ flexGrow: s.n }} className="is-her">you</span>
                  <span style={{ flexGrow: s.vs }} className="is-me">me</span>
                </span>
              )}
              <span className="y1-stat-note">{s.note}</span>
            </motion.div>
          ))}
        </div>
        <p className="y1-fine">Counted from our WhatsApp and iMessage, 30 October 2025 to today.</p>
      </section>

      {/* ---------- Clips ---------- */}
      <section className="y1-reel-wrap" aria-labelledby="y1-reel-title">
        <div className="y1-intro is-dark">
          <motion.p className="y1-kicker" {...rise()}>Five clips</motion.p>
          <motion.h2 id="y1-reel-title" className="y1-h2" {...rise(0.05)}>You, on repeat.</motion.h2>
          <motion.p className="y1-sub" {...rise(0.1)}>The little clips of you I keep rewatching. Swipe through them.</motion.p>
        </div>
        <div className="y1-reel">
          {CLIPS.map((c, i) => (
            <Clip key={c.src} src={c.src} sound={c.sound} soundOn={soundIdx === i} onToggle={() => toggleSound(i)} />
          ))}
        </div>
      </section>

      {/* ---------- Coupons ---------- */}
      <section className="y1-benefits" aria-labelledby="y1-benefits-title">
        <div className="y1-intro">
          <motion.p className="y1-kicker" {...rise()}>Year two benefits</motion.p>
          <motion.h2 id="y1-benefits-title" className="y1-h2" {...rise(0.05)}>Some paperwork.</motion.h2>
          <motion.p className="y1-sub" {...rise(0.1)}>
            The offer letter promised shoulder rubs and pizza nights. Tap redeem and it comes straight to me on WhatsApp.
          </motion.p>
        </div>

        <div className="y1-tickets">
          {COUPONS.map((c, i) => {
            const done = Boolean(redeemed[c.id]);
            return (
              <motion.div key={c.id} className={`y1-ticket ${done ? "is-done" : ""}`} {...rise(i * 0.08)}>
                <div className="y1-stub" aria-hidden="true"><span>No. {c.no}</span></div>
                <div className="y1-ticket-body">
                  <h3 className="y1-ticket-title">{c.title}</h3>
                  <p className="y1-ticket-fine">{c.fine}</p>

                  {c.picks && !done && (
                    <div className="y1-picks" role="radiogroup" aria-label="Choose one">
                      {c.picks.map((p) => (
                        <button key={p} type="button" role="radio" aria-checked={picks[c.id] === p}
                          className={`y1-pick ${picks[c.id] === p ? "is-on" : ""}`}
                          onClick={() => setPicks({ ...picks, [c.id]: p })}>
                          {p === "Popcorn" ? "🍿 " : "🍕 "}{p}
                        </button>
                      ))}
                    </div>
                  )}

                  <dl className="y1-ticket-meta">
                    <div><dt>Valid</dt><dd>{c.valid}</dd></div>
                    <div><dt>Expires</dt><dd>Never</dd></div>
                  </dl>

                  {done ? (
                    <div className="y1-stamp-row">
                      <span className="y1-stamp">Redeemed</span>
                      <button type="button" className="y1-undo" onClick={() => undo(c.id)}>undo</button>
                    </div>
                  ) : (
                    <button type="button" className="y1-redeem" onClick={() => redeem(c)}>Redeem</button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ---------- Renewal ---------- */}
      <section className="y1-renew-wrap" aria-labelledby="y1-renew-title">
        <div className="y1-renew">
          <motion.p className="y1-kicker" {...rise()}>Contract renewal</motion.p>
          <motion.h2 id="y1-renew-title" className="y1-renew-title" {...rise(0.1)}>Year two.<br />Shall we?</motion.h2>

          <motion.dl className="y1-terms" {...rise(0.2)}>
            <div><dt>Position</dt><dd>My person</dd></div>
            <div><dt>Start date</dt><dd>Today</dd></div>
            <div><dt>Location</dt><dd>Wherever you are</dd></div>
          </motion.dl>

          {renewed ? (
            <motion.div className="y1-renewed" initial={reduce ? false : { opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
              <p className="y1-renewed-big">Renewed. 💙</p>
              <p className="y1-renewed-note">I love you, Ohemaa. Here’s to year two, and to dinner, whenever payday says.</p>
              <p className="y1-sign">Alfred</p>
            </motion.div>
          ) : (
            <motion.div className="y1-renew-actions" {...rise(0.3)}>
              <button type="button" className="y1-btn is-big" onClick={renew}>YES</button>
              <motion.button type="button" className="y1-umm"
                animate={ummCount > 0 && !reduce ? { x: [0, -6, 6, -6, 6, 0] } : undefined}
                transition={{ duration: 0.35 }}
                onClick={() => (ummCount >= UMM_LINES.length ? renew() : setUmmCount((c) => c + 1))}>
                {ummCount >= UMM_LINES.length ? "…fine, YES 😇" : "Umm…"}
              </motion.button>
              <p className="y1-umm-msg" aria-live="polite">{ummMsg}</p>
            </motion.div>
          )}
        </div>

        <footer className="y1-foot">
          <Link to="/">Where it started</Link>
          <Link to="/cheer">Cheer Up Corner</Link>
        </footer>
      </section>
    </div>
  );
}
