import { useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import styles from "./CreateWorkspaceModal.module.css";

export default function CreateWorkspaceModal({
  isOpen,
  onClose,
  onWorkspaceCreated,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If the modal isn't supposed to be open, render absolutely nothing.
  if (!isOpen) return null;
  // (We will add State and Handlers here in the next steps)

  // This runs when the form is submitted
  const handleSubmit = async (e) => {
    e.preventDefault(); // Stop the page from refreshing

    // Dont do anything if they just typed spacebars
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      // POST the new workspace to the backend
      const res = await api.post("/workspaces", { name, description });

      toast.success("Workspace created successfully");

      // Reformat the new data to match exactly what Dashboard's map() expects

      const newSpace = {
        id: res.data.workspace.id,
        name: res.data.workspace.name,
        description: res.data.workspace.description,
        role: "admin", // Creator is always the Admin
        joinedAt: res.data.workspace.createdAt,
      };

      // Give the new data back to dashboard.jsx
      onWorkspaceCreated(newSpace);

      // Clean up! Zero out the form and shut the model.
      setName("");
      setDescription("");
      onClose();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create workspace",
      );
    } finally {
      // Turn of the loading state regardless of success or failure
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles["modal-overlay"]} onClick={onClose}>
      <div
        className={styles["modal-content"]}
        // Stop clicks inside the modal from reaching the overlay and closing the modal!
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles["modal-header"]}>
          <h2>Create New Workspace</h2>
          <p>Set up a new space for your team or project.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles["form-group"]}>
            <label>Workspace Name</label>
            <input
              type="text"
              placeholder="e.g. Marketing Q3, Engineering..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus // Automatically places cursor here
            />
          </div>

          <div className={styles["form-group"]}>
            <label>Description (Optional)</label>
            <textarea
              placeholder="What is the purpose of this workspace?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className={styles["modal-actions"]}>
            <button
              type="button"
              className={styles["cancel-btn"]}
              onClick={onClose}
              disabled={isSubmitting} // Prevent cancel mid-submission
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles["submit-btn"]}
              disabled={isSubmitting} // Prevent double-clicking
            >
              {isSubmitting ? "Creating..." : "Create Workspace"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
