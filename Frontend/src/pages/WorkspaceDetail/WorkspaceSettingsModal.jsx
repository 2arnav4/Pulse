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
    } catch (error) {
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
        
        <div className={styles["form-group"]} style={{ marginTop: "20px" }}>
          <h3 style={{ fontSize: "1rem", marginBottom: "10px" }}>Manage Members</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {members.map(m => (
              <li key={m.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
                <span>{m.username} <span style={{fontSize: "0.8rem", color: "gray"}}>({m.role})</span></span>
                {isAdmin && m.id !== activeUserId && (
                  <button onClick={() => handleRemoveMember(m.id)} style={{ color: "red", background: "none", border: "none", cursor: "pointer", fontWeight: "bold" }}>
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        {isAdmin && (
          <div className={styles["form-group"]} style={{ marginTop: "30px", borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
            <h3 style={{ fontSize: "1rem", color: "red", marginBottom: "10px" }}>Danger Zone</h3>
            <button 
              onClick={handleDeleteWorkspace} 
              disabled={isSubmitting}
              style={{ width: "100%", padding: "10px", background: "#fee2e2", color: "#ef4444", border: "1px solid #ef4444", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
              {isSubmitting ? "Deleting..." : "Permanently Delete Workspace"}
            </button>
          </div>
        )}

        <div className={styles["modal-actions"]} style={{ marginTop: "20px" }}>
          <button type="button" className={styles["cancel-btn"]} onClick={onClose} style={{ width: "100%" }}>Close Settings</button>
        </div>
      </div>
    </div>
  );
}
