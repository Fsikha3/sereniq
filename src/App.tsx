item.value}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Nav */}
        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 420, background: "rgba(13,13,26,0.97)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", padding: "12px 0 24px" }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 20 }}>{tab.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.5, color: activeTab === tab.id ? "#00D4AA" : "rgba(255,255,255,0.3)", transition: "color 0.2s" }}>{tab.label}</span>
              {activeTab === tab.id && <div style={{ width: 4, height: 4, borderRadius: 99, background: "#00D4AA", boxShadow: "0 0 8px #00D4AA" }} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
