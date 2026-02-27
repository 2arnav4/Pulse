import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import styles from "./Dashboard.module.css"; // Notice this change!

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Temporary dummy data until we build the real Level 2.1 Backend APIs
  const [workspaces] = useState([
    { id: 1, name: "Engineering Team", role: "Admin", members: 12 },
    { id: 2, name: "Marketing Campaign Q3", role: "Member", members: 5 },
    { id: 3, name: "Personal Projects", role: "Admin", members: 1 },
  ]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className={styles["dashboard-layout"]}>
      {/* 1. Global Nav Bar */}
      <nav className={styles["dashboard-nav"]}>
        <div className={styles["nav-brand"]}>
          <div className={styles["brand-logo"]}>P</div>
          <span className={styles["brand-text"]}>Pulse</span>
        </div>
        <div className={styles["nav-user"]}>
          <span className={styles["user-greeting"]}>
            Welcome, {user?.username}
          </span>
          <button className={styles["logout-btn"]} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* 2. Main Content Area */}
      <main className={styles["dashboard-main"]}>
        <header className={styles["dashboard-header"]}>
          <div>
            <h1 className={styles["header-title"]}>Your Workspaces</h1>
            <p className={styles["header-subtitle"]}>
              Select a workspace to jump into your command center.
            </p>
          </div>
          <button
            className={styles["create-workspace-btn"]}
            onClick={() => alert("Create Modal Coming Soon!")}
          >
            + New Workspace
          </button>
        </header>

        {/* 3. The Grid of Cards */}
        <div className={styles["workspace-grid"]}>
          {workspaces.map((space) => (
            <div
              key={space.id}
              className={styles["workspace-card"]}
              onClick={() => alert(`Going to ${space.name}...`)}
            >
              <div className={styles["card-top"]}>
                <h3 className={styles["card-title"]}>{space.name}</h3>
                <span
                  className={`${styles["role-badge"]} ${styles[space.role.toLowerCase()]}`}
                >
                  {space.role}
                </span>
              </div>
              <div className={styles["card-bottom"]}>
                <div className={styles["member-count"]}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  <span>{space.members} members</span>
                </div>
                <button className={styles["enter-btn"]}>Enter &rarr;</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
