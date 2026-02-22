import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

function todayStr() { return new Date().toISOString().slice(0, 10) }

function generateDays(total) {
  return Array.from({ length: total }, (_, i) => ({ id: i + 1, done: false }))
}

function useWindowWidth() {
  const [width, setWidth] = useState(() => (typeof window !== "undefined" ? window.innerWidth : 1024))
  useEffect(() => {
    const fn = () => setWidth(window.innerWidth)
    window.addEventListener("resize", fn)
    return () => window.removeEventListener("resize", fn)
  }, [])
  return width
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

// ── Congrats Card ─────────────────────────────────────────────────────────────
function CongratsCard({ total, onClose, isMobile, userName }) {
  return (
    <>
      <Confetti />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99, padding: isMobile ? "20px" : "24px" }}>
        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.1 }}
          style={{ maxWidth: isMobile ? "100%" : "380px", width: "100%", background: "linear-gradient(145deg, #13101f, #1a1230)", border: "1px solid rgba(192,132,252,0.4)", borderRadius: isMobile ? "24px" : "32px", padding: isMobile ? "36px 24px" : "48px 36px", textAlign: "center", boxShadow: "0 0 80px rgba(192,132,252,0.25), 0 40px 80px rgba(0,0,0,0.6)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-40px", left: "50%", transform: "translateX(-50%)", width: "200px", height: "200px", background: "radial-gradient(ellipse, rgba(192,132,252,0.3) 0%, transparent 70%)", pointerEvents: "none" }} />
          <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{ fontSize: isMobile ? "52px" : "64px", marginBottom: "16px" }}>🌙</motion.div>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", letterSpacing: "4px", fontFamily: "monospace", marginBottom: "12px" }}>ALHAMDULILLAH</div>
          <h2 style={{ color: "#fff", fontSize: isMobile ? "24px" : "28px", fontWeight: "800", margin: "0 0 8px", letterSpacing: "-1px", lineHeight: 1.2 }}>Kodo Puasa<br />Selesai! 🎉</h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: isMobile ? "13px" : "14px", margin: "0 0 8px", lineHeight: 1.6 }}>
            {userName && <><span style={{ color: "#c084fc", fontWeight: "700" }}>{userName}</span> berhasil menyelesaikan<br /></>}
            {!userName && <>Kamu berhasil menyelesaikan<br /></>}
            <span style={{ color: "#c084fc", fontWeight: "700", fontSize: isMobile ? "18px" : "20px" }}>{total} hari</span> kodo puasa<br />dengan penuh istiqomah.
          </p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(192,132,252,0.1)", border: "1px solid rgba(192,132,252,0.25)", borderRadius: "99px", padding: "8px 20px", marginBottom: "28px", marginTop: "16px" }}>
            <span>⭐</span>
            <span style={{ color: "#c084fc", fontSize: "13px", fontWeight: "600", fontFamily: "monospace" }}>{total}/{total} HARI · 100%</span>
          </div>
          <motion.button onClick={onClose} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{ width: "100%", padding: isMobile ? "14px" : "16px", background: "linear-gradient(135deg, #c084fc, #f59e0b)", border: "none", borderRadius: "16px", color: "#0a0a0f", fontSize: "14px", fontWeight: "800", cursor: "pointer" }}>
            Lihat Catatan →
          </motion.button>
        </motion.div>
      </motion.div>
    </>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function App() {
  const width = useWindowWidth()
  const isMobile = width < 768
  const isTablet = width >= 768 && width < 1024

  const [step, setStep] = useState("loading")
  const [nameValue, setNameValue] = useState("")
  const [inputValue, setInputValue] = useState("")
  const [inputError, setInputError] = useState("")
  const [nameError, setNameError] = useState("")
  const [data, setData] = useState([])
  const [userName, setUserName] = useState("")
  const [lastCheckedDate, setLastCheckedDate] = useState(null)
  const [showCongrats, setShowCongrats] = useState(false)
  const prevAllDoneRef = useRef(false)

  const today = todayStr()
  const alreadyCheckedToday = lastCheckedDate === today
  const allDone = data.length > 0 && data.every(i => i.done)
  const nextItem = data.find(i => !i.done)

  // ── Load ──
  useEffect(() => {
    function load() {
      try {
        const saved = localStorage.getItem("puasa-data")
        if (saved) {
          const s = JSON.parse(saved)
          if (s.data?.length > 0) {
            setData(s.data)
            setLastCheckedDate(s.lastCheckedDate || null)
            setUserName(s.userName || "")
            prevAllDoneRef.current = s.data.every(i => i.done)
            setStep("tracker")
            return
          }
        }
      } catch (_) {}
      setStep("setup")
    }
    load()
  }, [])

  // ── Save + congrats ──
  useEffect(() => {
    if (data.length === 0) return
    localStorage.setItem("puasa-data", JSON.stringify({ data, lastCheckedDate, userName }))
    if (allDone && !prevAllDoneRef.current) setTimeout(() => setShowCongrats(true), 500)
    prevAllDoneRef.current = allDone
  }, [data, lastCheckedDate, userName])

  const handleStart = () => {
    const trimmedName = nameValue.trim()
    const num = parseInt(inputValue)
    let hasError = false

    if (!trimmedName) { setNameError("Masukkan namamu dulu"); hasError = true }
    if (!inputValue || isNaN(num) || num < 1 || num > 365) { setInputError("Masukkan angka antara 1 hingga 365"); hasError = true }
    if (hasError) return

    setUserName(trimmedName)
    setData(generateDays(num))
    setLastCheckedDate(null)
    prevAllDoneRef.current = false
    setStep("tracker")
  }

  const handleReset = () => {
    localStorage.removeItem("puasa-data")
    setData([]); setLastCheckedDate(null); setUserName("")
    setNameValue(""); setInputValue("")
    setNameError(""); setInputError("")
    setShowCongrats(false)
    prevAllDoneRef.current = false; setStep("setup")
  }

  const handleCheck = (id) => {
    const item = data.find(d => d.id === id)
    if (!item) return
    if (!item.done) {
      if (item.id !== nextItem?.id) return
      if (alreadyCheckedToday) return
      setData(prev => prev.map(d => d.id === id ? { ...d, done: true } : d))
      setLastCheckedDate(today)
    } else {
      const lastDone = [...data].reverse().find(d => d.done)
      if (!lastDone || lastDone.id !== id) return
      setData(prev => prev.map(d => d.id === id ? { ...d, done: false } : d))
      if (lastCheckedDate === today) setLastCheckedDate(null)
    }
  }

  const totalDone = data.filter(i => i.done).length
  const progress = data.length > 0 ? (totalDone / data.length) * 100 : 0

  const r = {
    cardMaxW: isMobile ? "100%" : isTablet ? "440px" : "480px",
    cardPadX: isMobile ? "18px" : "36px",
    cardPadY: isMobile ? "22px" : "40px",
    cardRadius: isMobile ? "20px" : "28px",
    titleSize: isMobile ? "18px" : "20px",
    rowPad: isMobile ? "11px 14px" : "14px 18px",
    rowRadius: isMobile ? "11px" : "14px",
    rowGap: isMobile ? "6px" : "8px",
    dayNumSize: isMobile ? "15px" : "17px",
    statusSize: isMobile ? "13px" : "14px",
    checkSize: isMobile ? "24px" : "28px",
    checkFont: isMobile ? "11px" : "13px",
    bannerPad: isMobile ? "11px 13px" : "14px 16px",
    bannerRadius: isMobile ? "12px" : "14px",
    bannerTitleSize: isMobile ? "11px" : "12px",
    ringSize: isMobile ? 60 : 72,
    ringR: isMobile ? 24 : 30,
    progressNumSize: isMobile ? "22px" : "28px",
  }

  const cardStyle = {
    width: "100%", maxWidth: r.cardMaxW,
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: r.cardRadius, backdropFilter: "blur(20px)",
    boxShadow: "0 0 80px rgba(120,80,200,0.12), 0 40px 80px rgba(0,0,0,0.5)",
  }

  const inputStyle = (hasErr) => ({
    width: "100%", boxSizing: "border-box",
    background: "rgba(255,255,255,0.05)",
    border: `1px solid ${hasErr ? "rgba(252,100,100,0.5)" : "rgba(255,255,255,0.1)"}`,
    borderRadius: "14px", color: "#fff",
    fontSize: isMobile ? "15px" : "16px", fontWeight: "500",
    padding: isMobile ? "13px 16px" : "14px 18px",
    outline: "none", fontFamily: "monospace",
    transition: "border 0.2s",
  })

  const circumference = 2 * Math.PI * r.ringR

  if (step === "loading") return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}
        style={{ color: "rgba(255,255,255,0.3)", fontSize: "32px" }}>☽</motion.div>
    </div>
  )

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0f",
      display: "flex", alignItems: isMobile ? "flex-start" : "center", justifyContent: "center",
      fontFamily: "'Georgia', serif",
      padding: isMobile ? "16px 16px 48px" : "32px",
      position: "relative", overflow: isMobile ? "auto" : "hidden", boxSizing: "border-box",
    }}>
      <div style={{ position: "fixed", pointerEvents: "none", top: "-10%", left: "50%", transform: "translateX(-50%)", width: "600px", height: "300px", background: "radial-gradient(ellipse, rgba(120,80,200,0.15) 0%, transparent 70%)" }} />
      <div style={{ position: "fixed", pointerEvents: "none", bottom: 0, right: "-10%", width: "400px", height: "400px", background: "radial-gradient(ellipse, rgba(200,140,60,0.08) 0%, transparent 70%)" }} />

      <AnimatePresence>
        {showCongrats && <CongratsCard total={data.length} onClose={() => setShowCongrats(false)} isMobile={isMobile} userName={userName} />}
      </AnimatePresence>

      <AnimatePresence mode="wait">

        {/* ══ SETUP ══ */}
        {step === "setup" && (
          <motion.div key="setup"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ ...cardStyle, padding: `${isMobile ? "40px" : "48px"} ${r.cardPadX}`, marginTop: isMobile ? "16px" : 0 }}>

            {/* Logo */}
            <div style={{ textAlign: "center", marginBottom: isMobile ? "32px" : "40px" }}>
              <div style={{ fontSize: isMobile ? "40px" : "48px", marginBottom: "14px" }}>☽</div>
              <h1 style={{ color: "#fff", fontSize: isMobile ? "21px" : "24px", fontWeight: "700", letterSpacing: "-0.5px", margin: "0 0 6px" }}>Catatan Kodo</h1>
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: isMobile ? "11px" : "13px", letterSpacing: "4px", fontFamily: "monospace" }}>PUASA</span>
            </div>

            {/* Name input */}
            <div style={{ marginBottom: "18px" }}>
              <label style={{ display: "block", color: "rgba(255,255,255,0.45)", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "10px", fontFamily: "monospace" }}>
                Nama kamu
              </label>
              <input
                type="text" maxLength={40} value={nameValue} placeholder="contoh: Fatimah"
                onChange={e => { setNameValue(e.target.value); setNameError("") }}
                onKeyDown={e => e.key === "Enter" && handleStart()}
                style={inputStyle(!!nameError)}
                onFocus={e => e.target.style.borderColor = "rgba(192,132,252,0.5)"}
                onBlur={e => e.target.style.borderColor = nameError ? "rgba(252,100,100,0.5)" : "rgba(255,255,255,0.1)"}
              />
              <AnimatePresence>
                {nameError && (
                  <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ color: "rgba(252,100,100,0.8)", fontSize: "12px", margin: "6px 0 0", fontFamily: "monospace" }}>⚠ {nameError}</motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Days input */}
            <div>
              <label style={{ display: "block", color: "rgba(255,255,255,0.45)", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "10px", fontFamily: "monospace" }}>
                Berapa hari kodo puasamu?
              </label>
              <div style={{ display: "flex", gap: "10px" }}>
                <input type="number" min="1" max="365" value={inputValue}
                  onChange={e => { setInputValue(e.target.value); setInputError("") }}
                  onKeyDown={e => e.key === "Enter" && handleStart()}
                  placeholder="contoh: 30"
                  style={{ ...inputStyle(!!inputError), flex: 1, width: "auto", fontSize: isMobile ? "18px" : "20px", fontWeight: "600", padding: isMobile ? "13px 16px" : "16px 20px" }}
                  onFocus={e => e.target.style.borderColor = "rgba(192,132,252,0.5)"}
                  onBlur={e => e.target.style.borderColor = inputError ? "rgba(252,100,100,0.5)" : "rgba(255,255,255,0.1)"}
                />
                <motion.button onClick={handleStart} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  style={{ background: "linear-gradient(135deg, #c084fc, #f59e0b)", border: "none", borderRadius: "14px", color: "#0a0a0f", fontSize: isMobile ? "18px" : "20px", fontWeight: "800", padding: isMobile ? "13px 18px" : "16px 22px", cursor: "pointer", flexShrink: 0 }}>→</motion.button>
              </div>
              <AnimatePresence>
                {inputError && (
                  <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ color: "rgba(252,100,100,0.8)", fontSize: "12px", margin: "6px 0 0", fontFamily: "monospace" }}>⚠ {inputError}</motion.p>
                )}
              </AnimatePresence>
            </div>

            <p style={{ color: "rgba(255,255,255,0.15)", fontSize: "12px", textAlign: "center", marginTop: "28px", fontFamily: "monospace", letterSpacing: "0.5px" }}>
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
              ...cardStyle,
              padding: `${r.cardPadY} ${r.cardPadX}`,
              ...(isMobile ? {} : { maxHeight: "92vh", overflowY: "auto", scrollbarWidth: "none" }),
            }}>

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isMobile ? "16px" : "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "10px" : "12px" }}>
                <span style={{ fontSize: isMobile ? "22px" : "26px", lineHeight: 1 }}>☽</span>
                <div>
                  {/* Title with name */}
                  <h1 style={{ color: "#fff", fontSize: r.titleSize, fontWeight: "700", letterSpacing: "-0.5px", margin: "0 0 1px", lineHeight: 1.2 }}>
                    {userName
                      ? <>Kodo <span style={{ color: "#c084fc" }}>{userName}</span></>
                      : "Catatan Kodo"}
                  </h1>
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px", letterSpacing: "3px", fontFamily: "monospace" }}>PUASA · {data.length} HARI</span>
                </div>
              </div>
              <motion.button onClick={handleReset} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", color: "rgba(255,255,255,0.4)", fontSize: "10px", fontFamily: "monospace", letterSpacing: "1px", padding: isMobile ? "7px 11px" : "8px 14px", cursor: "pointer", flexShrink: 0 }}>
                ← RESET
              </motion.button>
            </div>

            {/* Status banner */}
            <AnimatePresence mode="wait">
              {allDone ? null
                : alreadyCheckedToday ? (
                  <motion.div key="locked" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ marginBottom: isMobile ? "14px" : "20px", padding: r.bannerPad, background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.18)", borderRadius: r.bannerRadius, display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "18px" }}>🔒</span>
                    <div>
                      <div style={{ color: "#f59e0b", fontSize: r.bannerTitleSize, fontWeight: "700" }}>Sudah diceklis hari ini</div>
                      <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px", fontFamily: "monospace", marginTop: "2px" }}>Kembali lagi besok untuk centang berikutnya</div>
                    </div>
                  </motion.div>
                ) : nextItem ? (
                  <motion.div key="available" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ marginBottom: isMobile ? "14px" : "20px", padding: r.bannerPad, background: "rgba(192,132,252,0.07)", border: "1px solid rgba(192,132,252,0.2)", borderRadius: r.bannerRadius, display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "18px" }}>✨</span>
                    <div>
                      <div style={{ color: "#c084fc", fontSize: r.bannerTitleSize, fontWeight: "700" }}>Giliran hari ini!</div>
                      <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px", fontFamily: "monospace", marginTop: "2px" }}>Tap Day {nextItem.id} untuk ceklis hari ini</div>
                    </div>
                  </motion.div>
                ) : null}
            </AnimatePresence>

            {/* Progress */}
            <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "16px" : "24px", marginBottom: isMobile ? "14px" : "24px", padding: isMobile ? "14px" : "20px", background: "rgba(255,255,255,0.03)", borderRadius: isMobile ? "14px" : "18px", border: "1px solid rgba(255,255,255,0.06)" }}>
              {/* Ring */}
              <div style={{ position: "relative", width: r.ringSize, height: r.ringSize, flexShrink: 0 }}>
                <svg width={r.ringSize} height={r.ringSize} style={{ transform: "rotate(-90deg)" }}>
                  <circle cx={r.ringSize / 2} cy={r.ringSize / 2} r={r.ringR} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="5" />
                  <motion.circle cx={r.ringSize / 2} cy={r.ringSize / 2} r={r.ringR} fill="none" stroke="url(#grad)" strokeWidth="5" strokeLinecap="round"
                    strokeDasharray={`${circumference}`}
                    animate={{ strokeDashoffset: circumference * (1 - progress / 100) }}
                    transition={{ duration: 0.6, ease: "easeOut" }} />
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#c084fc" /><stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                  </defs>
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: isMobile ? "12px" : "15px", fontWeight: "700" }}>
                  {Math.round(progress)}%
                </div>
              </div>

              {/* Stats — with name */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "4px" }}>
                  {userName
                    ? <><span style={{ color: "#c084fc", fontWeight: "700" }}>{userName}</span> · Progress</>
                    : "Progress"}
                </div>
                <div style={{ color: "#fff", fontSize: r.progressNumSize, fontWeight: "700", lineHeight: 1 }}>
                  {totalDone} <span style={{ color: "rgba(255,255,255,0.25)", fontSize: isMobile ? "14px" : "16px", fontWeight: "400" }}>/ {data.length}</span>
                </div>
                <div style={{ color: "rgba(255,255,255,0.35)", fontSize: isMobile ? "12px" : "13px", marginTop: "2px" }}>Hari Selesai</div>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ height: "3px", background: "rgba(255,255,255,0.07)", borderRadius: "99px", marginBottom: isMobile ? "14px" : "20px", overflow: "hidden" }}>
              <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.6, ease: "easeOut" }}
                style={{ height: "100%", background: "linear-gradient(90deg, #c084fc, #f59e0b)", borderRadius: "99px" }} />
            </div>

            {/* Day list */}
            <div style={{ display: "flex", flexDirection: "column", gap: r.rowGap }}>
              {data.map((item, idx) => {
                const isNext = item.id === nextItem?.id
                const isFuture = !item.done && !isNext
                const isLastDone = item.done && [...data].reverse().find(d => d.done)?.id === item.id
                const clickable = (!item.done && isNext && !alreadyCheckedToday) || (item.done && isLastDone)

                return (
                  <motion.button key={item.id}
                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(idx * 0.025, 0.4), duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => clickable && handleCheck(item.id)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: r.rowPad,
                      background: item.done ? "rgba(192,132,252,0.09)" : isNext && !alreadyCheckedToday ? "rgba(192,132,252,0.04)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${item.done ? "rgba(192,132,252,0.25)" : isNext && !alreadyCheckedToday ? "rgba(192,132,252,0.18)" : "rgba(255,255,255,0.05)"}`,
                      borderRadius: r.rowRadius,
                      cursor: clickable ? "pointer" : "default",
                      opacity: isFuture ? 0.28 : 1,
                      outline: "none", textAlign: "left", transition: "all 0.2s ease",
                    }}
                    whileHover={clickable ? { scale: 1.01 } : {}}
                    whileTap={clickable ? { scale: 0.98 } : {}}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "12px" : "16px" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: isMobile ? "30px" : "36px" }}>
                        <span style={{ color: "rgba(255,255,255,0.18)", fontSize: "8px", fontFamily: "monospace", letterSpacing: "0.5px", lineHeight: 1 }}>DAY</span>
                        <span style={{ color: item.done ? "#c084fc" : isNext && !alreadyCheckedToday ? "#c084fc" : "rgba(255,255,255,0.25)", fontSize: r.dayNumSize, fontWeight: "700", fontFamily: "monospace", lineHeight: 1.1, transition: "color 0.2s" }}>
                          {item.id}
                        </span>
                      </div>
                      <div style={{ width: "1px", height: "24px", background: item.done ? "rgba(192,132,252,0.2)" : "rgba(255,255,255,0.06)", flexShrink: 0 }} />
                      <div>
                        {isNext && !alreadyCheckedToday && (
                          <div style={{ display: "inline-block", background: "rgba(192,132,252,0.18)", color: "#c084fc", fontSize: "8px", fontFamily: "monospace", letterSpacing: "1.5px", padding: "2px 7px", borderRadius: "99px", marginBottom: "3px", fontWeight: "700" }}>HARI INI</div>
                        )}
                        {alreadyCheckedToday && !item.done && !isFuture && (
                          <div style={{ display: "inline-block", background: "rgba(245,158,11,0.12)", color: "rgba(245,158,11,0.6)", fontSize: "8px", fontFamily: "monospace", letterSpacing: "1.5px", padding: "2px 7px", borderRadius: "99px", marginBottom: "3px", fontWeight: "700" }}>BESOK</div>
                        )}
                        <div style={{ color: item.done ? "#fff" : isFuture ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.7)", fontSize: r.statusSize, fontWeight: item.done ? "600" : "400", lineHeight: 1 }}>
                          {item.done ? "Selesai" : isNext ? "Belum diceklis" : "Menunggu giliran"}
                        </div>
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      {item.done ? (
                        <motion.div key="done"
                          initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 25 }}
                          style={{ width: r.checkSize, height: r.checkSize, borderRadius: "50%", background: "linear-gradient(135deg, #c084fc, #f59e0b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: r.checkFont, color: "#0a0a0f", fontWeight: "800", flexShrink: 0 }}>✓</motion.div>
                      ) : isFuture ? (
                        <div style={{ width: r.checkSize, height: r.checkSize, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.05)", flexShrink: 0 }} />
                      ) : alreadyCheckedToday ? (
                        <div style={{ width: r.checkSize, height: r.checkSize, borderRadius: "50%", border: "1.5px solid rgba(245,158,11,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span style={{ fontSize: "11px" }}>🔒</span>
                        </div>
                      ) : (
                        <motion.div key="undone" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                          style={{ width: r.checkSize, height: r.checkSize, borderRadius: "50%", border: "2px solid rgba(192,132,252,0.35)", flexShrink: 0 }} />
                      )}
                    </AnimatePresence>
                  </motion.button>
                )
              })}
            </div>

            {/* All done banner */}
            <AnimatePresence>
              {allDone && !showCongrats && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  onClick={() => setShowCongrats(true)}
                  style={{ marginTop: "20px", padding: isMobile ? "14px" : "16px", background: "linear-gradient(135deg, rgba(192,132,252,0.12), rgba(245,158,11,0.08))", border: "1px solid rgba(192,132,252,0.25)", borderRadius: isMobile ? "12px" : "14px", textAlign: "center", color: "#c084fc", fontSize: isMobile ? "12px" : "13px", fontWeight: "600", cursor: "pointer" }}>
                  🌙 Alhamdulillah {userName ? userName : ""}! Semua {data.length} hari selesai · Tap untuk lihat 🎉
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}