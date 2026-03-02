import React, { useState, useEffect } from "react";
import { getDailyAffirmation, analyzeFoodMood, MoodAnalysis } from "./services/geminiService";

const MOODFOOD_DATA = {
  user: "Arjun",
  date: "MONDAY, MAR 2",
  gutBrainScore: 78,
  stressLevel: { value: 65, unit: "bpm", status: "OPTIMAL" },
  recentMeals: [
    { id: 1, name: "Rajma Chawal + Dahi", impact: 8, tags: ["Probiotic", "Prebiotic"], time: "Lunch" },
    { id: 2, name: "Masala Chai", impact: -2, tags: ["Caffeine"], time: "Evening" },
  ],
  insights: [
    { label: "Serotonin level", value: 68, color: "#00D4AA" },
    { label: "Gut Diversity", value: 82, color: "#6C3FC5" },
    { label: "Stress Resilience", value: 74, color: "#4A90D9" },
    { label: "Anti-Inflammatory", value: 55, color: "#F59E0B" },
  ],
  emotions: [
    { label: "Happy", icon: "😊" },
    { label: "Calm", icon: "😌" },
    { label: "Anxious", icon: "😰" },
    { label: "Stressed", icon: "😫" },
    { label: "Low", icon: "😔" },
    { label: "Irritable", icon: "😠" },
    { label: "Fatigue", icon: "😴" },
    { label: "Energised", icon: "⚡" },
  ],
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
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [affirmation, setAffirmation] = useState("Your gut is your second brain. Feed it right.");
  const [showLegal, setShowLegal] = useState<string | null>(null);
  const [foodInput, setFoodInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<MoodAnalysis | null>(null);

  useEffect(() => {
    const accepted = localStorage.getItem("moodfood_disclaimer_accepted");
    if (!accepted) setShowDisclaimer(true);
  }, []);

  useEffect(() => {
    if (selectedMood !== null) {
      getDailyAffirmation(selectedMood).then(setAffirmation).catch(console.error);
    }
  }, [selectedMood]);

  const acceptDisclaimer = () => {
    localStorage.setItem("moodfood_disclaimer_accepted", "true");
    setShowDisclaimer(false);
  };

  const tabs = [
    { id: "home", icon: "🏠", label: "Home" },
    { id: "mood", icon: "🧠", label: "Mood" },
    { id: "meals", icon: "🍲", label: "Meals" },
    { id: "stress", icon: "📉", label: "Stress" },
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
            }}>🧠</div>
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 2, textTransform: "uppercase" }}>
                {MOODFOOD_DATA.date}
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: "'Syne', sans-serif", lineHeight: 1.2 }}>
                MoodFood × StressGut
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

            {/* Gut-Brain Score Card */}
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
                  }}>GUT-BRAIN</span>
                  <span style={{
                    background: "rgba(0,212,170,0.15)", color: "#00D4AA",
                    fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99,
                    letterSpacing: 1, textTransform: "uppercase"
                  }}>AXIS</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: "'Syne', sans-serif", marginBottom: 4 }}>
                  Gut-Brain Score
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Your second brain is healthy</div>
                <div style={{
                  marginTop: 12, display: "flex", alignItems: "center", gap: 6,
                  color: "#00D4AA", fontWeight: 700, fontSize: 13
                }}>
                  <span>⚡</span> {MOODFOOD_DATA.gutBrainScore > 70 ? "OPTIMAL STATE" : "NEEDS CARE"}
                </div>
              </div>
              <CircleScore score={MOODFOOD_DATA.gutBrainScore} />
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
                }}>📉</div>
                <div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>
                    STRESS LEVEL
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span style={{ fontSize: 28, fontWeight: 800, color: "#fff", fontFamily: "'Syne', sans-serif" }}>
                      {MOODFOOD_DATA.stressLevel.value}
                    </span>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                      {MOODFOOD_DATA.stressLevel.unit}
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                <span style={{
                  background: "rgba(0,212,170,0.15)", color: "#00D4AA",
                  fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 99, letterSpacing: 1
                }}>{MOODFOOD_DATA.stressLevel.status}</span>
                <MiniChart />
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 18, padding: "16px"
              }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>🍌</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1 }}>Serotonin Foods</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", fontFamily: "'Syne', sans-serif" }}>65%</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>of daily target</div>
              </div>
              <div style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 18, padding: "16px"
              }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>🔥</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1 }}>Day Streak</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", fontFamily: "'Syne', sans-serif" }}>14</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Gut Guru status</div>
              </div>
            </div>

            {/* Today's Food Log */}
            <div style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 20, padding: "18px 20px", marginBottom: 16
            }}>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 12, letterSpacing: 1, textTransform: "uppercase" }}>
                Today's Food Log
              </div>
              {MOODFOOD_DATA.recentMeals.map(meal => (
                <div key={meal.id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)"
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{meal.name}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                      {meal.tags.map((tag, i) => (
                        <span key={i} style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: 4 }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: meal.impact > 0 ? "#00D4AA" : "#FF6B6B" }}>
                      {meal.impact > 0 ? "+" : ""}{meal.impact}
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{meal.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MOOD TAB */}
        {activeTab === "mood" && (
          <div style={{ padding: "0 24px" }}>
            <div style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 24, padding: "24px", marginBottom: 16
            }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "'Syne', sans-serif", marginBottom: 16 }}>
                Daily Mood Check-in
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
                {MOODFOOD_DATA.emotions.map((emo, i) => (
                  <button key={i} onClick={() => setSelectedMood(emo.label)} style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                    background: selectedMood === emo.label ? "rgba(108,63,197,0.2)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${selectedMood === emo.label ? "#6C3FC5" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 16, padding: "12px 8px", cursor: "pointer", transition: "all 0.2s"
                  }}>
                    <span style={{ fontSize: 24 }}>{emo.icon}</span>
                    <span style={{ fontSize: 10, color: selectedMood === emo.label ? "#fff" : "rgba(255,255,255,0.5)", fontWeight: 600 }}>{emo.label}</span>
                  </button>
                ))}
              </div>
              {selectedMood && (
                <div style={{
                  background: "rgba(108,63,197,0.1)", border: "1px solid rgba(108,63,197,0.2)",
                  borderRadius: 12, padding: "16px", textAlign: "center", animation: "fadeIn 0.5s ease"
                }}>
                  <div style={{ fontSize: 11, color: "#A78BFA", fontWeight: 700, marginBottom: 4, textTransform: "uppercase" }}>Gut-Brain Affirmation</div>
                  <div style={{ fontSize: 14, color: "#fff", fontStyle: "italic" }}>"{affirmation}"</div>
                </div>
              )}
            </div>

            <div style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 24, padding: "24px", marginBottom: 16
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: 16, textTransform: "uppercase" }}>
                7-Day Mood Score
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: 100, padding: "0 10px" }}>
                {[65, 72, 58, 84, 76, 91, 78].map((val, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <div style={{
                      width: 12, height: `${val}%`, background: i === 6 ? "#00D4AA" : "rgba(255,255,255,0.1)",
                      borderRadius: 4, transition: "height 1s ease"
                    }} />
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{["M", "T", "W", "T", "F", "S", "S"][i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MEALS TAB */}
        {activeTab === "meals" && (
          <div style={{ padding: "0 24px" }}>
            <div style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 24, padding: "24px", marginBottom: 16
            }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "'Syne', sans-serif", marginBottom: 16 }}>
                Serotonin Meal Plan
              </div>
              <div style={{
                background: "rgba(0,212,170,0.1)", border: "1px solid rgba(0,212,170,0.2)",
                borderRadius: 16, padding: "16px", marginBottom: 20
              }}>
                <div style={{ fontSize: 12, color: "#00D4AA", fontWeight: 700, marginBottom: 4 }}>DID YOU KNOW?</div>
                <div style={{ fontSize: 13, color: "#fff", lineHeight: 1.4 }}>Your gut produces 95% of your serotonin. Feed it right to feel right.</div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { type: "BREAKFAST", name: "Ragi Porridge + Almonds", reason: "Finger millet = calcium + tryptophan" },
                  { type: "LUNCH", name: "Rajma Chawal + Dahi", reason: "Kidney beans = prebiotic; Curd = live cultures" },
                  { type: "SNACK", name: "Walnuts + Turmeric Milk", reason: "Curcumin increases BDNF brain growth factor" },
                  { type: "DINNER", name: "Palak Paneer + Jowar Roti", reason: "Spinach magnesium = serotonin + sleep support" },
                ].map((meal, i) => (
                  <div key={i} style={{
                    background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: 16, border: "1px solid rgba(255,255,255,0.05)"
                  }}>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>{meal.type}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{meal.name}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontStyle: "italic" }}>{meal.reason}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 24, padding: "24px", marginBottom: 16
            }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "'Syne', sans-serif", marginBottom: 16 }}>
                Analyze Any Food
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                <input
                  type="text"
                  value={foodInput}
                  onChange={(e) => setFoodInput(e.target.value)}
                  placeholder="e.g. Samosa, Idli, Dal..."
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
                  <div style={{ fontSize: 14, color: "#fff", lineHeight: 1.5, marginBottom: 16 }}>{analysis.summary}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div style={{ background: "rgba(255,255,255,0.03)", padding: 12, borderRadius: 12, textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>SEROTONIN</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#00D4AA" }}>{analysis.serotonin > 0 ? "+" : ""}{analysis.serotonin}</div>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.03)", padding: 12, borderRadius: 12, textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>DOPAMINE</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#6C3FC5" }}>{analysis.dopamine > 0 ? "+" : ""}{analysis.dopamine}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STRESS TAB */}
        {activeTab === "stress" && (
          <div style={{ padding: "0 24px" }}>
            <div style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 24, padding: "24px", marginBottom: 16
            }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "'Syne', sans-serif", marginBottom: 16 }}>
                StressGut Analysis
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
                <div style={{ fontSize: 48, fontWeight: 800, color: "#00D4AA", fontFamily: "'Syne', sans-serif" }}>LOW</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 2 }}>Current Stress Meter</div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 12 }}>4-Week Gut-Stress Heatmap</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
                  {Array.from({ length: 28 }).map((_, i) => {
                    const colors = ["#00D4AA", "#F59E0B", "#FF6B6B", "#00D4AA", "#00D4AA"];
                    const color = colors[Math.floor(Math.random() * colors.length)];
                    return (
                      <div key={i} style={{
                        aspectRatio: "1/1", borderRadius: 4,
                        background: color, opacity: 0.6 + Math.random() * 0.4
                      }} />
                    );
                  })}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 9, color: "rgba(255,255,255,0.3)" }}>
                  <span>4 weeks ago</span>
                  <span>Today</span>
                </div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 12 }}>Gut-Healing Tips</div>
                {[
                  "4-7-8 Breathing (vagus nerve reset)",
                  "Curd at every meal (live cultures)",
                  "Post-meal 10-min walk",
                  "Ashwagandha KSM-66 twice daily",
                ].map((tip, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                    <span style={{ color: "#00D4AA" }}>•</span> {tip}
                  </div>
                ))}
              </div>
            </div>
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
                {MOODFOOD_DATA.user}
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                Gut Guru • 14-Day Streak
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
              {[
                { label: "Avg Score", value: "72" },
                { label: "Streak", value: "14d" },
                { label: "Meals", value: "42" },
              ].map((stat, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.04)", padding: "12px", borderRadius: 16, textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{stat.value}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 20, padding: "8px", marginBottom: 24 }}>
              {[
                { icon: "🧪", label: "The Science", id: "science_link" },
                { icon: "📋", label: "Diet Preference", value: "Vegetarian" },
                { icon: "⌚", label: "Connect Wearable", value: "Fitbit" },
                { icon: "📄", label: "Export Doctor PDF", id: "export" },
              ].map((item, i) => (
                <div key={i} onClick={() => item.id === "science_link" && setActiveTab("science_hidden")} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "14px 16px", cursor: "pointer", borderBottom: i === 3 ? "none" : "1px solid rgba(255,255,255,0.05)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 18 }}>{item.icon}</span>
                    <span style={{ fontSize: 14, color: "#fff" }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{item.value || "→"}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 24 }}>
              <button onClick={() => setShowLegal("privacy")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 11, cursor: "pointer" }}>Privacy Policy</button>
              <button onClick={() => setShowLegal("terms")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 11, cursor: "pointer" }}>Terms of Service</button>
            </div>
          </div>
        )}

        {/* HIDDEN SCIENCE TAB (Accessed from Profile) */}
        {activeTab === "science_hidden" && (
          <div style={{ padding: "0 24px" }}>
            <button onClick={() => setActiveTab("profile")} style={{
              background: "rgba(255,255,255,0.05)", border: "none", color: "#fff",
              padding: "8px 16px", borderRadius: 12, marginBottom: 16, cursor: "pointer"
            }}>← Back to Profile</button>
            <div style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 24, padding: "24px", marginBottom: 16
            }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "'Syne', sans-serif", marginBottom: 16 }}>
                Nutritional Psychiatry
              </div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, marginBottom: 20 }}>
                The gut contains 500 million neurons — it is the body's "second brain". 95% of your serotonin is produced here.
              </div>

              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 12 }}>Psychobiotics Guide</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { strain: "L. rhamnosus", benefit: "Reduces cortisol", source: "Dahi / Curd" },
                  { strain: "B. longum", benefit: "Lowers anxiety", source: "Kefir, aged dahi" },
                  { strain: "L. helveticus", benefit: "Reduces depression", source: "Idli / Dosa" },
                ].map((item, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#6C3FC5" }}>{item.strain}</span>
                      <span style={{ fontSize: 12, color: "#00D4AA", fontWeight: 600 }}>{item.source}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{item.benefit}</div>
                  </div>
                ))}
              </div>
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
                    MoodFood × StressGut
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: 24 }}>
                    MoodFood is a nutritional psychiatry tool. AI insights are for informational purposes only. "Your gut is your second brain. Feed it right."
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
                      "By using MoodFood × StressGut, you agree to our terms. This app is for personal wellness tracking only. We are not responsible for any health outcomes. Users must be 18+ or have parental consent. Subscription fees are non-refundable."
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
