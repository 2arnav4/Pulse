import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import StandupModal from "../WorkspaceDetail/StandupModal";
import styles from "./SettingsPage.module.css";
import { HiLogout } from "react-icons/hi";

export default function SettingsPage() {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Your screenshot shows the standup modal open, so we start it open.
  const [isStandupOpen, setIsStandupOpen] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const activeUserRole = useMemo(
    () => members.find((m) => m.id === user?.id)?.role || null,
    [members, user?.id],
  );
  const isAdmin = activeUserRole === "admin";

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/workspaces/${id}`);
      setWorkspace(res.data?.workspace || null);
      setMembers(res.data?.members || []);
    } catch (e) {
      toast.error("Failed to load workspace settings.");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleDeleteWorkspace = async () => {
    if (!window.confirm("Are you SURE you want to permanently delete this workspace and all tasks?")) return;
    setIsDeleting(true);
    try {
      await api.delete(`/workspaces/${id}`);
      toast.success("Workspace deleted");
      navigate("/dashboard");
    } catch (e) {
      toast.error("Failed to delete workspace");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Remove this member from the workspace?")) return;
    try {
      await api.delete(`/workspaces/${id}/members/${userId}`);
      toast.success("Member removed");
      await fetchDetails();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to remove member");
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.nav}>
          <span className={styles.pageTitle}>Workspace Settings</span>
        </div>
        <div className={styles.loading}>Loading settings...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.nav}>
        <div className={styles.navLeft}>
          <span className={styles.workspaceKicker}>Workspace Settings</span>
          <span className={styles.pageTitle}>{workspace?.name || "Settings"}</span>
        </div>
        <div className={styles.navRight}>
          <div className={styles.userChip}>
            {(user?.username || "U").charAt(0).toUpperCase()}
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <HiLogout /> Logout
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <div className={styles.cardTitle}>Workspace Settings</div>
              <div className={styles.cardSub}>
                Member management & safe admin actions.
              </div>
            </div>
            <div className={styles.actionsRow}>
              <button
                className={styles.aiBtn}
                onClick={() => setIsStandupOpen(true)}
                type="button"
              >
                🤖 AI Standup
              </button>
            </div>
          </div>

          <div className={styles.sectionTitle}>Member Management</div>
          <div className={styles.table}>
            {members.map((m) => (
              <div className={styles.row} key={m.id}>
                <div className={styles.person}>
                  <div className={styles.avatar}>
                    {m.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.personInfo}>
                    <div className={styles.personName}>{m.username}</div>
                    <div className={styles.personEmail}>{m.email}</div>
                  </div>
                </div>

                <span
                  className={[
                    styles.roleBadge,
                    m.role === "admin" ? styles.admin : styles.member,
                  ].join(" ")}
                >
                  {m.role.toUpperCase()}
                </span>

                {isAdmin && m.id !== user?.id ? (
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => handleRemoveMember(m.id)}
                  >
                    Remove
                  </button>
                ) : (
                  <div className={styles.rowSpacer} />
                )}
              </div>
            ))}
          </div>

          {isAdmin && (
            <div className={styles.dangerZone}>
              <div className={styles.dangerTitle}>Danger Zone</div>
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={handleDeleteWorkspace}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Permanently Delete Workspace"}
              </button>
            </div>
          )}
        </section>
      </div>

      <StandupModal
        isOpen={isStandupOpen}
        onClose={() => setIsStandupOpen(false)}
        workspaceId={id}
      />
    </div>
  );
}
