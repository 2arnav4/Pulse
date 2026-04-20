import express, { json } from 'express';
import cors from 'cors';
import 'dotenv/config';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDB, sequelize } from './config/database.js'; // Import DB connection
import authRoutes from './routes/authRoutes.js'; // <--- IMPORT ROUTES
// ---------------------------------------------------------
// IMPORT MODELS AND DEFINE RELATIONSHIPS
// ---------------------------------------------------------
import User from './models/User.js';
import Workspace from './models/Workspace.js';
import WorkspaceMember from './models/WorkspaceMember.js';
import workspaceRoutes from './routes/workspaceRoutes.js';
import Task from './models/Task.js';



// A User has many Workspaces, A Workspace has many Users. 
// They are connected "through" the WorkspaceMember table.

User.belongsToMany(Workspace, { through: WorkspaceMember, foreignKey: 'userId' });
Workspace.belongsToMany(User, { through: WorkspaceMember, foreignKey: 'workspaceId' });


// We also need direct access to the join table for specific queries

User.hasMany(WorkspaceMember, { foreignKey: 'userId' });
WorkspaceMember.belongsTo(User, { foreignKey: 'userId' });
Workspace.hasMany(WorkspaceMember, { foreignKey: 'workspaceId' });
WorkspaceMember.belongsTo(Workspace, { foreignKey: 'workspaceId' });
Workspace.hasMany(Task, {
    foreignKey: 'workspaceId',
    onDelete: 'CASCADE'
});
Task.belongsTo(Workspace, { foreignKey: 'workspaceId' })

User.hasMany(Task, { foreignKey: 'assignedTo', onDelete: 'SET NULL' });
Task.belongsTo(User, { as: 'Assignee', foreignKey: 'assignedTo' });

// ---------------------------------------------------------

const app = express();

// Assert required environment variables
if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET is not set');
    process.exit(1);
}

// Connect to Database
connectDB(); // <--- CALL DB CONNECTION

// Only sync database in development
if (process.env.NODE_ENV !== 'production') {
    sequelize.sync({ alter: true })
        .then(() => console.log('Database synced successfully'))
        .catch((err) => console.log('Database sync error', err));
}

app.use(helmet());

app.use(cors({
    origin: function(origin, callback) {
        const allowed = [
            'http://localhost:5173',
            'https://pulse-nu-liard.vercel.app',
            process.env.FRONTEND_URL,
        ].filter(Boolean);
        if (!origin || allowed.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many login attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(json());

// Health check endpoint for Render
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Use Routes
app.use('/api/auth', authLimiter, authRoutes); // <--- RATE LIMIT AUTH
app.use('/api/workspaces', workspaceRoutes); // <--- MOUNT ROUTES
// This means any request starting with /api/auth will go to authRoutes
// Example: /api/auth/register

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Pulse API Running');
});

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message, err.stack);
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown on SIGTERM
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    try {
        await sequelize.close();
        console.log('Database connection closed');
        process.exit(0);
    } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
    }
});
