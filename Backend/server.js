import express, { json } from 'express';
import cors from 'cors';
import { connectDB, sequelize } from './config/database.js'; // Import DB connection
import authRoutes from './routes/authRoutes.js'; // <--- IMPORT ROUTES
import 'dotenv/config';
// ---------------------------------------------------------
// IMPORT MODELS AND DEFINE RELATIONSHIPS
// ---------------------------------------------------------
import User from './models/User.js';
import Workspace from './models/Workspace.js';
import WorkspaceMember from './models/WorkspaceMember.js';
import workspaceRoutes from './routes/workspaceRoutes.js'; // <--- ADD THIS LINE



// A User has many Workspaces, A Workspace has many Users. 
// They are connected "through" the WorkspaceMember table.

User.belongsToMany(Workspace, { through: WorkspaceMember, foreignKey: 'userId' });
Workspace.belongsToMany(User, { through: WorkspaceMember, foreignKey: 'workspaceId' });


// We also need direct access to the join table for specific queries

User.hasMany(WorkspaceMember, { foreignKey: 'userId' });
WorkspaceMember.belongsTo(User, { foreignKey: 'userId' });
Workspace.hasMany(WorkspaceMember, { foreignKey: 'workspaceId' });
WorkspaceMember.belongsTo(Workspace, { foreignKey: 'workspaceId' });
// ---------------------------------------------------------

const app = express();

// Connect to Database
connectDB(); // <--- CALL DB CONNECTION

sequelize.sync({ alter: true })
    .then(() => console.log('Database synced successfully'))
    .catch((err) => console.log('Database sync error', err));

app.use(cors());
app.use(json());

// Use Routes
app.use('/api/auth', authRoutes); // <--- MOUNT ROUTES
app.use('/api/workspaces', workspaceRoutes); // <--- MOUNT ROUTES
// This means any request starting with /api/auth will go to authRoutes
// Example: /api/auth/register

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Pulse API Running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
