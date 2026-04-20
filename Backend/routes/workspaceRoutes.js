import { Router } from 'express';
import { body, param } from 'express-validator';
import { createWorkspace, getUserWorkspaces, getWorkspaceById, addMemberByEmail, removeMember, deleteWorkspace } from '../controllers/workspaceController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import { getWorkspaceTasks, createTask, updateTaskStatus, generateStandup } from '../controllers/taskController.js';


const router = Router();

// Protect all workspace routes so only logged-in users can use them!
router.use(authMiddleware);

const workspaceIdParam = param('id').isInt({ min: 1 }).withMessage('Invalid workspace id');
const taskIdParam = param('taskId').isInt({ min: 1 }).withMessage('Invalid task id');
const userIdParam = param('userId').isInt({ min: 1 }).withMessage('Invalid user id');

// Route: POST /api/workspaces (Create a workspace)
router.post(
    '/',
    [
        body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
        body('description').optional({ nullable: true }).trim().isLength({ max: 200 }).withMessage('Description max 200 characters'),
    ],
    validate,
    createWorkspace
);

// Route: GET /api/workspaces (Get my workspaces)
router.get('/', getUserWorkspaces);

// Route: GET /api/workspaces/:id (Get workspace details by ID)
router.get('/:id', [workspaceIdParam], validate, getWorkspaceById);

// Route: POST /api/workspaces/:id/members (Invite a user)
router.post(
    '/:id/members',
    [workspaceIdParam, body('email').isEmail().normalizeEmail().withMessage('Invalid email')],
    validate,
    addMemberByEmail
);

// Route: GET /api/workspaces/:id/tasks (Fetch all tasks in a workspace)
router.get('/:id/tasks', [workspaceIdParam], validate, getWorkspaceTasks);

// Route: POST /api/workspaces/:id/tasks (Create a new Kanban task)
router.post(
    '/:id/tasks',
    [
        workspaceIdParam,
        body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
        body('description').optional({ nullable: true }).trim().isLength({ max: 2000 }).withMessage('Description max 2000 characters'),
        body('assignedTo').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Invalid assignee id'),
    ],
    validate,
    createTask
);

// Route: PUT /api/workspaces/:id/tasks/:taskId (Update existing task status)
router.put(
    '/:id/tasks/:taskId',
    [
        workspaceIdParam,
        taskIdParam,
        body('status').isIn(['todo', 'in-progress', 'done']).withMessage('Status must be todo, in-progress, or done'),
    ],
    validate,
    updateTaskStatus
);

// Route: GET /api/workspaces/:id/standup (Generate AI Standup)
router.get('/:id/standup', [workspaceIdParam], validate, generateStandup);

// Route: DELETE /api/workspaces/:id/members/:userId (Remove member)
router.delete('/:id/members/:userId', [workspaceIdParam, userIdParam], validate, removeMember);

// Route: DELETE /api/workspaces/:id (Nuke the active workspace)
router.delete('/:id', [workspaceIdParam], validate, deleteWorkspace);


export default router;
