import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import styles from "./AnalyticsPage.module.css";
import { HiLogout } from "react-icons/hi";

function Donut({ value, label }) {
  const v = Math.max(0, Math.min(100, value));
  const radius = 42;
  const stroke = 10;
  const c = 2 * Math.PI * radius;
  const offset = c * (1 - v / 100);

  return (
    <div className={styles.donutWrap}>
      <svg width="120" height="120" viewBox="0 0 120 120" className={styles.donutSvg}>
        <defs>
          <linearGradient id="pulseGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="rgba(0,255,204,1)" />
            <stop offset="1" stopColor="rgba(139,92,246,1)" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="url(#pulseGrad)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transformOrigin: "60px 60px", transform: "rotate(-90deg)" }}
        />
      </svg>
      <div className={styles.donutText}>
        <div className={styles.donutValue}>{v}%</div>
        <div className={styles.donutLabel}>{label}</div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [workspaceName, setWorkspaceName] = useState("");

  // Keep visuals deterministic; still fetch workspace name for a realistic header.
  useEffect(() => {
    const run = async () => {
      try {
        const res = await api.get(`/workspaces/${id}`);
        setWorkspaceName(res.data?.workspace?.name || "");
      } catch (e) {
        toast.error("Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    };
    if (id) run();
  }, [id]);

  const donutValue = 85;
  const insightValue = 72;

  const performanceRows = useMemo(
    () => [
      { t: "Latency", v: "32 ms", s: "Good" },
      { t: "Throughput", v: "1.8k req/min", s: "Stable" },
      { t: "Error Rate", v: "0.12%", s: "Low" },
      { t: "Queue Depth", v: "7", s: "Healthy" },
    ],
    [],
  );

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.nav}>
          <span className={styles.pageTitle}>Analytics</span>
        </div>
        <div className={styles.loading}>Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.nav}>
        <div className={styles.navLeft}>
          <span className={styles.workspaceKicker}>Workspace Analytics</span>
          <span className={styles.pageTitle}>{workspaceName || "Analytics"}</span>
        </div>
        <div className={styles.navRight}>
          <div className={styles.userChip}>
            {(user?.username || "U").charAt(0).toUpperCase()}
          </div>
          <span className={styles.userName}>{user?.username}</span>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <HiLogout /> Logout
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.leftCol}>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>System Reliability</span>
              <span className={styles.cardMeta}>Last 7 days</span>
            </div>
            <Donut value={donutValue} label="Uptime" />
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>Collaboration Health</span>
              <span className={styles.cardMeta}>Moving average</span>
            </div>
            <div className={styles.bigPercent}>
              <span className={styles.bigPercentValue}>{insightValue}%</span>
              <span className={styles.bigPercentLabel}>Systems aligned</span>
            </div>
            <div className={styles.sparkArea} aria-hidden="true">
              <svg width="100%" height="60" viewBox="0 0 220 60" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="sparkGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="rgba(0,255,204,0.9)" />
                    <stop offset="1" stopColor="rgba(139,92,246,0.9)" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,40 C25,28 35,35 55,30 C78,24 94,18 110,22 C130,28 144,14 165,18 C183,21 197,28 220,12 L220,60 L0,60 Z"
                  fill="rgba(139,92,246,0.12)"
                />
                <polyline
                  points="0,40 25,28 35,35 55,30 78,24 94,18 110,22 130,28 144,14 165,18 183,21 197,28 220,12"
                  fill="none"
                  stroke="url(#sparkGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </section>
        </div>

        <div className={styles.rightCol}>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>Member Interaction</span>
              <span className={styles.cardMeta}>Active threads</span>
            </div>
            <div className={styles.legend}>
              <span className={styles.legendDot} />
              <span>AI Assisted</span>
            </div>
            <div className={styles.chartArea} aria-hidden="true">
              <svg width="100%" height="140" viewBox="0 0 320 140" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="rgba(0,255,204,1)" />
                    <stop offset="1" stopColor="rgba(139,92,246,1)" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,105 C45,80 65,95 105,78 C150,58 170,62 215,45 C250,33 270,36 320,18 L320,140 L0,140 Z"
                  fill="rgba(0,255,204,0.10)"
                />
                <polyline
                  points="0,105 45,80 65,95 105,78 150,58 170,62 215,45 250,33 270,36 320,18"
                  fill="none"
                  stroke="url(#chartGrad)"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>System Performance Log</span>
              <span className={styles.cardMeta}>Realtime (mock)</span>
            </div>
            <div className={styles.rows}>
              {performanceRows.map((r) => (
                <div className={styles.row} key={r.t}>
                  <span className={styles.rowKey}>{r.t}</span>
                  <span className={styles.rowVal}>{r.v}</span>
                  <span
                    className={[
                      styles.rowStatus,
                      r.s === "Good" ? styles.ok : r.s === "Stable" ? styles.mid : styles.low,
                    ].join(" ")}
                  >
                    {r.s}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
