const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// 1. REGISTER USER
exports.register = async (req, res) => {
    try {
        //Get Data from the frontend request
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        //Hash the password (encrypt it)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create the new user in the database 
        const newUser = await User.create({
            username,
            email,
            password_hash: hashedPassword,
        });
        // Create a Token (JWT) so that user is logged in immediately 
        const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });

        //Send success response 
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
            },
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// 2. LOGIN USER 
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user by email
        const user = await User.findOne({ where: { email } })
        if (!user) {
            return res.status(404).json({ message: 'Invalid credentials ' });
        }

        // Compare the password they typed with the hashed password in the DB
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(404).json({ message: 'Invalid credentials' });
        }

        //Generate Token 
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
}
// 3. GET CURRENT LOGGED IN USER
exports.getMe = async (req, res) => {
    try {
        // req.user.id comes from the authMiddleware!
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password_hash'] } // Don't send password back!
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
