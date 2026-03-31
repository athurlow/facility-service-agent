import { useState, useEffect, useRef } from "react";

const SERVICE_CATEGORIES = [
  { id: "janitorial", name: "Janitorial Services", icon: "🧹" },
  { id: "floor_care", name: "Floor Care & Maintenance", icon: "🪣" },
  { id: "carpet_cleaning", name: "Carpet & Upholstery Cleaning", icon: "🧶" },
  { id: "window_washing", name: "Window Washing", icon: "🪟" },
  { id: "pressure_washing", name: "Pressure Washing", icon: "💦" },
  { id: "plumbing", name: "Plumbing Services", icon: "🔧" },
  { id: "electrical", name: "Electrical Services", icon: "⚡" },
  { id: "hvac", name: "HVAC Maintenance", icon: "❄️" },
  { id: "handyman", name: "Handyman Services", icon: "🔨" },
  { id: "parking_lot", name: "Parking Lot Maintenance", icon: "🅿️" },
  { id: "landscaping", name: "Landscaping & Grounds", icon: "🌿" },
  { id: "snow_removal", name: "Snow & Ice Removal", icon: "❄️" },
  { id: "pest_control", name: "Pest Control", icon: "🐛" },
  { id: "disinfection", name: "Disinfection & Sanitization", icon: "🧴" },
  { id: "kitchen_cleaning", name: "Commercial Kitchen Cleaning", icon: "🍳" },
  { id: "mold_remediation", name: "Mold Remediation", icon: "🔬" },
  { id: "concrete_repair", name: "Concrete Repair", icon: "🏗️" },
  { id: "painting", name: "Painting & Touch-Up", icon: "🎨" },
  { id: "lighting", name: "Lighting Maintenance", icon: "💡" },
  { id: "waste_management", name: "Waste Management", icon: "🗑️" },
  { id: "signage", name: "Signage & Wayfinding", icon: "🪧" },
  { id: "security_systems", name: "Security Systems", icon: "🔒" },
];

const CONTRACTORS = [
  { id: 1, name: "Midwest Pro Cleaning LLC", services: ["janitorial", "disinfection", "kitchen_cleaning"], rating: 4.8, jobs: 342, available: true, responseTime: "2 hrs", rate: "$$" },
  { id: 2, name: "FloorMasters KC", services: ["floor_care", "carpet_cleaning", "pressure_washing"], rating: 4.9, jobs: 218, available: true, responseTime: "4 hrs", rate: "$$$" },
  { id: 3, name: "Precision Plumbing & Pipe", services: ["plumbing", "concrete_repair"], rating: 4.7, jobs: 156, available: true, responseTime: "1 hr", rate: "$$$" },
  { id: 4, name: "Heartland Electric Co.", services: ["electrical", "lighting", "security_systems"], rating: 4.6, jobs: 203, available: false, responseTime: "3 hrs", rate: "$$" },
  { id: 5, name: "ComfortZone HVAC", services: ["hvac"], rating: 4.8, jobs: 189, available: true, responseTime: "2 hrs", rate: "$$$" },
  { id: 6, name: "HandyPro Services", services: ["handyman", "painting", "signage"], rating: 4.5, jobs: 412, available: true, responseTime: "Same day", rate: "$" },
  { id: 7, name: "GreenScape Grounds", services: ["landscaping", "snow_removal", "parking_lot"], rating: 4.7, jobs: 275, available: true, responseTime: "Next day", rate: "$$" },
  { id: 8, name: "SafeGuard Pest Solutions", services: ["pest_control", "mold_remediation"], rating: 4.9, jobs: 98, available: true, responseTime: "4 hrs", rate: "$$" },
  { id: 9, name: "Crystal Clear Windows", services: ["window_washing", "pressure_washing"], rating: 4.6, jobs: 167, available: true, responseTime: "Next day", rate: "$$" },
  { id: 10, name: "Metro Waste Solutions", services: ["waste_management"], rating: 4.4, jobs: 310, available: true, responseTime: "Same day", rate: "$" },
];

const FACILITIES = [
  { id: 1, name: "Midwest Corporate Plaza", address: "8900 Ward Pkwy, Kansas City, MO", sqft: "125,000", type: "Office Complex" },
  { id: 2, name: "Prairie Village Medical Center", address: "7300 Mission Rd, Prairie Village, KS", sqft: "68,000", type: "Medical Office" },
  { id: 3, name: "Olathe Distribution Center", address: "1500 E Kansas City Rd, Olathe, KS", sqft: "210,000", type: "Warehouse" },
  { id: 4, name: "Lenexa Town Center Retail", address: "8700 Penrose Ln, Lenexa, KS", sqft: "45,000", type: "Retail" },
  { id: 5, name: "Overland Park School District - Admin", address: "12300 Metcalf Ave, Overland Park, KS", sqft: "32,000", type: "Education" },
];

const UPCOMING_SERVICES = {
  1: [
    { service: "floor_care", date: "Apr 7, 2026", contractor: "FloorMasters KC" },
    { service: "window_washing", date: "Apr 12, 2026", contractor: "Crystal Clear Windows" },
  ],
  2: [
    { service: "disinfection", date: "Apr 5, 2026", contractor: "Midwest Pro Cleaning LLC" },
  ],
  3: [
    { service: "parking_lot", date: "Apr 8, 2026", contractor: "GreenScape Grounds" },
    { service: "pest_control", date: "Apr 10, 2026", contractor: "SafeGuard Pest Solutions" },
  ],
  4: [
    { service: "janitorial", date: "Apr 4, 2026", contractor: "Midwest Pro Cleaning LLC" },
  ],
  5: [],
};

// ─── AI Classification via Claude API ───────────────────────────────────────

const SYSTEM_PROMPT = `You are a facility service classification agent for City Wide Facility Solutions, the largest management company in the building maintenance industry. City Wide manages 20+ facility service types through independent contractors for commercial building owners and property managers.

Given a natural language description of a facility issue, you must:
1. Classify it into one or more service categories
2. Assess priority level
3. Generate a professional work order scope description

Available service categories (use these exact IDs):
janitorial, floor_care, carpet_cleaning, window_washing, pressure_washing, plumbing, electrical, hvac, handyman, parking_lot, landscaping, snow_removal, pest_control, disinfection, kitchen_cleaning, mold_remediation, concrete_repair, painting, lighting, waste_management, signage, security_systems

Respond ONLY with valid JSON (no markdown, no backticks, no preamble):
{
  "classifications": [
    {"service_id": "string", "confidence": 0.0-1.0, "reasoning": "brief explanation"}
  ],
  "priority": "Critical|High|Medium|Standard",
  "priority_reasoning": "why this priority level",
  "scope_description": "professional work order scope description suitable for a contractor",
  "estimated_duration": "e.g., 2-4 hours",
  "safety_notes": "any safety considerations or null"
}

Priority guidelines:
- Critical: Safety hazards, flooding, electrical dangers, structural risks
- High: Active leaks, broken systems, service outages affecting operations
- Medium: Wear and tear, cosmetic issues, scheduled maintenance gaps
- Standard: Routine requests, minor improvements, planned upgrades`;

async function classifyWithAI(description) {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: `Classify this facility service request:\n\n"${description}"` }],
      }),
    });
    const data = await response.json();
    const text = data.content?.map((c) => c.text || "").join("") || "";
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch (err) {
    console.error("AI classification failed, using fallback:", err);
    return null;
  }
}

// ─── Fallback keyword classifier (when API unavailable) ─────────────────────

const KEYWORD_MAP = {
  water: ["plumbing", "concrete_repair", "mold_remediation"],
  leak: ["plumbing", "concrete_repair"], pooling: ["plumbing", "concrete_repair", "pressure_washing"],
  flood: ["plumbing", "mold_remediation"], drain: ["plumbing"], pipe: ["plumbing"],
  faucet: ["plumbing", "handyman"], toilet: ["plumbing", "janitorial"],
  floor: ["floor_care", "carpet_cleaning", "concrete_repair"], carpet: ["carpet_cleaning"],
  stain: ["carpet_cleaning", "pressure_washing", "janitorial"], scuff: ["floor_care"],
  tile: ["floor_care", "handyman"], window: ["window_washing"], glass: ["window_washing", "handyman"],
  dirty: ["janitorial", "pressure_washing"], trash: ["waste_management", "janitorial"],
  garbage: ["waste_management"], smell: ["janitorial", "pest_control", "mold_remediation"],
  odor: ["janitorial", "mold_remediation"], mold: ["mold_remediation"], mildew: ["mold_remediation"],
  bug: ["pest_control"], pest: ["pest_control"], mouse: ["pest_control"], rat: ["pest_control"],
  roach: ["pest_control"], ant: ["pest_control"], light: ["lighting", "electrical"],
  bulb: ["lighting"], dark: ["lighting", "electrical"], flicker: ["lighting", "electrical"],
  outlet: ["electrical"], power: ["electrical"], wire: ["electrical"],
  hot: ["hvac"], cold: ["hvac"], heat: ["hvac"], ac: ["hvac"],
  temperature: ["hvac"], thermostat: ["hvac"], paint: ["painting"],
  wall: ["painting", "handyman"], crack: ["concrete_repair", "painting", "handyman"],
  hole: ["handyman", "concrete_repair"], door: ["handyman"], hinge: ["handyman"],
  broken: ["handyman", "plumbing", "electrical"], fix: ["handyman"],
  parking: ["parking_lot"], pothole: ["parking_lot", "concrete_repair"],
  asphalt: ["parking_lot"], lot: ["parking_lot"], stripe: ["parking_lot"],
  grass: ["landscaping"], tree: ["landscaping"], lawn: ["landscaping"], weed: ["landscaping"],
  snow: ["snow_removal"], ice: ["snow_removal"], salt: ["snow_removal"],
  sign: ["signage"], camera: ["security_systems"], alarm: ["security_systems"],
  lock: ["security_systems", "handyman"], kitchen: ["kitchen_cleaning"],
  grease: ["kitchen_cleaning", "pressure_washing"], hood: ["kitchen_cleaning"],
  sanitize: ["disinfection"], disinfect: ["disinfection"], pressure: ["pressure_washing"],
  wash: ["pressure_washing", "window_washing"], exterior: ["pressure_washing", "painting", "window_washing"],
  sidewalk: ["pressure_washing", "concrete_repair", "snow_removal"],
  concrete: ["concrete_repair"], ceiling: ["handyman", "painting"], roof: ["handyman"],
};

function classifyFallback(text) {
  const lower = text.toLowerCase();
  const scores = {};
  Object.entries(KEYWORD_MAP).forEach(([keyword, serviceIds]) => {
    if (lower.includes(keyword)) {
      serviceIds.forEach((id, i) => { scores[id] = (scores[id] || 0) + (3 - i); });
    }
  });
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) return { classifications: [{ service_id: "handyman", confidence: 0.5, reasoning: "General maintenance request" }], priority: "Standard" };
  return {
    classifications: sorted.slice(0, 3).map(([id], i) => ({
      service_id: id,
      confidence: Math.round((95 - i * 12)) / 100,
      reasoning: "Keyword-based classification",
    })),
    priority: lower.match(/urgent|emergency|flood|dangerous|hazard|safety/) ? "Critical"
      : lower.match(/leak|broken|damage|crack|not working/) ? "High"
      : lower.match(/wear|dirty|stain|smell/) ? "Medium" : "Standard",
    scope_description: text,
    estimated_duration: "TBD",
    safety_notes: null,
  };
}

// ─── Contractor matching (simulates Dataverse Web API query) ────────────────

function matchContractors(serviceIds) {
  return CONTRACTORS
    .filter((c) => c.services.some((s) => serviceIds.includes(s)))
    .sort((a, b) => {
      if (a.available !== b.available) return a.available ? -1 : 1;
      return b.rating - a.rating;
    })
    .slice(0, 3);
}

function getTimeline(priority) {
  switch (priority) {
    case "Critical": return "Within 2 hours";
    case "High": return "Within 24 hours";
    case "Medium": return "2-3 business days";
    default: return "Next scheduled visit";
  }
}

const PRIORITY_COLORS = {
  Critical: { bg: "#dc2626", text: "#fff" },
  High: { bg: "#f59e0b", text: "#000" },
  Medium: { bg: "#3b82f6", text: "#fff" },
  Standard: { bg: "#6b7280", text: "#fff" },
};

function Stars({ rating }) {
  return (
    <span style={{ color: "#f59e0b", letterSpacing: 1 }}>
      {"★".repeat(Math.floor(rating))}
      {rating % 1 >= 0.5 ? "½" : ""}
      <span style={{ opacity: 0.25 }}>{"★".repeat(5 - Math.ceil(rating))}</span>
      <span style={{ color: "var(--text-secondary)", marginLeft: 6, fontSize: 12 }}>{rating}</span>
    </span>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function FacilityServiceAgent() {
  const [input, setInput] = useState("");
  const [facility, setFacility] = useState(FACILITIES[0]);
  const [result, setResult] = useState(null);
  const [phase, setPhase] = useState("idle");
  const [phaseText, setPhaseText] = useState("");
  const [aiMode, setAiMode] = useState("ai"); // "ai" or "fallback"
  const [showArch, setShowArch] = useState(false);
  const resultRef = useRef(null);

  const EXAMPLE_REQUESTS = [
    "The parking garage on 3rd floor has water pooling near the south entrance",
    "Multiple ceiling lights flickering in the east wing conference rooms",
    "Strong musty odor coming from the basement storage area — possible mold",
    "Parking lot has several new potholes after the winter freeze",
    "Lobby carpet has heavy staining near the main entrance",
    "Kitchen exhaust hood hasn't been cleaned in months, grease buildup visible",
  ];

  async function runAgent(text) {
    setResult(null);
    setPhase("classifying");
    setPhaseText(aiMode === "ai" ? "Sending to Claude API for NLP classification..." : "Running keyword-based classification...");

    let classification;
    if (aiMode === "ai") {
      classification = await classifyWithAI(text);
      if (!classification) {
        setPhaseText("API unavailable — falling back to keyword classifier...");
        await delay(500);
        classification = classifyFallback(text);
      }
    } else {
      await delay(800);
      classification = classifyFallback(text);
    }

    const serviceIds = classification.classifications.map((c) => c.service_id);
    const services = classification.classifications.map((c) => ({
      ...SERVICE_CATEGORIES.find((sc) => sc.id === c.service_id),
      confidence: c.confidence,
      reasoning: c.reasoning,
    })).filter((s) => s.id);

    setPhase("matching");
    setPhaseText("Querying Dataverse cw_contractor table for availability...");
    await delay(700);

    const contractors = matchContractors(serviceIds);

    setPhase("drafting");
    setPhaseText("Generating work order from classification result...");
    await delay(600);

    const upcoming = UPCOMING_SERVICES[facility.id] || [];
    const bundleOpps = upcoming.filter(() => Math.random() > 0.3);

    setPhase("bundling");
    setPhaseText("Cross-referencing cw_scheduledservice for bundling...");
    await delay(500);

    const workOrderNum = `WO-${Date.now().toString().slice(-6)}`;

    setResult({
      services,
      priority: classification.priority,
      priorityReasoning: classification.priority_reasoning,
      timeline: getTimeline(classification.priority),
      contractors,
      workOrder: {
        number: workOrderNum,
        description: classification.scope_description || text,
        facility: facility.name,
        address: facility.address,
        created: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      },
      estimatedDuration: classification.estimated_duration,
      safetyNotes: classification.safety_notes,
      bundleOpps,
      usedAI: aiMode === "ai" && classification.priority_reasoning,
    });
    setPhase("done");
  }

  useEffect(() => {
    if (phase === "done" && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [phase]);

  function handleSubmit() {
    if (!input.trim()) return;
    runAgent(input.trim());
  }

  function delay(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  const isProcessing = phase !== "idle" && phase !== "done";

  return (
    <div style={{
      fontFamily: "'Segoe UI', -apple-system, sans-serif",
      background: "#0a0f1a",
      color: "#e2e8f0",
      minHeight: "100vh",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg-primary: #0a0f1a; --bg-card: #111827; --bg-card-hover: #1a2332;
          --border: #1e293b; --border-active: #3b82f6;
          --text-primary: #f1f5f9; --text-secondary: #94a3b8;
          --accent: #3b82f6; --accent-glow: rgba(59, 130, 246, 0.15);
          --green: #10b981; --green-glow: rgba(16, 185, 129, 0.15);
        }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
        .stagger-1 { animation-delay: 0.1s; opacity: 0; }
        .stagger-2 { animation-delay: 0.2s; opacity: 0; }
        .stagger-3 { animation-delay: 0.3s; opacity: 0; }
        .stagger-4 { animation-delay: 0.4s; opacity: 0; }
        .stagger-5 { animation-delay: 0.5s; opacity: 0; }
        .stagger-6 { animation-delay: 0.6s; opacity: 0; }
        textarea:focus, select:focus { outline: none; border-color: var(--accent) !important; box-shadow: 0 0 0 3px var(--accent-glow); }
        .example-chip { cursor: pointer; transition: all 0.2s; border: 1px solid var(--border); background: var(--bg-card); }
        .example-chip:hover { border-color: var(--accent); background: var(--accent-glow); transform: translateY(-1px); }
        .phase-dot { width: 8px; height: 8px; border-radius: 50%; animation: pulse 1s ease infinite; }
        .contractor-card { transition: all 0.2s; cursor: pointer; }
        .contractor-card:hover { border-color: var(--accent) !important; transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.3); }
        .mode-btn { cursor: pointer; transition: all 0.2s; border: 1px solid var(--border); border-radius: 6px; padding: 6px 14px; font-size: 12px; font-weight: 600; font-family: 'DM Sans', sans-serif; }
        .mode-btn:hover { border-color: var(--accent); }
        .mode-btn.active { background: var(--accent-glow); border-color: var(--accent); color: var(--accent); }
        .mode-btn.inactive { background: transparent; color: var(--text-secondary); }
        .arch-toggle { cursor: pointer; transition: all 0.2s; }
        .arch-toggle:hover { color: var(--accent); }
      `}</style>

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
        borderBottom: "1px solid var(--border)", padding: "24px 32px",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "'DM Sans', sans-serif",
              }}>CW</div>
              <div>
                <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 20, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                  Facility Service Request Agent
                </h1>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                  City Wide Facility Solutions — Dynamics 365 + Agentic AI
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button className={`mode-btn ${aiMode === "ai" ? "active" : "inactive"}`} onClick={() => setAiMode("ai")}>
                🤖 Claude API
              </button>
              <button className={`mode-btn ${aiMode === "fallback" ? "active" : "inactive"}`} onClick={() => setAiMode("fallback")}>
                ⚙️ Keyword
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 32px" }}>
        {/* AI Mode Indicator */}
        {aiMode === "ai" && (
          <div className="fade-up" style={{
            background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.25)",
            borderRadius: 8, padding: "10px 16px", marginBottom: 20,
            fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#a78bfa",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span>⚡</span>
            <span>Agentic AI mode — requests are classified by Claude (Anthropic API) with structured JSON output. In production, this would be a Copilot Studio agent or Power Automate cloud flow calling Azure OpenAI.</span>
          </div>
        )}

        {/* Facility Selector */}
        <div className="fade-up" style={{ marginBottom: 24 }}>
          <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
            Active Facility (cw_facility)
          </label>
          <select value={facility.id} onChange={(e) => setFacility(FACILITIES.find((f) => f.id === +e.target.value))}
            style={{ fontFamily: "'DM Sans', sans-serif", background: "var(--bg-card)", color: "var(--text-primary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px", fontSize: 14, width: "100%", cursor: "pointer" }}>
            {FACILITIES.map((f) => (
              <option key={f.id} value={f.id}>{f.name} — {f.type} ({f.sqft} sq ft)</option>
            ))}
          </select>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-secondary)", marginTop: 6 }}>📍 {facility.address}</p>
        </div>

        {/* Input */}
        <div className="fade-up stagger-1" style={{ marginBottom: 20 }}>
          <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
            Describe the Issue
          </label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., The parking garage on 3rd floor has water pooling near the south entrance..."
            rows={3}
            style={{ fontFamily: "'DM Sans', sans-serif", background: "var(--bg-card)", color: "var(--text-primary)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", fontSize: 14, width: "100%", resize: "vertical", lineHeight: 1.6 }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
            <button onClick={handleSubmit} disabled={isProcessing || !input.trim()}
              style={{ fontFamily: "'DM Sans', sans-serif", background: isProcessing ? "#1e293b" : "linear-gradient(135deg, #3b82f6, #6366f1)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 28px", fontSize: 14, fontWeight: 600, cursor: isProcessing || !input.trim() ? "not-allowed" : "pointer", opacity: isProcessing || !input.trim() ? 0.5 : 1, transition: "all 0.2s" }}>
              {isProcessing ? "Processing..." : "⚡ Run Agent"}
            </button>
          </div>
        </div>

        {/* Example Chips */}
        <div className="fade-up stagger-2" style={{ marginBottom: 32 }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "var(--text-secondary)", marginBottom: 8, fontWeight: 500 }}>Try an example:</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {EXAMPLE_REQUESTS.map((ex, i) => (
              <div key={i} className="example-chip" onClick={() => { setInput(ex); setResult(null); setPhase("idle"); }}
                style={{ fontFamily: "'DM Sans', sans-serif", padding: "6px 12px", borderRadius: 6, fontSize: 12, color: "var(--text-secondary)", maxWidth: 280, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {ex}
              </div>
            ))}
          </div>
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="fade-up" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 24px", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="phase-dot" style={{ background: "var(--accent)" }} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "var(--accent)" }}>{phaseText}</span>
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 16 }}>
              {["classifying", "matching", "drafting", "bundling"].map((p, i) => (
                <div key={p} style={{ flex: 1, height: 3, borderRadius: 2, background: ["classifying", "matching", "drafting", "bundling"].indexOf(phase) >= i ? "var(--accent)" : "var(--border)", transition: "background 0.3s" }} />
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {result && phase === "done" && (
          <div ref={resultRef}>
            {/* AI Badge */}
            {result.usedAI && (
              <div className="fade-up" style={{
                background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)",
                borderRadius: 8, padding: "10px 16px", marginBottom: 16,
                fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--green)",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span>✓</span>
                <span>Classified by Claude API — agentic reasoning with structured output</span>
              </div>
            )}

            {/* Classification */}
            <div className="fade-up stagger-1" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 24px", marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600 }}>Service Classification</h3>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--green)", background: "var(--green-glow)", padding: "3px 10px", borderRadius: 4 }}>
                  {result.usedAI ? "AI Classified" : "Keyword Match"}
                </span>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {result.services.map((svc, i) => (
                  <div key={svc.id} style={{
                    background: i === 0 ? "var(--accent-glow)" : "transparent",
                    border: `1px solid ${i === 0 ? "var(--accent)" : "var(--border)"}`,
                    borderRadius: 8, padding: "10px 16px", display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <span style={{ fontSize: 18 }}>{svc.icon}</span>
                    <div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600 }}>{svc.name}</div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-secondary)" }}>
                        {i === 0 ? "Primary" : `Alt ${i}`} • {Math.round(svc.confidence * 100)}% confidence
                      </div>
                      {svc.reasoning && svc.reasoning !== "Keyword-based classification" && (
                        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "var(--text-secondary)", marginTop: 2, fontStyle: "italic" }}>
                          {svc.reasoning}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Work Order */}
            <div className="fade-up stagger-2" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 24px", marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600 }}>Draft Work Order</h3>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>{result.workOrder.number}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px" }}>
                {[
                  ["Facility", result.workOrder.facility],
                  ["Created", result.workOrder.created],
                  ["Address", result.workOrder.address],
                  ["Service", result.services[0]?.name],
                  ["Est. Duration", result.estimatedDuration || "TBD"],
                  ["Response Window", result.timeline],
                ].map(([label, val]) => (
                  <div key={label}>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-secondary)", marginBottom: 4 }}>{label}</div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "var(--text-primary)" }}>{val}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 16 }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-secondary)", marginBottom: 4 }}>Scope Description</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "var(--text-primary)", background: "#0a0f1a", borderRadius: 6, padding: "10px 14px", border: "1px solid var(--border)", lineHeight: 1.6 }}>
                  {result.workOrder.description}
                </div>
              </div>

              {result.safetyNotes && (
                <div style={{ marginTop: 12, background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.25)", borderRadius: 6, padding: "8px 12px" }}>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#f87171" }}>⚠️ Safety: {result.safetyNotes}</span>
                </div>
              )}

              <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
                <div style={{
                  background: PRIORITY_COLORS[result.priority].bg, color: PRIORITY_COLORS[result.priority].text,
                  fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, padding: "5px 14px", borderRadius: 6,
                }}>
                  {result.priority} Priority
                </div>
                {result.priorityReasoning && (
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "var(--text-secondary)", padding: "5px 0", fontStyle: "italic" }}>
                    — {result.priorityReasoning}
                  </div>
                )}
              </div>
            </div>

            {/* Contractor Matches */}
            <div className="fade-up stagger-3" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 24px", marginBottom: 16 }}>
              <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Recommended Contractors</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {result.contractors.map((c, i) => (
                  <div key={c.id} className="contractor-card" style={{
                    background: i === 0 ? "rgba(16,185,129,0.05)" : "transparent",
                    border: `1px solid ${i === 0 ? "var(--green)" : "var(--border)"}`,
                    borderRadius: 10, padding: "14px 18px",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600 }}>{c.name}</span>
                        {i === 0 && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--green)", background: "var(--green-glow)", padding: "2px 8px", borderRadius: 4 }}>Best Match</span>}
                        {!c.available && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#f59e0b", background: "rgba(245,158,11,0.1)", padding: "2px 8px", borderRadius: 4 }}>Unavailable</span>}
                      </div>
                      <Stars rating={c.rating} />
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-secondary)", marginTop: 4 }}>
                        {c.jobs} jobs completed • {c.responseTime} response • {c.rate}
                      </div>
                    </div>
                    <button style={{ fontFamily: "'DM Sans', sans-serif", background: c.available ? "var(--accent)" : "var(--border)", color: c.available ? "#fff" : "var(--text-secondary)", border: "none", borderRadius: 6, padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      {c.available ? "Assign" : "Waitlist"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Bundling */}
            {result.bundleOpps.length > 0 && (
              <div className="fade-up stagger-4" style={{
                background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(59,130,246,0.08))",
                border: "1px solid rgba(139,92,246,0.3)", borderRadius: 12, padding: "20px 24px", marginBottom: 16,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 16 }}>💡</span>
                  <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: "#a78bfa" }}>Bundling Opportunity Detected</h3>
                </div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "var(--text-secondary)", marginBottom: 12, lineHeight: 1.6 }}>
                  This facility has upcoming services that could be combined to reduce visit costs:
                </p>
                {result.bundleOpps.map((b, i) => {
                  const svc = SERVICE_CATEGORIES.find((s) => s.id === b.service);
                  return (
                    <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 16 }}>{svc?.icon}</span>
                        <div>
                          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600 }}>{svc?.name}</div>
                          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-secondary)" }}>Scheduled: {b.date} • {b.contractor}</div>
                        </div>
                      </div>
                      <button style={{ fontFamily: "'DM Sans', sans-serif", background: "rgba(139,92,246,0.15)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Bundle</button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Architecture Panel */}
            <div className="fade-up stagger-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 24px", marginBottom: 16 }}>
              <div className="arch-toggle" onClick={() => setShowArch(!showArch)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600 }}>Dynamics 365 Architecture Reference</h3>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-secondary)" }}>{showArch ? "▼" : "▶"}</span>
              </div>
              {showArch && (
                <div style={{ marginTop: 16 }}>
                  {/* Dataverse Entity Map */}
                  <div style={{ marginBottom: 20 }}>
                    <h4 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Dataverse Custom Tables</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {[
                        { entity: "cw_facility", desc: "Client buildings — address, type, sqft, contract" },
                        { entity: "cw_servicecategory", desc: "22 service types with SLA templates" },
                        { entity: "cw_contractor", desc: "IC profiles, ratings, certifications, availability" },
                        { entity: "cw_servicerequest", desc: "Inbound requests with AI classification output" },
                        { entity: "cw_workorder", desc: "Generated WOs with priority, scope, assignment" },
                        { entity: "cw_scheduledservice", desc: "Recurring service schedule for bundling logic" },
                      ].map((e) => (
                        <div key={e.entity} style={{ background: "#0a0f1a", border: "1px solid var(--border)", borderRadius: 6, padding: "8px 12px" }}>
                          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--accent)", marginBottom: 2 }}>{e.entity}</div>
                          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "var(--text-secondary)" }}>{e.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pipeline Architecture */}
                  <div style={{ marginBottom: 20 }}>
                    <h4 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Agent Pipeline (Power Automate / Copilot Studio)</h4>
                    <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
                      {[
                        { step: "Natural Language Input", detail: "Model-Driven App custom page" },
                        { step: "→" },
                        { step: "AI Classification", detail: "Azure OpenAI / Copilot Studio" },
                        { step: "→" },
                        { step: "Dataverse Query", detail: "Web API — cw_contractor filter" },
                        { step: "→" },
                        { step: "Work Order Creation", detail: "Power Automate cloud flow" },
                        { step: "→" },
                        { step: "Bundle Detection", detail: "FetchXML on cw_scheduledservice" },
                      ].map((s, i) =>
                        s.detail ? (
                          <div key={i} style={{ background: "var(--accent-glow)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 6, padding: "6px 10px", textAlign: "center" }}>
                            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, color: "var(--accent)" }}>{s.step}</div>
                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "var(--text-secondary)", marginTop: 2 }}>{s.detail}</div>
                          </div>
                        ) : (
                          <span key={i} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "var(--text-secondary)", padding: "0 2px" }}>→</span>
                        )
                      )}
                    </div>
                  </div>

                  {/* FetchXML Sample */}
                  <div>
                    <h4 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Sample: Dataverse Web API — Contractor Availability Query</h4>
                    <pre style={{
                      fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#a78bfa",
                      background: "#0a0f1a", border: "1px solid var(--border)", borderRadius: 6,
                      padding: "12px 16px", overflowX: "auto", lineHeight: 1.6,
                    }}>{`GET /api/data/v9.2/cw_contractors
  ?$filter=cw_servicecategoryid eq '{serviceId}'
    and cw_isavailable eq true
  &$orderby=cw_performancerating desc
  &$top=3
  &$select=cw_name,cw_performancerating,
    cw_responsetime,cw_jobscompleted

// Power Automate: Create Work Order
POST /api/data/v9.2/cw_workorders
{
  "cw_facilityid@odata.bind": "/cw_facilities({facilityId})",
  "cw_servicecategoryid@odata.bind": "/cw_servicecategories({categoryId})",
  "cw_priority": 947210001, // Option Set: High
  "cw_scopedescription": "AI-generated scope...",
  "cw_assignedcontractorid@odata.bind": "/cw_contractors({contractorId})"
}`}</pre>
                  </div>
                </div>
              )}
            </div>

            {/* Migration Context */}
            <div className="fade-up stagger-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 24px", marginBottom: 16 }}>
              <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
                On-Prem → D365 Online Migration Context
              </h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                City Wide is transitioning from on-premise Dynamics CRM to Dynamics 365 for Sales online. This demo illustrates how new AI-powered capabilities become possible once on D365 Online — specifically Copilot Studio agents, Power Automate cloud flows with AI Builder, and Dataverse Web API integrations that aren't feasible in on-prem deployments. The classification agent pattern shown here represents the kind of value-add that justifies the migration and differentiates the post-migration platform.
              </p>
              <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                {["Dynamics 365 Sales", "Dataverse", "Power Automate", "Copilot Studio", "AI Builder", "Azure OpenAI", "FetchXML", "Web API v9.2", "Model-Driven Apps", "SSRS / Power BI"].map((tag) => (
                  <span key={tag} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-secondary)", background: "rgba(148,163,184,0.1)", border: "1px solid var(--border)", padding: "3px 8px", borderRadius: 4 }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
