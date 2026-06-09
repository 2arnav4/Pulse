import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import styles from "../Dashboard/CreateWorkspaceModal.module.css";

export default function WorkspaceSettingsModal({ isOpen, onClose, workspaceId, members, activeUserId }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Find out if the active user is an admin
  const activeUserRole = members.find(m => m.id === activeUserId)?.role;
  const isAdmin = activeUserRole === "admin";

  if (!isOpen) return null;

  const handleDeleteWorkspace = async () => {
    if (!window.confirm("Are you SURE you want to permanently delete this workspace and all tasks?")) return;
    
    setIsSubmitting(true);
    try {
      await api.delete(`/workspaces/${workspaceId}`);
      toast.success("Workspace deleted");
      navigate("/dashboard");
    } catch {
      toast.error("Failed to delete workspace");
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Remove this member from the workspace?")) return;

    try {
      await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
      toast.success("Member removed! Please refresh.");
      window.location.reload(); 
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove member");
    }
  };

  return (
    <div className={styles["modal-overlay"]} onClick={onClose}>
      <div className={styles["modal-content"]} onClick={(e) => e.stopPropagation()}>
        <div className={styles["modal-header"]}>
          <h2>Workspace Settings</h2>
          <p>Manage members and dangerous actions.</p>
        </div>
        
        <div className={styles["form-group"]}>
          <h3 className={styles["modal-section-title"]}>Manage Members</h3>
          <ul className={styles["settings-member-list"]}>
            {members.map(m => (
              <li key={m.id} className={styles["settings-member-row"]}>
                <span>{m.username} <span>({m.role})</span></span>
                {isAdmin && m.id !== activeUserId && (
                  <button
                    onClick={() => handleRemoveMember(m.id)}
                    className={styles["remove-member-btn"]}
                    type="button"
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        {isAdmin && (
          <div className={styles["danger-zone"]}>
            <h3>Danger Zone</h3>
            <button 
              onClick={handleDeleteWorkspace} 
              disabled={isSubmitting}
              className={styles["danger-btn"]}
              type="button"
            >
              {isSubmitting ? "Deleting..." : "Permanently Delete Workspace"}
            </button>
          </div>
        )}

        <div className={styles["modal-actions"]}>
          <button type="button" className={styles["cancel-btn"]} onClick={onClose} data-full-width>Close Settings</button>
        </div>
      </div>
    </div>
  );
}
