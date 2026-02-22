import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

function todayStr() { return new Date().toISOString().slice(0, 10) }
function generateDays(total) {
  return Array.from({ length: total }, (_, i) => ({ id: i + 1, done: false }))
}

// ── Confetti ──────────────────────────────────────────────────────────────────
function Confetti() {
  const colors = ["#c084fc", "#f59e0b", "#34d399", "#60a5fa", "#f472b6", "#fff"]
  const particles = useRef(
    Array.from({ length: 60 }, (_, i) => ({
      id: i, color: colors[i % colors.length],
      x: Math.random() * 100, delay: Math.random() * 0.8,
      duration: 1.5 + Math.random() * 1.5, size: 4 + Math.random() * 8,
      rotate: Math.random() * 360, shape: Math.random() > 0.5 ? "circle" : "rect",
    }))
  ).current
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 100, overflow: "hidden" }}>
      {particles.map(p => (
        <motion.div key={p.id}
          initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: 0 }}
          animate={{ y: "110vh", opacity: [1, 1, 0], rotate: p.rotate + 360 }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
          style={{ position: "absolute", top: 0, width: p.size, height: p.shape === "circle" ? p.size : p.size * 0.5, borderRadius: p.shape === "circle" ? "50%" : "2px", background: p.color }}
        />
      ))}
    </div>
  )
}

// ── Congrats ──────────────────────────────────────────────────────────────────
function CongratsCard({ total, onClose, userName }) {
  return (
    <>
      <Confetti />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", backdropFilter: "blur(14px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99, padding: "clamp(16px, 4vw, 40px)" }}>
        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.1 }}
          style={{ width: "min(480px, 92vw)", background: "linear-gradient(145deg, #13101f, #1a1230)", border: "1px solid rgba(192,132,252,0.4)", borderRadius: "clamp(20px, 4vw, 32px)", padding: "clamp(32px, 6vw, 52px) clamp(24px, 5vw, 44px)", textAlign: "center", boxShadow: "0 0 80px rgba(192,132,252,0.25), 0 40px 80px rgba(0,0,0,0.6)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-40px", left: "50%", transform: "translateX(-50%)", width: "200px", height: "200px", background: "radial-gradient(ellipse, rgba(192,132,252,0.3) 0%, transparent 70%)", pointerEvents: "none" }} />
          <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{ fontSize: "clamp(44px, 10vw, 64px)", marginBottom: "16px" }}>🌙</motion.div>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "clamp(10px, 2vw, 12px)", letterSpacing: "4px", fontFamily: "monospace", marginBottom: "12px" }}>ALHAMDULILLAH</div>
          <h2 style={{ color: "#fff", fontSize: "clamp(22px, 5vw, 30px)", fontWeight: "800", margin: "0 0 10px", letterSpacing: "-1px", lineHeight: 1.2 }}>Kodo Puasa<br />Selesai! 🎉</h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "clamp(13px, 3vw, 15px)", margin: "0 0 8px", lineHeight: 1.7 }}>
            {userName
              ? <><span style={{ color: "#c084fc", fontWeight: "700" }}>{userName}</span> berhasil menyelesaikan<br /></>
              : <>Kamu berhasil menyelesaikan<br /></>}
            <span style={{ color: "#c084fc", fontWeight: "700", fontSize: "clamp(18px, 4vw, 24px)" }}>{total} hari</span> kodo puasa<br />dengan penuh istiqomah.
          </p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(192,132,252,0.1)", border: "1px solid rgba(192,132,252,0.25)", borderRadius: "99px", padding: "10px 22px", marginBottom: "24px", marginTop: "16px" }}>
            <span>⭐</span>
            <span style={{ color: "#c084fc", fontSize: "clamp(12px, 2.5vw, 14px)", fontWeight: "600", fontFamily: "monospace" }}>{total}/{total} HARI · 100%</span>
          </div>
          <motion.button onClick={onClose} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{ width: "100%", padding: "clamp(13px, 3vw, 18px)", background: "linear-gradient(135deg, #c084fc, #f59e0b)", border: "none", borderRadius: "14px", color: "#0a0a0f", fontSize: "clamp(14px, 3vw, 16px)", fontWeight: "800", cursor: "pointer" }}>
            Lihat Catatan →
          </motion.button>
        </motion.div>
      </motion.div>
    </>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState("loading")
  const [nameValue, setNameValue] = useState("")
  const [inputValue, setInputValue] = useState("")
  const [nameError, setNameError] = useState("")
  const [inputError, setInputError] = useState("")
  const [data, setData] = useState([])
  const [userName, setUserName] = useState("")
  const [lastCheckedDate, setLastCheckedDate] = useState(null)
  const [showCongrats, setShowCongrats] = useState(false)
  const prevAllDoneRef = useRef(false)

  const today = todayStr()
  const alreadyCheckedToday = lastCheckedDate === today
  const allDone = data.length > 0 && data.every(i => i.done)
  const nextItem = data.find(i => !i.done)
  const totalDone = data.filter(i => i.done).length
  const progress = data.length > 0 ? (totalDone / data.length) * 100 : 0

  useEffect(() => {
    function load() {
      try {
        const saved = localStorage.getItem("puasa-data")
        if (saved) {
          const s = JSON.parse(saved)
          if (s.data?.length > 0) {
            setData(s.data); setLastCheckedDate(s.lastCheckedDate || null); setUserName(s.userName || "")
            prevAllDoneRef.current = s.data.every(i => i.done); setStep("tracker"); return
          }
        }
      } catch (_) {}
      setStep("setup")
    }
    load()
  }, [])

  useEffect(() => {
    if (data.length === 0) return
    localStorage.setItem("puasa-data", JSON.stringify({ data, lastCheckedDate, userName }))
    if (allDone && !prevAllDoneRef.current) setTimeout(() => setShowCongrats(true), 500)
    prevAllDoneRef.current = allDone
  }, [data, lastCheckedDate, userName])

  const handleStart = () => {
    const trimmedName = nameValue.trim()
    const num = parseInt(inputValue)
    let err = false
    if (!trimmedName) { setNameError("Masukkan namamu dulu"); err = true }
    if (!inputValue || isNaN(num) || num < 1 || num > 365) { setInputError("Masukkan angka antara 1 hingga 365"); err = true }
    if (err) return
    setUserName(trimmedName); setData(generateDays(num)); setLastCheckedDate(null)
    prevAllDoneRef.current = false; setStep("tracker")
  }

  const handleReset = () => {
    localStorage.removeItem("puasa-data")
    setData([]); setLastCheckedDate(null); setUserName("")
    setNameValue(""); setInputValue(""); setNameError(""); setInputError("")
    setShowCongrats(false); prevAllDoneRef.current = false; setStep("setup")
  }

  const handleCheck = (id) => {
    const item = data.find(d => d.id === id)
    if (!item) return
    if (!item.done) {
      if (item.id !== nextItem?.id || alreadyCheckedToday) return
      setData(prev => prev.map(d => d.id === id ? { ...d, done: true } : d))
      setLastCheckedDate(today)
    } else {
      const lastDone = [...data].reverse().find(d => d.done)
      if (!lastDone || lastDone.id !== id) return
      setData(prev => prev.map(d => d.id === id ? { ...d, done: false } : d))
      if (lastCheckedDate === today) setLastCheckedDate(null)
    }
  }

  // Semua ukuran pakai clamp(min, preferred-vw, max) — otomatis menyesuaikan layar apapun
  const C = {
    // Card
    cardW: "min(700px, 94vw)",          // max 700px di desktop, 94% lebar di HP
    cardPad: "clamp(24px, 5vw, 56px) clamp(20px, 5vw, 52px)",
    cardRadius: "clamp(16px, 3vw, 28px)",
    outerPad: "clamp(12px, 3vw, 48px)",
    // Setup
    moonSize: "clamp(40px, 8vw, 56px)",
    h1Size: "clamp(22px, 4.5vw, 30px)",
    subSize: "clamp(11px, 2vw, 14px)",
    labelSize: "clamp(10px, 1.8vw, 12px)",
    inputFontSize: "clamp(16px, 3.5vw, 22px)",
    inputPad: "clamp(12px, 2.5vw, 17px) clamp(14px, 3vw, 22px)",
    btnFontSize: "clamp(18px, 4vw, 24px)",
    btnPad: "clamp(12px, 2.5vw, 17px) clamp(16px, 3.5vw, 28px)",
    // Tracker header
    headerMoonSize: "clamp(22px, 4vw, 30px)",
    headerTitleSize: "clamp(17px, 3.5vw, 24px)",
    headerSubSize: "clamp(9px, 1.8vw, 12px)",
    resetFontSize: "clamp(9px, 1.8vw, 11px)",
    resetPad: "clamp(6px, 1.5vw, 10px) clamp(10px, 2.5vw, 16px)",
    // Banner
    bannerPad: "clamp(12px, 2.5vw, 18px) clamp(14px, 3vw, 20px)",
    bannerTitleSize: "clamp(11px, 2.2vw, 14px)",
    bannerSubSize: "clamp(10px, 2vw, 12px)",
    // Progress ring
    ringSize: "clamp(64px, 11vw, 92px)",
    ringR: "clamp(25, 4.2, 36)",        // dipakai sbg angka
    progressLabelSize: "clamp(9px, 1.8vw, 12px)",
    progressNumSize: "clamp(24px, 5vw, 36px)",
    progressSubSize: "clamp(11px, 2.2vw, 14px)",
    progressPad: "clamp(14px, 3vw, 24px)",
    // Row
    rowPad: "clamp(11px, 2.2vw, 17px) clamp(14px, 3vw, 22px)",
    rowRadius: "clamp(10px, 2vw, 14px)",
    rowGap: "clamp(6px, 1.2vw, 10px)",
    dayLabelSize: "clamp(7px, 1.4vw, 10px)",
    dayNumSize: "clamp(14px, 3vw, 20px)",
    dayMinW: "clamp(28px, 5vw, 42px)",
    statusSize: "clamp(12px, 2.5vw, 16px)",
    checkSize: "clamp(24px, 4.5vw, 32px)",
    checkFont: "clamp(10px, 2vw, 14px)",
    badgeFont: "clamp(7px, 1.4vw, 9px)",
    badgePad: "2px clamp(6px, 1.5vw, 9px)",
  }

  // Ring size sebagai angka untuk SVG
  const ringPx = 80   // base, SVG memakai viewBox agar otomatis scale
  const ringR = 32
  const circumference = 2 * Math.PI * ringR

  const fieldStyle = (hasErr) => ({
    width: "100%", boxSizing: "border-box",
    background: "rgba(255,255,255,0.06)",
    border: `1px solid ${hasErr ? "rgba(252,100,100,0.55)" : "rgba(255,255,255,0.12)"}`,
    borderRadius: "12px", color: "#fff",
    fontSize: C.inputFontSize, fontWeight: "500",
    padding: C.inputPad, outline: "none", fontFamily: "monospace", transition: "border 0.2s",
  })

  if (step === "loading") return (
    <div style={{ minHeight: "100vh", width: "100vw", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}
        style={{ color: "rgba(255,255,255,0.3)", fontSize: "36px" }}>☽</motion.div>
    </div>
  )

  const cardBase = {
    width: C.cardW,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: C.cardRadius,
    backdropFilter: "blur(20px)",
    boxShadow: "0 0 100px rgba(120,80,200,0.14), 0 40px 80px rgba(0,0,0,0.5)",
    padding: C.cardPad,
  }

  return (
    <div style={{
      minHeight: "100vh",
      width: "100vw",
      background: "#0a0a0f",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Georgia', serif",
      padding: C.outerPad,
      boxSizing: "border-box",
      position: "relative",
    }}>
      {/* CSS global fix — pastikan html/body tidak ada overflow hidden */}
      <style>{`
        html, body { margin: 0; padding: 0; min-height: 100vh; background: #0a0a0f; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 0px; }
      `}</style>

      {/* Glows */}
      <div style={{ position: "fixed", pointerEvents: "none", top: 0, left: "50%", transform: "translateX(-50%)", width: "80vw", height: "50vh", background: "radial-gradient(ellipse, rgba(120,80,200,0.16) 0%, transparent 65%)", zIndex: 0 }} />
      <div style={{ position: "fixed", pointerEvents: "none", bottom: 0, right: 0, width: "60vw", height: "60vh", background: "radial-gradient(ellipse, rgba(200,140,60,0.1) 0%, transparent 70%)", zIndex: 0 }} />

      <AnimatePresence>
        {showCongrats && <CongratsCard total={data.length} onClose={() => setShowCongrats(false)} userName={userName} />}
      </AnimatePresence>

      <AnimatePresence mode="wait">

        {/* ══ SETUP ══ */}
        {step === "setup" && (
          <motion.div key="setup"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ ...cardBase, zIndex: 1 }}>

            <div style={{ textAlign: "center", marginBottom: "clamp(28px, 5vw, 48px)" }}>
              <div style={{ fontSize: C.moonSize, marginBottom: "clamp(10px, 2vw, 16px)" }}>☽</div>
              <h1 style={{ color: "#fff", fontSize: C.h1Size, fontWeight: "700", letterSpacing: "-0.5px", margin: "0 0 8px" }}>Catatan Kodo</h1>
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: C.subSize, letterSpacing: "4px", fontFamily: "monospace" }}>PUASA</span>
            </div>

            {/* Name */}
            <div style={{ marginBottom: "clamp(16px, 3vw, 22px)" }}>
              <label style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: C.labelSize, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "10px", fontFamily: "monospace" }}>
                Nama kamu
              </label>
              <input type="text" maxLength={40} value={nameValue} placeholder="contoh: Fatimah"
                onChange={e => { setNameValue(e.target.value); setNameError("") }}
                onKeyDown={e => e.key === "Enter" && handleStart()}
                style={fieldStyle(!!nameError)}
                onFocus={e => e.target.style.borderColor = "rgba(192,132,252,0.6)"}
                onBlur={e => e.target.style.borderColor = nameError ? "rgba(252,100,100,0.55)" : "rgba(255,255,255,0.12)"}
              />
              <AnimatePresence>
                {nameError && (
                  <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ color: "rgba(252,100,100,0.85)", fontSize: "12px", margin: "7px 0 0", fontFamily: "monospace" }}>⚠ {nameError}</motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Days */}
            <div>
              <label style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: C.labelSize, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "10px", fontFamily: "monospace" }}>
                Berapa hari kodo puasamu?
              </label>
              <div style={{ display: "flex", gap: "clamp(8px, 2vw, 12px)" }}>
                <input type="number" min="1" max="365" value={inputValue}
                  onChange={e => { setInputValue(e.target.value); setInputError("") }}
                  onKeyDown={e => e.key === "Enter" && handleStart()}
                  placeholder="contoh: 30"
                  style={{ ...fieldStyle(!!inputError), flex: 1, width: "auto", fontSize: C.btnFontSize, fontWeight: "600" }}
                  onFocus={e => e.target.style.borderColor = "rgba(192,132,252,0.6)"}
                  onBlur={e => e.target.style.borderColor = inputError ? "rgba(252,100,100,0.55)" : "rgba(255,255,255,0.12)"}
                />
                <motion.button onClick={handleStart} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  style={{ background: "linear-gradient(135deg, #c084fc, #f59e0b)", border: "none", borderRadius: "12px", color: "#0a0a0f", fontSize: C.btnFontSize, fontWeight: "800", padding: C.btnPad, cursor: "pointer", flexShrink: 0 }}>→</motion.button>
              </div>
              <AnimatePresence>
                {inputError && (
                  <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ color: "rgba(252,100,100,0.85)", fontSize: "12px", margin: "7px 0 0", fontFamily: "monospace" }}>⚠ {inputError}</motion.p>
                )}
              </AnimatePresence>
            </div>

            <p style={{ color: "rgba(255,255,255,0.15)", fontSize: "clamp(11px, 2vw, 13px)", textAlign: "center", marginTop: "clamp(24px, 4vw, 36px)", fontFamily: "monospace" }}>
              1 ceklis per hari · 1 – 365 hari
            </p>
          </motion.div>
        )}

        {/* ══ TRACKER ══ */}
        {step === "tracker" && (
          <motion.div key="tracker"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{
              ...cardBase,
              zIndex: 1,
              maxHeight: "96vh",
              overflowY: "auto",
            }}>

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "clamp(16px, 3vw, 28px)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "clamp(10px, 2vw, 16px)" }}>
                <span style={{ fontSize: C.headerMoonSize, lineHeight: 1 }}>☽</span>
                <div>
                  <h1 style={{ color: "#fff", fontSize: C.headerTitleSize, fontWeight: "700", letterSpacing: "-0.5px", margin: "0 0 2px", lineHeight: 1.2 }}>
                    {userName ? <>Kodo <span style={{ color: "#c084fc" }}>{userName}</span></> : "Catatan Kodo"}
                  </h1>
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: C.headerSubSize, letterSpacing: "3px", fontFamily: "monospace" }}>PUASA · {data.length} HARI</span>
                </div>
              </div>
              <motion.button onClick={handleReset} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "rgba(255,255,255,0.45)", fontSize: C.resetFontSize, fontFamily: "monospace", letterSpacing: "1px", padding: C.resetPad, cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap" }}>
                ← RESET
              </motion.button>
            </div>

            {/* Status banner */}
            <AnimatePresence mode="wait">
              {!allDone && alreadyCheckedToday && (
                <motion.div key="locked" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ marginBottom: "clamp(14px, 3vw, 22px)", padding: C.bannerPad, background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.18)", borderRadius: "clamp(10px, 2vw, 14px)", display: "flex", alignItems: "center", gap: "clamp(10px, 2.5vw, 16px)" }}>
                  <span style={{ fontSize: "clamp(18px, 3.5vw, 22px)" }}>🔒</span>
                  <div>
                    <div style={{ color: "#f59e0b", fontSize: C.bannerTitleSize, fontWeight: "700" }}>Sudah diceklis hari ini</div>
                    <div style={{ color: "rgba(255,255,255,0.3)", fontSize: C.bannerSubSize, fontFamily: "monospace", marginTop: "2px" }}>Kembali lagi besok untuk centang berikutnya</div>
                  </div>
                </motion.div>
              )}
              {!allDone && !alreadyCheckedToday && nextItem && (
                <motion.div key="available" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ marginBottom: "clamp(14px, 3vw, 22px)", padding: C.bannerPad, background: "rgba(192,132,252,0.07)", border: "1px solid rgba(192,132,252,0.2)", borderRadius: "clamp(10px, 2vw, 14px)", display: "flex", alignItems: "center", gap: "clamp(10px, 2.5vw, 16px)" }}>
                  <span style={{ fontSize: "clamp(18px, 3.5vw, 22px)" }}>✨</span>
                  <div>
                    <div style={{ color: "#c084fc", fontSize: C.bannerTitleSize, fontWeight: "700" }}>Giliran hari ini!</div>
                    <div style={{ color: "rgba(255,255,255,0.3)", fontSize: C.bannerSubSize, fontFamily: "monospace", marginTop: "2px" }}>Tap Day {nextItem.id} untuk ceklis hari ini</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress */}
            <div style={{ display: "flex", alignItems: "center", gap: "clamp(16px, 4vw, 28px)", marginBottom: "clamp(14px, 3vw, 24px)", padding: C.progressPad, background: "rgba(255,255,255,0.03)", borderRadius: "clamp(12px, 2.5vw, 18px)", border: "1px solid rgba(255,255,255,0.06)" }}>
              {/* Ring — pakai % width agar fluid */}
              <div style={{ position: "relative", width: "clamp(64px, 11vw, 92px)", height: "clamp(64px, 11vw, 92px)", flexShrink: 0 }}>
                <svg viewBox={`0 0 ${ringPx} ${ringPx}`} width="100%" height="100%" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx={ringPx/2} cy={ringPx/2} r={ringR} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
                  <motion.circle cx={ringPx/2} cy={ringPx/2} r={ringR} fill="none" stroke="url(#grad)" strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={circumference}
                    animate={{ strokeDashoffset: circumference * (1 - progress / 100) }}
                    transition={{ duration: 0.6, ease: "easeOut" }} />
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#c084fc" /><stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                  </defs>
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "clamp(11px, 2.2vw, 16px)", fontWeight: "700" }}>
                  {Math.round(progress)}%
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: C.progressLabelSize, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "5px" }}>
                  {userName ? <><span style={{ color: "#c084fc", fontWeight: "700" }}>{userName}</span> · Progress</> : "Progress"}
                </div>
                <div style={{ color: "#fff", fontSize: C.progressNumSize, fontWeight: "700", lineHeight: 1 }}>
                  {totalDone} <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "clamp(14px, 3vw, 20px)", fontWeight: "400" }}>/ {data.length}</span>
                </div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: C.progressSubSize, marginTop: "4px" }}>Hari Selesai</div>
              </div>
            </div>

            {/* Bar */}
            <div style={{ height: "clamp(3px, 0.5vw, 5px)", background: "rgba(255,255,255,0.07)", borderRadius: "99px", marginBottom: "clamp(14px, 3vw, 22px)", overflow: "hidden" }}>
              <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.6, ease: "easeOut" }}
                style={{ height: "100%", background: "linear-gradient(90deg, #c084fc, #f59e0b)", borderRadius: "99px" }} />
            </div>

            {/* Day list */}
            <div style={{ display: "flex", flexDirection: "column", gap: C.rowGap }}>
              {data.map((item, idx) => {
                const isNext = item.id === nextItem?.id
                const isFuture = !item.done && !isNext
                const isLastDone = item.done && [...data].reverse().find(d => d.done)?.id === item.id
                const clickable = (!item.done && isNext && !alreadyCheckedToday) || (item.done && isLastDone)

                return (
                  <motion.button key={item.id}
                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(idx * 0.02, 0.35), duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => clickable && handleCheck(item.id)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: C.rowPad,
                      background: item.done ? "rgba(192,132,252,0.09)" : isNext && !alreadyCheckedToday ? "rgba(192,132,252,0.05)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${item.done ? "rgba(192,132,252,0.25)" : isNext && !alreadyCheckedToday ? "rgba(192,132,252,0.2)" : "rgba(255,255,255,0.05)"}`,
                      borderRadius: C.rowRadius,
                      cursor: clickable ? "pointer" : "default",
                      opacity: isFuture ? 0.28 : 1,
                      outline: "none", textAlign: "left", transition: "all 0.2s ease",
                    }}
                    whileHover={clickable ? { scale: 1.01 } : {}}
                    whileTap={clickable ? { scale: 0.98 } : {}}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "clamp(12px, 2.5vw, 20px)" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: C.dayMinW }}>
                        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: C.dayLabelSize, fontFamily: "monospace", letterSpacing: "0.5px", lineHeight: 1 }}>DAY</span>
                        <span style={{ color: item.done ? "#c084fc" : isNext && !alreadyCheckedToday ? "#c084fc" : "rgba(255,255,255,0.28)", fontSize: C.dayNumSize, fontWeight: "700", fontFamily: "monospace", lineHeight: 1.1, transition: "color 0.2s" }}>
                          {item.id}
                        </span>
                      </div>
                      <div style={{ width: "1px", height: "clamp(22px, 4vw, 30px)", background: item.done ? "rgba(192,132,252,0.25)" : "rgba(255,255,255,0.07)", flexShrink: 0 }} />
                      <div>
                        {isNext && !alreadyCheckedToday && (
                          <div style={{ display: "inline-block", background: "rgba(192,132,252,0.2)", color: "#c084fc", fontSize: C.badgeFont, fontFamily: "monospace", letterSpacing: "1.5px", padding: C.badgePad, borderRadius: "99px", marginBottom: "4px", fontWeight: "700" }}>HARI INI</div>
                        )}
                        {alreadyCheckedToday && !item.done && !isFuture && (
                          <div style={{ display: "inline-block", background: "rgba(245,158,11,0.14)", color: "rgba(245,158,11,0.65)", fontSize: C.badgeFont, fontFamily: "monospace", letterSpacing: "1.5px", padding: C.badgePad, borderRadius: "99px", marginBottom: "4px", fontWeight: "700" }}>BESOK</div>
                        )}
                        <div style={{ color: item.done ? "#fff" : isFuture ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.75)", fontSize: C.statusSize, fontWeight: item.done ? "600" : "400", lineHeight: 1 }}>
                          {item.done ? "Selesai" : isNext ? "Belum diceklis" : "Menunggu giliran"}
                        </div>
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      {item.done ? (
                        <motion.div key="done" initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 25 }}
                          style={{ width: C.checkSize, height: C.checkSize, borderRadius: "50%", background: "linear-gradient(135deg, #c084fc, #f59e0b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: C.checkFont, color: "#0a0a0f", fontWeight: "800", flexShrink: 0 }}>✓</motion.div>
                      ) : isFuture ? (
                        <div style={{ width: C.checkSize, height: C.checkSize, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.06)", flexShrink: 0 }} />
                      ) : alreadyCheckedToday ? (
                        <div style={{ width: C.checkSize, height: C.checkSize, borderRadius: "50%", border: "1.5px solid rgba(245,158,11,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span style={{ fontSize: "clamp(10px, 2vw, 13px)" }}>🔒</span>
                        </div>
                      ) : (
                        <motion.div key="undone" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                          style={{ width: C.checkSize, height: C.checkSize, borderRadius: "50%", border: "2px solid rgba(192,132,252,0.4)", flexShrink: 0 }} />
                      )}
                    </AnimatePresence>
                  </motion.button>
                )
              })}
            </div>

            {/* All done */}
            <AnimatePresence>
              {allDone && !showCongrats && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  onClick={() => setShowCongrats(true)}
                  style={{ marginTop: "clamp(16px, 3vw, 24px)", padding: "clamp(14px, 3vw, 20px)", background: "linear-gradient(135deg, rgba(192,132,252,0.12), rgba(245,158,11,0.08))", border: "1px solid rgba(192,132,252,0.25)", borderRadius: "clamp(10px, 2vw, 14px)", textAlign: "center", color: "#c084fc", fontSize: "clamp(12px, 2.5vw, 14px)", fontWeight: "600", cursor: "pointer" }}>
                  🌙 Alhamdulillah {userName}! Semua {data.length} hari selesai · Tap untuk lihat 🎉
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}