import Task from "../models/Task.js";
import WorkspaceMember from "../models/WorkspaceMember.js";
import User from "../models/User.js";

// Helper Function: Ensure hacker can't view private workspace tasks
const isUserInWorkspace = async (userId, workspaceId) => {
    return await WorkspaceMember.findOne({ where: { userId, workspaceId } });
};

// 1. GET ALL TASKS FOR A WORKSPACE
export async function getWorkspaceTasks(req, res) {
    try {
        const { id: workspaceId } = req.params;
        const userId = req.user.id;

        // Block if not a workspace member
        if (!(await isUserInWorkspace(userId, workspaceId))) {
            return res.status(403).json({ message: "Access denied. You are not a member." });
        }

        // Fetch Tasks + include the avatar/username of whoever it is assigned to!
        const tasks = await Task.findAll({
            where: { workspaceId },
            include: [{ model: User, as: "Assignee", attributes: ["id", "username"] }]
        });

        res.json(tasks);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ message: "Failed to fetch tasks" });
    }
}

// 2. CREATE A NEW TASK
export async function createTask(req, res) {
    try {
        const { id: workspaceId } = req.params;
        const { title, description, assignedTo } = req.body;
        const userId = req.user.id;

        // Block if not a workspace member
        if (!(await isUserInWorkspace(userId, workspaceId))) {
            return res.status(403).json({ message: "Access denied. You are not a member." });
        }

        // Create the task ticket
        const newTask = await Task.create({
            title,
            description: description || "",
            workspaceId,
            assignedTo: assignedTo || null
        });

        res.status(201).json(newTask);
    } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ message: "Failed to create task" });
    }
}
