import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../../context/authCore";
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

function buildLinePath(values, width = 320, height = 140, padding = 12) {
  if (!values.length) return { line: "", area: "" };

  const max = Math.max(...values, 1);
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;
  const points = values.map((value, index) => {
    const x =
      values.length === 1
        ? width / 2
        : padding + (index / (values.length - 1)) * innerWidth;
    const y = height - padding - (value / max) * innerHeight;
    return [Number(x.toFixed(2)), Number(y.toFixed(2))];
  });

  const line = points.map(([x, y]) => `${x},${y}`).join(" ");
  const area = `${points[0][0]},${height - padding} ${line} ${
    points[points.length - 1][0]
  },${height - padding}`;

  return { line, area };
}

function TrendChart({ values, variant = "wide" }) {
  const hasData = values.some((value) => value > 0);
  const { line, area } = buildLinePath(values);

  if (!hasData) {
    return <div className={styles.emptyChart}>No activity yet</div>;
  }

  const gradientId = variant === "member" ? "memberChartGrad" : "taskChartGrad";

  return (
    <svg
      width="100%"
      height={variant === "compact" ? "60" : "140"}
      viewBox="0 0 320 140"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="rgba(0,255,204,1)" />
          <stop offset="1" stopColor="rgba(139,92,246,1)" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="rgba(0,255,204,0.10)" />
      <polyline
        points={line}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function getDayKey(date) {
  return date.toISOString().slice(0, 10);
}

function getStatusLabel(score) {
  if (score >= 75) return "Good";
  if (score >= 40) return "Watch";
  return "Needs work";
}

export default function AnalyticsPage() {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [workspaceName, setWorkspaceName] = useState("");
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const run = async () => {
      try {
        const [workspaceRes, tasksRes] = await Promise.all([
          api.get(`/workspaces/${id}`),
          api.get(`/workspaces/${id}/tasks`),
        ]);
        setWorkspaceName(workspaceRes.data?.workspace?.name || "");
        setMembers(workspaceRes.data?.members || []);
        setTasks(tasksRes.data || []);
      } catch {
        toast.error("Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    };
    if (id) run();
  }, [id]);

  const analytics = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.status === "done").length;
    const inProgressTasks = tasks.filter(
      (task) => task.status === "in-progress",
    ).length;
    const todoTasks = tasks.filter((task) => task.status === "todo").length;
    const assignedTasks = tasks.filter((task) => task.assignedTo).length;
    const unassignedTasks = totalTasks - assignedTasks;
    const activeMemberIds = new Set(
      tasks
        .map((task) => task.assignedTo || task.Assignee?.id)
        .filter(Boolean),
    );

    const completionRate = totalTasks
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;
    const assignmentRate = totalTasks
      ? Math.round((assignedTasks / totalTasks) * 100)
      : 0;
    const memberActivityRate = members.length
      ? Math.round((activeMemberIds.size / members.length) * 100)
      : 0;
    const collaborationScore = totalTasks
      ? Math.round(
          completionRate * 0.4 +
            assignmentRate * 0.35 +
            memberActivityRate * 0.25,
        )
      : 0;

    const today = new Date();
    const dayKeys = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      return getDayKey(date);
    });
    const taskActivityByDay = dayKeys.map(
      (day) =>
        tasks.filter((task) => {
          const activitySource = task.updatedAt || task.createdAt;
          if (!activitySource) return false;
          const activityDate = new Date(activitySource);
          if (Number.isNaN(activityDate.getTime())) return false;
          return getDayKey(activityDate) === day;
        }).length,
    );

    const memberActivity = members.map((member) =>
      tasks.filter(
        (task) => (task.assignedTo || task.Assignee?.id) === member.id,
      ).length,
    );

    const activityRows = [
      {
        t: "Total Tasks",
        v: String(totalTasks),
        s: totalTasks > 0 ? "Active" : "Empty",
      },
      {
        t: "Completion",
        v: `${completedTasks}/${totalTasks}`,
        s: getStatusLabel(completionRate),
      },
      {
        t: "Assigned Coverage",
        v: `${assignedTasks}/${totalTasks}`,
        s: getStatusLabel(assignmentRate),
      },
      {
        t: "Active Members",
        v: `${activeMemberIds.size}/${members.length}`,
        s: getStatusLabel(memberActivityRate),
      },
    ];

    return {
      activityRows,
      assignedTasks,
      collaborationScore,
      completedTasks,
      completionRate,
      inProgressTasks,
      memberActivity,
      memberActivityRate,
      taskActivityByDay,
      todoTasks,
      totalTasks,
      unassignedTasks,
    };
  }, [members, tasks]);

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
              <span className={styles.cardTitle}>Task Completion</span>
              <span className={styles.cardMeta}>{analytics.totalTasks} tasks</span>
            </div>
            <Donut value={analytics.completionRate} label="Done" />
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>Collaboration Health</span>
              <span className={styles.cardMeta}>Last 7 days</span>
            </div>
            <div className={styles.bigPercent}>
              <span className={styles.bigPercentValue}>
                {analytics.collaborationScore}%
              </span>
              <span className={styles.bigPercentLabel}>Workspace alignment</span>
            </div>
            <div className={styles.sparkArea} aria-hidden="true">
              <TrendChart values={analytics.taskActivityByDay} variant="compact" />
            </div>
          </section>
        </div>

        <div className={styles.rightCol}>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>Member Workload</span>
              <span className={styles.cardMeta}>
                {analytics.assignedTasks} assigned
              </span>
            </div>
            <div className={styles.legend}>
              <span className={styles.legendDot} />
              <span>Tasks per member</span>
            </div>
            <div className={styles.chartArea} aria-hidden="true">
              <TrendChart values={analytics.memberActivity} variant="member" />
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>Workspace Activity Log</span>
              <span className={styles.cardMeta}>Live task data</span>
            </div>
            <div className={styles.rows}>
              {analytics.activityRows.map((r) => (
                <div className={styles.row} key={r.t}>
                  <span className={styles.rowKey}>{r.t}</span>
                  <span className={styles.rowVal}>{r.v}</span>
                  <span
                    className={[
                      styles.rowStatus,
                      r.s === "Good" || r.s === "Active"
                        ? styles.ok
                        : r.s === "Watch"
                          ? styles.mid
                          : styles.low,
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
