import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

function todayStr() { return new Date().toISOString().slice(0, 10) }

function generateDays(total) {
  return Array.from({ length: total }, (_, i) => ({
    id: i + 1,
    done: false,
  }))
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
function CongratsCard({ total, onClose }) {
  return (
    <>
      <Confetti />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99, padding: "24px" }}>
        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.1 }}
          style={{ maxWidth: "380px", width: "100%", background: "linear-gradient(145deg, #13101f, #1a1230)", border: "1px solid rgba(192,132,252,0.4)", borderRadius: "32px", padding: "48px 36px", textAlign: "center", boxShadow: "0 0 80px rgba(192,132,252,0.25), 0 40px 80px rgba(0,0,0,0.6)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-40px", left: "50%", transform: "translateX(-50%)", width: "200px", height: "200px", background: "radial-gradient(ellipse, rgba(192,132,252,0.3) 0%, transparent 70%)", pointerEvents: "none" }} />
          <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{ fontSize: "64px", marginBottom: "20px" }}>🌙</motion.div>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", letterSpacing: "4px", fontFamily: "monospace", marginBottom: "12px" }}>ALHAMDULILLAH</div>
          <h2 style={{ color: "#fff", fontSize: "28px", fontWeight: "800", margin: "0 0 8px", letterSpacing: "-1px", lineHeight: 1.2 }}>Kodo Puasa<br />Selesai! 🎉</h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "14px", margin: "0 0 28px", lineHeight: 1.6 }}>
            Kamu berhasil menyelesaikan<br />
            <span style={{ color: "#c084fc", fontWeight: "700", fontSize: "20px" }}>{total} hari</span> kodo puasa<br />dengan penuh istiqomah.
          </p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(192,132,252,0.1)", border: "1px solid rgba(192,132,252,0.25)", borderRadius: "99px", padding: "8px 20px", marginBottom: "28px" }}>
            <span>⭐</span>
            <span style={{ color: "#c084fc", fontSize: "13px", fontWeight: "600", fontFamily: "monospace" }}>{total}/{total} HARI · 100%</span>
          </div>
          <motion.button onClick={onClose} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{ width: "100%", padding: "16px", background: "linear-gradient(135deg, #c084fc, #f59e0b)", border: "none", borderRadius: "16px", color: "#0a0a0f", fontSize: "14px", fontWeight: "800", cursor: "pointer" }}>
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
  const [inputValue, setInputValue] = useState("")
  const [inputError, setInputError] = useState("")
  const [data, setData] = useState([])
  const [lastCheckedDate, setLastCheckedDate] = useState(null)
  const [showCongrats, setShowCongrats] = useState(false)
  const prevAllDoneRef = useRef(false)

  const today = todayStr()
  const alreadyCheckedToday = lastCheckedDate === today
  const allDone = data.length > 0 && data.every(i => i.done)

  // Next day to check = first undone
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

  localStorage.setItem(
    "puasa-data",
    JSON.stringify({ data, lastCheckedDate })
  )

  if (allDone && !prevAllDoneRef.current) {
    setTimeout(() => setShowCongrats(true), 500)
  }

  prevAllDoneRef.current = allDone
}, [data, lastCheckedDate])

  const handleStart = () => {
    const num = parseInt(inputValue)
    if (!inputValue || isNaN(num) || num < 1 || num > 365) { setInputError("Masukkan angka antara 1 hingga 365"); return }
    setData(generateDays(num))
    setLastCheckedDate(null)
    prevAllDoneRef.current = false
    setStep("tracker")
  }

  const handleReset = () => {
  localStorage.removeItem("puasa-data")

  setData([])
  setLastCheckedDate(null)
  setInputValue("")
  setInputError("")
  setShowCongrats(false)
  prevAllDoneRef.current = false
  setStep("setup")
}

  const handleCheck = (id) => {
    const item = data.find(d => d.id === id)
    if (!item) return

    if (!item.done) {
      // Hanya nextItem yang bisa diceklis, dan belum centang hari ini
      if (item.id !== nextItem?.id) return
      if (alreadyCheckedToday) return
      setData(prev => prev.map(d => d.id === id ? { ...d, done: true } : d))
      setLastCheckedDate(today)
    } else {
      // Un-centang (koreksi) — hanya boleh hari terakhir yang di-done
      const lastDone = [...data].reverse().find(d => d.done)
      if (!lastDone || lastDone.id !== id) return
      setData(prev => prev.map(d => d.id === id ? { ...d, done: false } : d))
      if (lastCheckedDate === today) setLastCheckedDate(null)
    }
  }

  const totalDone = data.filter(i => i.done).length
  const progress = data.length > 0 ? (totalDone / data.length) * 100 : 0

  const cardStyle = {
    width: "100%", maxWidth: "420px",
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "28px", backdropFilter: "blur(20px)",
    boxShadow: "0 0 80px rgba(120,80,200,0.12), 0 40px 80px rgba(0,0,0,0.5)",
  }

  if (step === "loading") return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}
        style={{ color: "rgba(255,255,255,0.3)", fontSize: "32px" }}>☽</motion.div>
    </div>
  )

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Georgia', serif", padding: "24px", position: "relative", overflow: "hidden" }}>
      {/* Glows */}
      <div style={{ position: "absolute", pointerEvents: "none", top: "-10%", left: "50%", transform: "translateX(-50%)", width: "600px", height: "300px", background: "radial-gradient(ellipse, rgba(120,80,200,0.15) 0%, transparent 70%)" }} />
      <div style={{ position: "absolute", pointerEvents: "none", bottom: 0, right: "-10%", width: "400px", height: "400px", background: "radial-gradient(ellipse, rgba(200,140,60,0.08) 0%, transparent 70%)" }} />

      <AnimatePresence>{showCongrats && <CongratsCard total={data.length} onClose={() => setShowCongrats(false)} />}</AnimatePresence>

      <AnimatePresence mode="wait">

        {/* ══ SETUP ══ */}
        {step === "setup" && (
          <motion.div key="setup" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ ...cardStyle, padding: "48px 36px" }}>
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>☽</div>
              <h1 style={{ color: "#fff", fontSize: "24px", fontWeight: "700", letterSpacing: "-0.5px", margin: "0 0 6px" }}>Catatan Kodo</h1>
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", letterSpacing: "4px", fontFamily: "monospace" }}>PUASA</span>
            </div>
            <label style={{ display: "block", color: "rgba(255,255,255,0.45)", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "10px", fontFamily: "monospace" }}>
              Berapa hari kodo puasamu?
            </label>
            <div style={{ display: "flex", gap: "10px" }}>
              <input type="number" min="1" max="365" value={inputValue}
                onChange={e => { setInputValue(e.target.value); setInputError("") }}
                onKeyDown={e => e.key === "Enter" && handleStart()}
                placeholder="contoh: 30"
                style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: `1px solid ${inputError ? "rgba(252,100,100,0.5)" : "rgba(255,255,255,0.1)"}`, borderRadius: "14px", color: "#fff", fontSize: "20px", fontWeight: "600", padding: "16px 20px", outline: "none", fontFamily: "monospace" }}
                onFocus={e => e.target.style.borderColor = "rgba(192,132,252,0.5)"}
                onBlur={e => e.target.style.borderColor = inputError ? "rgba(252,100,100,0.5)" : "rgba(255,255,255,0.1)"}
              />
              <motion.button onClick={handleStart} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                style={{ background: "linear-gradient(135deg, #c084fc, #f59e0b)", border: "none", borderRadius: "14px", color: "#0a0a0f", fontSize: "20px", fontWeight: "800", padding: "16px 22px", cursor: "pointer" }}>→</motion.button>
            </div>
            <AnimatePresence>
              {inputError && (
                <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ color: "rgba(252,100,100,0.8)", fontSize: "12px", margin: "8px 0 0", fontFamily: "monospace" }}>⚠ {inputError}</motion.p>
              )}
            </AnimatePresence>
            <p style={{ color: "rgba(255,255,255,0.15)", fontSize: "12px", textAlign: "center", marginTop: "32px", fontFamily: "monospace", letterSpacing: "0.5px" }}>
              1 ceklis per hari · 1 – 365 hari
            </p>
          </motion.div>
        )}

        {/* ══ TRACKER ══ */}
        {step === "tracker" && (
          <motion.div key="tracker" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ ...cardStyle, padding: "40px 36px", maxHeight: "90vh", overflowY: "auto", scrollbarWidth: "none" }}>

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
              <div>
                <div style={{ fontSize: "26px", marginBottom: "4px" }}>☽</div>
                <h1 style={{ color: "#fff", fontSize: "20px", fontWeight: "700", letterSpacing: "-0.5px", margin: "0 0 2px" }}>Catatan Kodo</h1>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", letterSpacing: "3px", fontFamily: "monospace" }}>PUASA · {data.length} HARI</span>
              </div>
              <motion.button onClick={handleReset} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", color: "rgba(255,255,255,0.4)", fontSize: "11px", fontFamily: "monospace", letterSpacing: "1px", padding: "8px 14px", cursor: "pointer", marginTop: "4px" }}>
                ← RESET
              </motion.button>
            </div>

            {/* Status banner */}
            <AnimatePresence mode="wait">
              {allDone ? null
                : alreadyCheckedToday ? (
                  <motion.div key="locked" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ marginBottom: "20px", padding: "14px 16px", background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.18)", borderRadius: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "18px" }}>🔒</span>
                    <div>
                      <div style={{ color: "#f59e0b", fontSize: "12px", fontWeight: "700" }}>Sudah diceklis hari ini</div>
                      <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", fontFamily: "monospace", marginTop: "2px" }}>Kembali lagi besok untuk centang berikutnya</div>
                    </div>
                  </motion.div>
                ) : nextItem ? (
                  <motion.div key="available" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ marginBottom: "20px", padding: "14px 16px", background: "rgba(192,132,252,0.07)", border: "1px solid rgba(192,132,252,0.2)", borderRadius: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "18px" }}>✨</span>
                    <div>
                      <div style={{ color: "#c084fc", fontSize: "12px", fontWeight: "700" }}>Giliran hari ini!</div>
                      <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", fontFamily: "monospace", marginTop: "2px" }}>Tap Day {nextItem.id} untuk ceklis hari ini</div>
                    </div>
                  </motion.div>
                ) : null
              }
            </AnimatePresence>

            {/* Progress ring */}
            <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "24px", padding: "20px", background: "rgba(255,255,255,0.03)", borderRadius: "18px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ position: "relative", width: 72, height: 72, flexShrink: 0 }}>
                <svg width="72" height="72" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="5" />
                  <motion.circle cx="36" cy="36" r="30" fill="none" stroke="url(#grad)" strokeWidth="5" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 30}`}
                    animate={{ strokeDashoffset: 2 * Math.PI * 30 * (1 - progress / 100) }}
                    transition={{ duration: 0.6, ease: "easeOut" }} />
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#c084fc" /><stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                  </defs>
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "15px", fontWeight: "700" }}>{Math.round(progress)}%</div>
              </div>
              <div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "4px" }}>Progress</div>
                <div style={{ color: "#fff", fontSize: "28px", fontWeight: "700", lineHeight: 1 }}>
                  {totalDone} <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "16px", fontWeight: "400" }}>/ {data.length}</span>
                </div>
                <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px", marginTop: "2px" }}>Hari Selesai</div>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ height: "3px", background: "rgba(255,255,255,0.07)", borderRadius: "99px", marginBottom: "20px", overflow: "hidden" }}>
              <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.6, ease: "easeOut" }}
                style={{ height: "100%", background: "linear-gradient(90deg, #c084fc, #f59e0b)", borderRadius: "99px" }} />
            </div>

            {/* Day list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {data.map((item, idx) => {
                const isNext = item.id === nextItem?.id
                const isPast = item.id < (nextItem?.id ?? data.length + 1)
                const isFuture = !item.done && !isNext
                const isLastDone = item.done && [...data].reverse().find(d => d.done)?.id === item.id
                const canUncheck = isLastDone
                const clickable = (!item.done && isNext && !alreadyCheckedToday) || (item.done && canUncheck)

                return (
                  <motion.button key={item.id}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(idx * 0.03, 0.5), duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => clickable && handleCheck(item.id)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "14px 18px",
                      background: item.done
                        ? "rgba(192,132,252,0.09)"
                        : isNext && !alreadyCheckedToday
                          ? "rgba(192,132,252,0.04)"
                          : "rgba(255,255,255,0.02)",
                      border: `1px solid ${
                        item.done ? "rgba(192,132,252,0.25)"
                        : isNext && !alreadyCheckedToday ? "rgba(192,132,252,0.18)"
                        : "rgba(255,255,255,0.05)"}`,
                      borderRadius: "14px",
                      cursor: clickable ? "pointer" : "default",
                      opacity: isFuture ? 0.28 : 1,
                      outline: "none", textAlign: "left", transition: "all 0.2s ease",
                    }}
                    whileHover={clickable ? { scale: 1.01 } : {}}
                    whileTap={clickable ? { scale: 0.98 } : {}}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      {/* Day label */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "36px" }}>
                        <span style={{ color: "rgba(255,255,255,0.18)", fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.5px", lineHeight: 1 }}>DAY</span>
                        <span style={{
                          color: item.done ? "#c084fc" : isNext && !alreadyCheckedToday ? "#c084fc" : "rgba(255,255,255,0.25)",
                          fontSize: "17px", fontWeight: "700", fontFamily: "monospace", lineHeight: 1.1,
                          transition: "color 0.2s",
                        }}>
                          {item.id}
                        </span>
                      </div>

                      {/* Divider */}
                      <div style={{ width: "1px", height: "28px", background: item.done ? "rgba(192,132,252,0.2)" : "rgba(255,255,255,0.06)", flexShrink: 0 }} />

                      {/* Status text */}
                      <div>
                        {isNext && !alreadyCheckedToday && (
                          <div style={{ display: "inline-block", background: "rgba(192,132,252,0.18)", color: "#c084fc", fontSize: "9px", fontFamily: "monospace", letterSpacing: "1.5px", padding: "2px 7px", borderRadius: "99px", marginBottom: "3px", fontWeight: "700" }}>
                            HARI INI
                          </div>
                        )}
                        {alreadyCheckedToday && !item.done && !isFuture && (
                          <div style={{ display: "inline-block", background: "rgba(245,158,11,0.12)", color: "rgba(245,158,11,0.6)", fontSize: "9px", fontFamily: "monospace", letterSpacing: "1.5px", padding: "2px 7px", borderRadius: "99px", marginBottom: "3px", fontWeight: "700" }}>
                            BESOK
                          </div>
                        )}
                        <div style={{
                          color: item.done ? "#fff" : isFuture ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.7)",
                          fontSize: "14px", fontWeight: item.done ? "600" : "400", lineHeight: 1,
                        }}>
                          {item.done ? "Selesai" : isNext ? "Belum diceklis" : "Menunggu giliran"}
                        </div>
                      </div>
                    </div>

                    {/* Right indicator */}
                    <AnimatePresence mode="wait">
                      {item.done ? (
                        <motion.div key="done"
                          initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 25 }}
                          style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #c084fc, #f59e0b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", color: "#0a0a0f", fontWeight: "800", flexShrink: 0 }}>✓</motion.div>
                      ) : isFuture ? (
                        <div style={{ width: "28px", height: "28px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.05)", flexShrink: 0 }} />
                      ) : alreadyCheckedToday ? (
                        <div style={{ width: "28px", height: "28px", borderRadius: "50%", border: "1.5px solid rgba(245,158,11,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span style={{ fontSize: "11px" }}>🔒</span>
                        </div>
                      ) : (
                        <motion.div key="undone" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                          style={{ width: "28px", height: "28px", borderRadius: "50%", border: "2px solid rgba(192,132,252,0.35)", flexShrink: 0 }} />
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
                  style={{ marginTop: "24px", padding: "16px", background: "linear-gradient(135deg, rgba(192,132,252,0.12), rgba(245,158,11,0.08))", border: "1px solid rgba(192,132,252,0.25)", borderRadius: "14px", textAlign: "center", color: "#c084fc", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                  🌙 Alhamdulillah! Semua {data.length} hari selesai · Tap untuk lihat 🎉
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}