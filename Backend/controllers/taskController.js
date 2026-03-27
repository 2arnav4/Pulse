import Task from "../models/Task.js";
import WorkspaceMember from "../models/WorkspaceMember.js";
import User from "../models/User.js";
import { Op } from "sequelize";
import Groq from "groq-sdk";


const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

// 3.  UPDATE TASK STATUS
export async function updateTaskStatus(req, res) {
    try {
        const { id: workspaceId, taskId } = req.params;
        const { status } = req.body;
        const userId = req.user.id;

        // Security check: Must be in workspace
        if (!(await isUserInWorkspace(userId, workspaceId))) {
            return res.status(403).json({ message: "Access denied. You are not a member" });
        }

        // Update the task status
        const task = await Task.findOne({ where: { id: taskId, workspaceId } });
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        task.status = status;
        await task.save();

        res.json(task);
    } catch (error) {
        console.error("Error updating task status:", error);
        res.status(500).json({ message: "Failed to update task status" });
    }
}

export const generateStandup = async (req, res) => {
    try {
        const { id: workspaceId } = req.params;

        // Fetch tasks updated in last 24 hours
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const tasks = await Task.findAll({
            where: {
                workspaceId,
                updatedAt: { [Op.gte]: since },
            },
            include: [
                {
                    model: User,
                    as: "Assignee", // NOTE: Your association is called "Assignee" with a capital A!
                    attributes: ["id", "username", "email"], // NOTE: You use username, not name!
                },
            ],
        });

        if (tasks.length === 0) {
            return res.json({ standup: "No tasks were updated in the last 24 hours for this workspace." });
        }

        // Group tasks by assigned user
        const grouped = {};
        tasks.forEach((task) => {
            const name = task.Assignee ? task.Assignee.username : "Unassigned";
            if (!grouped[name]) grouped[name] = [];
            grouped[name].push(`- [${task.status}] ${task.title}`);
        });

        // Build the Prompt
        const taskSummaryText = Object.entries(grouped)
            .map(([name, items]) => `${name}:\n${items.join("\n")}`)
            .join("\n\n");

        const prompt = `You are a project management assistant. Based on the following task activity from the last 24 hours, generate a concise daily standup report for the team. For each person, mention what they worked on and what the current status is. Keep it extremely brief and professional.

Task Activity:
${taskSummaryText}

Generate the standup report now:`.trim();

        // Call Groq API
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.1-8b-instant",
            max_tokens: 500,
        });

        const standup = chatCompletion.choices[0]?.message?.content || "Could not generate standup.";
        return res.json({ standup });
    } catch (error) {
        console.error("Standup generation error:", error);
        return res.status(500).json({ message: "Failed to generate standup." });
    }
};
