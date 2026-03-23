import { useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import styles from "../Dashboard/CreateWorkspaceModal.module.css";

export default function InviteMemberModal({
  isOpen,
  onClose,
  workspaceId,
  onMemberAdded,
}) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await api.post(`/workspaces/${workspaceId}/members`, {
        email,
      });
      toast.success("Member invited successfully!");
      onMemberAdded(res.data.member);
      setEmail("");
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to invite member");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles["modal-overlay"]} onClick={onClose}>
      <div
        className={styles["modal-content"]}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles["modal-header"]}>
          <h2>Invite Member</h2>
          <p>Add a new collaborator to the workspace via email.</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles["form-group"]}>
            <label>User Email</label>
            <input
              type="email"
              placeholder="e.g. colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className={styles["modal-actions"]}>
            <button
              type="button"
              className={styles["cancel-btn"]}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles["submit-btn"]}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Inviting..." : "Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
