import { Link, useLocation } from "react-router-dom";
import { Home, FolderOpen, CheckSquare, BarChart2, Settings, Plus } from "lucide-react";
import styles from "./Sidebar.module.css";

export default function Sidebar({ onNewWorkspace }) {
  const location = useLocation();
  
  // Extract workspace ID from URL if present
  const match = location.pathname.match(/\/workspace\/([^/]+)/);
  const workspaceId = match ? match[1] : null;

  const getWorkspacePath = (suffix) => {
    return workspaceId ? `/workspace/${workspaceId}${suffix}` : "/dashboard";
  };

  const navItems = [
    { name: "Home", icon: Home, path: "/dashboard" },
    { name: "Projects", icon: FolderOpen, path: "/dashboard" },
    { name: "Tasks", icon: CheckSquare, path: getWorkspacePath("") },
    { name: "Analytics", icon: BarChart2, path: getWorkspacePath("/analytics") },
    { name: "Settings", icon: Settings, path: getWorkspacePath("/settings") },
  ];

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname === path;
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.logo}>⚡</div>
        <div className={styles.brandText}>
          <span className={styles.title}>Pulse</span>
          <span className={styles.subtitle}>Workspace</span>
        </div>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`${styles.navItem} ${active ? styles.active : ""}`}
            >
              <item.icon className={styles.icon} size={20} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <button className={styles.newWorkspaceBtn} onClick={onNewWorkspace}>
          <Plus size={18} /> New Workspace
        </button>
      </div>
    </aside>
  );
}
