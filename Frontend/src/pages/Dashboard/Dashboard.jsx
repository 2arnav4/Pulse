import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import styles from "./Dashboard.module.css";
import {
  HiPlus,
  HiSearch,
  HiQuestionMarkCircle,
  HiLogout,
  HiExternalLink,
} from "react-icons/hi";

const COVER_IMAGES = [
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=300&fit=crop",
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=300&fit=crop",
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=300&fit=crop",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=300&fit=crop",
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/");
  };
  const handleEnterWorkspace = (id) => navigate(`/workspace/${id}`);

  const openCreateWorkspaceModal = () => {
    window.dispatchEvent(new CustomEvent("open-create-workspace"));
  };

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const res = await api.get("/workspaces");
        setWorkspaces(res.data);
      } catch {
        toast.error("Failed to load your workspaces.");
      } finally {
        setLoading(false);
      }
    };
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    const onWorkspaceCreated = (event) => {
      const newSpace = event.detail;
      if (!newSpace?.id) return;
      setWorkspaces((prev) => [...prev, newSpace]);
    };
    window.addEventListener("workspace-created", onWorkspaceCreated);
    return () =>
      window.removeEventListener("workspace-created", onWorkspaceCreated);
  }, []);

  const filteredWorkspaces = workspaces.filter((space) =>
    space.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const avatarLetter = user?.username?.charAt(0).toUpperCase() || "U";

  return (
    <div className={styles["dashboard-container"]}>
      <nav className={styles["dashboard-navbar"]}>
        <div className={styles["nav-left"]}>
          <div className={styles["logo-pulse"]}>P</div>
          <span className={styles["nav-title"]}>Pulse</span>
        </div>
        <div className={styles["nav-right"]}>
          <div className={styles["user-profile"]}>
            <div className={styles["avatar"]}>{avatarLetter}</div>
            <span className={styles["username"]}>{user?.username}</span>
          </div>
          <button className={styles["logout-btn"]} onClick={handleLogout}>
            <HiLogout /> Logout
          </button>
        </div>
      </nav>

      <main className={styles["dashboard-content"]}>
        <header className={styles["content-header"]}>
          <div>
            <h1 className={styles["main-title"]}>Your Workspaces</h1>
            <p className={styles["main-subtitle"]}>Manage your projects and collaborate with your team.</p>
          </div>
          <div className={styles["header-actions"]}>
            <div className={styles["search-box"]}>
              <HiSearch className={styles["search-icon"]} />
              <input
                type="text"
                placeholder="Find a workspace..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className={styles["create-button"]} onClick={openCreateWorkspaceModal}>
              <HiPlus /> Create Workspace
            </button>
          </div>
        </header>

        {loading ? (
          <div className={styles["loading-state"]}>
             <div className={styles["spinner"]}></div>
             <p>Assembling your workspaces...</p>
          </div>
        ) : filteredWorkspaces.length === 0 ? (
          <div className={styles["empty-state"]}>
            <div className={styles["empty-icon"]}>📂</div>
            <h3>{searchQuery ? "No matching workspaces" : "No workspaces yet"}</h3>
            <p>{searchQuery ? "Try a different keyword." : "Get started by creating your first workspace."}</p>
            {!searchQuery && (
               <button onClick={openCreateWorkspaceModal} className={styles["create-button"]}>
                 + Create Workspace
               </button>
            )}
          </div>
        ) : (
          <div className={styles["workspace-grid"]}>
            {filteredWorkspaces.map((space, index) => (
              <div
                key={space.id}
                className={styles["workspace-card"]}
                onClick={() => handleEnterWorkspace(space.id)}
              >
                <div className={styles["card-image-wrapper"]}>
                  <img
                    src={COVER_IMAGES[index % COVER_IMAGES.length]}
                    alt={space.name}
                  />
                  <div className={styles["card-overlay"]}>
                    <span>Enter Workspace</span>
                  </div>
                </div>
                <div className={styles["card-details"]}>
                  <div className={styles["card-header"]}>
                    <h3 className={styles["card-title"]}>{space.name}</h3>
                    <span className={styles["role-tag"]}>{space.role}</span>
                  </div>
                  <p className={styles["card-desc"]}>{space.description || "Project collaboration space"}</p>
                  <div className={styles["card-footer"]}>
                    <span className={styles["card-date"]}>Created {new Date(space.joinedAt).toLocaleDateString()}</span>
                    <HiExternalLink className={styles["go-icon"]} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <section className={styles["support-banner"]}>
           <div className={styles["support-icon"]}>
             <HiQuestionMarkCircle size={24} />
           </div>
           <div className={styles["support-text"]}>
             <h4>Need assistance?</h4>
             <p>Our documentation and support team are here to help you get the most out of Pulse.</p>
           </div>
           <div className={styles["support-btns"]}>
             <button className={styles["support-link"]}>Documentation</button>
             <button className={styles["support-link-alt"]}>Contact Us</button>
           </div>
        </section>
      </main>
    </div>
  );
}
