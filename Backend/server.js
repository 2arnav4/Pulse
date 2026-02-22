const express = require('express');
const cors = require('cors');
const { connectDB, sequelize } = require('./config/database'); // Import DB connection
const authRoutes = require('./routes/authRoutes'); // <--- IMPORT ROUTES

require('dotenv').config();

const app = express();

// Connect to Database
connectDB(); // <--- CALL DB CONNECTION

sequelize.sync({ alter: true })
    .then(() => console.log('Database synced successfully'))
    .catch((err) => console.log('Database sync error', err));

app.use(cors());
app.use(express.json());

// Use Routes
app.use('/api/auth', authRoutes); // <--- MOUNT ROUTES
// This means any request starting with /api/auth will go to authRoutes
// Example: /api/auth/register

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Pulse API Running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
