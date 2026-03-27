import { useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import styles from "../Dashboard/CreateWorkspaceModal.module.css";

export default function CreateTaskModal({
  isOpen,
  onClose,
  workspaceId,
  onTaskCreated,
  members,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = { title, description };
      if (assignedTo) payload.assignedTo = parseInt(assignedTo); // Ensure ID is a number

      const res = await api.post(`/workspaces/${workspaceId}/tasks`, payload);
      toast.success("Task created!");
      onTaskCreated(res.data);

      // Reset form on success
      setTitle("");
      setDescription("");
      setAssignedTo("");
      onClose();
    } catch (error) {
      toast.error("Failed to create task");
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
          <h2>Create Task</h2>
          <p>Add a new ticket to the board.</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles["form-group"]}>
            <label>Task Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className={styles["form-group"]}>
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className={styles["form-group"]}>
            <label>Assign To (Optional)</label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid rgba(203, 153, 126, 0.3)",
              }}
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.username}
                </option> // Renders existing workspace members inside the dropdown
              ))}
            </select>
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
              {isSubmitting ? "Saving..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
