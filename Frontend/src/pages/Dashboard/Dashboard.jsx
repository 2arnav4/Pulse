/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import CreateWorkspaceModal from "./CreateWorkspaceModal";
import styles from "./Dashboard.module.css";
import { HiHome, HiFolder, HiCheckCircle, HiChartBar, HiCog, HiArrowRight, HiQuestionMarkCircle, HiLogout } from "react-icons/hi";

// Rotating set of free placeholder images for workspace cards
const COVER_IMAGES = [
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=200&fit=crop",
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=200&fit=crop",
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&h=200&fit=crop",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=200&fit=crop",
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=200&fit=crop",
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/"); };
  const handleCreateClick = () => setIsModalOpen(true);
  const handleWorkspaceCreated = (newSpace) => {
    setWorkspaces((prev) => [...prev, newSpace]);
    setIsModalOpen(false);
  };
  const handleEnterWorkspace = (name) => toast.success(`Entering ${name}...`);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const res = await api.get("/workspaces");
        setWorkspaces(res.data);
      } catch (error) {
        toast.error("Failed to load your workspaces.");
      } finally {
        setLoading(false);
      }
    };
    fetchWorkspaces();
  }, []);

  const avatarLetter = user?.username?.charAt(0).toUpperCase() || "U";

  return (
    <div className={styles["dashboard-layout"]}>
      <CreateWorkspaceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onWorkspaceCreated={handleWorkspaceCreated} />

      {/* ── SIDEBAR ── */}
      <aside className={styles["sidebar"]}>
        <div className={styles["sidebar-brand"]}>
          <div className={styles["brand-logo"]}>⚡</div>
          <div className={styles["brand-info"]}>
            <span className={styles["brand-text"]}>Pulse Workspace</span>
            <span className={styles["brand-plan"]}>Enterprise Plan</span>
          </div>
        </div>

        <nav className={styles["sidebar-nav"]}>
          <button className={`${styles["nav-item"]} ${styles["active"]}`}>
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
          <button className={styles["new-workspace-btn"]} onClick={handleCreateClick}>
            + New Workspace
          </button>
        </div>
      </aside>

      {/* ── MAIN BODY ── */}
      <div className={styles["dashboard-body"]}>
        <nav className={styles["dashboard-nav"]}>
          <span className={styles["nav-page-title"]}>Dashboard Overview</span>
          <div className={styles["nav-user"]}>
            <div className={styles["user-avatar"]}>{avatarLetter}</div>
            <span className={styles["user-greeting"]}>Welcome, {user?.username}</span>
            <button className={styles["logout-btn"]} onClick={handleLogout}>
              <HiLogout /> Logout
            </button>
          </div>
        </nav>

        <main className={styles["dashboard-main"]}>
          <header className={styles["dashboard-header"]}>
            <h1 className={styles["header-title"]}>Your Workspaces</h1>
            <p className={styles["header-subtitle"]}>
              You are currently active in {workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""}.
            </p>
          </header>

          {loading ? (
            <div className={styles["empty-state"]}>
              <p>Loading your workspaces...</p>
            </div>
          ) : workspaces.length === 0 ? (
            <div className={styles["empty-state"]}>
              <p>No workspaces yet. Create one!</p>
            </div>
          ) : (
            <div className={styles["workspace-grid"]}>
              {workspaces.map((space, index) => (
                <div key={space.id} className={styles["workspace-card"]} onClick={() => handleEnterWorkspace(space.name)}>
                  <div className={styles["card-cover"]}>
                    <img
                      src={COVER_IMAGES[index % COVER_IMAGES.length]}
                      alt={space.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                  <div className={styles["card-body"]}>
                    <div className={styles["card-top"]}>
                      <h3 className={styles["card-title"]}>{space.name}</h3>
                      <span className={`${styles["role-badge"]} ${styles[space.role.toLowerCase()]}`}>
                        {space.role.toUpperCase()}
                      </span>
                    </div>
                    <div className={styles["card-bottom"]}>
                      <div className={styles["member-count"]}>
                        📅 Created {new Date(space.joinedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                      <button className={styles["enter-btn"]}>
                        Enter Workspace <HiArrowRight />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className={styles["help-banner"]}>
            <div className={styles["help-icon"]}><HiQuestionMarkCircle size={20} /></div>
            <div className={styles["help-text"]}>
              <strong>Need help with workspaces?</strong>
              <span>Read our documentation or contact the support team.</span>
            </div>
            <div className={styles["help-actions"]}>
              <button className={styles["help-btn"]}>Documentation</button>
              <span className={styles["help-link"]}>Contact Support</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}