import { Router } from 'express';
import { createWorkspace, getUserWorkspaces, getWorkspaceById } from '../controllers/workspaceController.js';
import authMiddleware from '../middleware/authMiddleware.js';


const router = Router();

// Protect all workspace routes so only logged-in users can use them!
router.use(authMiddleware);

// Route: POST /api/workspaces (Create a workspace)
router.post('/', createWorkspace);

// Route: GET /api/workspaces (Get my workspaces)
router.get('/', getUserWorkspaces);

// Route: GET /api/workspaces/:id (Get workspace details by ID)
router.get('/:id', getWorkspaceById);

export default router;
