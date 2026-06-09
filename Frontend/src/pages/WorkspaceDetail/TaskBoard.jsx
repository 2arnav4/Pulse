import { useState, useEffect } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import styles from "./TaskBoard.module.css";
import CreateTaskModal from "./CreateTaskModal";
import { Plus } from "lucide-react";

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
      } catch {
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
    let taskToAdd = newTask;
    if (newTask.assignedTo) {
      const member = members.find((m) => m.id === newTask.assignedTo);
      if (member) {
        taskToAdd = {
          ...newTask,
          Assignee: { id: member.id, username: member.username },
        };
      }
    }
    setTasks((prev) =>
      prev.some((task) => task.id === taskToAdd.id) ? prev : [...prev, taskToAdd],
    );
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
    } catch {
      toast.error("Failed to update task");
    }
  };

  const columns = ["todo", "in-progress", "done"];
  const columnLabels = {
    todo: "To do",
    "in-progress": "In progress",
    done: "Done",
  };

  if (loading) {
    return <div className={styles.loading}>Loading tasks...</div>;
  }

  return (
    <section className={styles.boardSection}>
      <div className={styles.boardHeader}>
        <div>
          <h2 className={styles.boardTitle}>Task Board</h2>
          <p className={styles.boardSubtitle}>
            Plan, assign, and move work from idea to done.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className={styles.newTaskButton}
          type="button"
        >
          <Plus size={16} />
          New Task
        </button>
      </div>

      <div className={styles["board-container"]}>
        {columns.map((status) => (
          <div key={status} className={styles["column"]}>
            <div className={styles["column-header"]}>
              <span>{columnLabels[status]}</span>
              <span className={styles.columnCount}>
                {tasks.filter((t) => t.status === status).length}
              </span>
            </div>

            {tasks.filter((t) => t.status === status).length === 0 ? (
              <div className={styles.emptyColumn}>No tasks here yet.</div>
            ) : (
              tasks
                .filter((t) => t.status === status)
                .map((task) => (
                <div key={task.id} className={styles["task-card"]}>
                  <div className={styles["task-title"]}>{task.title}</div>
                  {task.description && (
                    <div className={styles["task-desc"]}>
                      {task.description}
                    </div>
                  )}

                  <div className={styles["task-footer"]}>
                    <select
                      className={styles.statusSelect}
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
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
                      <span className={styles.unassigned}>
                        Unassigned
                      </span>
                    )}
                  </div>
                </div>
                ))
            )}
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
