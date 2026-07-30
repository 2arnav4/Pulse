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

// Render terminates TLS at a proxy, so req.socket.remoteAddress is the proxy,
// not the visitor. Without this, express-rate-limit keys every request in the
// world to the same address and the auth limit becomes one shared bucket
// instead of one per client. Trust exactly one hop: trusting more would let a
// caller forge X-Forwarded-For and pick their own rate-limit key.
app.set('trust proxy', 1);

// Assert required environment variables
if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET is not set');
    process.exit(1);
}

// Database connection and schema sync happen in start() at the bottom of this
// file, so the server does not begin accepting requests before either finishes.

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

// Rate limiting for auth endpoints.
//
// The point of this limiter is to make password guessing expensive, so only
// failed attempts are counted. Counting successes too meant a real visitor who
// signed up, logged in, and reloaded a few times could lock themselves out
// without ever getting a password wrong. 20 failures in 15 minutes is still far
// below what any credential-stuffing attempt needs, and it leaves room for a
// handful of people behind one office or campus NAT to use the app at once.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // failed auth attempts per IP per window
    skipSuccessfulRequests: true, // a correct login should not consume budget
    message: 'Too many failed login attempts, please try again later',
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

// Schema sync is an explicit decision, not a consequence of the environment.
//
// This used to run whenever NODE_ENV !== 'production'. Render sets
// NODE_ENV=production automatically for Node services, so on a fresh database
// the sync silently never ran and every request failed against zero tables.
// Reading "am I in production?" to answer "should I change the schema?" is the
// wrong question, and it fails quietly in the one place it matters.
//
// Set RUN_DB_SYNC=true for a single deploy, confirm the log line below, then
// remove the variable. Leaving it on means every restart runs ALTER against a
// live schema, which can rewrite or drop columns.
const start = async () => {
    await connectDB(); // exits the process itself if the database is unreachable

    if (process.env.RUN_DB_SYNC === 'true') {
        console.log('RUN_DB_SYNC=true -> synchronising schema with { alter: true }');
        try {
            await sequelize.sync({ alter: true });
            console.log('Database synced successfully');
        } catch (err) {
            console.error('FATAL: database sync failed', err);
            process.exit(1);
        }
    } else {
        console.log('RUN_DB_SYNC not set -> skipping schema sync (expected in normal operation)');
    }

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

start();

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
