import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar";
import { HiLogout, HiUserCircle } from "react-icons/hi";
import styles from "./WorkspaceDetail.module.css";
import InviteMemberModal from "./InviteMemberModal";
import TaskBoard from "./TaskBoard";
import WorkspaceSettingsModal from "./WorkspaceSettingsModal";
import StandupModal from "./StandupModal";

export default function WorkspaceDetail() {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isStandupModalOpen, setIsStandupModalOpen] = useState(false);

  const handleMemberAdded = (newMember) => {
    setMembers((prev) => [...prev, newMember]);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    const fetchWorkspaceDetails = async () => {
      try {
        const res = await api.get(`/workspaces/${id}`);
        setWorkspace(res.data.workspace);
        setMembers(res.data.members);
      } catch (error) {
        console.error("Failed to load workspace details:", error);
        toast.error("Failed to load workspace details");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchWorkspaceDetails();
  }, [id]);

  const avatarLetter = user?.username?.charAt(0).toUpperCase() || "U";

  if (loading) {
    return (
      <div className={styles["detail-layout"]}>
        <Sidebar onNewWorkspace={() => navigate("/dashboard")} />
        <div className={styles["detail-body"]}>
          <div className={styles["loading"]}>Loading workspace...</div>
        </div>
      </div>
    );
  }
  return (
    <div className={styles["detail-layout"]}>
      <Sidebar onNewWorkspace={() => navigate("/dashboard")} />

      <div className={styles["detail-body"]}>
        {/* Top navbar */}
        <nav className={styles["detail-nav"]}>
          <span className={styles["nav-page-title"]}>{workspace.name}</span>
          <div className={styles["nav-user"]}>
            <div className={styles["user-avatar"]}>{avatarLetter}</div>
            <span className={styles["user-greeting"]}>
              Welcome, {user?.username}
            </span>
            <button
              onClick={() => setIsStandupModalOpen(true)}
              style={{ padding: "6px 12px", borderRadius: "20px", background: "var(--accent-light)", border: `1px solid var(--accent)`, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontWeight: "600", color: "var(--accent)" }}
            >
              🤖 AI Standup
            </button>
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              style={{ padding: "6px 12px", borderRadius: "20px", background: "var(--bg-secondary)", border: "1px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontWeight: "600", color: "var(--text-secondary)" }}
            >
              ⚙️ Settings
            </button>
            <button className={styles["logout-btn"]} onClick={handleLogout}>
              <HiLogout /> Logout
            </button>
          </div>
        </nav>

        <main className={styles["detail-main"]}>
          {/* Workspace header */}
          <header className={styles["detail-header"]}>
            <div>
              <h1 className={styles["header-title"]}>{workspace.name}</h1>
              <p className={styles["header-subtitle"]}>
                {workspace.description || "No description provided."}
              </p>
            </div>
            <div className={styles["header-meta"]}>
              <span className={styles["meta-tag"]}>
                📅 Created{" "}
                {new Date(workspace.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className={styles["meta-tag"]}>
                👥 {members.length} member{members.length !== 1 ? "s" : ""}
              </span>
            </div>
          </header>

          {/* Members section */}
          <section className={styles["members-section"]}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2 className={styles["section-title"]} style={{ margin: 0 }}>
                Members
              </h2>
              <button
                onClick={() => setIsInviteModalOpen(true)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  background: "var(--accent)",
                  color: "var(--text-secondary)",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                + Invite Member
              </button>
            </div>

            <div className={styles["members-list"]}>
              {members.map((member) => (
                <div key={member.id} className={styles["member-row"]}>
                  <div className={styles["member-avatar"]}>
                    {member.username.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles["member-info"]}>
                    <span className={styles["member-name"]}>
                      {member.username}
                    </span>
                    <span className={styles["member-email"]}>
                      {member.email}
                    </span>
                  </div>
                  <span
                    className={`${styles["role-badge"]} ${styles[member.role.toLowerCase()]}`}
                  >
                    {member.role.toUpperCase()}
                  </span>
                  <span className={styles["member-joined"]}>
                    Joined{" "}
                    {new Date(member.joinedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              ))}
            </div>
          </section>
          <TaskBoard workspaceId={id} members={members} />
        </main>
      </div>
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        workspaceId={id}
        onMemberAdded={handleMemberAdded}
      />
      <WorkspaceSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        workspaceId={id}
        members={members}
        activeUserId={user?.id}
      />
      <StandupModal
        isOpen={isStandupModalOpen}
        onClose={() => setIsStandupModalOpen(false)}
        workspaceId={id}
      />
    </div>
  );
}
