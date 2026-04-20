import User from '../models/User.js';
import bcryptjs from 'bcryptjs';
const { genSalt, hash, compare } = bcryptjs;
import jwt from 'jsonwebtoken';
const { sign } = jwt;
import { validationResult } from 'express-validator';


// 1. REGISTER USER
export async function register(req, res) {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        //Get Data from the frontend request
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        //Hash the password (encrypt it)
        const salt = await genSalt(10);
        const hashedPassword = await hash(password, salt);

        // Create the new user in the database 
        const newUser = await User.create({
            username,
            email,
            password_hash: hashedPassword,
        });
        // Create a Token (JWT) so that user is logged in immediately 
        const token = sign({ id: newUser.id }, process.env.JWT_SECRET, {
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
}

// 2. LOGIN USER 
export async function login(req, res) {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        // Find user by email
        const user = await User.findOne({ where: { email } })
        if (!user) {
            return res.status(404).json({ message: 'Invalid credentials ' });
        }

        // Compare the password they typed with the hashed password in the DB
        const isMatch = await compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(404).json({ message: 'Invalid credentials' });
        }

        //Generate Token 
        const token = sign({ id: user.id }, process.env.JWT_SECRET, {
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
export async function getMe(req, res) {
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
}
