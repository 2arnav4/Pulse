import { useState, useEffect } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import styles from "./TaskBoard.module.css";
import CreateTaskModal from "./CreateTaskModal";

export default function TaskBoard({ workspaceId, members }) {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // A. Fetch all tasks instantly when the board loads
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get(`/workspaces/${workspaceId}/tasks`);
        setTasks(res.data);
      } catch (error) {
        toast.error("Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [workspaceId]);

  // B. Optimistically update UI so it feels real-time
  const handleTaskCreated = (newTask) => {
    // We attach an Assignee object manually so the UI renders their Avatar instantly without refreshing
    if (newTask.assignedTo) {
      const member = members.find((m) => m.id === newTask.assignedTo);
      if (member)
        newTask.Assignee = { id: member.id, username: member.username };
    }
    setTasks((prev) => [...prev, newTask]);
  };

  // C. Update Task Status
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      // Optimistically update the UI instantly
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
      // Wait for backend to confirm
      await api.put(`/workspaces/${workspaceId}/tasks/${taskId}`, { status: newStatus });
      toast.success("Task updated!");
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const columns = ["todo", "in-progress", "done"];

  if (loading) return <div style={{ marginTop: "20px" }}>Loading tasks...</div>;

  return (
    <section style={{ marginTop: "40px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2
          style={{
            fontSize: "1.2rem",
            margin: 0,
            color: "var(--text-primary)",
          }}
        >
          Task Board
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            background: "var(--accent)",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          + New Task
        </button>
      </div>

      <div className={styles["board-container"]}>
        {columns.map((status) => (
          <div key={status} className={styles["column"]}>
            <div className={styles["column-header"]}>
              <span>{status.replace("-", " ")}</span>
              <span style={{ fontSize: "0.8rem", color: "gray" }}>
                {tasks.filter((t) => t.status === status).length}
              </span>
            </div>

            {/* Filter tasks so they only render inside their assigned column! */}
            {tasks
              .filter((t) => t.status === status)
              .map((task) => (
                <div key={task.id} className={styles["task-card"]}>
                  <div className={styles["task-title"]}>{task.title}</div>
                  {task.description && (
                    <div className={styles["task-desc"]}>
                      {task.description}
                    </div>
                  )}

                  <div className={styles["task-footer"]} style={{ justifyContent: "space-between", alignItems: "center" }}>
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        border: "1px solid var(--border)",
                        fontSize: "0.75rem",
                        color: "var(--text-secondary)",
                        cursor: "pointer",
                        background: "var(--input-bg)"
                      }}
                    >
                      <option value="todo">Todo</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>

                    {task.Assignee ? (
                      <div
                        className={styles["assignee-avatar"]}
                        title={task.Assignee.username}
                      >
                        {task.Assignee.username.charAt(0).toUpperCase()}
                      </div>
                    ) : (
                      <span style={{ fontSize: "0.8rem", color: "gray" }}>
                        Unassigned
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        workspaceId={workspaceId}
        onTaskCreated={handleTaskCreated}
        members={members}
      />
    </section>
  );
}
