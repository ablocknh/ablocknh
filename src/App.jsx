import React, { useState, useEffect, useCallback } from "react";
import {
  KeyRound,
  Boxes,
  ClipboardList,
  Clock,
  ShieldCheck,
  CalendarDays,
  BookOpen,
  HelpCircle,
  FolderOpen,
  Users,
  LogOut,
  Lock,
  Plus,
  Trash2,
  Loader2,
  QrCode,
  Search,
  AlertTriangle,
  Minus,
  X,
  DoorOpen,
  Palette,
  ChevronRight,
  Wrench,
  Droplet,
  Gauge,
  CheckCircle2,
  Download,
  Bell,
  Camera,
  User,
  Grid3x3,
} from "lucide-react";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');`;

// Swap in the actual ANB Commercial Solutions logo file here once provided
// (data URI or hosted URL). Falls back to a text/icon lockup until then.
const LOGO_URL = "/logo.png";

const ROLE_META = {
  admin: { label: "Admin", color: "#E8873A" },
  office: { label: "Office / Ops", color: "#4A90D9" },
  locksmith: { label: "Locksmith", color: "#4FAE7C" },
  lowvoltage: { label: "Low Voltage", color: "#9B7BD9" },
};

const SEED_EMPLOYEES = [
  { id: "brian-akerley", name: "Brian Akerley", role: "admin", pattern: null },
  { id: "drew-dunn", name: "Drew Dunn", role: "office", pattern: null },
  { id: "matt-domeny", name: "Matt Domeny", role: "office", pattern: null },
  { id: "oliver-worth", name: "Oliver Worth", role: "locksmith", pattern: null },
  { id: "richard-watson", name: "Richard Watson", role: "locksmith", pattern: null },
  { id: "eric-corson", name: "Eric Corson", role: "locksmith", pattern: null },
  { id: "sam-arcand", name: "Sam Arcand", role: "locksmith", pattern: null },
  { id: "andrew-towne", name: "Andrew Towne", role: "locksmith", pattern: null },
  { id: "corey-poitras", name: "Corey Poitras", role: "lowvoltage", pattern: null },
  { id: "adam-brooks", name: "Adam Brooks", role: "lowvoltage", pattern: null },
  { id: "briar-cudworth", name: "Briar Cudworth", role: "lowvoltage", pattern: null },
];

const STORAGE_KEY = "ab-portal:employees";

function initials(name) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export default function App() {
  const [employees, setEmployees] = useState(SEED_EMPLOYEES);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState(null);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [continued, setContinued] = useState(false);
  const [patternError, setPatternError] = useState(false);
  const [patternResetSeed, setPatternResetSeed] = useState(0);
  const [setupStage, setSetupStage] = useState(null); // null | "draw" | "confirm"
  const [setupFirstPattern, setSetupFirstPattern] = useState(null);

  const [session, setSession] = useState(null); // logged-in employee
  const [view, setView] = useState("dashboard"); // dashboard | inventory | manage-team

  // Load shared employee directory on mount
  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get(STORAGE_KEY, true);
        if (result && result.value) {
          setEmployees(JSON.parse(result.value));
        } else {
          await window.storage.set(STORAGE_KEY, JSON.stringify(SEED_EMPLOYEES), true);
        }
      } catch (e) {
        // Key not found or storage unavailable — fall back to seed data in memory
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persistEmployees = useCallback(async (next) => {
    setEmployees(next);
    try {
      const result = await window.storage.set(STORAGE_KEY, JSON.stringify(next), true);
      if (!result) setSaveError("Changes may not have saved. Try again.");
      else setSaveError(null);
    } catch (e) {
      setSaveError("Changes may not have saved. Try again.");
    }
  }, []);

  function handleSelectEmployee(id) {
    const emp = employees.find((e) => e.id === id) || null;
    setSelectedEmployee(emp);
    setContinued(false);
    setPatternError(false);
    setPatternResetSeed((s) => s + 1);
    setSetupStage(emp && !emp.pattern ? "draw" : null);
    setSetupFirstPattern(null);
  }

  function handleContinue() {
    if (selectedEmployee) setContinued(true);
  }

  function handleChangeEmployee() {
    setSelectedEmployee(null);
    setContinued(false);
    setPatternError(false);
    setPatternResetSeed((s) => s + 1);
    setSetupStage(null);
    setSetupFirstPattern(null);
  }

  function handlePatternComplete(path) {
    if (!selectedEmployee || path.length < 2) return;

    if (setupStage === "draw") {
      setSetupFirstPattern(path);
      setSetupStage("confirm");
      setPatternResetSeed((s) => s + 1);
      return;
    }

    if (setupStage === "confirm") {
      const match = JSON.stringify(path) === JSON.stringify(setupFirstPattern);
      if (match) {
        const next = employees.map((e) => (e.id === selectedEmployee.id ? { ...e, pattern: path } : e));
        persistEmployees(next);
        setSession({ ...selectedEmployee, pattern: path });
        setSelectedEmployee(null);
        setSetupStage(null);
        setSetupFirstPattern(null);
        setView("dashboard");
      } else {
        setPatternError(true);
        setTimeout(() => {
          setPatternError(false);
          setSetupStage("draw");
          setSetupFirstPattern(null);
          setPatternResetSeed((s) => s + 1);
        }, 600);
      }
      return;
    }

    const match = JSON.stringify(path) === JSON.stringify(selectedEmployee.pattern);
    if (match) {
      setSession(selectedEmployee);
      setSelectedEmployee(null);
      setView("dashboard");
    } else {
      setPatternError(true);
      setTimeout(() => {
        setPatternError(false);
        setPatternResetSeed((s) => s + 1);
      }, 500);
    }
  }

  function handleLogout() {
    setSession(null);
    setView("dashboard");
  }

  return (
    <div style={styles.root}>
      <style>{`
        ${FONT_IMPORT}
        * { box-sizing: border-box; }
        button:focus-visible, div[role="button"]:focus-visible {
          outline: 2px solid #E8873A;
          outline-offset: 2px;
        }
        @media (prefers-reduced-motion: reduce) {
          * { transition: none !important; animation: none !important; }
        }
        .tile-btn { transition: transform 0.15s ease, border-color 0.15s ease; }
        .tile-btn:hover:not(:disabled) { transform: translateY(-3px); border-color: #4A90D9; }
        .pin-pad-key { transition: transform 0.08s ease, box-shadow 0.08s ease; }
        .pin-pad-key:active { transform: translateY(2px); box-shadow: none !important; }
        .pin-dot-enter { animation: pinPop 0.15s ease; }
        @keyframes pinPop { from { transform: scale(0.6); } to { transform: scale(1); } }
        .shake { animation: shake 0.4s ease; }
        .notify-pulse { animation: notifyPulse 1.8s ease-in-out infinite; }
        @keyframes notifyPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.12); }
        }
        @keyframes shake { 0%,100%{transform:translateX(0);} 25%{transform:translateX(-6px);} 75%{transform:translateX(6px);} }
      `}</style>

      {loading ? (
        <div style={styles.loadingScreen}>
          <Loader2 size={28} color="#8B94A3" style={{ animation: "spin 1s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : !session ? (
        <LoginScreen
          employees={employees}
          selectedEmployee={selectedEmployee}
          continued={continued}
          patternError={patternError}
          patternResetSeed={patternResetSeed}
          setupStage={setupStage}
          onSelectEmployee={handleSelectEmployee}
          onContinue={handleContinue}
          onPatternComplete={handlePatternComplete}
          onChangeEmployee={handleChangeEmployee}
        />
      ) : (
        <PortalShell
          session={session}
          view={view}
          setView={setView}
          onLogout={handleLogout}
          employees={employees}
          persistEmployees={persistEmployees}
          saveError={saveError}
        />
      )}
    </div>
  );
}

const FOOTER_SERVICES = [
  { key: "locksmith", label: "Locksmith", icon: Lock },
  { key: "doors", label: "Doors & Hardware", icon: DoorOpen },
  { key: "security", label: "Security Systems", icon: Camera },
  { key: "access", label: "Access Control", icon: Grid3x3 },
];

function LoginScreen({ employees, selectedEmployee, continued, patternError, patternResetSeed, setupStage, onSelectEmployee, onContinue, onPatternComplete, onChangeEmployee }) {
  const showPatternStep = selectedEmployee && continued;

  return (
    <div style={styles.welcomeWrap}>
      <div style={styles.welcomeLogoBlock}>
        {LOGO_URL ? (
          <img src={LOGO_URL} alt="A&B Commercial Solutions — Solutions. Security. Success." style={styles.welcomeLogoImg} />
        ) : (
          <>
            <div style={styles.welcomeLogoLockup}>
              <span style={styles.welcomeLogoA}>A</span>
              <span style={styles.welcomeLogoAmp}>&amp;</span>
              <span style={styles.welcomeLogoB}>B</span>
            </div>
            <div style={styles.welcomeLogoSub}>COMMERCIAL SOLUTIONS</div>
            <div style={styles.welcomeTaglineRow}>
              <span style={styles.welcomeTaglineLine} />
              <span style={styles.welcomeTaglineText}>SOLUTIONS. SECURITY. SUCCESS.</span>
              <span style={styles.welcomeTaglineLine} />
            </div>
          </>
        )}
      </div>

      {!showPatternStep ? (
        <>
          <h1 style={styles.welcomeTitle}>Welcome</h1>
          <p style={styles.welcomeSub}>Please select your name to continue</p>

          <label style={styles.welcomeSelectLabel} htmlFor="employee-select">
            Select Employee
          </label>
          <div style={styles.welcomeSelectWrap}>
            <User size={16} color="#9AA1AC" style={styles.welcomeSelectIcon} />
            <select
              id="employee-select"
              style={styles.welcomeSelect}
              value={selectedEmployee ? selectedEmployee.id : ""}
              onChange={(e) => onSelectEmployee(e.target.value)}
            >
              <option value="" disabled>
                Choose your name
              </option>
              {Object.entries(ROLE_META).map(([roleKey, meta]) => {
                const inRole = employees.filter((e) => e.role === roleKey);
                if (inRole.length === 0) return null;
                return (
                  <optgroup key={roleKey} label={meta.label}>
                    {inRole.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </div>

          <button
            style={{ ...styles.welcomeContinueBtn, ...(!selectedEmployee ? styles.welcomeContinueBtnDisabled : {}) }}
            onClick={onContinue}
            disabled={!selectedEmployee}
          >
            CONTINUE
          </button>

          <div style={styles.welcomeFooterRow}>
            {FOOTER_SERVICES.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.key} style={{ ...styles.welcomeFooterItem, borderLeft: i === 0 ? "none" : "1px solid #3A2426" }}>
                  <Icon size={18} color="#C1272D" />
                  <span style={styles.welcomeFooterLabel}>{s.label}</span>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className={patternError ? "shake" : ""} style={styles.welcomePatternCard}>
          <div style={styles.pinPersonRow}>
            <div style={{ ...styles.badgeAvatar, width: 40, height: 40, fontSize: 14, background: ROLE_META[selectedEmployee.role].color }}>
              {initials(selectedEmployee.name)}
            </div>
            <div>
              <div style={styles.pinName}>{selectedEmployee.name}</div>
              <div style={{ ...styles.badgeRole, color: ROLE_META[selectedEmployee.role].color }}>
                {ROLE_META[selectedEmployee.role].label}
              </div>
            </div>
            <button style={styles.changeLink} onClick={onChangeEmployee}>
              Change
            </button>
          </div>

          <div style={styles.pinLabel}>
            {setupStage === "draw"
              ? "Create your pattern"
              : setupStage === "confirm"
              ? "Draw it again to confirm"
              : "Draw your pattern"}
          </div>
          <PatternPad key={patternResetSeed} error={patternError} onComplete={onPatternComplete} />
          <div style={styles.pinDemoNote}>
            {setupStage === "draw"
              ? "First time here — connect at least 4 dots to set your pattern."
              : setupStage === "confirm"
              ? "Draw the same pattern once more to save it."
              : "Forgot your pattern? Ask an admin to reset it from Manage Team."}
          </div>
        </div>
      )}
    </div>
  );
}

const PATTERN_DOTS = [
  [40, 40], [120, 40], [200, 40],
  [40, 120], [120, 120], [200, 120],
  [40, 200], [120, 200], [200, 200],
];
const PATTERN_HIT_RADIUS = 30;

function PatternPad({ onComplete, error }) {
  const [path, setPath] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const [cursor, setCursor] = useState(null);
  const svgRef = React.useRef(null);

  function localPoint(clientX, clientY) {
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = 240 / rect.width;
    const scaleY = 240 / rect.height;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  }

  function nearestDot(pt) {
    for (let i = 0; i < PATTERN_DOTS.length; i++) {
      const [dx, dy] = PATTERN_DOTS[i];
      if (Math.hypot(pt.x - dx, pt.y - dy) <= PATTERN_HIT_RADIUS) return i;
    }
    return -1;
  }

  function handleDown(e) {
    const pt = localPoint(e.clientX, e.clientY);
    const idx = nearestDot(pt);
    if (idx !== -1) {
      setPath([idx]);
      setDrawing(true);
      setCursor(pt);
    }
  }

  function handleMove(e) {
    if (!drawing) return;
    const pt = localPoint(e.clientX, e.clientY);
    setCursor(pt);
    const idx = nearestDot(pt);
    if (idx !== -1 && !path.includes(idx)) {
      setPath((p) => [...p, idx]);
    }
  }

  function handleUp() {
    if (drawing) {
      setDrawing(false);
      onComplete(path);
    }
  }

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 240 240"
      style={{ ...styles.patternSvg, touchAction: "none" }}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerLeave={handleUp}
    >
      {path.slice(1).map((idx, i) => {
        const [x1, y1] = PATTERN_DOTS[path[i]];
        const [x2, y2] = PATTERN_DOTS[idx];
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={error ? "#D9534F" : "#C1272D"} strokeWidth={6} strokeLinecap="round" />
        );
      })}
      {drawing && cursor && path.length > 0 && (
        <line
          x1={PATTERN_DOTS[path[path.length - 1]][0]}
          y1={PATTERN_DOTS[path[path.length - 1]][1]}
          x2={cursor.x}
          y2={cursor.y}
          stroke={error ? "#D9534F" : "#C1272D"}
          strokeWidth={6}
          strokeLinecap="round"
        />
      )}
      {PATTERN_DOTS.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={22} fill="transparent" />
          <circle
            cx={x}
            cy={y}
            r={path.includes(i) ? 10 : 7}
            fill={path.includes(i) ? (error ? "#D9534F" : "#C1272D") : "#333B47"}
          />
        </g>
      ))}
    </svg>
  );
}

// Swap in the actual shared Drive link (folder/sheet/doc) here once provided
const CUSTOMER_RECORDS_URL = null;

const MODULES = [
  { key: "inventory", label: "Inventory", desc: "QR-scan stock, reorder lists", icon: Boxes, active: true },
  {
    key: "customer-records",
    label: "Customer Records",
    desc: "Quick link to the Drive lookup",
    icon: FolderOpen,
    active: !!CUSTOMER_RECORDS_URL,
    external: true,
    url: CUSTOMER_RECORDS_URL,
    lockText: "Add Drive link",
  },
  { key: "jobs", label: "Job Tracker", desc: "Open jobs & follow-ups", icon: ClipboardList, active: false },
  { key: "time", label: "Time Tracking", desc: "Clock in / clock out", icon: Clock, active: false },
  { key: "timeoff", label: "Time Off", desc: "Vacation & sick balances, requests", icon: CalendarDays, active: false },
  { key: "safety", label: "Safety Checks", desc: "Truck & site inspections", icon: ShieldCheck, active: true },
  { key: "sop", label: "SOPs", desc: "Standard operating procedures", icon: BookOpen, active: false },
  { key: "faq", label: "Tech Support FAQ", desc: "Common issues & quick fixes", icon: HelpCircle, active: true },
];

function PortalShell({ session, view, setView, onLogout, employees, persistEmployees, saveError }) {
  return (
    <div style={styles.shell}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <KeyRound size={20} color="#E8873A" />
          <span style={styles.headerBrand}>A&amp;B PORTAL</span>
        </div>
        <div style={styles.headerRight}>
          <div style={{ textAlign: "right" }}>
            <div style={styles.headerName}>{session.name}</div>
            <div style={{ ...styles.headerRole, color: ROLE_META[session.role].color }}>
              {ROLE_META[session.role].label}
            </div>
          </div>
          <div style={{ ...styles.badgeAvatar, width: 36, height: 36, fontSize: 13, background: ROLE_META[session.role].color }}>
            {initials(session.name)}
          </div>
          <button style={styles.logoutBtn} onClick={onLogout}>
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <main style={styles.main}>
        {view === "dashboard" && (
          <Dashboard session={session} setView={setView} />
        )}
        {view === "inventory" && <InventoryModule setView={setView} />}
        {view === "faq" && <FaqModule setView={setView} />}
        {view === "safety" && <SafetyChecksModule session={session} setView={setView} />}
        {view === "manage-team" && (
          <ManageTeam
            employees={employees}
            persistEmployees={persistEmployees}
            saveError={saveError}
            setView={setView}
          />
        )}
      </main>
    </div>
  );
}

function Dashboard({ session, setView }) {
  const [dueCount, setDueCount] = useState(0);
  const [openTicketCount, setOpenTicketCount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get(SAFETY_STORAGE_KEY, true);
        const stored = result && result.value ? JSON.parse(result.value) : { vehicles: SEED_VEHICLES, checks: {}, tickets: [] };
        const knownIds = new Set(stored.vehicles.map((v) => v.id));
        const missing = SEED_VEHICLES.filter((v) => !knownIds.has(v.id));
        const data = missing.length ? { ...stored, vehicles: [...stored.vehicles, ...missing] } : stored;
        const monthKey = currentMonthKey();
        const myVehicles = data.vehicles.filter((v) => v.assignedTo === session.name);
        const due = myVehicles.filter((v) => !(data.checks[v.id] && data.checks[v.id][monthKey]));
        setDueCount(due.length);
        const tickets = data.tickets || [];
        setOpenTicketCount(tickets.filter((t) => t.status !== "done").length);
      } catch (e) {
        // storage not seeded yet — nothing due to show
      }
    })();
  }, [session.name]);

  const canSeeTickets = session.role === "admin" || session.role === "office";

  return (
    <div>
      <div style={styles.dashHeadRow}>
        <h2 style={styles.dashTitle}>YOUR MODULES</h2>
        <div style={styles.dashDate}>
          {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        </div>
      </div>

      <div style={styles.tileGrid}>
        {MODULES.map((m) => (
          <ModuleTile
            key={m.key}
            mod={m}
            badge={m.key === "safety" ? dueCount : 0}
            alertBadge={m.key === "safety" && canSeeTickets ? openTicketCount : 0}
            onClick={() => m.active && setView(m.key)}
          />
        ))}
        {session.role === "admin" && (
          <ModuleTile
            mod={{ key: "manage-team", label: "Manage Team", desc: "Add / edit employee badges", icon: Users, active: true }}
            onClick={() => setView("manage-team")}
          />
        )}
      </div>
    </div>
  );
}

function ModuleTile({ mod, onClick, badge, alertBadge }) {
  const Icon = mod.icon;
  const content = (
    <>
      <div style={styles.tilePunch} />
      {alertBadge > 0 && (
        <div style={styles.tileAlertBadge} title={`${alertBadge} open maintenance ticket${alertBadge !== 1 ? "s" : ""}`}>
          !{alertBadge}
        </div>
      )}
      {badge > 0 && (
        <div className="notify-pulse" style={styles.tileNotifyBadge} title={`${badge} check${badge !== 1 ? "s" : ""} due`}>
          {badge}
        </div>
      )}
      <div style={{ ...styles.tileIconWrap, opacity: mod.active ? 1 : 0.4 }}>
        <Icon size={24} color={mod.active ? "#E7EAEE" : "#8B94A3"} />
      </div>
      <div style={{ ...styles.tileLabel, color: mod.active ? "#E7EAEE" : "#8B94A3" }}>{mod.label}</div>
      <div style={styles.tileDesc}>{mod.desc}</div>
      {!mod.active && (
        <div style={styles.tileLockRow}>
          <Lock size={12} color="#8B94A3" />
          <span style={styles.tileLockText}>{mod.lockText || "Coming soon"}</span>
        </div>
      )}
    </>
  );

  if (mod.active && mod.external && mod.url) {
    return (
      <a className="tile-btn" style={{ ...styles.tile, textDecoration: "none" }} href={mod.url} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return (
    <button className="tile-btn" style={styles.tile} onClick={onClick} disabled={!mod.active}>
      {content}
    </button>
  );
}


const SUPABASE_URL = "https://lptjeudwnpddpucyrhin.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwdGpldWR3bnBkZHB1Y3lyaGluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0NDU5OTksImV4cCI6MjEwMTAyMTk5OX0.xnQJjlT7Jxgx2G9os46Xqq5YRl5ivnk8hQh8_phzj9Q";

async function sb(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: options.prefer || "return=representation",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Supabase ${res.status}: ${text || res.statusText}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

function newQrCode() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `qr-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// ---- Placeholder seed payloads: used only the first time each table is empty ----
const PLACEHOLDER_CATEGORIES = ["Door Hardware", "Low Voltage", "Networking", "Automotive", "Safe"];

const PLACEHOLDER_LOCATIONS = [
  { name: "Gilford NH Office", is_truck: false },
  { name: "Dover HQ (19 Dover St)", is_truck: false },
  { name: "Dover Retail (11 Main St)", is_truck: false },
  { name: "Trucks (combined)", is_truck: false },
];

const PLACEHOLDER_SUPPLIERS = [
  { key: "sup-1", name: "Placeholder Supplier — Door Hardware Co", contact: "orders@example.com" },
  { key: "sup-2", name: "Placeholder Supplier — Security Distributors", contact: "(555) 555-0102" },
  { key: "sup-3", name: "Placeholder Supplier — Auto Lock Supply", contact: "(555) 555-0103" },
];

const MANUFACTURERS = [
  "Schlage", "Von Duprin", "LCN", "HID", "Sargent", "Kwikset", "Medeco", "Corbin Russwin", "Dormakaba", "Assa Abloy",
];

const PLACEHOLDER_ITEMS = [
  { name: "Exit Device (99 Series)", category: "Door Hardware", manufacturer: "Von Duprin", price: 412.5, unit: "each", supplierKey: "sup-1", supplierPartNo: "VD-99-EO", reorderPoint: 4, reorderQty: 8 },
  { name: "Door Closer 4040XP", category: "Door Hardware", manufacturer: "LCN", price: 189.0, unit: "each", supplierKey: "sup-1", supplierPartNo: "LCN-4040XP", reorderPoint: 3, reorderQty: 6 },
  { name: "Cylinder, C Keyway", category: "Door Hardware", manufacturer: "Schlage", price: 24.75, unit: "each", supplierKey: "sup-1", supplierPartNo: "SCH-C123", reorderPoint: 10, reorderQty: 20 },
  { name: "ProxCard Reader, RP40", category: "Low Voltage", manufacturer: "HID", price: 138.0, unit: "each", supplierKey: "sup-2", supplierPartNo: "HID-RP40", reorderPoint: 5, reorderQty: 10 },
  { name: "Electric Strike 6211", category: "Low Voltage", manufacturer: "Von Duprin", price: 96.25, unit: "each", supplierKey: "sup-2", supplierPartNo: "VD-6211", reorderPoint: 4, reorderQty: 8 },
  { name: "Access Control Panel, 2-Door", category: "Low Voltage", manufacturer: "HID", price: 610.0, unit: "each", supplierKey: "sup-2", supplierPartNo: "AC-2DR", reorderPoint: 2, reorderQty: 4 },
  { name: "Cat6 Plenum Cable, 1000ft Box", category: "Networking", manufacturer: "Dormakaba", price: 215.0, unit: "box", supplierKey: "sup-2", supplierPartNo: "CAT6-1000P", reorderPoint: 3, reorderQty: 6 },
  { name: "8-Port PoE Switch", category: "Networking", manufacturer: "Assa Abloy", price: 145.0, unit: "each", supplierKey: "sup-2", supplierPartNo: "POE-8PORT", reorderPoint: 3, reorderQty: 5 },
  { name: "RJ45 Keystone Jacks (25-pack)", category: "Networking", manufacturer: "Dormakaba", price: 32.0, unit: "pack", supplierKey: "sup-2", supplierPartNo: "RJ45-KS25", reorderPoint: 4, reorderQty: 10 },
  { name: "Transponder Key Blank, GM", category: "Automotive", manufacturer: "Kwikset", price: 6.5, unit: "each", supplierKey: "sup-3", supplierPartNo: "GM-TRK-01", reorderPoint: 15, reorderQty: 30 },
  { name: "Smart Key Shell, Ford", category: "Automotive", manufacturer: "Medeco", price: 18.0, unit: "each", supplierKey: "sup-3", supplierPartNo: "FD-SK-04", reorderPoint: 8, reorderQty: 16 },
  { name: "Deadbolt", category: "Safe", manufacturer: "Sargent", price: 54.0, unit: "each", supplierKey: "sup-1", supplierPartNo: "SAR-DB-10", reorderPoint: 8, reorderQty: 16 },
  { name: "Dial Combination Lock", category: "Safe", manufacturer: "Corbin Russwin", price: 88.0, unit: "each", supplierKey: "sup-3", supplierPartNo: "SFDIAL-22", reorderPoint: 3, reorderQty: 6 },
];

// Ensures each reference table has at least placeholder rows, then returns everything needed
// to build the shaped client-side data. Safe to call every load — only inserts when a table is empty.
async function ensureSeeded() {
  let categories = await sb("categories?select=*");
  if (categories.length === 0) {
    categories = await sb("categories", { method: "POST", body: JSON.stringify(PLACEHOLDER_CATEGORIES.map((name) => ({ name }))) });
  }

  let manufacturers = await sb("manufacturers?select=*");
  if (manufacturers.length === 0) {
    manufacturers = await sb("manufacturers", { method: "POST", body: JSON.stringify(MANUFACTURERS.map((name) => ({ name }))) });
  }

  let suppliers = await sb("suppliers?select=*");
  if (suppliers.length === 0) {
    suppliers = await sb(
      "suppliers",
      { method: "POST", body: JSON.stringify(PLACEHOLDER_SUPPLIERS.map(({ name, contact }) => ({ name, contact }))) }
    );
  }

  let locations = await sb("locations?select=*");
  if (locations.length === 0) {
    locations = await sb("locations", { method: "POST", body: JSON.stringify(PLACEHOLDER_LOCATIONS) });
  }

  let items = await sb("items?select=*");
  if (items.length === 0) {
    const catByName = Object.fromEntries(categories.map((c) => [c.name, c.id]));
    const mfrByName = Object.fromEntries(manufacturers.map((m) => [m.name, m.id]));
    const supplierByName = Object.fromEntries(suppliers.map((s) => [s.name, s.id]));
    const keyToName = Object.fromEntries(PLACEHOLDER_SUPPLIERS.map((s) => [s.key, s.name]));

    const payload = PLACEHOLDER_ITEMS.map((it) => ({
      name: it.name,
      category_id: catByName[it.category] || null,
      manufacturer_id: mfrByName[it.manufacturer] || null,
      unit: it.unit,
      price: it.price,
      supplier_id: supplierByName[keyToName[it.supplierKey]] || null,
      supplier_part_no: it.supplierPartNo,
      reorder_point: it.reorderPoint,
      reorder_qty: it.reorderQty,
      qr_code: newQrCode(),
    }));
    items = await sb("items", { method: "POST", body: JSON.stringify(payload) });

    const stockPayload = [];
    items.forEach((it, idx) => {
      locations.forEach((loc, locIdx) => {
        const rp = PLACEHOLDER_ITEMS[idx].reorderPoint;
        const base = ((idx + 1) * 3 + locIdx * 2) % (rp * 2 + 4);
        stockPayload.push({ item_id: it.id, location_id: loc.id, quantity: base });
      });
    });
    await sb("stock_levels", { method: "POST", body: JSON.stringify(stockPayload), prefer: "return=minimal" });
  }

  const stockRows = await sb("stock_levels?select=*");

  return { categories, manufacturers, suppliers, locations, items, stockRows };
}

function shapeInventoryData({ categories, manufacturers, suppliers, locations, items, stockRows }) {
  const catById = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  const mfrById = Object.fromEntries(manufacturers.map((m) => [m.id, m.name]));

  const stock = {};
  stockRows.forEach((row) => {
    stock[row.item_id] = stock[row.item_id] || {};
    stock[row.item_id][row.location_id] = row.quantity;
  });

  const shapedItems = items.map((it) => ({
    id: it.id,
    name: it.name,
    category: catById[it.category_id] || "Uncategorized",
    manufacturer: mfrById[it.manufacturer_id] || "—",
    price: Number(it.price),
    unit: it.unit,
    supplierId: it.supplier_id,
    secondarySupplierId: it.secondary_supplier_id,
    supplierPartNo: it.supplier_part_no || "—",
    reorderPoint: it.reorder_point,
    reorderQty: it.reorder_qty,
    qrCode: it.qr_code,
  }));

  return {
    categories: categories.map((c) => c.name),
    manufacturers: manufacturers.map((m) => m.name),
    suppliers: suppliers.map((s) => ({ id: s.id, name: s.name, contact: s.contact })),
    locations: locations.map((l) => ({ id: l.id, name: l.name })),
    refCategoriesByName: Object.fromEntries(categories.map((c) => [c.name, c.id])),
    refManufacturersByName: Object.fromEntries(manufacturers.map((m) => [m.name, m.id])),
    items: shapedItems,
    stock,
  };
}

function totalStock(stockForItem) {
  return Object.values(stockForItem || {}).reduce((sum, n) => sum + (n || 0), 0);
}

function qrUrl(qrCode) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=${encodeURIComponent(qrCode)}`;
}


function InventoryModule({ setView }) {
  const [data, setData] = useState({ categories: [], manufacturers: [], suppliers: [], locations: [], items: [], stock: {} });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [tab, setTab] = useState("items"); // items | add | reorder | suppliers
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [manufacturerFilter, setManufacturerFilter] = useState("all");
  const [activeItem, setActiveItem] = useState(null); // item shown in detail/QR modal
  const [scannerOpen, setScannerOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const seeded = await ensureSeeded();
        setData(shapeInventoryData(seeded));
        setLoadError(null);
      } catch (e) {
        setLoadError(e.message || "Couldn't reach the database.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function adjustStock(itemId, locationId, delta) {
    const current = data.stock[itemId]?.[locationId] || 0;
    const next = Math.max(0, current + delta);
    try {
      await sb(`stock_levels?item_id=eq.${itemId}&location_id=eq.${locationId}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity: next, updated_at: new Date().toISOString() }),
        prefer: "return=minimal",
      });
      await sb("inventory_transactions", {
        method: "POST",
        body: JSON.stringify([{ item_id: itemId, location_id: locationId, delta }]),
        prefer: "return=minimal",
      });
      setData((prev) => ({
        ...prev,
        stock: { ...prev.stock, [itemId]: { ...prev.stock[itemId], [locationId]: next } },
      }));
      setSaveError(null);
    } catch (e) {
      setSaveError("Couldn't save that change — check your connection and try again.");
    }
  }

  async function addItem(form) {
    try {
      const payload = {
        name: form.name,
        category_id: data.refCategoriesByName[form.category] || null,
        manufacturer_id: data.refManufacturersByName[form.manufacturer] || null,
        unit: form.unit,
        price: form.price,
        supplier_id: form.supplierId,
        secondary_supplier_id: form.secondarySupplierId || null,
        supplier_part_no: form.supplierPartNo,
        reorder_point: form.reorderPoint,
        reorder_qty: form.reorderQty,
        qr_code: newQrCode(),
      };
      const [inserted] = await sb("items", { method: "POST", body: JSON.stringify([payload]) });

      const stockPayload = data.locations.map((loc) => ({ item_id: inserted.id, location_id: loc.id, quantity: 0 }));
      await sb("stock_levels", { method: "POST", body: JSON.stringify(stockPayload), prefer: "return=minimal" });

      const shapedItem = {
        id: inserted.id,
        name: inserted.name,
        category: form.category,
        manufacturer: form.manufacturer,
        price: Number(inserted.price),
        unit: inserted.unit,
        supplierId: inserted.supplier_id,
        secondarySupplierId: inserted.secondary_supplier_id,
        supplierPartNo: inserted.supplier_part_no || "—",
        reorderPoint: inserted.reorder_point,
        reorderQty: inserted.reorder_qty,
        qrCode: inserted.qr_code,
      };
      setData((prev) => {
        const stock = { ...prev.stock, [inserted.id]: {} };
        prev.locations.forEach((loc) => (stock[inserted.id][loc.id] = 0));
        return { ...prev, items: [...prev.items, shapedItem], stock };
      });
      setSaveError(null);
    } catch (e) {
      setSaveError("Couldn't save the new item — check your connection and try again.");
    }
  }

  const filteredItems = data.items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.supplierPartNo.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    const matchesManufacturer = manufacturerFilter === "all" || item.manufacturer === manufacturerFilter;
    return matchesSearch && matchesCategory && matchesManufacturer;
  });

  const categoryCounts = {};
  data.items.forEach((item) => {
    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
  });

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <Loader2 size={24} color="#8B94A3" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={styles.placeholderWrap}>
        <AlertTriangle size={28} color="#D9534F" />
        <h2 style={styles.placeholderTitle}>Couldn't reach the database</h2>
        <p style={styles.placeholderText}>{loadError}</p>
        <p style={styles.placeholderText}>
          Double check the Supabase URL and anon key are correct and that RLS policies allow read/write.
        </p>
        <button style={styles.backBtn} onClick={() => setView("dashboard")}>
          ← Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={styles.dashHeadRow}>
        <h2 style={styles.dashTitle}>INVENTORY</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={styles.scanBtn} onClick={() => setScannerOpen(true)}>
            <Camera size={15} /> Scan
          </button>
          <button style={styles.backBtn} onClick={() => setView("dashboard")}>
            ← Back to dashboard
          </button>
        </div>
      </div>

      <div style={styles.invTabs}>
        {[
          { key: "items", label: "Items" },
          { key: "add", label: "Add Item" },
          { key: "reorder", label: "Reorder Report" },
          { key: "suppliers", label: "Suppliers" },
        ].map((t) => (
          <button
            key={t.key}
            style={{ ...styles.invTab, ...(tab === t.key ? styles.invTabActive : {}) }}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {saveError && <div style={styles.errorText}>{saveError}</div>}

      {tab === "items" && !selectedCategory && (
        <div>
          <div style={styles.catIntro}>Choose a category to browse its products.</div>
          <div style={styles.pegboard}>
            {data.categories.map((cat) => (
              <button key={cat} className="tile-btn" style={styles.catBadge} onClick={() => setSelectedCategory(cat)}>
                <div style={styles.catBadgeIcon}>
                  <Boxes size={22} color="#4A90D9" />
                </div>
                <div style={styles.catBadgeName}>{cat}</div>
                <div style={styles.catBadgeCount}>{categoryCounts[cat] || 0} items</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {tab === "items" && selectedCategory && (
        <div>
          <button style={styles.catBackLink} onClick={() => { setSelectedCategory(null); setManufacturerFilter("all"); setSearch(""); }}>
            ← All categories
          </button>
          <h3 style={styles.catHeading}>{selectedCategory}</h3>

          <div style={styles.invFilterRow}>
            <div style={styles.searchBox}>
              <Search size={14} color="#8B94A3" />
              <input
                style={styles.searchInput}
                placeholder="Search by name or part number…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select style={styles.select} value={manufacturerFilter} onChange={(e) => setManufacturerFilter(e.target.value)}>
              <option value="all">All manufacturers</option>
              {MANUFACTURERS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.productTable}>
            <div style={styles.productTableHead}>
              <span style={{ flex: 2 }}>Name</span>
              <span style={{ flex: 1, textAlign: "center" }}>In Stock</span>
              <span style={{ flex: 1, textAlign: "right" }}>Price</span>
            </div>
            {filteredItems.length === 0 && <div style={styles.emptyText}>No items match that filter.</div>}
            {filteredItems.map((item) => {
              const total = totalStock(data.stock[item.id]);
              const inStock = total > 0;
              return (
                <button key={item.id} style={styles.productRow} onClick={() => setActiveItem(item)}>
                  <span style={styles.productRowName}>
                    {item.name}
                    <span style={styles.productRowMfr}>{item.manufacturer}</span>
                  </span>
                  <span style={{ flex: 1, textAlign: "center" }}>
                    <span style={{ ...styles.stockPill, ...(inStock ? styles.stockPillIn : styles.stockPillOut) }}>
                      {inStock ? "In stock" : "Out"}
                    </span>
                  </span>
                  <span style={styles.productRowPrice}>${item.price.toFixed(2)}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {tab === "add" && (
        <AddItemForm categories={data.categories} suppliers={data.suppliers} onAdd={addItem} onDone={() => setTab("items")} />
      )}

      {tab === "reorder" && <ReorderReport data={data} />}

      {tab === "suppliers" && <SuppliersList suppliers={data.suppliers} />}

      {activeItem && (
        <ItemDetailModal
          item={data.items.find((i) => i.id === activeItem.id) || activeItem}
          supplier={data.suppliers.find((s) => s.id === activeItem.supplierId)}
          secondarySupplier={data.suppliers.find((s) => s.id === (data.items.find((i) => i.id === activeItem.id) || activeItem).secondarySupplierId)}
          stock={data.stock[activeItem.id] || {}}
          locations={data.locations}
          onAdjust={(locationId, delta) => adjustStock(activeItem.id, locationId, delta)}
          onClose={() => setActiveItem(null)}
        />
      )}

      {scannerOpen && (
        <QRScannerModal
          items={data.items}
          onMatch={(item) => {
            setScannerOpen(false);
            setActiveItem(item);
          }}
          onClose={() => setScannerOpen(false)}
        />
      )}
    </div>
  );
}

function AddItemForm({ categories, suppliers, onAdd, onDone }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [manufacturer, setManufacturer] = useState(MANUFACTURERS[0]);
  const [price, setPrice] = useState(0);
  const [unit, setUnit] = useState("each");
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || "");
  const [secondarySupplierId, setSecondarySupplierId] = useState("");
  const [supplierPartNo, setSupplierPartNo] = useState("");
  const [reorderPoint, setReorderPoint] = useState(5);
  const [reorderQty, setReorderQty] = useState(10);

  function submit() {
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      category,
      manufacturer,
      price: Number(price) || 0,
      unit,
      supplierId,
      secondarySupplierId: secondarySupplierId || null,
      supplierPartNo: supplierPartNo.trim() || "—",
      reorderPoint: Number(reorderPoint) || 0,
      reorderQty: Number(reorderQty) || 0,
    });
    onDone();
  }

  return (
    <div style={styles.formCard}>
      <div style={styles.formRow}>
        <label style={styles.formLabel}>Item name</label>
        <input style={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Cylinder, C Keyway" />
      </div>
      <div style={styles.formRow2col}>
        <div>
          <label style={styles.formLabel}>Category</label>
          <select style={styles.select} value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={styles.formLabel}>Manufacturer</label>
          <select style={styles.select} value={manufacturer} onChange={(e) => setManufacturer(e.target.value)}>
            {MANUFACTURERS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div style={styles.formRow2col}>
        <div>
          <label style={styles.formLabel}>Price ($)</label>
          <input type="number" step="0.01" style={styles.input} value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
        <div>
          <label style={styles.formLabel}>Unit</label>
          <input style={styles.input} value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="each / box / pack" />
        </div>
      </div>
      <div style={styles.formRow2col}>
        <div>
          <label style={styles.formLabel}>Primary supplier</label>
          <select style={styles.select} value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={styles.formLabel}>Secondary supplier (optional)</label>
          <select style={styles.select} value={secondarySupplierId} onChange={(e) => setSecondarySupplierId(e.target.value)}>
            <option value="">None</option>
            {suppliers
              .filter((s) => s.id !== supplierId)
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
          </select>
        </div>
      </div>
      <div style={styles.formRow2col}>
        <div>
          <label style={styles.formLabel}>Supplier part #</label>
          <input style={styles.input} value={supplierPartNo} onChange={(e) => setSupplierPartNo(e.target.value)} placeholder="e.g. SCH-C123" />
        </div>
        <div>
          <label style={styles.formLabel}>Reorder point</label>
          <input type="number" style={styles.input} value={reorderPoint} onChange={(e) => setReorderPoint(e.target.value)} />
        </div>
      </div>
      <div style={styles.formRow}>
        <label style={styles.formLabel}>Reorder quantity</label>
        <input type="number" style={styles.input} value={reorderQty} onChange={(e) => setReorderQty(e.target.value)} />
      </div>
      <button style={styles.addBtn} onClick={submit} disabled={!name.trim()}>
        <Plus size={16} /> Add item &amp; generate QR code
      </button>
    </div>
  );
}

function ItemDetailModal({ item, supplier, secondarySupplier, stock, locations, onAdjust, onClose }) {
  const [adjustQty, setAdjustQty] = useState(1);
  return (
    <div style={styles.pinOverlay} onClick={onClose}>
      <div style={styles.detailCard} onClick={(e) => e.stopPropagation()}>
        <button style={styles.detailClose} onClick={onClose} aria-label="Close">
          <X size={18} color="#8B94A3" />
        </button>
        <div style={styles.detailTop}>
          <img src={qrUrl(item.qrCode)} alt={`QR code for ${item.name}`} style={styles.qrImg} />
          <div>
            <div style={styles.detailName}>{item.name}</div>
            <div style={styles.detailMeta}>{item.category}</div>
            <div style={styles.detailMeta}>
              Primary: {supplier ? supplier.name : "No supplier set"} · #{item.supplierPartNo}
            </div>
            {secondarySupplier && <div style={styles.detailMeta}>Secondary: {secondarySupplier.name}</div>}
            <div style={styles.detailMeta}>{item.manufacturer} · ${item.price.toFixed(2)} / {item.unit}</div>
            <div style={styles.detailMeta}>Reorder at {item.reorderPoint}, order {item.reorderQty} {item.unit}s</div>
          </div>
        </div>

        <div style={styles.detailStockList}>
          {locations.map((loc) => (
            <div key={loc.id} style={styles.detailStockRow}>
              <span style={styles.detailStockLoc}>{loc.name}</span>
              <span style={styles.detailStockQty}>
                {stock[loc.id] || 0} {item.unit}
                {(stock[loc.id] || 0) !== 1 ? "s" : ""}
              </span>
              <div style={styles.detailStockBtns}>
                <button style={styles.stockBtn} onClick={() => onAdjust(loc.id, -adjustQty)} aria-label="Remove stock">
                  <Minus size={14} />
                </button>
                <input
                  type="number"
                  style={styles.stockQtyInput}
                  value={adjustQty}
                  min={1}
                  onChange={(e) => setAdjustQty(Math.max(1, Number(e.target.value) || 1))}
                />
                <button style={styles.stockBtn} onClick={() => onAdjust(loc.id, adjustQty)} aria-label="Add stock">
                  <Plus size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div style={styles.pinDemoNote}>
          Print this QR and attach it to the bin/shelf — scanning it from the Inventory screen's Scan button
          opens this same adjust view.
        </div>
      </div>
    </div>
  );
}

function QRScannerModal({ items, onMatch, onClose }) {
  const videoRef = React.useRef(null);
  const streamRef = React.useRef(null);
  const rafRef = React.useRef(null);
  const [status, setStatus] = useState("starting"); // starting | scanning | unsupported | denied | not-found
  const [notFoundText, setNotFoundText] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function start() {
      if (typeof window === "undefined" || !("BarcodeDetector" in window)) {
        setStatus("unsupported");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setStatus("scanning");

        const detector = new window.BarcodeDetector({ formats: ["qr_code"] });

        const tick = async () => {
          if (cancelled || !videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes.length > 0) {
              const value = codes[0].rawValue;
              const match = items.find((i) => i.qrCode === value);
              if (match) {
                onMatch(match);
                return;
              } else {
                setNotFoundText(value);
              }
            }
          } catch (e) {
            // detection hiccup on this frame — keep trying
          }
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch (e) {
        setStatus("denied");
      }
    }

    start();
    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, [items, onMatch]);

  return (
    <div style={styles.pinOverlay} onClick={onClose}>
      <div style={styles.scannerCard} onClick={(e) => e.stopPropagation()}>
        <button style={styles.detailClose} onClick={onClose} aria-label="Close">
          <X size={18} color="#8B94A3" />
        </button>
        <h3 style={styles.faqSectionTitle}>Scan an item QR code</h3>

        {status === "scanning" || status === "starting" ? (
          <div style={styles.scannerVideoWrap}>
            <video ref={videoRef} style={styles.scannerVideo} muted playsInline />
            <div style={styles.scannerFrame} />
          </div>
        ) : status === "unsupported" ? (
          <div style={styles.emptyText}>
            This browser doesn't support built-in barcode scanning (common on iPhone Safari). Use search on the
            Items tab to find the product instead, or open this portal in Chrome on Android.
          </div>
        ) : status === "denied" ? (
          <div style={styles.emptyText}>
            Camera access was blocked. Check your browser's site permissions and allow camera access, then try
            again.
          </div>
        ) : null}

        {notFoundText && (
          <div style={styles.errorText}>No item matches code "{notFoundText}" — keep scanning or check the Items tab.</div>
        )}

        <div style={styles.pinDemoNote}>Point the camera at the QR code printed on the bin or shelf label.</div>
      </div>
    </div>
  );
}

function ReorderReport({ data }) {
  const lowItems = data.items.filter((item) => totalStock(data.stock[item.id]) < item.reorderPoint);
  const bySupplier = {};
  lowItems.forEach((item) => {
    const supId = item.supplierId || "none";
    if (!bySupplier[supId]) bySupplier[supId] = [];
    bySupplier[supId].push(item);
  });

  if (lowItems.length === 0) {
    return <div style={styles.emptyText}>Nothing below its reorder point right now.</div>;
  }

  return (
    <div>
      {Object.entries(bySupplier).map(([supId, items]) => {
        const supplier = data.suppliers.find((s) => s.id === supId);
        return (
          <div key={supId} style={styles.reorderGroup}>
            <div style={styles.reorderSupplierName}>{supplier ? supplier.name : "No supplier set"}</div>
            {supplier && <div style={styles.reorderSupplierContact}>{supplier.contact}</div>}
            {items.map((item) => (
              <div key={item.id} style={styles.reorderItemRow}>
                <span>{item.name}</span>
                <span style={styles.reorderQtyText}>
                  order {item.reorderQty} {item.unit}
                  {item.reorderQty !== 1 ? "s" : ""} · #{item.supplierPartNo}
                </span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function SuppliersList({ suppliers }) {
  return (
    <div style={styles.teamList}>
      {suppliers.map((s) => (
        <div key={s.id} style={styles.teamRow}>
          <div style={{ flex: 1 }}>
            <div style={styles.teamRowName}>{s.name}</div>
            <div style={styles.teamRowRole}>{s.contact}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ManageTeam({ employees, persistEmployees, saveError, setView }) {
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("locksmith");
  const [saving, setSaving] = useState(false);

  async function addEmployee() {
    if (!newName.trim()) return;
    setSaving(true);
    const id = newName.trim().toLowerCase().replace(/\s+/g, "-") + "-" + Date.now().toString(36).slice(-4);
    const next = [...employees, { id, name: newName.trim(), role: newRole, pattern: null }];
    await persistEmployees(next);
    setNewName("");
    setSaving(false);
  }

  async function removeEmployee(id) {
    const next = employees.filter((e) => e.id !== id);
    await persistEmployees(next);
  }

  async function resetPattern(id) {
    const next = employees.map((e) => (e.id === id ? { ...e, pattern: null } : e));
    await persistEmployees(next);
  }

  return (
    <div style={styles.placeholderWrap}>
      <Users size={32} color="#E8873A" />
      <h2 style={styles.placeholderTitle}>Manage team</h2>
      <p style={styles.placeholderText}>
        Shared across everyone who opens this portal — changes here update the badge
        board for all employees. New employees set their own pattern the first time
        they log in.
      </p>

      <div style={styles.addRow}>
        <input
          style={styles.input}
          placeholder="Full name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <select style={styles.select} value={newRole} onChange={(e) => setNewRole(e.target.value)}>
          {Object.entries(ROLE_META).map(([key, meta]) => (
            <option key={key} value={key}>
              {meta.label}
            </option>
          ))}
        </select>
        <button style={styles.addBtn} onClick={addEmployee} disabled={saving || !newName.trim()}>
          <Plus size={16} /> Add
        </button>
      </div>
      {saveError && <div style={styles.errorText}>{saveError}</div>}

      <div style={styles.teamList}>
        {employees.map((emp) => (
          <div key={emp.id} style={styles.teamRow}>
            <div style={{ ...styles.badgeAvatar, width: 32, height: 32, fontSize: 12, background: ROLE_META[emp.role].color }}>
              {initials(emp.name)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={styles.teamRowName}>{emp.name}</div>
              <div style={{ ...styles.teamRowRole, color: ROLE_META[emp.role].color }}>
                {ROLE_META[emp.role].label} · {emp.pattern ? "Pattern set" : "No pattern yet"}
              </div>
            </div>
            <button style={styles.resetPatternBtn} onClick={() => resetPattern(emp.id)} disabled={!emp.pattern}>
              Reset pattern
            </button>
            <button style={styles.deleteBtn} onClick={() => removeEmployee(emp.id)} aria-label={`Remove ${emp.name}`}>
              <Trash2 size={14} color="#D9534F" />
            </button>
          </div>
        ))}
      </div>

      <button style={styles.backBtn} onClick={() => setView("dashboard")}>
        ← Back to dashboard
      </button>
    </div>
  );
}

const FAQ_ARTICLES = [
  {
    key: "handing-finishes",
    title: "Door & Hardware Handing + Finish Codes",
    desc: "Terminology, diagrams, and the standard finish code chart",
    icon: DoorOpen,
  },
];

const FINISH_CODES = [
  { code: "605", name: "Bright Brass", swatch: "#D4AF6A", note: "US3" },
  { code: "606", name: "Satin Brass", swatch: "#C4A25A", note: "US4" },
  { code: "609", name: "Antique Brass", swatch: "#8A6B3A", note: "US5" },
  { code: "612", name: "Satin Bronze", swatch: "#7A6A52", note: "US10" },
  { code: "613", name: "Oil-Rubbed Bronze", swatch: "#3A2E22", note: "US10B — living finish, patinas over time" },
  { code: "619", name: "Satin Nickel", swatch: "#C7C9CC", note: "US15" },
  { code: "622", name: "Flat Black", swatch: "#1C1C1C", note: "US19" },
  { code: "625", name: "Bright Chrome", swatch: "#DEE2E6", note: "US26" },
  { code: "626", name: "Satin Chrome", swatch: "#A9AFB5", note: "US26D — most common interior commercial finish" },
  { code: "630", name: "Satin Stainless Steel", swatch: "#9DA3A8", note: "US32D — common on exit devices, exterior/coastal" },
];

function FaqModule({ setView }) {
  const [article, setArticle] = useState(null);

  if (article === "handing-finishes") {
    return <DoorHandingFinishesArticle onBack={() => setArticle(null)} />;
  }

  return (
    <div>
      <div style={styles.dashHeadRow}>
        <h2 style={styles.dashTitle}>TECH SUPPORT FAQ</h2>
        <button style={styles.backBtn} onClick={() => setView("dashboard")}>
          ← Back to dashboard
        </button>
      </div>

      <div style={styles.itemList}>
        {FAQ_ARTICLES.map((a) => {
          const Icon = a.icon;
          return (
            <button key={a.key} style={styles.faqArticleRow} onClick={() => setArticle(a.key)}>
              <div style={styles.faqArticleIcon}>
                <Icon size={18} color="#4A90D9" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={styles.itemRowName}>{a.title}</div>
                <div style={styles.itemRowMeta}>{a.desc}</div>
              </div>
              <ChevronRight size={16} color="#5C6473" />
            </button>
          );
        })}
        <div style={styles.emptyText}>More articles coming as questions come up — let the office know what to add.</div>
      </div>
    </div>
  );
}

function DoorHandingFinishesArticle({ onBack }) {
  const hands = [
    { key: "LH", name: "Left Hand", desc: "Hinges on the left, door pushes away from you (swings in)." },
    { key: "RH", name: "Right Hand", desc: "Hinges on the right, door pushes away from you (swings in)." },
    { key: "LHR", name: "Left Hand Reverse", desc: "Hinges on the left, door pulls toward you (swings out)." },
    { key: "RHR", name: "Right Hand Reverse", desc: "Hinges on the right, door pulls toward you (swings out)." },
  ];

  return (
    <div>
      <button style={styles.catBackLink} onClick={onBack}>
        ← All FAQ articles
      </button>
      <h2 style={styles.catHeading}>Door &amp; Hardware Handing + Finish Codes</h2>

      <section style={styles.faqSection}>
        <div style={styles.faqSectionHead}>
          <DoorOpen size={16} color="#4A90D9" />
          <h3 style={styles.faqSectionTitle}>Determining door handing</h3>
        </div>
        <p style={styles.faqBodyText}>
          Stand on the secure side of the door — the side the key is used from (usually outside, or the
          hallway side for an interior door). From there, note which side the hinges are on, and whether
          you'd push or pull the door open.
        </p>

        <div style={styles.handGrid}>
          {hands.map((h) => (
            <div key={h.key} style={styles.handCard}>
              <svg viewBox="0 0 100 100" width="72" height="72" style={styles.handDiagram}>
                <rect x="10" y="10" width="80" height="80" fill="none" stroke="#333B47" strokeWidth="2" />
                {/* hinge marks */}
                {(h.key === "LH" || h.key === "LHR") && (
                  <>
                    <rect x="6" y="20" width="6" height="10" fill="#4A90D9" />
                    <rect x="6" y="70" width="6" height="10" fill="#4A90D9" />
                  </>
                )}
                {(h.key === "RH" || h.key === "RHR") && (
                  <>
                    <rect x="88" y="20" width="6" height="10" fill="#4A90D9" />
                    <rect x="88" y="70" width="6" height="10" fill="#4A90D9" />
                  </>
                )}
                {/* swing arc */}
                {h.key === "LH" && <path d="M 10 10 A 80 80 0 0 1 90 90" fill="none" stroke="#E8873A" strokeWidth="2" strokeDasharray="4 3" />}
                {h.key === "RH" && <path d="M 90 10 A 80 80 0 0 0 10 90" fill="none" stroke="#E8873A" strokeWidth="2" strokeDasharray="4 3" />}
                {h.key === "LHR" && <path d="M 10 10 A 80 80 0 0 0 -10 90" fill="none" stroke="#E8873A" strokeWidth="2" strokeDasharray="4 3" transform="translate(20,0)" />}
                {h.key === "RHR" && <path d="M 90 10 A 80 80 0 0 1 110 90" fill="none" stroke="#E8873A" strokeWidth="2" strokeDasharray="4 3" transform="translate(-20,0)" />}
              </svg>
              <div style={styles.handCardCode}>{h.key}</div>
              <div style={styles.handCardName}>{h.name}</div>
              <div style={styles.handCardDesc}>{h.desc}</div>
            </div>
          ))}
        </div>
        <p style={styles.faqNoteText}>
          Blue marks = hinge side. Orange dashed line = swing direction, from the secure side view.
        </p>
      </section>

      <section style={styles.faqSection}>
        <div style={styles.faqSectionHead}>
          <Palette size={16} color="#4A90D9" />
          <h3 style={styles.faqSectionTitle}>Standard hardware finish codes (BHMA / ANSI A156.18)</h3>
        </div>
        <p style={styles.faqBodyText}>
          These three-digit BHMA codes are the current industry standard and are used across manufacturers
          (Schlage, Von Duprin, LCN, Sargent, etc.) — the same code means the same finish regardless of brand.
          Older "US" codes (shown in the note column) are still common in the trade and refer to the same finish.
        </p>
        <div style={styles.finishGrid}>
          {FINISH_CODES.map((f) => (
            <div key={f.code} style={styles.finishCard}>
              <div style={{ ...styles.finishSwatch, background: f.swatch }} />
              <div style={styles.finishCode}>{f.code}</div>
              <div style={styles.finishName}>{f.name}</div>
              <div style={styles.finishNote}>{f.note}</div>
            </div>
          ))}
        </div>
        <p style={styles.faqNoteText}>
          626 (satin chrome) and 630 (satin stainless) are the two most common defaults — 626 for interior
          commercial hardware, 630 for exit devices, hinges, and exterior/coastal applications. Colors above
          are approximate — always confirm against a physical sample before quoting a customer on a finish
          match.
        </p>
      </section>
    </div>
  );
}

const SAFETY_STORAGE_KEY = "ab-portal:safety-checks";

// Swap in the actual shared Drive folder link here once provided — see note in SafetyChecksModule
const SAFETY_DRIVE_URL = null;

const SEED_VEHICLES = [
  { id: "veh-01", name: "Truck 1", assignedTo: "Oliver Worth", takeHome: true },
  { id: "veh-02", name: "Truck 2", assignedTo: "Richard Watson", takeHome: true },
  { id: "veh-03", name: "Truck 3", assignedTo: "Eric Corson", takeHome: true },
  { id: "veh-04", name: "Truck 4", assignedTo: "Sam Arcand", takeHome: true },
  { id: "veh-05", name: "Truck 5", assignedTo: "Andrew Towne", takeHome: true },
  { id: "veh-06", name: "Van 1", assignedTo: "Corey Poitras", takeHome: true },
  { id: "veh-07", name: "Van 2", assignedTo: "Adam Brooks", takeHome: true },
  { id: "veh-08", name: "Van 3", assignedTo: "Briar Cudworth", takeHome: true },
  { id: "veh-09", name: "Shared Pool Van — Gilford", assignedTo: "Richard Watson", takeHome: false },
  { id: "veh-10", name: "Shared Pool Truck — Dover HQ", assignedTo: "Drew Dunn", takeHome: false },
  { id: "veh-11", name: "2024 GMC 2500", assignedTo: "Brian Akerley", takeHome: true },
];

const CHECK_ITEMS = [
  { key: "fluids", label: "Fluids", desc: "Oil, coolant, washer fluid levels", icon: Droplet },
  { key: "tires", label: "Tires", desc: "Tread depth & condition", icon: Wrench },
  { key: "pressure", label: "Tire pressure", desc: "All four at spec", icon: Gauge },
  { key: "other", label: "Anything else", desc: "Windshield, lights, brakes, or anything else noticed", icon: AlertTriangle },
];

function currentMonthKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(monthKey) {
  const [y, m] = monthKey.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

const CHECK_WINDOW_HOURS = 72;

// Checks open on the 1st of the month and are due within a 72-hour window from then
function checkWindow(monthKey = currentMonthKey(), now = new Date()) {
  const [y, m] = monthKey.split("-");
  const opensAt = new Date(Number(y), Number(m) - 1, 1, 0, 0, 0);
  const deadline = new Date(opensAt.getTime() + CHECK_WINDOW_HOURS * 60 * 60 * 1000);
  return { opensAt, deadline, isPastDeadline: now > deadline };
}

function deadlineLabel(monthKey) {
  const { deadline } = checkWindow(monthKey);
  return deadline.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + " at " + deadline.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function downloadCsv(filename, rows) {
  const csv = rows.map((r) => r.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function SafetyChecksModule({ session, setView }) {
  const [data, setData] = useState({ vehicles: SEED_VEHICLES, checks: {}, tickets: [] });
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState(null);
  const [tab, setTab] = useState("my-checks"); // my-checks | tickets
  const [formVehicle, setFormVehicle] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get(SAFETY_STORAGE_KEY, true);
        if (result && result.value) {
          const stored = JSON.parse(result.value);
          const knownIds = new Set(stored.vehicles.map((v) => v.id));
          const missing = SEED_VEHICLES.filter((v) => !knownIds.has(v.id));
          if (missing.length) {
            const merged = { ...stored, vehicles: [...stored.vehicles, ...missing] };
            setData(merged);
            await window.storage.set(SAFETY_STORAGE_KEY, JSON.stringify(merged), true);
          } else {
            setData(stored);
          }
        } else {
          const seeded = { vehicles: SEED_VEHICLES, checks: {}, tickets: [] };
          await window.storage.set(SAFETY_STORAGE_KEY, JSON.stringify(seeded), true);
          setData(seeded);
        }
      } catch (e) {
        // fall back to in-memory placeholder data
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function persist(next) {
    setData(next);
    try {
      const result = await window.storage.set(SAFETY_STORAGE_KEY, JSON.stringify(next), true);
      setSaveError(result ? null : "Changes may not have saved. Try again.");
    } catch (e) {
      setSaveError("Changes may not have saved. Try again.");
    }
  }

  function submitCheck(vehicle, items, oilChangeDate, mileage, notes) {
    const monthKey = currentMonthKey();
    const next = { ...data, checks: { ...data.checks }, tickets: [...data.tickets] };
    next.checks[vehicle.id] = { ...(next.checks[vehicle.id] || {}) };
    next.checks[vehicle.id][monthKey] = {
      completedBy: session.name,
      completedAt: new Date().toISOString(),
      items,
      oilChangeDate,
      mileage,
      notes,
    };

    Object.entries(items).forEach(([itemKey, val]) => {
      if (val.status === "needs-service") {
        const itemMeta = CHECK_ITEMS.find((c) => c.key === itemKey);
        next.tickets.push({
          id: "tkt-" + Date.now().toString(36) + "-" + itemKey,
          vehicleId: vehicle.id,
          vehicleName: vehicle.name,
          item: itemMeta ? itemMeta.label : itemKey,
          note: val.note || "",
          reportedBy: session.name,
          date: new Date().toISOString(),
          status: "open",
        });
      }
    });

    persist(next);
    setFormVehicle(null);
  }

  function cycleTicketStatus(ticketId) {
    const order = ["open", "scheduled", "done"];
    const next = { ...data, tickets: data.tickets.map((t) => (t.id === ticketId ? { ...t, status: order[(order.indexOf(t.status) + 1) % order.length] } : t)) };
    persist(next);
  }

  function exportMonthCsv() {
    const monthKey = currentMonthKey();
    const rows = [["Vehicle", "Assigned To", "Completed By", "Fluids", "Tires", "Tire Pressure", "Other", "Mileage", "Last Oil Change", "Notes"]];
    data.vehicles.forEach((v) => {
      const check = data.checks[v.id] && data.checks[v.id][monthKey];
      if (!check) return;
      rows.push([
        v.name,
        v.assignedTo,
        check.completedBy,
        check.items.fluids?.status,
        check.items.tires?.status,
        check.items.pressure?.status,
        check.items.other?.status,
        check.mileage,
        check.oilChangeDate,
        check.notes,
      ]);
    });
    downloadCsv(`safety-checks-${monthKey}.csv`, rows);
  }

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <Loader2 size={24} color="#8B94A3" />
      </div>
    );
  }

  const monthKey = currentMonthKey();
  const myVehicles = data.vehicles.filter((v) => v.assignedTo === session.name);
  const canSeeTickets = session.role === "admin" || session.role === "office";
  const openTicketCount = data.tickets.filter((t) => t.status !== "done").length;

  return (
    <div>
      <div style={styles.dashHeadRow}>
        <h2 style={styles.dashTitle}>SAFETY CHECKS — PLACEHOLDER DATA</h2>
        <button style={styles.backBtn} onClick={() => setView("dashboard")}>
          ← Back to dashboard
        </button>
      </div>

      <div style={styles.invTabs}>
        <button style={{ ...styles.invTab, ...(tab === "my-checks" ? styles.invTabActive : {}) }} onClick={() => setTab("my-checks")}>
          My Vehicle Checks
        </button>
        {canSeeTickets && (
          <button style={{ ...styles.invTab, ...(tab === "tickets" ? styles.invTabActive : {}) }} onClick={() => setTab("tickets")}>
            Maintenance Tickets{openTicketCount > 0 ? ` (${openTicketCount})` : ""}
          </button>
        )}
      </div>

      {saveError && <div style={styles.errorText}>{saveError}</div>}

      {tab === "my-checks" && (
        <div>
          <p style={styles.faqBodyText}>
            Checks open on the 1st of the month with a 72-hour window to complete — this month's deadline is{" "}
            {deadlineLabel(monthKey)}. Anything marked "Needs service" automatically opens a maintenance ticket below.
          </p>
          {myVehicles.length === 0 && <div style={styles.emptyText}>No vehicle is assigned to you.</div>}
          <div style={styles.itemList}>
            {myVehicles.map((v) => {
              const check = data.checks[v.id] && data.checks[v.id][monthKey];
              const overdue = !check && checkWindow(monthKey).isPastDeadline;
              return (
                <div key={v.id} style={styles.vehicleRow}>
                  <div style={{ flex: 1 }}>
                    <div style={styles.itemRowName}>{v.name}</div>
                    <div style={styles.itemRowMeta}>{v.takeHome ? "Take-home vehicle" : "Shared vehicle"}</div>
                  </div>
                  {check ? (
                    <div style={styles.vehicleDoneTag}>
                      <CheckCircle2 size={14} color="#4FAE7C" /> Completed {new Date(check.completedAt).toLocaleDateString()}
                    </div>
                  ) : (
                    <button
                      style={{ ...styles.vehicleDueBtn, ...(overdue ? styles.vehicleOverdueBtn : {}) }}
                      onClick={() => setFormVehicle(v)}
                    >
                      <Bell size={13} /> {overdue ? "Overdue — fill out" : "Due — fill out"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "tickets" && canSeeTickets && (
        <div>
          <div style={styles.invFilterRow}>
            <div style={{ flex: 1 }} />
            <button style={styles.addBtn} onClick={exportMonthCsv}>
              <Download size={14} /> Export {monthLabel(monthKey)} (CSV)
            </button>
          </div>
          {data.tickets.length === 0 && <div style={styles.emptyText}>No maintenance tickets yet.</div>}
          <div style={styles.itemList}>
            {data.tickets
              .slice()
              .sort((a, b) => (a.status === "done") - (b.status === "done"))
              .map((t) => (
                <div key={t.id} style={styles.ticketRow}>
                  <div style={{ flex: 1 }}>
                    <div style={styles.itemRowName}>
                      {t.vehicleName} — {t.item}
                    </div>
                    <div style={styles.itemRowMeta}>
                      {t.note ? t.note + " · " : ""}Reported by {t.reportedBy}, {new Date(t.date).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    style={{
                      ...styles.ticketStatusBtn,
                      ...(t.status === "open" ? styles.ticketStatusOpen : t.status === "scheduled" ? styles.ticketStatusScheduled : styles.ticketStatusDone),
                    }}
                    onClick={() => cycleTicketStatus(t.id)}
                  >
                    {t.status === "open" ? "Open" : t.status === "scheduled" ? "Scheduled" : "Done"}
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {formVehicle && (
        <VehicleCheckForm vehicle={formVehicle} onSubmit={submitCheck} onClose={() => setFormVehicle(null)} />
      )}
    </div>
  );
}

function VehicleCheckForm({ vehicle, onSubmit, onClose }) {
  const [items, setItems] = useState(() => {
    const init = {};
    CHECK_ITEMS.forEach((c) => (init[c.key] = { status: "ok", note: "" }));
    return init;
  });
  const [oilChangeDate, setOilChangeDate] = useState("");
  const [mileage, setMileage] = useState("");
  const [notes, setNotes] = useState("");

  function setStatus(key, status) {
    setItems((prev) => ({ ...prev, [key]: { ...prev[key], status } }));
  }
  function setNote(key, note) {
    setItems((prev) => ({ ...prev, [key]: { ...prev[key], note } }));
  }

  return (
    <div style={styles.pinOverlay} onClick={onClose}>
      <div style={styles.checkFormCard} onClick={(e) => e.stopPropagation()}>
        <button style={styles.detailClose} onClick={onClose} aria-label="Close">
          <X size={18} color="#8B94A3" />
        </button>
        <h3 style={styles.faqSectionTitle}>{vehicle.name} — monthly safety check</h3>

        {CHECK_ITEMS.map((c) => {
          const Icon = c.icon;
          const val = items[c.key];
          return (
            <div key={c.key} style={styles.checkItemBlock}>
              <div style={styles.checkItemHead}>
                <Icon size={15} color="#4A90D9" />
                <div>
                  <div style={styles.checkItemLabel}>{c.label}</div>
                  <div style={styles.checkItemDesc}>{c.desc}</div>
                </div>
              </div>
              <div style={styles.checkStatusRow}>
                <button
                  style={{ ...styles.checkStatusBtn, ...(val.status === "ok" ? styles.checkStatusOkActive : {}) }}
                  onClick={() => setStatus(c.key, "ok")}
                >
                  OK
                </button>
                <button
                  style={{ ...styles.checkStatusBtn, ...(val.status === "needs-service" ? styles.checkStatusBadActive : {}) }}
                  onClick={() => setStatus(c.key, "needs-service")}
                >
                  Needs service
                </button>
              </div>
              {val.status === "needs-service" && (
                <input
                  style={styles.input}
                  placeholder="What's wrong? (e.g. rear tire low, windshield crack)"
                  value={val.note}
                  onChange={(e) => setNote(c.key, e.target.value)}
                />
              )}
            </div>
          );
        })}

        <div style={styles.formRow2col}>
          <div>
            <label style={styles.formLabel}>Current mileage</label>
            <input
              type="number"
              inputMode="numeric"
              style={styles.input}
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              placeholder="e.g. 42150"
            />
          </div>
          <div>
            <label style={styles.formLabel}>Last oil change (date, if known)</label>
            <input type="date" style={styles.input} value={oilChangeDate} onChange={(e) => setOilChangeDate(e.target.value)} />
          </div>
        </div>
        <div style={styles.formRow}>
          <label style={styles.formLabel}>General notes (optional)</label>
          <input style={styles.input} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything else worth flagging" />
        </div>

        <button style={styles.addBtn} onClick={() => onSubmit(vehicle, items, oilChangeDate, mileage, notes)}>
          <CheckCircle2 size={16} /> Submit check
        </button>
        <div style={styles.pinDemoNote}>
          {SAFETY_DRIVE_URL
            ? "This will also be saved to the shared Drive log."
            : "Saved to the portal for now — connecting this to your Drive log needs a real Drive integration, not just a link. Use Export CSV above in the meantime."}
        </div>
      </div>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "#14171C",
    fontFamily: "'Inter', sans-serif",
    color: "#E7EAEE",
  },
  loadingScreen: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  // Login
  loginWrap: { minHeight: "100vh", padding: "48px 24px", maxWidth: 880, margin: "0 auto" },
  loginHeader: { textAlign: "center", marginBottom: 36 },
  logoSlot: { display: "flex", justifyContent: "center", marginBottom: 16 },
  logoImg: { height: 56, width: "auto" },
  logoFallback: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    border: "1px solid #333B47",
    borderRadius: 10,
    padding: "12px 20px",
    background: "#1E232B",
  },
  logoFallbackText: {
    fontFamily: "'Oswald', sans-serif",
    fontWeight: 600,
    fontSize: 15,
    letterSpacing: "1px",
  },
  loginSub: { color: "#8B94A3", fontSize: 14, margin: 0 },

  signInCard: {
    maxWidth: 440,
    margin: "0 auto",
    background: "#1E232B",
    border: "1px solid #333B47",
    borderRadius: 16,
    padding: "28px 24px",
  },
  selectLabel: {
    display: "block",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 11,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    color: "#8B94A3",
    marginBottom: 8,
  },
  employeeSelect: {
    width: "100%",
    background: "#262C36",
    border: "1px solid #333B47",
    borderRadius: 8,
    padding: "12px 14px",
    color: "#E7EAEE",
    fontSize: 14,
    fontFamily: "'Inter', sans-serif",
  },
  pinSection: {
    marginTop: 24,
    paddingTop: 20,
    borderTop: "1px solid #2A313C",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  pinPersonRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    marginBottom: 18,
  },
  changeLink: {
    marginLeft: "auto",
    background: "none",
    border: "none",
    color: "#4A90D9",
    fontSize: 12,
    cursor: "pointer",
    padding: 4,
  },
  badgeAvatar: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Oswald', sans-serif",
    fontWeight: 600,
    fontSize: 16,
    color: "#14171C",
  },
  badgeRole: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 10,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  pinName: { fontFamily: "'Oswald', sans-serif", fontSize: 15, fontWeight: 600 },
  pinLabel: { color: "#8B94A3", fontSize: 13, margin: "4px 0 18px" },
  pinDots: { display: "flex", gap: 14, justifyContent: "center", marginBottom: 24 },
  pinDot: { width: 16, height: 16, borderRadius: "50%", border: "1px solid #4A5462" },
  pinPad: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, width: "100%" },
  pinKey: {
    background: "#262C36",
    border: "1px solid #3A4250",
    borderRadius: 12,
    padding: "26px 0",
    fontSize: 30,
    fontFamily: "'Oswald', sans-serif",
    fontWeight: 600,
    color: "#E7EAEE",
    cursor: "pointer",
    boxShadow: "0 2px 0 #14171C",
  },
  pinBottomRow: {
    display: "grid",
    gridTemplateColumns: "1fr 2fr",
    gap: 14,
    width: "100%",
    marginTop: 14,
  },
  pinZeroKey: {
    background: "#262C36",
    border: "1px solid #3A4250",
    borderRadius: 12,
    padding: "26px 0",
    fontSize: 30,
    fontFamily: "'Oswald', sans-serif",
    fontWeight: 600,
    color: "#E7EAEE",
    cursor: "pointer",
    boxShadow: "0 2px 0 #14171C",
  },
  pinClearKey: {
    background: "#33262A",
    border: "1px solid #4A3339",
    borderRadius: 12,
    padding: "26px 0",
    fontSize: 16,
    fontFamily: "'Oswald', sans-serif",
    fontWeight: 600,
    letterSpacing: "1px",
    color: "#D9534F",
    cursor: "pointer",
    boxShadow: "0 2px 0 #14171C",
  },
  pinDemoNote: { marginTop: 18, fontSize: 11, color: "#5C6473" },
  patternSvg: {
    width: "100%",
    maxWidth: 260,
    aspectRatio: "1 / 1",
    display: "block",
    margin: "0 auto",
    cursor: "pointer",
  },

  // Welcome screen (dark/red redesign)
  welcomeWrap: {
    minHeight: "100vh",
    background: "#0A0C0E",
    display: "flex",
    flexDirection: "column",
    padding: "48px 24px 28px",
    maxWidth: 520,
    margin: "0 auto",
  },
  welcomeLogoBlock: { textAlign: "center", marginBottom: 28 },
  welcomeLogoImg: { width: "100%", maxWidth: 480, height: "auto", display: "block", margin: "0 auto" },
  welcomeLogoLockup: {
    display: "flex",
    justifyContent: "center",
    alignItems: "baseline",
    fontFamily: "'Oswald', sans-serif",
    fontWeight: 700,
    fontSize: 46,
    letterSpacing: "-1px",
  },
  welcomeLogoA: { color: "#F4F4F4" },
  welcomeLogoAmp: { color: "#F4F4F4", fontSize: "0.55em", margin: "0 2px" },
  welcomeLogoB: { color: "#C1272D" },
  welcomeLogoSub: {
    fontFamily: "'Oswald', sans-serif",
    fontWeight: 600,
    fontSize: 15,
    letterSpacing: "2px",
    color: "#EDEDED",
    marginTop: 2,
  },
  welcomeTaglineRow: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 8 },
  welcomeTaglineLine: { width: 26, height: 1, background: "#C1272D" },
  welcomeTaglineText: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 10,
    letterSpacing: "2px",
    color: "#C1272D",
  },
  welcomeTitle: {
    fontFamily: "'Oswald', sans-serif",
    fontWeight: 600,
    fontSize: 26,
    textAlign: "center",
    color: "#F5F5F5",
    margin: "20px 0 4px",
  },
  welcomeSub: { textAlign: "center", fontSize: 13, color: "#9AA1AC", margin: "0 0 28px" },
  welcomeSelectLabel: {
    display: "block",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 11,
    letterSpacing: "1px",
    textTransform: "uppercase",
    color: "#C7CBD1",
    marginBottom: 8,
  },
  welcomeSelectWrap: { position: "relative", marginBottom: 20 },
  welcomeSelectIcon: { position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" },
  welcomeSelect: {
    width: "100%",
    background: "#15181C",
    border: "1px solid #33383F",
    borderRadius: 8,
    padding: "13px 14px 13px 40px",
    color: "#F0F0F0",
    fontSize: 14,
    fontFamily: "'Inter', sans-serif",
  },
  welcomeContinueBtn: {
    width: "100%",
    background: "#A61E22",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "15px 0",
    fontFamily: "'Oswald', sans-serif",
    fontWeight: 700,
    fontSize: 14,
    letterSpacing: "1px",
    cursor: "pointer",
    marginBottom: 36,
  },
  welcomeContinueBtnDisabled: { opacity: 0.45, cursor: "not-allowed" },
  welcomeFooterRow: {
    display: "flex",
    justifyContent: "center",
    marginTop: "auto",
    paddingTop: 20,
  },
  welcomeFooterItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    padding: "0 14px",
    flex: 1,
  },
  welcomeFooterLabel: {
    fontSize: 9,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    color: "#9AA1AC",
    lineHeight: 1.3,
    textAlign: "center",
  },
  welcomePatternCard: {
    background: "#15181C",
    border: "1px solid #2A2E33",
    borderRadius: 16,
    padding: "28px 24px",
    maxWidth: 380,
    margin: "0 auto",
  },

  // Shell
  shell: { minHeight: "100vh", display: "flex", flexDirection: "column" },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 24px",
    borderBottom: "1px solid #262C36",
    background: "#181C22",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 8 },
  headerBrand: {
    fontFamily: "'Oswald', sans-serif",
    fontWeight: 600,
    fontSize: 16,
    letterSpacing: "1px",
  },
  headerRight: { display: "flex", alignItems: "center", gap: 12 },
  headerName: { fontSize: 13, fontWeight: 600 },
  headerRole: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  logoutBtn: {
    background: "#262C36",
    border: "1px solid #333B47",
    borderRadius: 8,
    padding: 8,
    color: "#8B94A3",
    cursor: "pointer",
    display: "flex",
  },

  main: { flex: 1, padding: "32px 24px", maxWidth: 960, margin: "0 auto", width: "100%" },

  dashHeadRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 20,
    flexWrap: "wrap",
    gap: 8,
  },
  dashTitle: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: 14,
    letterSpacing: "2px",
    color: "#8B94A3",
    margin: 0,
  },
  dashDate: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#5C6473" },

  tileGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: 16,
  },
  tile: {
    background: "#1E232B",
    border: "1px solid #333B47",
    borderRadius: 10,
    padding: "20px 16px",
    textAlign: "left",
    cursor: "pointer",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    minHeight: 120,
  },
  tilePunch: {
    position: "absolute",
    top: 10,
    left: 10,
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#14171C",
    border: "1px solid #333B47",
  },
  tileIconWrap: { marginTop: 8 },
  tileLabel: { fontFamily: "'Oswald', sans-serif", fontSize: 16, fontWeight: 600 },
  tileDesc: { fontSize: 12, color: "#8B94A3", lineHeight: 1.4 },
  tileLockRow: { display: "flex", alignItems: "center", gap: 4, marginTop: "auto" },
  tileLockText: { fontSize: 10, color: "#8B94A3", textTransform: "uppercase", letterSpacing: "0.5px" },

  placeholderWrap: {
    maxWidth: 520,
    margin: "40px auto",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  placeholderTitle: { fontFamily: "'Oswald', sans-serif", fontSize: 22, margin: "8px 0 0" },
  placeholderText: { color: "#8B94A3", fontSize: 14, lineHeight: 1.6, margin: "0 0 16px" },
  backBtn: {
    background: "none",
    border: "1px solid #333B47",
    borderRadius: 8,
    padding: "10px 16px",
    color: "#8B94A3",
    cursor: "pointer",
    fontSize: 13,
    marginTop: 16,
  },

  addRow: { display: "flex", gap: 8, width: "100%", marginBottom: 8, flexWrap: "wrap" },
  input: {
    flex: 1,
    minWidth: 140,
    background: "#262C36",
    border: "1px solid #333B47",
    borderRadius: 8,
    padding: "10px 12px",
    color: "#E7EAEE",
    fontSize: 13,
  },
  select: {
    background: "#262C36",
    border: "1px solid #333B47",
    borderRadius: 8,
    padding: "10px 12px",
    color: "#E7EAEE",
    fontSize: 13,
  },
  addBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "#E8873A",
    border: "none",
    borderRadius: 8,
    padding: "10px 16px",
    color: "#14171C",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
  },
  errorText: { color: "#D9534F", fontSize: 12, marginBottom: 8 },

  teamList: { width: "100%", display: "flex", flexDirection: "column", gap: 8, marginTop: 8 },
  teamRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "#1E232B",
    border: "1px solid #2A313C",
    borderRadius: 8,
    padding: "10px 12px",
  },
  teamRowName: { fontSize: 13, fontWeight: 600, textAlign: "left" },
  teamRowRole: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 10,
    textTransform: "uppercase",
    textAlign: "left",
  },
  resetPatternBtn: {
    background: "none",
    border: "1px solid #333B47",
    borderRadius: 8,
    padding: "6px 10px",
    color: "#8B94A3",
    fontSize: 11,
    cursor: "pointer",
    flexShrink: 0,
  },
  deleteBtn: { background: "none", border: "none", cursor: "pointer", padding: 6 },

  // Inventory module
  invTabs: { display: "flex", gap: 4, borderBottom: "1px solid #262C36", marginBottom: 20, flexWrap: "wrap" },
  invTab: {
    background: "none",
    border: "none",
    borderBottom: "2px solid transparent",
    color: "#8B94A3",
    padding: "10px 14px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
  },
  invTabActive: { color: "#E7EAEE", borderBottomColor: "#4A90D9" },
  invFilterRow: { display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" },
  searchBox: {
    flex: 1,
    minWidth: 200,
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#262C36",
    border: "1px solid #333B47",
    borderRadius: 8,
    padding: "10px 12px",
  },
  searchInput: { background: "none", border: "none", outline: "none", color: "#E7EAEE", fontSize: 13, width: "100%" },

  itemList: { display: "flex", flexDirection: "column", gap: 8 },
  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    background: "#1E232B",
    border: "1px solid #2A313C",
    borderRadius: 8,
    padding: "12px 14px",
    cursor: "pointer",
    textAlign: "left",
  },
  itemRowMain: { flex: 1, minWidth: 0 },
  itemRowName: { fontSize: 13, fontWeight: 600 },
  itemRowMeta: { fontSize: 11, color: "#8B94A3", marginTop: 2 },
  itemRowStock: { textAlign: "right", flexShrink: 0 },
  itemRowQty: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 600 },
  itemRowLowFlag: {
    display: "flex",
    alignItems: "center",
    gap: 3,
    fontSize: 10,
    color: "#E8873A",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginTop: 2,
    justifyContent: "flex-end",
  },
  emptyText: { color: "#5C6473", fontSize: 13, padding: "16px 0" },

  formCard: { display: "flex", flexDirection: "column", gap: 14, maxWidth: 480 },
  formRow: { display: "flex", flexDirection: "column", gap: 6 },
  formRow2col: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  formLabel: {
    display: "block",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 10,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    color: "#8B94A3",
    marginBottom: 6,
  },

  detailCard: {
    background: "#1E232B",
    border: "1px solid #333B47",
    borderRadius: 16,
    padding: "28px 24px",
    width: 380,
    maxWidth: "100%",
    position: "relative",
  },
  detailClose: { position: "absolute", top: 12, right: 12, background: "none", border: "none", cursor: "pointer", padding: 4 },
  detailTop: { display: "flex", gap: 16, marginBottom: 20 },
  qrImg: { width: 96, height: 96, borderRadius: 8, background: "#fff", padding: 4, flexShrink: 0 },
  detailName: { fontFamily: "'Oswald', sans-serif", fontSize: 16, fontWeight: 600, marginBottom: 4 },
  detailMeta: { fontSize: 11, color: "#8B94A3", marginBottom: 2 },
  detailStockList: { display: "flex", flexDirection: "column", gap: 8, borderTop: "1px solid #2A313C", paddingTop: 16 },
  detailStockRow: { display: "flex", alignItems: "center", gap: 10 },
  detailStockLoc: { fontSize: 12, flex: 1 },
  detailStockQty: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#8B94A3", width: 60, textAlign: "right" },
  detailStockBtns: { display: "flex", alignItems: "center", gap: 4 },
  stockBtn: {
    background: "#262C36",
    border: "1px solid #333B47",
    borderRadius: 6,
    width: 28,
    height: 28,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#E7EAEE",
    cursor: "pointer",
  },
  stockQtyInput: {
    width: 40,
    background: "#262C36",
    border: "1px solid #333B47",
    borderRadius: 6,
    color: "#E7EAEE",
    textAlign: "center",
    fontSize: 12,
    padding: "4px 0",
  },

  reorderGroup: {
    background: "#1E232B",
    border: "1px solid #2A313C",
    borderRadius: 10,
    padding: "14px 16px",
    marginBottom: 12,
  },
  reorderSupplierName: { fontFamily: "'Oswald', sans-serif", fontSize: 14, fontWeight: 600 },
  reorderSupplierContact: { fontSize: 11, color: "#8B94A3", marginBottom: 10 },
  reorderItemRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 12,
    padding: "6px 0",
    borderTop: "1px solid #262C36",
  },
  reorderQtyText: { color: "#E8873A", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 },

  catIntro: { color: "#8B94A3", fontSize: 13, marginBottom: 16 },
  pegboard: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: 16,
  },
  catBadge: {
    background: "#1E232B",
    border: "1px solid #333B47",
    borderRadius: 12,
    padding: "24px 16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
  },
  catBadgeIcon: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    background: "#262C36",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  catBadgeName: { fontFamily: "'Oswald', sans-serif", fontSize: 15, fontWeight: 600, textAlign: "center" },
  catBadgeCount: { fontSize: 11, color: "#8B94A3" },
  catBackLink: {
    background: "none",
    border: "none",
    color: "#4A90D9",
    fontSize: 13,
    cursor: "pointer",
    padding: 0,
    marginBottom: 8,
  },
  catHeading: { fontFamily: "'Oswald', sans-serif", fontSize: 20, fontWeight: 600, margin: "0 0 16px" },

  productTable: { display: "flex", flexDirection: "column", gap: 2 },
  productTableHead: {
    display: "flex",
    padding: "0 14px 8px",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: "#5C6473",
  },
  productRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#1E232B",
    border: "1px solid #2A313C",
    borderRadius: 8,
    padding: "12px 14px",
    cursor: "pointer",
    textAlign: "left",
    marginBottom: 6,
  },
  productRowName: { flex: 2, fontSize: 13, fontWeight: 600, display: "flex", flexDirection: "column", gap: 2 },
  productRowMfr: { fontSize: 11, color: "#8B94A3", fontWeight: 400 },
  productRowPrice: { flex: 1, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", fontSize: 13 },
  stockPill: {
    display: "inline-block",
    fontSize: 10,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    padding: "4px 10px",
    borderRadius: 999,
  },
  stockPillIn: { background: "rgba(79,174,124,0.15)", color: "#4FAE7C" },
  stockPillOut: { background: "rgba(217,83,79,0.15)", color: "#D9534F" },

  // FAQ module
  faqArticleRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "#1E232B",
    border: "1px solid #2A313C",
    borderRadius: 8,
    padding: "14px 16px",
    cursor: "pointer",
    textAlign: "left",
  },
  faqArticleIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    background: "#262C36",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  faqSection: { marginBottom: 32 },
  faqSectionHead: { display: "flex", alignItems: "center", gap: 8, marginBottom: 10 },
  faqSectionTitle: { fontFamily: "'Oswald', sans-serif", fontSize: 16, fontWeight: 600, margin: 0 },
  faqBodyText: { fontSize: 13, color: "#B8BEC8", lineHeight: 1.6, marginBottom: 16, maxWidth: 640 },
  faqNoteText: { fontSize: 11, color: "#5C6473", lineHeight: 1.5, marginTop: 12, maxWidth: 640 },

  handGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 14 },
  handCard: {
    background: "#1E232B",
    border: "1px solid #2A313C",
    borderRadius: 10,
    padding: "16px 12px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: 4,
  },
  handDiagram: { marginBottom: 6 },
  handCardCode: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 11,
    color: "#4A90D9",
    letterSpacing: "0.5px",
  },
  handCardName: { fontFamily: "'Oswald', sans-serif", fontSize: 13, fontWeight: 600 },
  handCardDesc: { fontSize: 11, color: "#8B94A3", lineHeight: 1.4 },

  finishGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 12 },
  finishCard: {
    background: "#1E232B",
    border: "1px solid #2A313C",
    borderRadius: 10,
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  finishSwatch: { width: "100%", height: 36, borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)" },
  finishCode: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 600, marginTop: 4 },
  finishName: { fontSize: 12, fontWeight: 600 },
  finishNote: { fontSize: 10, color: "#8B94A3", lineHeight: 1.4 },

  // Dashboard tile notification badges — styled like a phone app icon badge
  tileNotifyBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    minWidth: 22,
    height: 22,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#D9534F",
    color: "#fff",
    fontSize: 12,
    fontWeight: 800,
    borderRadius: 999,
    border: "2px solid #14171C",
    padding: "0 5px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
    zIndex: 2,
  },
  tileAlertBadge: {
    position: "absolute",
    top: -8,
    left: -8,
    minWidth: 22,
    height: 22,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#D9534F",
    color: "#fff",
    fontSize: 11,
    fontWeight: 800,
    borderRadius: 999,
    border: "2px solid #14171C",
    padding: "0 6px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
    zIndex: 2,
  },

  // Safety checks module
  vehicleRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "#1E232B",
    border: "1px solid #2A313C",
    borderRadius: 8,
    padding: "12px 14px",
  },
  vehicleDoneTag: { display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#4FAE7C", flexShrink: 0 },
  vehicleDueBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "#3A2E1E",
    border: "1px solid #5A4A2E",
    color: "#E8873A",
    fontSize: 12,
    fontWeight: 600,
    padding: "8px 14px",
    borderRadius: 8,
    cursor: "pointer",
    flexShrink: 0,
  },
  vehicleOverdueBtn: {
    background: "#3A1E1E",
    border: "1px solid #5A2E2E",
    color: "#D9534F",
  },

  ticketRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "#1E232B",
    border: "1px solid #2A313C",
    borderRadius: 8,
    padding: "12px 14px",
  },
  ticketStatusBtn: {
    border: "none",
    borderRadius: 999,
    padding: "6px 14px",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    cursor: "pointer",
    flexShrink: 0,
  },
  ticketStatusOpen: { background: "rgba(217,83,79,0.15)", color: "#D9534F" },
  ticketStatusScheduled: { background: "rgba(232,135,58,0.15)", color: "#E8873A" },
  ticketStatusDone: { background: "rgba(79,174,124,0.15)", color: "#4FAE7C" },

  checkFormCard: {
    background: "#1E232B",
    border: "1px solid #333B47",
    borderRadius: 16,
    padding: "28px 24px",
    width: 420,
    maxWidth: "100%",
    maxHeight: "85vh",
    overflowY: "auto",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  checkItemBlock: {
    borderTop: "1px solid #2A313C",
    paddingTop: 14,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  checkItemHead: { display: "flex", alignItems: "flex-start", gap: 10 },
  checkItemLabel: { fontSize: 13, fontWeight: 600 },
  checkItemDesc: { fontSize: 11, color: "#8B94A3" },
  checkStatusRow: { display: "flex", gap: 8 },
  checkStatusBtn: {
    flex: 1,
    background: "#262C36",
    border: "1px solid #333B47",
    borderRadius: 8,
    padding: "8px 0",
    fontSize: 12,
    fontWeight: 600,
    color: "#8B94A3",
    cursor: "pointer",
  },
  checkStatusOkActive: { background: "rgba(79,174,124,0.15)", borderColor: "#4FAE7C", color: "#4FAE7C" },
  checkStatusBadActive: { background: "rgba(217,83,79,0.15)", borderColor: "#D9534F", color: "#D9534F" },

  scanBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "#4A90D9",
    border: "none",
    borderRadius: 8,
    padding: "10px 16px",
    color: "#14171C",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
  },
  scannerCard: {
    background: "#1E232B",
    border: "1px solid #333B47",
    borderRadius: 16,
    padding: "28px 24px",
    width: 380,
    maxWidth: "100%",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  scannerVideoWrap: {
    position: "relative",
    width: "100%",
    aspectRatio: "1 / 1",
    background: "#000",
    borderRadius: 10,
    overflow: "hidden",
  },
  scannerVideo: { width: "100%", height: "100%", objectFit: "cover" },
  scannerFrame: {
    position: "absolute",
    inset: "15%",
    border: "3px solid #4A90D9",
    borderRadius: 12,
    pointerEvents: "none",
  },
};
