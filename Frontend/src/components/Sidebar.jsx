import { Link, useLocation } from "react-router-dom";
import { Home, FolderOpen, CheckSquare, BarChart2, Settings, Plus } from "lucide-react";
import toast from "react-hot-toast";
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
  ];

  const workspaceItems = [
    { name: "Tasks", icon: CheckSquare, path: getWorkspacePath("") },
    { name: "Analytics", icon: BarChart2, path: getWorkspacePath("/analytics") },
    { name: "Settings", icon: Settings, path: getWorkspacePath("/settings") },
  ];

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    // Check if the current pathname starts with the item path (so Analytics is active for sub-routes if needed)
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles["brand-icon"]}>P</div>
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
              title={item.name}
            >
              <item.icon className={styles.icon} size={20} />
              <span className={styles.navText}>{item.name}</span>
            </Link>
          );
        })}

        <div className={styles.divider}></div>

        <div className={styles.navSubtitle}>WORKSPACE</div>
        
        {workspaceItems.map((item) => {
          const active = isActive(item.path);
          const isDisabled = !workspaceId;

          return (
            <Link
              key={item.name}
              to={isDisabled ? "#" : item.path}
              className={`${styles.navItem} ${active ? styles.active : ""} ${
                isDisabled ? styles.disabled : ""
              }`}
              onClick={(e) => {
                if (isDisabled) {
                  e.preventDefault();
                  toast.error("Enter a workspace first");
                }
              }}
              title={item.name}
            >
              <item.icon className={styles.icon} size={20} />
              <span className={styles.navText}>{item.name}</span>
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
