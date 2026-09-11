import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Heart, MessageCircle, Image as ImageIcon, Video as VideoIcon, FileText, Type as TypeIcon,
  Heading as HeadingIcon, Plus, X, Upload, Instagram, Youtube, Globe, ShoppingBag,
  CreditCard, ChevronLeft, ChevronRight, Pencil, LogOut, Search, Home, User as UserIcon,
  BookOpen, Lock, Check, ArrowLeft, Trash2, GripVertical, Sparkles
} from "lucide-react";

/* ---------------------------------- palette ---------------------------------- */
const C = {
  cream: "#FFF8F3",
  blush: "#FADCE0",
  blushSoft: "#FCEAEC",
  peach: "#FBD9C6",
  butter: "#F3D67B",
  butterSoft: "#F8E7A8",
  rosewood: "#A63A50",
  rosewoodDark: "#7C2A3B",
  plum: "#3E2A2F",
  plumSoft: "#8A6D71",
  white: "#FFFFFF",
  line: "#EFD3D7",
};

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,500&family=Karla:wght@400;500;600;700&display=swap');`;

const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => Date.now();
const fmtDate = (t) => {
  const d = new Date(t);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

/* ---------------------------------- placeholder art ---------------------------------- */
function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}
const PALETTE_SETS = [
  [C.rosewood, C.butter, C.peach],
  [C.plum, C.blush, C.butter],
  [C.rosewoodDark, C.peach, C.blush],
  [C.butter, C.rosewood, C.blushSoft],
];

function GrannySquare({ seed = "x", size = 64, rounded = true }) {
  const h = hashSeed(seed);
  const set = PALETTE_SETS[h % PALETTE_SETS.length];
  const rot = (h % 4) * 90;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{ borderRadius: rounded ? "50%" : 10, background: set[2] }}>
      <g transform={`rotate(${rot} 32 32)`}>
        <rect x="4" y="4" width="56" height="56" fill={set[2]} />
        <rect x="12" y="12" width="40" height="40" fill="none" stroke={set[0]} strokeWidth="4" strokeDasharray="6 4" />
        <rect x="20" y="20" width="24" height="24" fill="none" stroke={set[1]} strokeWidth="4" strokeDasharray="5 3" />
        <circle cx="32" cy="32" r="6" fill={set[0]} />
      </g>
    </svg>
  );
}

function CoverArt({ seed = "x", height = 160 }) {
  const h = hashSeed(seed);
  const set = PALETTE_SETS[h % PALETTE_SETS.length];
  return (
    <svg width="100%" height={height} viewBox="0 0 400 160" preserveAspectRatio="xMidYMid slice" style={{ display: "block" }}>
      <rect width="400" height="160" fill={set[2]} />
      {Array.from({ length: 6 }).map((_, i) => {
        const cx = ((h >> i) % 9) * 45 + 20;
        const cy = ((h >> (i + 3)) % 7) * 22 + 15;
        const r = 14 + ((h >> (i + 5)) % 10);
        return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={i % 2 ? set[0] : set[1]} strokeWidth="3" strokeDasharray="4 3" opacity="0.8" />;
      })}
    </svg>
  );
}

/* ---------------------------------- stitch divider ---------------------------------- */
function StitchDivider() {
  return <div style={{ height: 0, borderTop: `2px dashed ${C.rosewood}`, opacity: 0.35, margin: "0" }} />;
}

/* ---------------------------------- toast ---------------------------------- */
function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, [onDone]);
  if (!message) return null;
  return (
    <div style={{
      position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", zIndex: 200,
      background: C.plum, color: C.cream, padding: "10px 18px", borderRadius: 999,
      fontFamily: "Karla, sans-serif", fontSize: 14, boxShadow: "0 6px 20px rgba(0,0,0,0.2)"
    }}>
      {message}
    </div>
  );
}

/* ---------------------------------- storage helpers ---------------------------------- */
const DATA_KEY = "crosheher_app_data";
const SESSION_KEY = "crosheher_session";

function seedData() {
  const u1 = { id: "u_priya", name: "Priya Nair", username: "priya.knots", bio: "Amigurumi & granny squares from Mumbai 🧶 Slow stitching, fast shipping.", socials: { instagram: "priya.knots", youtube: "", etsy: "PriyaKnotsShop", website: "" }, paymentConnected: true, avatarSeed: "priya-avatar" };
  const u2 = { id: "u_maya", name: "Maya Fernandes", username: "mayamakes", bio: "Designing cosy crochet wearables. Pattern drops every full moon 🌙", socials: { instagram: "mayamakes.co", youtube: "MayaMakesTV", etsy: "", website: "mayamakes.studio" }, paymentConnected: false, avatarSeed: "maya-avatar" };
  const u3 = { id: "u_leo", name: "Leo D'Souza", username: "hooked_by_leo", bio: "Weekend hooker, weekday engineer. Sharing free beginner patterns.", socials: { instagram: "hooked.by.leo", youtube: "", etsy: "", website: "" }, paymentConnected: false, avatarSeed: "leo-avatar" };

  const users = { [u1.id]: u1, [u2.id]: u2, [u3.id]: u3 };

  const posts = [
    { id: "p1", authorId: "u_maya", type: "image", text: "Finished this cropped cardigan in butter yellow — pattern going up this weekend!", mediaSeed: "maya-cardigan", likes: 24, comments: [{ id: "c1", authorId: "u_leo", text: "The colour!! 😍", createdAt: now() - 800000 }], createdAt: now() - 3600_000 * 5 },
    { id: "p2", authorId: "u_leo", type: "text", text: "PSA: blocking your granny squares before seaming will save you so much heartbreak. Learned this the hard way.", likes: 41, comments: [], createdAt: now() - 3600_000 * 20 },
    { id: "p3", authorId: "u_priya", type: "image", text: "Custom amigurumi order — a tiny stegosaurus for a very lucky 5 year old.", mediaSeed: "priya-ami", likes: 63, comments: [], createdAt: now() - 3600_000 * 40 },
  ];

  const patterns = [
    {
      id: "pat1", authorId: "u_maya", title: "Sunday Peach Cropped Cardigan", coverSeed: "cardigan-cover",
      isPaid: true, price: 249, likes: 88, createdAt: now() - 3600_000 * 30,
      blocks: [
        { id: "b1", type: "heading", text: "Sunday Peach Cropped Cardigan" },
        { id: "b2", type: "paragraph", text: "A relaxed, cropped cardigan worked top-down in a simple shell stitch. Beginner-friendly with written instructions and a schematic." },
        { id: "b3", type: "image", seed: "cardigan-detail" },
        { id: "b4", type: "heading", text: "Materials" },
        { id: "b5", type: "paragraph", text: "5mm hook, 600g DK weight yarn, stitch markers, tapestry needle." },
        { id: "b6", type: "paragraph", text: "Row 1: ch2, work 8dc into a magic ring, join with sl st...\n\n(Full written pattern continues after purchase.)" },
      ],
    },
    {
      id: "pat2", authorId: "u_leo", title: "One-Skein Granny Square Coaster", coverSeed: "coaster-cover",
      isPaid: false, price: 0, likes: 52, createdAt: now() - 3600_000 * 60,
      blocks: [
        { id: "b1", type: "heading", text: "One-Skein Granny Square Coaster" },
        { id: "b2", type: "paragraph", text: "A quick weekend project that uses up scrap yarn — perfect for beginners learning their first granny square." },
        { id: "b3", type: "image", seed: "coaster-detail" },
        { id: "b4", type: "heading", text: "Pattern" },
        { id: "b5", type: "paragraph", text: "Round 1: magic ring, ch3 (counts as dc), 2dc, ch2, [3dc, ch2] x3, join.\nRound 2: sl st into space, ch3, 2dc, ch2, 3dc in same space...\nContinue for 4 rounds, fasten off and weave in ends." },
      ],
    },
  ];

  return { users, posts, patterns };
}

async function loadAppData() {
  try {
    const res = await window.storage.get("app-data", true);
    if (res && res.value) return JSON.parse(res.value);
  } catch (e) { /* not found yet */ }
  const seeded = seedData();
  try { await window.storage.set("app-data", JSON.stringify(seeded), true); } catch (e) { console.error(e); }
  return seeded;
}

async function saveAppData(data) {
  try {
    const res = await window.storage.set("app-data", JSON.stringify(data), true);
    if (!res) console.error("Storage save returned null");
  } catch (e) { console.error("Storage error", e); }
}

async function loadSession() {
  try {
    const res = await window.storage.get("session", false);
    if (res && res.value) return JSON.parse(res.value);
  } catch (e) { /* none */ }
  return null;
}
async function saveSession(session) {
  try { await window.storage.set("session", JSON.stringify(session), false); } catch (e) { console.error(e); }
}
async function clearSession() {
  try { await window.storage.delete("session", false); } catch (e) { /* ignore */ }
}

/* ---------------------------------- shared UI bits ---------------------------------- */
function PrimaryButton({ children, onClick, style, disabled, type = "button" }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      background: disabled ? C.plumSoft : C.rosewood, color: C.cream, border: "none",
      borderRadius: 10, padding: "11px 20px", fontFamily: "Karla, sans-serif", fontWeight: 600,
      fontSize: 14.5, cursor: disabled ? "default" : "pointer", transition: "background 0.15s", ...style,
    }}
      onMouseEnter={e => !disabled && (e.currentTarget.style.background = C.rosewoodDark)}
      onMouseLeave={e => !disabled && (e.currentTarget.style.background = C.rosewood)}
    >{children}</button>
  );
}
function GhostButton({ children, onClick, style }) {
  return (
    <button onClick={onClick} style={{
      background: "transparent", color: C.rosewood, border: `1.5px solid ${C.rosewood}`,
      borderRadius: 10, padding: "10px 18px", fontFamily: "Karla, sans-serif", fontWeight: 600,
      fontSize: 14.5, cursor: "pointer", ...style,
    }}>{children}</button>
  );
}
function Field({ label, children }) {
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <div style={{ fontFamily: "Karla, sans-serif", fontSize: 12.5, fontWeight: 600, color: C.plumSoft, marginBottom: 5, letterSpacing: 0.2 }}>{label}</div>
      {children}
    </label>
  );
}
const inputStyle = {
  width: "100%", boxSizing: "border-box", border: `1.5px solid ${C.line}`, borderRadius: 9,
  padding: "10px 12px", fontFamily: "Karla, sans-serif", fontSize: 14.5, color: C.plum, background: C.white, outline: "none",
};

function Modal({ title, onClose, children, width = 480 }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(62,42,47,0.45)", zIndex: 150, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: C.cream, borderRadius: 16, width: "100%", maxWidth: width, maxHeight: "88vh", overflowY: "auto", padding: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 21, color: C.plum, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.plumSoft }}><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---------------------------------- Auth ---------------------------------- */
function AuthScreen({ onLogin, onSignup, users }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    setError("");
    if (mode === "signup") {
      if (!form.name || !form.username || !form.email || !form.password) { setError("Fill in every field to create your account."); return; }
      const exists = Object.values(users).some(u => u.username === form.username || u.email === form.email);
      if (exists) { setError("That username or email is already taken."); return; }
      onSignup(form);
    } else {
      const found = Object.values(users).find(u => u.email === form.email);
      if (!found) { setError("No account found with that email. Try signing up instead."); return; }
      onLogin(found.id);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(160deg, ${C.blush} 0%, ${C.peach} 45%, ${C.butterSoft} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "Karla, sans-serif" }}>
      <style>{FONT_IMPORT}</style>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 26 }}>
          <div style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", fontWeight: 500, fontSize: 40, color: C.rosewoodDark }}>Crosheher</div>
          <div style={{ color: C.plumSoft, fontSize: 14.5, marginTop: 4 }}>a home for crochet patterns &amp; the people who make them</div>
        </div>

        <div style={{ background: C.white, borderRadius: 18, padding: 26, boxShadow: "0 16px 40px rgba(166,58,80,0.15)" }}>
          <div style={{ display: "flex", gap: 6, background: C.blushSoft, borderRadius: 10, padding: 4, marginBottom: 20 }}>
            {["login", "signup"].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); }} style={{
                flex: 1, padding: "8px 0", border: "none", borderRadius: 8, cursor: "pointer",
                fontFamily: "Karla, sans-serif", fontWeight: 600, fontSize: 14,
                background: mode === m ? C.rosewood : "transparent", color: mode === m ? C.cream : C.plumSoft,
              }}>{m === "login" ? "Log in" : "Sign up"}</button>
            ))}
          </div>

          <button onClick={() => onLogin("u_priya")} style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            border: `1.5px solid ${C.line}`, background: C.white, borderRadius: 10, padding: "11px 0",
            fontFamily: "Karla, sans-serif", fontWeight: 600, fontSize: 14.5, color: C.plum, cursor: "pointer", marginBottom: 16,
          }}>
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.9 6.1 29.7 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" /><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.9 6.1 29.7 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" /><path fill="#4CAF50" d="M24 44c5.6 0 10.7-2.1 14.5-5.6l-6.7-5.5c-2 1.5-4.7 2.4-7.8 2.4-5.2 0-9.6-3.3-11.3-8l-6.6 5.1C9.5 39.6 16.2 44 24 44z" /><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.7 5.5C41.7 35.9 44 30.4 44 24c0-1.3-.1-2.7-.4-3.5z" /></svg>
            Continue with Google <span style={{ color: C.plumSoft, fontWeight: 400 }}>(demo)</span>
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0", color: C.plumSoft, fontSize: 12.5 }}>
            <div style={{ flex: 1, height: 1, background: C.line }} /> or <div style={{ flex: 1, height: 1, background: C.line }} />
          </div>

          <form onSubmit={submit}>
            {mode === "signup" && <>
              <Field label="Name"><input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" /></Field>
              <Field label="Username"><input style={inputStyle} value={form.username} onChange={e => setForm({ ...form, username: e.target.value.replace(/\s/g, "").toLowerCase() })} placeholder="yourhandle" /></Field>
            </>}
            <Field label="Email"><input type="email" style={inputStyle} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></Field>
            <Field label="Password"><input type="password" style={inputStyle} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" /></Field>
            {error && <div style={{ color: C.rosewoodDark, fontSize: 13, marginBottom: 10 }}>{error}</div>}
            <PrimaryButton type="submit" style={{ width: "100%", padding: "12px 0", marginTop: 4 }}>{mode === "login" ? "Log in" : "Create account"}</PrimaryButton>
          </form>
          {mode === "login" && <div style={{ textAlign: "center", marginTop: 14 }}>
            <button onClick={() => onLogin("u_priya")} style={{ background: "none", border: "none", color: C.plumSoft, fontSize: 13, textDecoration: "underline", cursor: "pointer" }}>Just browsing? Try the demo account</button>
          </div>}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- Top Nav ---------------------------------- */
function TopNav({ route, setRoute, currentUser, onLogout, onSearch }) {
  const [q, setQ] = useState("");
  const NavIcon = ({ active, icon: Icon, onClick, label }) => (
    <button onClick={onClick} title={label} style={{
      background: "none", border: "none", cursor: "pointer", padding: 8, borderRadius: 10,
      color: active ? C.rosewood : C.plumSoft,
    }}><Icon size={22} strokeWidth={active ? 2.4 : 2} /></button>
  );
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,248,243,0.92)", backdropFilter: "blur(6px)", borderBottom: `1.5px solid ${C.line}` }}>
      <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px" }}>
        <div onClick={() => setRoute({ name: "feed" })} style={{ cursor: "pointer", fontFamily: "Fraunces, serif", fontStyle: "italic", fontWeight: 500, fontSize: 24, color: C.rosewoodDark, flexShrink: 0 }}>Crosheher</div>

        <div style={{ flex: 1, maxWidth: 280, margin: "0 16px", display: "flex", alignItems: "center", background: C.blushSoft, borderRadius: 999, padding: "7px 12px", gap: 8 }}>
          <Search size={15} color={C.plumSoft} />
          <input value={q} onChange={e => { setQ(e.target.value); onSearch(e.target.value); }} placeholder="Search patterns, people..." style={{ border: "none", background: "transparent", outline: "none", fontSize: 13.5, fontFamily: "Karla, sans-serif", width: "100%", color: C.plum }} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <NavIcon active={route.name === "feed"} icon={Home} label="Home" onClick={() => setRoute({ name: "feed" })} />
          <NavIcon active={route.name === "explore"} icon={BookOpen} label="Patterns" onClick={() => setRoute({ name: "explore" })} />
          <NavIcon active={route.name === "createChoice"} icon={Plus} label="Create" onClick={() => setRoute({ name: "createChoice" })} />
          <NavIcon active={route.name === "profile" && route.userId === currentUser.id} icon={UserIcon} label="Profile" onClick={() => setRoute({ name: "profile", userId: currentUser.id })} />
          <NavIcon icon={LogOut} label="Log out" onClick={onLogout} />
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- Post / Pattern cards ---------------------------------- */
function AuthorRow({ user, timestamp, onOpenProfile, size = 34 }) {
  if (!user) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, cursor: onOpenProfile ? "pointer" : "default" }} onClick={onOpenProfile}>
      <GrannySquare seed={user.avatarSeed} size={size} />
      <div>
        <div style={{ fontFamily: "Karla, sans-serif", fontWeight: 700, fontSize: 13.5, color: C.plum }}>{user.name}</div>
        {timestamp && <div style={{ fontSize: 12, color: C.plumSoft }}>@{user.username} · {fmtDate(timestamp)}</div>}
      </div>
    </div>
  );
}

function MediaBlock({ post }) {
  if (post.type === "image") return <div style={{ borderRadius: 12, overflow: "hidden", marginTop: 10 }}><CoverArt seed={post.mediaSeed || post.id} height={260} /></div>;
  if (post.type === "video") return (
    <div style={{ borderRadius: 12, overflow: "hidden", marginTop: 10, background: C.plum, height: 220, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
      {post.mediaUrl ? <video src={post.mediaUrl} controls style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <><VideoIcon color={C.butterSoft} size={34} /><span style={{ color: C.blushSoft, fontSize: 12.5, fontFamily: "Karla, sans-serif" }}>video preview</span></>}
    </div>
  );
  if (post.type === "pdf") return (
    <div style={{ marginTop: 10, border: `1.5px solid ${C.line}`, borderRadius: 12, padding: 14, display: "flex", alignItems: "center", gap: 10, background: C.blushSoft }}>
      <FileText color={C.rosewood} size={22} />
      <div style={{ fontFamily: "Karla, sans-serif", fontSize: 13.5, color: C.plum, fontWeight: 600 }}>{post.fileName || "pattern.pdf"}</div>
      <div style={{ marginLeft: "auto", fontSize: 12, color: C.plumSoft }}>tap to view</div>
    </div>
  );
  return null;
}

function PostCard({ post, author, onOpen, onOpenProfile, onLike, liked }) {
  return (
    <div style={{ background: C.white, borderRadius: 16, padding: 18, boxShadow: "0 3px 14px rgba(166,58,80,0.07)" }}>
      <AuthorRow user={author} timestamp={post.createdAt} onOpenProfile={() => onOpenProfile(author.id)} />
      <div onClick={onOpen} style={{ cursor: "pointer" }}>
        {post.text && <div style={{ fontFamily: "Karla, sans-serif", fontSize: 14.5, color: C.plum, marginTop: 10, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{post.text}</div>}
        <MediaBlock post={post} />
      </div>
      <div style={{ display: "flex", gap: 18, marginTop: 12, alignItems: "center" }}>
        <button onClick={() => onLike(post.id)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: liked ? C.rosewood : C.plumSoft }}>
          <Heart size={17} fill={liked ? C.rosewood : "none"} /> <span style={{ fontSize: 13, fontFamily: "Karla, sans-serif" }}>{post.likes}</span>
        </button>
        <button onClick={onOpen} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: C.plumSoft }}>
          <MessageCircle size={17} /> <span style={{ fontSize: 13, fontFamily: "Karla, sans-serif" }}>{post.comments.length}</span>
        </button>
      </div>
    </div>
  );
}

function PatternCard({ pattern, author, onOpen, onOpenProfile }) {
  return (
    <div style={{ background: C.white, borderRadius: 16, overflow: "hidden", boxShadow: "0 3px 14px rgba(166,58,80,0.07)", borderTop: `3px dashed ${C.rosewood}` }}>
      <div onClick={onOpen} style={{ cursor: "pointer" }}><CoverArt seed={pattern.coverSeed} height={170} /></div>
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 8 }}>
          <div onClick={onOpen} style={{ cursor: "pointer", fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 18, color: C.plum, lineHeight: 1.3 }}>{pattern.title}</div>
          <span style={{
            flexShrink: 0, fontFamily: "Karla, sans-serif", fontWeight: 700, fontSize: 11.5, padding: "4px 9px", borderRadius: 999,
            background: pattern.isPaid ? C.butter : C.blushSoft, color: pattern.isPaid ? C.plum : C.rosewoodDark,
          }}>{pattern.isPaid ? `₹${pattern.price}` : "Free"}</span>
        </div>
        <div style={{ marginTop: 10 }}><AuthorRow user={author} onOpenProfile={() => onOpenProfile(author.id)} size={26} /></div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, color: C.plumSoft }}>
          <Heart size={14} /> <span style={{ fontSize: 12.5, fontFamily: "Karla, sans-serif" }}>{pattern.likes} likes</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- Feed / Explore ---------------------------------- */
function Feed({ items, users, onOpenPost, onOpenPattern, onOpenProfile, onLikePost, likedPosts, filter }) {
  const filtered = filter ? items.filter(it => {
    const title = it.kind === "pattern" ? it.title : it.text || "";
    const author = users[it.authorId];
    const hay = (title + " " + (author?.name || "") + " " + (author?.username || "")).toLowerCase();
    return hay.includes(filter.toLowerCase());
  }) : items;

  if (filtered.length === 0) return <EmptyState title="Nothing here yet" body="When there's something to show, it'll land right in this spot." />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {filtered.map(it => it.kind === "pattern"
        ? <PatternCard key={it.id} pattern={it} author={users[it.authorId]} onOpen={() => onOpenPattern(it.id)} onOpenProfile={onOpenProfile} />
        : <PostCard key={it.id} post={it} author={users[it.authorId]} onOpen={() => onOpenPost(it.id)} onOpenProfile={onOpenProfile} onLike={onLikePost} liked={likedPosts.has(it.id)} />
      )}
    </div>
  );
}

function EmptyState({ title, body, action }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: C.plumSoft }}>
      <Sparkles size={26} color={C.rosewood} style={{ marginBottom: 10 }} />
      <div style={{ fontFamily: "Fraunces, serif", fontSize: 20, color: C.plum, fontWeight: 600 }}>{title}</div>
      <div style={{ fontFamily: "Karla, sans-serif", fontSize: 14, marginTop: 6, maxWidth: 320, marginInline: "auto" }}>{body}</div>
      {action}
    </div>
  );
}

/* ---------------------------------- Profile ---------------------------------- */
function SocialIcon({ type, handle }) {
  if (!handle) return null;
  const icons = { instagram: Instagram, youtube: Youtube, website: Globe, etsy: ShoppingBag };
  const Icon = icons[type] || Globe;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, background: C.blushSoft, padding: "5px 10px", borderRadius: 999, color: C.rosewoodDark, fontSize: 12.5, fontFamily: "Karla, sans-serif", fontWeight: 600 }}>
      <Icon size={13} /> {handle}
    </div>
  );
}

function ProfileView({ user, isMe, posts, patterns, users, onOpenPost, onOpenPattern, onOpenProfile, onEdit, onPayment, onLikePost, likedPosts, onCreatePattern }) {
  const [tab, setTab] = useState("posts");
  const myPosts = posts.filter(p => p.authorId === user.id).sort((a, b) => b.createdAt - a.createdAt);
  const myPatterns = patterns.filter(p => p.authorId === user.id).sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div>
      <div style={{ borderRadius: 18, overflow: "hidden", background: C.white, boxShadow: "0 3px 14px rgba(166,58,80,0.07)" }}>
        <div style={{ height: 110, background: `linear-gradient(120deg, ${C.blush}, ${C.peach} 55%, ${C.butterSoft})` }} />
        <div style={{ padding: "0 22px 20px", marginTop: -36 }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div style={{ border: `4px solid ${C.white}`, borderRadius: "50%" }}><GrannySquare seed={user.avatarSeed} size={78} /></div>
            {isMe ? (
              <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                <GhostButton onClick={onEdit} style={{ padding: "8px 14px", fontSize: 13 }}><Pencil size={13} style={{ marginRight: 6, verticalAlign: -2 }} />Edit profile</GhostButton>
              </div>
            ) : null}
          </div>
          <div style={{ marginTop: 12, fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 23, color: C.plum }}>{user.name}</div>
          <div style={{ color: C.plumSoft, fontSize: 13.5, fontFamily: "Karla, sans-serif" }}>@{user.username}</div>
          <div style={{ marginTop: 10, fontFamily: "Karla, sans-serif", fontSize: 14, color: C.plum, lineHeight: 1.5, maxWidth: 480 }}>{user.bio}</div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            <SocialIcon type="instagram" handle={user.socials.instagram} />
            <SocialIcon type="youtube" handle={user.socials.youtube} />
            <SocialIcon type="etsy" handle={user.socials.etsy} />
            <SocialIcon type="website" handle={user.socials.website} />
          </div>

          {isMe && (
            <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12, background: C.blushSoft, borderRadius: 12, padding: "12px 14px" }}>
              <CreditCard size={18} color={C.rosewoodDark} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "Karla, sans-serif", fontWeight: 700, fontSize: 13.5, color: C.plum }}>Payment methods</div>
                <div style={{ fontFamily: "Karla, sans-serif", fontSize: 12, color: C.plumSoft }}>{user.paymentConnected ? "Connected — ready to sell paid patterns" : "Set up payouts to sell paid patterns"}</div>
              </div>
              <GhostButton onClick={onPayment} style={{ padding: "7px 14px", fontSize: 12.5 }}>{user.paymentConnected ? "Manage" : "Set up"}</GhostButton>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 4, marginTop: 20, background: C.blushSoft, borderRadius: 10, padding: 4, maxWidth: 260 }}>
        {[["posts", "Posts"], ["patterns", "Patterns"]].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            flex: 1, padding: "8px 0", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "Karla, sans-serif",
            fontWeight: 600, fontSize: 13.5, background: tab === k ? C.rosewood : "transparent", color: tab === k ? C.cream : C.plumSoft,
          }}>{label}</button>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        {tab === "posts" && (myPosts.length ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {myPosts.map(p => <PostCard key={p.id} post={p} author={user} onOpen={() => onOpenPost(p.id)} onOpenProfile={onOpenProfile} onLike={onLikePost} liked={likedPosts.has(p.id)} />)}
          </div>
        ) : <EmptyState title="No posts yet" body={isMe ? "Share a finished project, a work-in-progress, or a quick tip." : `${user.name} hasn't posted anything yet.`} />)}

        {tab === "patterns" && (myPatterns.length ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
            {myPatterns.map(p => <PatternCard key={p.id} pattern={p} author={user} onOpen={() => onOpenPattern(p.id)} onOpenProfile={onOpenProfile} />)}
          </div>
        ) : <EmptyState title="No patterns yet" body={isMe ? "Turn your next project into a shareable — free or paid — pattern." : `${user.name} hasn't published a pattern yet.`}
          action={isMe ? <div style={{ marginTop: 14 }}><PrimaryButton onClick={onCreatePattern}>Write a pattern</PrimaryButton></div> : null} />)}
      </div>
    </div>
  );
}

/* ---------------------------------- Edit profile modal ---------------------------------- */
function EditProfileModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({ name: user.name, bio: user.bio, instagram: user.socials.instagram, youtube: user.socials.youtube, etsy: user.socials.etsy, website: user.socials.website });
  return (
    <Modal title="Edit profile" onClose={onClose}>
      <Field label="Name"><input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
      <Field label="Bio"><textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical", fontFamily: "Karla, sans-serif" }} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} /></Field>
      <Field label="Instagram handle"><input style={inputStyle} value={form.instagram} onChange={e => setForm({ ...form, instagram: e.target.value })} placeholder="yourhandle" /></Field>
      <Field label="YouTube channel"><input style={inputStyle} value={form.youtube} onChange={e => setForm({ ...form, youtube: e.target.value })} placeholder="channel name" /></Field>
      <Field label="Etsy shop"><input style={inputStyle} value={form.etsy} onChange={e => setForm({ ...form, etsy: e.target.value })} placeholder="ShopName" /></Field>
      <Field label="Website"><input style={inputStyle} value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="yoursite.com" /></Field>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
        <GhostButton onClick={onClose}>Cancel</GhostButton>
        <PrimaryButton onClick={() => onSave(form)}>Save changes</PrimaryButton>
      </div>
    </Modal>
  );
}

/* ---------------------------------- Payment modal ---------------------------------- */
function PaymentModal({ user, onClose, onConnect }) {
  const [connected, setConnected] = useState(user.paymentConnected);
  return (
    <Modal title="Payment methods" onClose={onClose}>
      <div style={{ fontFamily: "Karla, sans-serif", fontSize: 13.5, color: C.plumSoft, marginBottom: 16, lineHeight: 1.5 }}>
        Connect a payout method so buyers can purchase your paid patterns. Crosheher takes a 10% commission on each paid pattern sale — the rest goes straight to you.
      </div>
      <div style={{ border: `1.5px dashed ${connected ? C.rosewood : C.line}`, borderRadius: 12, padding: 18, textAlign: "center" }}>
        {connected ? (
          <>
            <Check size={26} color={C.rosewood} style={{ marginBottom: 8 }} />
            <div style={{ fontFamily: "Karla, sans-serif", fontWeight: 700, color: C.plum }}>Payouts connected</div>
            <div style={{ fontSize: 12.5, color: C.plumSoft, marginTop: 4 }}>You're all set to sell paid patterns.</div>
          </>
        ) : (
          <>
            <CreditCard size={26} color={C.plumSoft} style={{ marginBottom: 8 }} />
            <div style={{ fontFamily: "Karla, sans-serif", fontWeight: 700, color: C.plum, marginBottom: 4 }}>No payout method yet</div>
            <div style={{ fontSize: 12.5, color: C.plumSoft, marginBottom: 14 }}>This is a placeholder — real payment processing isn't wired up yet.</div>
            <PrimaryButton onClick={() => { setConnected(true); onConnect(); }}>Connect payout method</PrimaryButton>
          </>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}><GhostButton onClick={onClose}>Close</GhostButton></div>
    </Modal>
  );
}

/* ---------------------------------- Create choice ---------------------------------- */
function CreateChoice({ onPost, onPattern }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 560, margin: "40px auto" }}>
      <button onClick={onPost} style={{ background: C.white, border: `1.5px solid ${C.line}`, borderRadius: 16, padding: 26, textAlign: "left", cursor: "pointer" }}>
        <ImageIcon color={C.rosewood} size={26} />
        <div style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 19, color: C.plum, marginTop: 12 }}>New post</div>
        <div style={{ fontFamily: "Karla, sans-serif", fontSize: 13, color: C.plumSoft, marginTop: 4 }}>Text, an image, a video, or a PDF.</div>
      </button>
      <button onClick={onPattern} style={{ background: C.white, border: `1.5px dashed ${C.rosewood}`, borderRadius: 16, padding: 26, textAlign: "left", cursor: "pointer" }}>
        <BookOpen color={C.rosewood} size={26} />
        <div style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 19, color: C.plum, marginTop: 12 }}>New pattern</div>
        <div style={{ fontFamily: "Karla, sans-serif", fontSize: 13, color: C.plumSoft, marginTop: 4 }}>A free-form pattern page — free or paid.</div>
      </button>
    </div>
  );
}

/* ---------------------------------- Create post ---------------------------------- */
function FileDrop({ accept, onFile, label, icon: Icon }) {
  const ref = useRef();
  const [name, setName] = useState("");
  const handle = (file) => {
    if (!file) return;
    setName(file.name);
    const reader = new FileReader();
    reader.onload = () => onFile(reader.result, file.name);
    reader.readAsDataURL(file);
  };
  return (
    <div onClick={() => ref.current.click()} style={{ border: `1.5px dashed ${C.rosewood}`, borderRadius: 12, padding: 24, textAlign: "center", cursor: "pointer", background: C.blushSoft }}>
      <input ref={ref} type="file" accept={accept} style={{ display: "none" }} onChange={e => handle(e.target.files[0])} />
      <Icon size={24} color={C.rosewood} />
      <div style={{ fontFamily: "Karla, sans-serif", fontSize: 13.5, color: C.plum, marginTop: 8, fontWeight: 600 }}>{name || label}</div>
      {!name && <div style={{ fontSize: 12, color: C.plumSoft, marginTop: 2 }}>click to choose a file</div>}
    </div>
  );
}

function CreatePostView({ onPublish, onCancel }) {
  const [type, setType] = useState("text");
  const [text, setText] = useState("");
  const [media, setMedia] = useState(null);
  const [fileName, setFileName] = useState("");

  const types = [["text", TypeIcon, "Text"], ["image", ImageIcon, "Image"], ["video", VideoIcon, "Video"], ["pdf", FileText, "PDF"]];

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <button onClick={onCancel} style={{ background: "none", border: "none", cursor: "pointer", color: C.plumSoft, display: "flex", alignItems: "center", gap: 6, marginBottom: 14, fontFamily: "Karla, sans-serif", fontSize: 13.5 }}><ArrowLeft size={15} />Back</button>
      <div style={{ background: C.white, borderRadius: 16, padding: 22 }}>
        <div style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 20, color: C.plum, marginBottom: 14 }}>New post</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {types.map(([k, Icon, label]) => (
            <button key={k} onClick={() => { setType(k); setMedia(null); }} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 999, cursor: "pointer",
              border: `1.5px solid ${type === k ? C.rosewood : C.line}`, background: type === k ? C.rosewood : C.white, color: type === k ? C.cream : C.plumSoft,
              fontFamily: "Karla, sans-serif", fontSize: 12.5, fontWeight: 600,
            }}><Icon size={14} />{label}</button>
          ))}
        </div>

        <Field label={type === "text" ? "What's on your hook?" : "Caption"}>
          <textarea style={{ ...inputStyle, minHeight: 90, resize: "vertical", fontFamily: "Karla, sans-serif" }} value={text} onChange={e => setText(e.target.value)} placeholder="Say something about it..." />
        </Field>

        {type === "image" && <FileDrop accept="image/*" icon={ImageIcon} label="Upload an image" onFile={(url, n) => { setMedia(url); setFileName(n); }} />}
        {type === "video" && <FileDrop accept="video/*" icon={VideoIcon} label="Upload a video" onFile={(url, n) => { setMedia(url); setFileName(n); }} />}
        {type === "pdf" && <FileDrop accept="application/pdf" icon={FileText} label="Upload a PDF" onFile={(url, n) => { setMedia(url); setFileName(n); }} />}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
          <GhostButton onClick={onCancel}>Cancel</GhostButton>
          <PrimaryButton disabled={type !== "text" && !media && type !== "image"} onClick={() => onPublish({ type, text, mediaUrl: media, fileName })}>Publish</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- Pattern editor (canvas) ---------------------------------- */
function BlockEditor({ block, update, remove, move, isFirst, isLast }) {
  const fileRef = useRef();
  const onFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update({ ...block, mediaUrl: reader.result, fileName: file.name });
    reader.readAsDataURL(file);
  };
  return (
    <div style={{ position: "relative", border: `1.5px solid ${C.line}`, borderRadius: 12, padding: "14px 14px 14px 40px", marginBottom: 12, background: C.white }}>
      <div style={{ position: "absolute", left: 10, top: 14, display: "flex", flexDirection: "column", gap: 4, color: C.plumSoft }}>
        <GripVertical size={14} />
      </div>
      <div style={{ position: "absolute", right: 10, top: 10, display: "flex", gap: 4 }}>
        <button disabled={isFirst} onClick={() => move(-1)} style={{ background: "none", border: "none", cursor: isFirst ? "default" : "pointer", opacity: isFirst ? 0.3 : 1, color: C.plumSoft }}><ChevronLeft size={15} style={{ transform: "rotate(90deg)" }} /></button>
        <button disabled={isLast} onClick={() => move(1)} style={{ background: "none", border: "none", cursor: isLast ? "default" : "pointer", opacity: isLast ? 0.3 : 1, color: C.plumSoft }}><ChevronRight size={15} style={{ transform: "rotate(90deg)" }} /></button>
        <button onClick={remove} style={{ background: "none", border: "none", cursor: "pointer", color: C.rosewoodDark }}><Trash2 size={15} /></button>
      </div>

      {block.type === "heading" && <input style={{ ...inputStyle, fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 19, border: "none", padding: "6px 0" }} value={block.text} onChange={e => update({ ...block, text: e.target.value })} placeholder="Heading" />}
      {block.type === "paragraph" && <textarea style={{ ...inputStyle, minHeight: 90, border: "none", padding: "6px 0", fontFamily: "Karla, sans-serif", resize: "vertical" }} value={block.text} onChange={e => update({ ...block, text: e.target.value })} placeholder="Write instructions, notes, or a story..." />}
      {(block.type === "image" || block.type === "video") && (
        <div>
          {block.mediaUrl ? (
            block.type === "image" ? <img src={block.mediaUrl} style={{ width: "100%", borderRadius: 10, display: "block" }} /> : <video src={block.mediaUrl} controls style={{ width: "100%", borderRadius: 10, display: "block" }} />
          ) : (
            <div onClick={() => fileRef.current.click()} style={{ border: `1.5px dashed ${C.rosewood}`, borderRadius: 10, padding: 20, textAlign: "center", cursor: "pointer", background: C.blushSoft }}>
              {block.type === "image" ? <ImageIcon color={C.rosewood} /> : <VideoIcon color={C.rosewood} />}
              <div style={{ fontSize: 12.5, color: C.plumSoft, marginTop: 6, fontFamily: "Karla, sans-serif" }}>click to upload {block.type}</div>
            </div>
          )}
          <input ref={fileRef} type="file" accept={block.type === "image" ? "image/*" : "video/*"} style={{ display: "none" }} onChange={e => onFile(e.target.files[0])} />
        </div>
      )}
    </div>
  );
}

function PatternEditorView({ onPublish, onCancel }) {
  const [title, setTitle] = useState("");
  const [coverUrl, setCoverUrl] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState("199");
  const [blocks, setBlocks] = useState([{ id: uid(), type: "paragraph", text: "" }]);
  const coverRef = useRef();

  const addBlock = (type) => setBlocks(b => [...b, { id: uid(), type, text: "" }]);
  const updateBlock = (id, nb) => setBlocks(b => b.map(x => x.id === id ? nb : x));
  const removeBlock = (id) => setBlocks(b => b.filter(x => x.id !== id));
  const moveBlock = (id, dir) => setBlocks(b => {
    const i = b.findIndex(x => x.id === id);
    const j = i + dir;
    if (j < 0 || j >= b.length) return b;
    const copy = [...b]; [copy[i], copy[j]] = [copy[j], copy[i]]; return copy;
  });
  const onCover = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCoverUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const canPublish = title.trim().length > 0 && blocks.some(b => b.text?.trim() || b.mediaUrl);

  return (
    <div style={{ maxWidth: 620, margin: "0 auto" }}>
      <button onClick={onCancel} style={{ background: "none", border: "none", cursor: "pointer", color: C.plumSoft, display: "flex", alignItems: "center", gap: 6, marginBottom: 14, fontFamily: "Karla, sans-serif", fontSize: 13.5 }}><ArrowLeft size={15} />Back</button>

      <div style={{ background: C.white, borderRadius: 16, padding: 22 }}>
        <div style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 20, color: C.plum, marginBottom: 14 }}>Write a pattern</div>

        <div onClick={() => coverRef.current.click()} style={{ borderRadius: 12, overflow: "hidden", cursor: "pointer", marginBottom: 16, border: `1.5px solid ${C.line}` }}>
          {coverUrl ? <img src={coverUrl} style={{ width: "100%", height: 150, objectFit: "cover", display: "block" }} /> : <div style={{ height: 120, background: C.blushSoft, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 6, color: C.plumSoft }}><ImageIcon size={20} /><span style={{ fontSize: 12.5, fontFamily: "Karla, sans-serif" }}>Add a cover image</span></div>}
        </div>
        <input ref={coverRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => onCover(e.target.files[0])} />

        <Field label="Title"><input style={{ ...inputStyle, fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 18 }} value={title} onChange={e => setTitle(e.target.value)} placeholder="Sunday Peach Cropped Cardigan" /></Field>

        <div style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: "Karla, sans-serif", fontSize: 12.5, fontWeight: 600, color: C.plumSoft, marginBottom: 6 }}>Canvas</div>
          {blocks.map((b, i) => (
            <BlockEditor key={b.id} block={b} update={nb => updateBlock(b.id, nb)} remove={() => removeBlock(b.id)} move={dir => moveBlock(b.id, dir)} isFirst={i === 0} isLast={i === blocks.length - 1} />
          ))}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[["heading", HeadingIcon, "Heading"], ["paragraph", TypeIcon, "Text"], ["image", ImageIcon, "Image"], ["video", VideoIcon, "Video"]].map(([k, Icon, label]) => (
              <button key={k} onClick={() => addBlock(k)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 999, border: `1.5px solid ${C.line}`, background: C.blushSoft, color: C.rosewoodDark, cursor: "pointer", fontFamily: "Karla, sans-serif", fontSize: 12.5, fontWeight: 600 }}>
                <Plus size={12} /><Icon size={13} />{label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ border: `1.5px solid ${C.line}`, borderRadius: 12, padding: 14, marginBottom: 18 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <input type="checkbox" checked={isPaid} onChange={e => setIsPaid(e.target.checked)} />
            <span style={{ fontFamily: "Karla, sans-serif", fontWeight: 700, fontSize: 13.5, color: C.plum }}>This is a paid pattern</span>
          </label>
          {isPaid && <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "Karla, sans-serif", fontSize: 13.5, color: C.plumSoft }}>Price ₹</span>
            <input type="number" min="1" style={{ ...inputStyle, width: 100 }} value={price} onChange={e => setPrice(e.target.value)} />
            <span style={{ fontFamily: "Karla, sans-serif", fontSize: 12, color: C.plumSoft }}>Crosheher takes a 10% commission</span>
          </div>}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <GhostButton onClick={onCancel}>Cancel</GhostButton>
          <PrimaryButton disabled={!canPublish} onClick={() => onPublish({ title, coverUrl, isPaid, price: Number(price) || 0, blocks })}>Publish pattern</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- Pattern detail ---------------------------------- */
function PatternDetail({ pattern, author, onBack, onOpenProfile, purchased, onUnlock }) {
  const locked = pattern.isPaid && !purchased;
  const visibleBlocks = locked ? pattern.blocks.slice(0, 3) : pattern.blocks;
  return (
    <div style={{ maxWidth: 620, margin: "0 auto" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: C.plumSoft, display: "flex", alignItems: "center", gap: 6, marginBottom: 14, fontFamily: "Karla, sans-serif", fontSize: 13.5 }}><ArrowLeft size={15} />Back</button>
      <div style={{ background: C.white, borderRadius: 16, overflow: "hidden" }}>
        {pattern.coverUrl ? <img src={pattern.coverUrl} style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }} /> : <CoverArt seed={pattern.coverSeed || pattern.id} height={220} />}
        <div style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 10 }}>
            <AuthorRow user={author} timestamp={pattern.createdAt} onOpenProfile={() => onOpenProfile(author.id)} />
            <span style={{ flexShrink: 0, fontFamily: "Karla, sans-serif", fontWeight: 700, fontSize: 12, padding: "5px 11px", borderRadius: 999, background: pattern.isPaid ? C.butter : C.blushSoft, color: pattern.isPaid ? C.plum : C.rosewoodDark }}>{pattern.isPaid ? `₹${pattern.price}` : "Free"}</span>
          </div>

          <div style={{ marginTop: 18 }}>
            {visibleBlocks.map(b => (
              <div key={b.id} style={{ marginBottom: 16 }}>
                {b.type === "heading" && <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 22, color: C.plum, margin: 0 }}>{b.text}</h2>}
                {b.type === "paragraph" && <p style={{ fontFamily: "Karla, sans-serif", fontSize: 15, color: C.plum, lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0 }}>{b.text}</p>}
                {b.type === "image" && (b.mediaUrl ? <img src={b.mediaUrl} style={{ width: "100%", borderRadius: 10, display: "block" }} /> : <div style={{ borderRadius: 10, overflow: "hidden" }}><CoverArt seed={b.seed || b.id} height={200} /></div>)}
                {b.type === "video" && b.mediaUrl && <video src={b.mediaUrl} controls style={{ width: "100%", borderRadius: 10, display: "block" }} />}
              </div>
            ))}
            {locked && (
              <div style={{ borderRadius: 12, background: `linear-gradient(180deg, transparent, ${C.blushSoft})`, padding: "24px 18px", textAlign: "center", marginTop: -20 }}>
                <Lock size={22} color={C.rosewood} style={{ marginBottom: 8 }} />
                <div style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 17, color: C.plum }}>Unlock the full pattern</div>
                <div style={{ fontFamily: "Karla, sans-serif", fontSize: 13, color: C.plumSoft, margin: "6px 0 14px" }}>The rest of the instructions unlock after purchase.</div>
                <PrimaryButton onClick={onUnlock}>Unlock for ₹{pattern.price}</PrimaryButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- Post detail (incl. PDF viewer) ---------------------------------- */
function PostDetail({ post, author, onBack, onOpenProfile, onComment, onLike, liked }) {
  const [comment, setComment] = useState("");
  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: C.plumSoft, display: "flex", alignItems: "center", gap: 6, marginBottom: 14, fontFamily: "Karla, sans-serif", fontSize: 13.5 }}><ArrowLeft size={15} />Back</button>
      <div style={{ background: C.white, borderRadius: 16, padding: 20 }}>
        <AuthorRow user={author} timestamp={post.createdAt} onOpenProfile={() => onOpenProfile(author.id)} />
        {post.text && <div style={{ fontFamily: "Karla, sans-serif", fontSize: 15, color: C.plum, marginTop: 12, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{post.text}</div>}

        {post.type === "image" && <div style={{ borderRadius: 12, overflow: "hidden", marginTop: 12 }}>{post.mediaUrl ? <img src={post.mediaUrl} style={{ width: "100%", display: "block" }} /> : <CoverArt seed={post.mediaSeed || post.id} height={320} />}</div>}
        {post.type === "video" && post.mediaUrl && <video src={post.mediaUrl} controls style={{ width: "100%", borderRadius: 12, marginTop: 12, display: "block" }} />}
        {post.type === "pdf" && post.mediaUrl && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 12.5, color: C.plumSoft, marginBottom: 6, fontFamily: "Karla, sans-serif" }}>Scroll or use your viewer's controls to page through — swipe on mobile.</div>
            <iframe title="pdf" src={post.mediaUrl} style={{ width: "100%", height: 520, border: `1.5px solid ${C.line}`, borderRadius: 12 }} />
          </div>
        )}

        <div style={{ display: "flex", gap: 18, marginTop: 16, alignItems: "center" }}>
          <button onClick={onLike} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: liked ? C.rosewood : C.plumSoft }}>
            <Heart size={18} fill={liked ? C.rosewood : "none"} /> <span style={{ fontSize: 13.5, fontFamily: "Karla, sans-serif" }}>{post.likes}</span>
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.plumSoft }}><MessageCircle size={18} /><span style={{ fontSize: 13.5, fontFamily: "Karla, sans-serif" }}>{post.comments.length}</span></div>
        </div>

        <StitchDivider />
        <div style={{ marginTop: 16 }}>
          {post.comments.map(c => (
            <div key={c.id} style={{ marginBottom: 12 }}>
              <div style={{ fontFamily: "Karla, sans-serif", fontWeight: 700, fontSize: 13 }}>{c.authorName}</div>
              <div style={{ fontFamily: "Karla, sans-serif", fontSize: 13.5, color: C.plum }}>{c.text}</div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <input style={{ ...inputStyle, flex: 1 }} placeholder="Add a comment..." value={comment} onChange={e => setComment(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && comment.trim()) { onComment(comment); setComment(""); } }} />
            <PrimaryButton onClick={() => { if (comment.trim()) { onComment(comment); setComment(""); } }}>Post</PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- App ---------------------------------- */
export default function App() {
  const [data, setData] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [route, setRoute] = useState({ name: "feed" });
  const [search, setSearch] = useState("");
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [purchased, setPurchased] = useState(new Set());
  const [toast, setToast] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [appData, session] = await Promise.all([loadAppData(), loadSession()]);
      setData(appData);
      if (session?.userId && appData.users[session.userId]) setCurrentUserId(session.userId);
      setLoading(false);
    })();
  }, []);

  const persist = useCallback((next) => { setData(next); saveAppData(next); }, []);

  if (loading || !data) {
    return <div style={{ minHeight: "100vh", background: C.cream, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Karla, sans-serif", color: C.plumSoft }}>
      <style>{FONT_IMPORT}</style>
      loading Crosheher…
    </div>;
  }

  const currentUser = data.users[currentUserId];

  const handleLogin = async (userId) => {
    setCurrentUserId(userId);
    await saveSession({ userId });
    setRoute({ name: "feed" });
  };
  const handleSignup = async (form) => {
    const id = "u_" + uid();
    const newUser = { id, name: form.name, username: form.username, email: form.email, bio: "New to Crosheher 🧶", socials: { instagram: "", youtube: "", etsy: "", website: "" }, paymentConnected: false, avatarSeed: id };
    const next = { ...data, users: { ...data.users, [id]: newUser } };
    persist(next);
    setCurrentUserId(id);
    await saveSession({ userId: id });
    setRoute({ name: "feed" });
  };
  const handleLogout = async () => {
    await clearSession();
    setCurrentUserId(null);
    setRoute({ name: "feed" });
  };

  const feedItems = [
    ...data.posts.map(p => ({ ...p, kind: "post" })),
    ...data.patterns.map(p => ({ ...p, kind: "pattern" })),
  ].sort((a, b) => b.createdAt - a.createdAt);

  const openPost = (id) => setRoute({ name: "post", id });
  const openPattern = (id) => setRoute({ name: "pattern", id });
  const openProfile = (userId) => setRoute({ name: "profile", userId });

  const likePost = (id) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      const isLiked = next.has(id);
      isLiked ? next.delete(id) : next.add(id);
      const posts = data.posts.map(p => p.id === id ? { ...p, likes: p.likes + (isLiked ? -1 : 1) } : p);
      persist({ ...data, posts });
      return next;
    });
  };

  const addComment = (postId, text) => {
    const posts = data.posts.map(p => p.id === postId ? { ...p, comments: [...p.comments, { id: uid(), authorId: currentUser.id, authorName: currentUser.name, text, createdAt: now() }] } : p);
    persist({ ...data, posts });
  };

  const publishPost = (form) => {
    const post = { id: "p_" + uid(), authorId: currentUser.id, type: form.type, text: form.text, mediaUrl: form.mediaUrl || null, fileName: form.fileName || "", mediaSeed: "p_" + uid(), likes: 0, comments: [], createdAt: now() };
    persist({ ...data, posts: [post, ...data.posts] });
    setToast("Post published!");
    openProfile(currentUser.id);
  };

  const publishPattern = (form) => {
    const pattern = { id: "pat_" + uid(), authorId: currentUser.id, title: form.title, coverUrl: form.coverUrl, coverSeed: "pat_" + uid(), isPaid: form.isPaid, price: form.price, blocks: form.blocks, likes: 0, createdAt: now() };
    persist({ ...data, patterns: [pattern, ...data.patterns] });
    setToast("Pattern published!");
    openProfile(currentUser.id);
  };

  const saveProfile = (form) => {
    const updated = { ...currentUser, name: form.name, bio: form.bio, socials: { instagram: form.instagram, youtube: form.youtube, etsy: form.etsy, website: form.website } };
    persist({ ...data, users: { ...data.users, [currentUser.id]: updated } });
    setEditingProfile(false);
    setToast("Profile updated");
  };

  const connectPayment = () => {
    const updated = { ...currentUser, paymentConnected: true };
    persist({ ...data, users: { ...data.users, [currentUser.id]: updated } });
    setToast("Payout method connected (demo)");
  };

  const unlockPattern = (patternId) => {
    setPurchased(prev => new Set(prev).add(patternId));
    setToast("Unlocked — thanks for supporting the designer! (demo checkout, no real payment)");
  };

  if (!currentUser) return <AuthScreen onLogin={handleLogin} onSignup={handleSignup} users={data.users} />;

  let body = null;
  if (route.name === "feed") body = <Feed items={feedItems} users={data.users} onOpenPost={openPost} onOpenPattern={openPattern} onOpenProfile={openProfile} onLikePost={likePost} likedPosts={likedPosts} filter={search} />;
  else if (route.name === "explore") body = <Feed items={data.patterns.map(p => ({ ...p, kind: "pattern" })).sort((a, b) => b.createdAt - a.createdAt)} users={data.users} onOpenPattern={openPattern} onOpenProfile={openProfile} onLikePost={likePost} likedPosts={likedPosts} filter={search} onOpenPost={openPost} />;
  else if (route.name === "createChoice") body = <CreateChoice onPost={() => setRoute({ name: "createPost" })} onPattern={() => setRoute({ name: "createPattern" })} />;
  else if (route.name === "createPost") body = <CreatePostView onPublish={publishPost} onCancel={() => setRoute({ name: "feed" })} />;
  else if (route.name === "createPattern") body = <PatternEditorView onPublish={publishPattern} onCancel={() => setRoute({ name: "feed" })} />;
  else if (route.name === "profile") {
    const user = data.users[route.userId];
    body = <ProfileView user={user} isMe={user.id === currentUser.id} posts={data.posts} patterns={data.patterns} users={data.users}
      onOpenPost={openPost} onOpenPattern={openPattern} onOpenProfile={openProfile}
      onEdit={() => setEditingProfile(true)} onPayment={() => setPaymentModal(true)}
      onLikePost={likePost} likedPosts={likedPosts} onCreatePattern={() => setRoute({ name: "createPattern" })} />;
  } else if (route.name === "pattern") {
    const pattern = data.patterns.find(p => p.id === route.id);
    body = <PatternDetail pattern={pattern} author={data.users[pattern.authorId]} onBack={() => setRoute({ name: "feed" })} onOpenProfile={openProfile} purchased={purchased.has(pattern.id) || pattern.authorId === currentUser.id} onUnlock={() => unlockPattern(pattern.id)} />;
  } else if (route.name === "post") {
    const post = data.posts.find(p => p.id === route.id);
    body = <PostDetail post={post} author={data.users[post.authorId]} onBack={() => setRoute({ name: "feed" })} onOpenProfile={openProfile} onComment={(text) => addComment(post.id, text)} onLike={() => likePost(post.id)} liked={likedPosts.has(post.id)} />;
  }

  return (
    <div style={{ minHeight: "100vh", background: C.cream, fontFamily: "Karla, sans-serif" }}>
      <style>{FONT_IMPORT}</style>
      <TopNav route={route} setRoute={setRoute} currentUser={currentUser} onLogout={handleLogout} onSearch={setSearch} />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px 60px" }}>{body}</div>
      {editingProfile && <EditProfileModal user={currentUser} onClose={() => setEditingProfile(false)} onSave={saveProfile} />}
      {paymentModal && <PaymentModal user={currentUser} onClose={() => setPaymentModal(false)} onConnect={connectPayment} />}
      <Toast message={toast} onDone={() => setToast("")} />
    </div>
  );
}
