import React, { useState, useEffect } from "react";
import { getDailyAffirmation, analyzeFoodMood, MoodAnalysis } from "./services/geminiService";

const SERENIQ_DATA = {
  user: "Arjun",
  date: "SUNDAY, MAR 1",
  mindScore: 84,
  stressLevel: { value: 112, unit: "bpm", status: "ELEVATED" },
  protocols: [
    { id: 1, title: "Morning Meditation", duration: "10 min", icon: "🧘", status: "done" },
    { id: 2, title: "Breathing Exercise", duration: "5 min", icon: "🌬️", status: "pending" },
    { id: 3, title: "Gratitude Journal", duration: "7 min", icon: "📓", status: "pending" },
    { id: 4, title: "Evening Walk", duration: "20 min", icon: "🚶", status: "pending" },
  ],
  insights: [
    { label: "Sleep Quality", value: 76, color: "#00D4AA" },
    { label: "Focus Level", value: 88, color: "#6C3FC5" },
    { label: "Anxiety Index", value: 42, color: "#4A90D9" },
    { label: "Mood Balance", value: 91, color: "#F59E0B" },
  ],
  moods: ["😌", "😊", "😐", "😔", "😤"],
};

function CircleScore({ score, size = 120 }: { score: number; size?: number }) {
  const [animated, setAnimated] = useState(0);
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (animated / 100) * circumference;

  useEffect(() => {
    let start = 0;
    const timer = setInterval(() => {
      start += 2;
      if (start >= score) { setAnimated(score); clearInterval(timer); }
      else setAnimated(start);
    }, 15);
    return () => clearInterval(timer);
  }, [score]);

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
        <circle
          cx={size/2} cy={size/2} r={radius} fill="none"
          stroke="url(#scoreGrad)" strokeWidth="8"
          strokeDasharray={`${strokeDash} ${circumference}`}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00D4AA" />
            <stop offset="100%" stopColor="#6C3FC5" />
          </linearGradient>
        </defs>
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center"
      }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>{animated}</span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", letterSpacing: 2, textTransform: "uppercase" }}>score</span>
      </div>
    </div>
  );
}

function MiniChart() {
  const points = [30, 45, 35, 55, 42, 60, 50, 65, 48, 70];
  const w = 80, h = 36;
  const max = Math.max(...points), min = Math.min(...points);
  const toX = (i: number) => (i / (points.length - 1)) * w;
  const toY = (v: number) => h - ((v - min) / (max - min)) * h;
  const d = points.map((v, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(v)}`).join(" ");

  return (
    <svg width={w} height={h}>
      <defs>
        <linearGradient id="chartGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF6B6B" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FF6B6B" />
        </linearGradient>
      </defs>
      <path d={d} fill="none" stroke="url(#chartGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface BarInsightProps {
  label: string;
  value: number;
  color: string;
}

const BarInsight: React.FC<BarInsightProps> = ({ label, value, color }) => {
  const [w, setW] = useState(0);
  useEffect(() => { setTimeout(() => setW(value), 200); }, [value]);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: "'DM Sans', sans-serif" }}>{label}</span>
        <span style={{ fontSize: 12, color, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>{value}%</span>
      </div>
      <div style={{ height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${w}%`, background: color,
          borderRadius: 99, transition: "width 1s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: `0 0 8px ${color}88`
        }} />
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [protocols, setProtocols] = useState(SERENIQ_DATA.protocols);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [affirmation, setAffirmation] = useState("Your mind is your greatest asset. Protect it.");
  const [showLegal, setShowLegal] = useState<string | null>(null);
  const [foodInput, setFoodInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<MoodAnalysis | null>(null);

  useEffect(() => {
    const accepted = localStorage.getItem("sereniq_disclaimer_accepted");
    if (!accepted) setShowDisclaimer(true);
  }, []);

  useEffect(() => {
    if (selectedMood !== null) {
      const moodText = ["Depressed", "Anxious", "Neutral", "Happy", "Energetic"][selectedMood];
      getDailyAffirmation(moodText).then(setAffirmation).catch(console.error);
    }
  }, [selectedMood]);

  const acceptDisclaimer = () => {
    localStorage.setItem("sereniq_disclaimer_accepted", "true");
    setShowDisclaimer(false);
  };

  const toggleProtocol = (id: number) => {
    setProtocols(p => p.map(x => x.id === id ? { ...x, status: x.status === "done" ? "pending" : "done" } : x));
  };

  const tabs = [
    { id: "home", icon: "⚡", label: "Home" },
    { id: "scan", icon: "🔍", label: "Scan" },
    { id: "insights", icon: "📊", label: "Insights" },
    { id: "protocols", icon: "🛡️", label: "Protocols" },
    { id: "profile", icon: "👤", label: "Profile" },
  ];

  const handleAnalyzeFood = async () => {
    if (!foodInput.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await analyzeFoodMood(foodInput);
      setAnalysis(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0A0A14", fontFamily: "'DM Sans', sans-serif",
      display: "flex", justifyContent: "center", alignItems: "flex-start",
      padding: "0"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

      {/* Phone frame */}
      <div style={{
        width: "100%", maxWidth: 420, minHeight: "100vh",
        background: "#0D0D1A", position: "relative", overflow: "hidden",
        paddingBottom: 80
      }}>

        {/* Background glow */}
        <div style={{
          position: "absolute", top: -80, left: -80, width: 300, height: 300,
          background: "radial-gradient(circle, rgba(108,63,197,0.15) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute", top: 100, right: -60, width: 200, height: 200,
          background: "radial-gradient(circle, rgba(0,212,170,0.08) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />

        {/* Header */}
        <div style={{ padding: "52px 24px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: "linear-gradient(135deg, #6C3FC5, #4A90D9)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, boxShadow: "0 4px 20px rgba(108,63,197,0.4)"
            }}>👤</div>
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 2, textTransform: "uppercase" }}>
                {SERENIQ_DATA.date}
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: "'Syne', sans-serif", lineHeight: 1.2 }}>
                Good Afternoon,<br />{SERENIQ_DATA.user}
              </div>
            </div>
          </div>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, cursor: "pointer"
          }}>🔔</div>
        </div>

        {/* HOME TAB */}
        {activeTab === "home" && (
          <div style={{ padding: "0 24px" }}>

            {/* Mind Balance Card */}
            <div style={{
              background: "linear-gradient(135deg, rgba(108,63,197,0.3), rgba(74,144,217,0.2))",
              border: "1px solid rgba(108,63,197,0.3)",
              borderRadius: 24, padding: "20px 24px",
              backdropFilter: "blur(20px)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: 16,
              boxShadow: "0 8px 32px rgba(108,63,197,0.2)"
            }}>
              <div>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <span style={{
                    background: "rgba(108,63,197,0.4)", color: "#A78BFA",
                    fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99,
                    letterSpacing: 1, textTransform: "uppercase"
                  }}>NEURAL</span>
                  <span style={{
                    background: "rgba(0,212,170,0.15)", color: "#00D4AA",
                    fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99,
                    letterSpacing: 1, textTransform: "uppercase"
                  }}>WELLNESS</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: "'Syne', sans-serif", marginBottom: 4 }}>
                  Mind Balance
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Your mental clarity is high</div>
                <div style={{
                  marginTop: 12, display: "flex", alignItems: "center", gap: 6,
                  color: "#00D4AA", fontWeight: 700, fontSize: 13
                }}>
                  <span>⚡</span> INNER PEACE
                </div>
              </div>
              <CircleScore score={84} />
            </div>

            {/* Stress Level Card */}
            <div style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 20, padding: "18px 20px",
              marginBottom: 16,
              display: "flex", alignItems: "center", justifyContent: "space-between"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 14,
                  background: "rgba(255,107,107,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20
                }}>💓</div>
                <div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>
                    STRESS LEVEL
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span style={{ fontSize: 28, fontWeight: 800, color: "#fff", fontFamily: "'Syne', sans-serif" }}>
                      {SERENIQ_DATA.stressLevel.value}
                    </span>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                      {SERENIQ_DATA.stressLevel.unit}
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                <span style={{
                  background: "rgba(255,107,107,0.15)", color: "#FF6B6B",
                  fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 99, letterSpacing: 1
                }}>ELEVATED</span>
                <MiniChart />
              </div>
            </div>

            {/* Mood Check */}
            <div style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 20, padding: "18px 20px", marginBottom: 16
            }}>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 12, letterSpacing: 1, textTransform: "uppercase" }}>
                How are you feeling?
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                {SERENIQ_DATA.moods.map((m, i) => (
                  <button key={i} onClick={() => setSelectedMood(i)} style={{
                    width: 52, height: 52, borderRadius: 16, border: "none", cursor: "pointer",
                    background: selectedMood === i
                      ? "linear-gradient(135deg, rgba(108,63,197,0.5), rgba(0,212,170,0.3))"
                      : "rgba(255,255,255,0.06)",
                    fontSize: 24, transition: "all 0.2s",
                    transform: selectedMood === i ? "scale(1.15)" : "scale(1)",
                    boxShadow: selectedMood === i ? "0 4px 20px rgba(108,63,197,0.4)" : "none"
                  }}>{m}</button>
                ))}
              </div>
              {selectedMood !== null && (
                <div style={{
                  background: "rgba(108,63,197,0.1)", border: "1px solid rgba(108,63,197,0.2)",
                  borderRadius: 12, padding: "12px", textAlign: "center", animation: "fadeIn 0.5s ease"
                }}>
                  <div style={{ fontSize: 11, color: "#A78BFA", fontWeight: 700, marginBottom: 4, textTransform: "uppercase" }}>Daily Affirmation</div>
                  <div style={{ fontSize: 14, color: "#fff", fontStyle: "italic" }}>"{affirmation}"</div>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[
                { icon: "🧘", label: "Meditations", value: "12", sub: "this week" },
                { icon: "💤", label: "Sleep", value: "7.5h", sub: "last night" },
              ].map((s, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 18, padding: "16px"
                }}>
                  <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", fontFamily: "'Syne', sans-serif" }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SCAN TAB */}
        {activeTab === "scan" && (
          <div style={{ padding: "0 24px" }}>
            <div style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 24, padding: "24px", marginBottom: 16
            }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "'Syne', sans-serif", marginBottom: 16 }}>
                Food Impact Analysis
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                <input
                  type="text"
                  value={foodInput}
                  onChange={(e) => setFoodInput(e.target.value)}
                  placeholder="What did you eat?"
                  style={{
                    flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12, padding: "12px 16px", color: "#fff", fontSize: 14, outline: "none"
                  }}
                />
                <button
                  onClick={handleAnalyzeFood}
                  disabled={isAnalyzing}
                  style={{
                    background: "linear-gradient(135deg, #6C3FC5, #4A90D9)",
                    border: "none", borderRadius: 12, padding: "0 16px", color: "#fff",
                    fontWeight: 700, cursor: "pointer", opacity: isAnalyzing ? 0.6 : 1
                  }}
                >
                  {isAnalyzing ? "..." : "Analyze"}
                </button>
              </div>

              {analysis && (
                <div style={{ animation: "fadeIn 0.5s ease" }}>
                  <div style={{
                    background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: 16, marginBottom: 16
                  }}>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 12 }}>Neurotransmitter Impact</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Serotonin</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: "#00D4AA" }}>{analysis.serotonin > 0 ? "+" : ""}{analysis.serotonin}</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Dopamine</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: "#6C3FC5" }}>{analysis.dopamine > 0 ? "+" : ""}{analysis.dopamine}</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 14, color: "#fff", lineHeight: 1.5, marginBottom: 16 }}>
                    {analysis.summary}
                  </div>
                  {analysis.alternatives.length > 0 && (
                    <div>
                      <div style={{ fontSize: 12, color: "#F59E0B", fontWeight: 700, marginBottom: 8 }}>Better Alternatives:</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {analysis.alternatives.map((alt, i) => (
                          <span key={i} style={{
                            background: "rgba(245,158,11,0.1)", color: "#F59E0B",
                            fontSize: 11, padding: "4px 10px", borderRadius: 99, border: "1px solid rgba(245,158,11,0.2)"
                          }}>{alt}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* INSIGHTS TAB */}
        {activeTab === "insights" && (
          <div style={{ padding: "0 24px" }}>
            <div style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 24, padding: "24px", marginBottom: 16
            }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "'Syne', sans-serif", marginBottom: 20 }}>
                Mental Health Metrics
              </div>
              {SERENIQ_DATA.insights.map((ins, i) => (
                <BarInsight key={i} label={ins.label} value={ins.value} color={ins.color} />
              ))}
            </div>

            <div style={{
              background: "linear-gradient(135deg, rgba(0,212,170,0.1), rgba(108,63,197,0.1))",
              border: "1px solid rgba(0,212,170,0.2)",
              borderRadius: 20, padding: "20px", textAlign: "center"
            }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🌟</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "'Syne', sans-serif" }}>
                Great Progress!
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>
                Your mood balance is up 15% this week
              </div>
            </div>
          </div>
        )}

        {/* PROTOCOLS TAB */}
        {activeTab === "protocols" && (
          <div style={{ padding: "0 24px" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "'Syne', sans-serif", marginBottom: 16 }}>
              Core Protocols
            </div>
            {protocols.map(p => (
              <div key={p.id} onClick={() => toggleProtocol(p.id)} style={{
                background: p.status === "done"
                  ? "rgba(0,212,170,0.08)"
                  : "rgba(255,255,255,0.04)",
                border: `1px solid ${p.status === "done" ? "rgba(0,212,170,0.3)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: 18, padding: "16px 20px", marginBottom: 12,
                display: "flex", alignItems: "center", gap: 14, cursor: "pointer",
                transition: "all 0.3s"
              }}>
                <div style={{ fontSize: 24 }}>{p.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 15, fontWeight: 600,
                    color: p.status === "done" ? "#00D4AA" : "#fff",
                    textDecoration: p.status === "done" ? "line-through" : "none"
                  }}>{p.title}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{p.duration}</div>
                </div>
                <div style={{
                  width: 28, height: 28, borderRadius: 99,
                  background: p.status === "done" ? "#00D4AA" : "rgba(255,255,255,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, transition: "all 0.3s"
                }}>
                  {p.status === "done" ? "✓" : "○"}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div style={{ padding: "0 24px" }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{
                width: 80, height: 80, borderRadius: 26, margin: "0 auto 12px",
                background: "linear-gradient(135deg, #6C3FC5, #4A90D9)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 36, boxShadow: "0 8px 32px rgba(108,63,197,0.4)"
              }}>👤</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: "'Syne', sans-serif" }}>
                {SERENIQ_DATA.user}
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                SERENIQ Premium Member
              </div>
            </div>
            {[
              { icon: "🎯", label: "Daily Goal", value: "20 min mindfulness" },
              { icon: "🏆", label: "Streak", value: "7 days" },
              { icon: "📅", label: "Member since", value: "Jan 2026" },
            ].map((item, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16, padding: "14px 18px", marginBottom: 10,
                display: "flex", alignItems: "center", gap: 14
              }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1 }}>{item.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{item.value}</div>
                </div>
              </div>
            ))}

            <div style={{ marginTop: 24, display: "flex", justifyContent: "center", gap: 16 }}>
              <button onClick={() => setShowLegal("privacy")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 11, cursor: "pointer" }}>Privacy Policy</button>
              <button onClick={() => setShowLegal("terms")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 11, cursor: "pointer" }}>Terms of Service</button>
            </div>
          </div>
        )}

        {/* Modals */}
        {(showDisclaimer || showLegal) && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 100,
            background: "rgba(10,10,20,0.9)", backdropFilter: "blur(10px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 24
          }}>
            <div style={{
              background: "#16162A", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 24, padding: 32, maxWidth: 340, width: "100%",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
            }}>
              {showDisclaimer ? (
                <>
                  <div style={{ fontSize: 40, marginBottom: 16, textAlign: "center" }}>🛡️</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 12, textAlign: "center", fontFamily: "'Syne', sans-serif" }}>
                    Medical Disclaimer
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: 24 }}>
                    SERENIQ is a wellness tool, not a medical device. AI insights are for informational purposes only. Always consult a healthcare professional before making health decisions.
                  </div>
                  <button onClick={acceptDisclaimer} style={{
                    width: "100%", padding: "14px", borderRadius: 16, border: "none",
                    background: "linear-gradient(135deg, #6C3FC5, #4A90D9)",
                    color: "#fff", fontWeight: 700, cursor: "pointer"
                  }}>I Understand</button>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 12, fontFamily: "'Syne', sans-serif" }}>
                    {showLegal === "privacy" ? "Privacy Policy" : "Terms of Service"}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxHeight: 300, overflowY: "auto", marginBottom: 24 }}>
                    {showLegal === "privacy" ? (
                      "Your privacy is important to us. We collect minimal data to provide personalized wellness insights. Your health data is encrypted and never sold to third parties. We use industry-standard security measures to protect your information."
                    ) : (
                      "By using SERENIQ, you agree to our terms. This app is for personal wellness tracking only. We are not responsible for any health outcomes. Users must be 18+ or have parental consent. Subscription fees are non-refundable."
                    )}
                  </div>
                  <button onClick={() => setShowLegal(null)} style={{
                    width: "100%", padding: "12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.05)",
                    color: "#fff", fontWeight: 600, cursor: "pointer"
                  }}>Close</button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Bottom Nav */}
        <div style={{
          position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: 420,
          background: "rgba(13,13,26,0.95)", backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "flex", padding: "12px 0 24px"
        }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex: 1, background: "none", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4
            }}>
              <span style={{ fontSize: 20 }}>{tab.icon}</span>
              <span style={{
                fontSize: 10, fontWeight: 600, letterSpacing: 0.5,
                color: activeTab === tab.id ? "#00D4AA" : "rgba(255,255,255,0.3)",
                transition: "color 0.2s"
              }}>{tab.label}</span>
              {activeTab === tab.id && (
                <div style={{
                  width: 4, height: 4, borderRadius: 99,
                  background: "#00D4AA",
                  boxShadow: "0 0 8px #00D4AA"
                }} />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
