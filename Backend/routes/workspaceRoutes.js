import { Router } from 'express';
import { createWorkspace, getUserWorkspaces } from '../controllers/workspaceController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// Protect all workspace routes so only logged-in users can use them!
router.use(authMiddleware);

// Route: POST /api/workspaces (Create a workspace)
router.post('/', createWorkspace);

// Route: GET /api/workspaces (Get my workspaces)
router.get('/', getUserWorkspaces);

export default router;
