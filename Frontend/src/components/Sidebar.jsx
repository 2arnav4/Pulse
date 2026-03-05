import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  HiHome,
  HiFolder,
  HiCheckCircle,
  HiChartBar,
  HiCog,
} from "react-icons/hi";
import styles from "./Sidebar.module.css";

export default function Sidebar({ onNewWorkspace }) {
  const navigate = useNavigate();

  return (
    <aside className={styles["sidebar"]}>
      <div className={styles["sidebar-brand"]}>
        <div className={styles["brand-logo"]}>⚡</div>
        <div className={styles["brand-info"]}>
          <span className={styles["brand-text"]}>Pulse Workspace</span>
          <span className={styles["brand-plan"]}>Enterprise Plan</span>
        </div>
      </div>

      <nav className={styles["sidebar-nav"]}>
        <button
          className={`${styles["nav-item"]} ${styles["active"]}`}
          onClick={() => navigate("/dashboard")}
        >
          <HiHome className={styles["nav-icon"]} /> Home
        </button>
        <button className={styles["nav-item"]}>
          <HiFolder className={styles["nav-icon"]} /> Projects
        </button>
        <button className={styles["nav-item"]}>
          <HiCheckCircle className={styles["nav-icon"]} /> Tasks
        </button>
        <button className={styles["nav-item"]}>
          <HiChartBar className={styles["nav-icon"]} /> Analytics
        </button>
        <button className={styles["nav-item"]}>
          <HiCog className={styles["nav-icon"]} /> Settings
        </button>
      </nav>

      <div className={styles["sidebar-footer"]}>
        <button
          className={styles["new-workspace-btn"]}
          onClick={onNewWorkspace}
        >
          + New Workspace
        </button>
      </div>
    </aside>
  );
}