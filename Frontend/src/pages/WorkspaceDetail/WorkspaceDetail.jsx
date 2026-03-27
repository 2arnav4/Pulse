import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
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
  }, [id, navigate]);

  const [activeTab, setActiveTab] = useState("board");

  const avatarLetter = user?.username?.charAt(0).toUpperCase() || "U";

  if (loading) {
    return (
      <div className={styles["detail-layout"]}>
        <div className={styles["detail-body"]}>
          <div className={styles["loading"]}>Loading workspace...</div>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "board":
        return <TaskBoard workspaceId={id} members={members} />;
      case "members":
        return (
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
                Manage Team
              </h2>
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className={styles["primary-btn"]}
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
        );
      case "settings":
        return (
          <div className={styles["settings-view"]}>
             <h2 className={styles["section-title"]}>Workspace Settings</h2>
             <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>Management options for {workspace.name}</p>
             <button 
                onClick={() => setIsSettingsModalOpen(true)} 
                className={styles["secondary-btn"]}
                style={{ width: "fit-content" }}
             >
               Open Full Settings
             </button>
          </div>
        );
      default:
        return <TaskBoard workspaceId={id} members={members} />;
    }
  };

  return (
    <div className={styles["detail-layout"]}>
      <div className={styles["detail-body"]}>
        {/* Jira-style Top Bar */}
        <header className={styles["workspace-top-bar"]}>
          <div className={styles["title-area"]}>
             <div className={styles["workspace-icon"]}>{workspace.name.charAt(0)}</div>
             <div className={styles["title-info"]}>
                <h1 className={styles["workspace-name"]}>{workspace.name}</h1>
                <span className={styles["workspace-type"]}>Software Project</span>
             </div>
          </div>
          
          <div className={styles["top-actions"]}>
            <button
              onClick={() => setIsStandupModalOpen(true)}
              className={styles["ai-btn"]}
            >
              AI Standup
            </button>
            <div className={styles["user-pill"]}>
               <div className={styles["user-avatar-sm"]}>{avatarLetter}</div>
               <button className={styles["logout-link"]} onClick={handleLogout}>
                 <HiLogout size={14} />
               </button>
            </div>
          </div>
        </header>

        <nav className={styles["workspace-nav-tabs"]}>
          <button 
            className={`${styles["nav-tab"]} ${activeTab === "board" ? styles["active"] : ""}`}
            onClick={() => setActiveTab("board")}
          >
            Board
          </button>
          <button 
            className={`${styles["nav-tab"]} ${activeTab === "members" ? styles["active"] : ""}`}
            onClick={() => setActiveTab("members")}
          >
            Members
          </button>
          <button 
            className={`${styles["nav-tab"]} ${activeTab === "settings" ? styles["active"] : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            Settings
          </button>
        </nav>

        <main className={styles["detail-main"]}>
          {renderTabContent()}
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
