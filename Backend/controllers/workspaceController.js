import Workspace from "../models/Workspace.js";
import WorkspaceMember from "../models/WorkspaceMember.js";
import User from '../models/User.js';

// 1. CREATE WORKSPACE
export async function createWorkspace(req, res) {
  try {
    const { name, description } = req.body;
    const userId = req.user.id; // Comes from authMiddleware
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Workspace name is required" });
    }

    if (name.trim().length < 2) {
      return res
        .status(400)
        .json({ message: "Workspace name must be at least 2 characters" });
    }

    if (name.trim().length > 50) {
      return res
        .status(400)
        .json({ message: "Workspace name cannot exceed 50 characters" });
    }

    if (description && description.trim().length > 200) {
      return res
        .status(400)
        .json({ message: "Description cannot exceed 200 characters" });
    }

    const trimmedName = name.trim();
    // Create the actual Workspace
    const newWorkspace = await Workspace.create({
      name: trimmedName,
      description: description?.trim() || "",
    });

    // Automatically add the creator to the WorkspaceMember table as an Admin
    await WorkspaceMember.create({
      userId: userId,
      workspaceId: newWorkspace.id,
      role: "Admin",
    });

    res.status(201).json({
      message: "Workspace created successfully",
      workspace: newWorkspace,
    });
  } catch (error) {
    console.error("Error creating workspace:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// 2. GET USER'S WORKSPACES
export async function getUserWorkspaces(req, res) {
  try {
    const userId = req.user.id;

    // Find all memberships for this user, and "include" the associated Workspace data
    const memberships = await WorkspaceMember.findAll({
      where: { userId: userId },
      include: [
        {
          model: Workspace,
          attributes: ["id", "name", "description", "createdAt"], // Only grab what we need
        },
      ],
    });

    // The data comes back nested. Let's flatten it so it's easier for React to use on the Dashboard
    const formattedWorkspaces = memberships.map((membership) => ({
      id: membership.Workspace.id,
      name: membership.Workspace.name,
      description: membership.Workspace.description,
      role: membership.role,
      joinedAt: membership.createdAt,
    }));

    res.json(formattedWorkspaces);
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getWorkspaceById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    //Checking if the user is already a member of the workspace

    const membership = await WorkspaceMember.findOne({
      where: { userId: userId, workspaceId: id}, 
    });

    if (!membership) {
      return res.status(403).json({ message: "You are not a member of this workspace" });
    }
    // Get the workspace details
     const workspace = await Workspace.findByPk(id, {
      attributes: ["id", "name","description", "createdAt"]
     });
     if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

      // Get all members of this workspace
        const members = await WorkspaceMember.findAll({
          where: { workspaceId: id },
          include: [{
            model: User,
            attributes: ['id', 'username', 'email'] // Adjust based on your User model
          }]
        })

        const formattedMembers = members.map(m => ({
          id: m.User.id,
          username: m.User.username,
          email: m.User.email,
          role: m.role,
          joinedAt: m.createdAt
        }));

        res.json({
          workspace: workspace,
          members: formattedMembers
        })
  } catch (error) {
    console.error("Error fetching workspace details:", error);
    res.status(500).json({ message: "Server error" });
  }
}