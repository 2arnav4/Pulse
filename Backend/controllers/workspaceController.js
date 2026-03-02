import Workspace from '../models/Workspace.js';
import WorkspaceMember from '../models/WorkspaceMember.js';

// 1. CREATE WORKSPACE
export async function createWorkspace(req, res) {
    try {
        const { name, description } = req.body;
        const userId = req.user.id; // Comes from authMiddleware

        // Create the actual Workspace
        const newWorkspace = await Workspace.create({
            name,
            description
        });

        // Automatically add the creator to the WorkspaceMember table as an Admin
        await WorkspaceMember.create({
            userId: userId,
            workspaceId: newWorkspace.id,
            role: 'Admin'
        });

        res.status(201).json({
            message: 'Workspace created successfully',
            workspace: newWorkspace
        });

    } catch (error) {
        console.error("Error creating workspace:", error);
        res.status(500).json({ message: 'Server error' });
    }
}

// 2. GET USER'S WORKSPACES
export async function getUserWorkspaces(req, res) {
    try {
        const userId = req.user.id;

        // Find all memberships for this user, and "include" the associated Workspace data
        const memberships = await WorkspaceMember.findAll({
            where: { userId: userId },
            include: [{
                model: Workspace,
                attributes: ['id', 'name', 'description', 'createdAt'] // Only grab what we need
            }]
        });

        // The data comes back nested. Let's flatten it so it's easier for React to use on the Dashboard
        const formattedWorkspaces = memberships.map(membership => ({
            id: membership.Workspace.id,
            name: membership.Workspace.name,
            description: membership.Workspace.description,
            role: membership.role,
            joinedAt: membership.createdAt
        }));

        res.json(formattedWorkspaces);

    } catch (error) {
        console.error("Error fetching workspaces:", error);
        res.status(500).json({ message: 'Server error' });
    }
}
