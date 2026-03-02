/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();

  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleCreateClick = () => {
    toast("Workspace creation modal coming soon!", {
      icon: "🚧",
    });
  };

  const handleEnterWorkspace = (name) => {
    toast.success(`Entering ${name}...`);
  };

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/workspaces", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setWorkspaces(res.data);
      } catch (error) {
        toast.error("Failed to load your workspaces.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchWorkspaces();
    }
  }, [token]);

  return (
    <div className={styles["dashboard-layout"]}>
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
            onClick={handleCreateClick}
          >
            + New Workspace
          </button>
        </header>

        {loading ? (
          <p style={{ color: "var(--text-muted)", marginTop: "2rem" }}>
            Loading your workspaces...
          </p>
        ) : workspaces.length === 0 ? (
          <p style={{ color: "var(--text-muted)", marginTop: "2rem" }}>
            You don't have any workspaces yet. Create one!
          </p>
        ) : (
          <div className={styles["workspace-grid"]}>
            {workspaces.map((space) => (
              <div
                key={space.id}
                className={styles["workspace-card"]}
                onClick={() => handleEnterWorkspace(space.name)}
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
                    <span>
                      Created: {new Date(space.joinedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button className={styles["enter-btn"]}>Enter &rarr;</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
