const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { ROLES } = require("../utils/roles.js");

require("dotenv").config();

const loginUser = async (req, res) => {
    try{
        const {email, password} = req.body;

        if (!email || !password) {
            return res.status(400).json({message: "Email and password are required"});
        }

        const user = await User.findOne({email}).select("+password");

        if (!user) {
            return res.status(401).json({message: "Invalid email or password"});
        }

        if (!user.isActive) {
            return res.status(403).json({message: "User account is inactive"});
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({message: "Invalid email or password"});
        }

        const payload = {
        user_id: user._id,
        role: user.role,
        region: user.region || null,
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION || "1m" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                region: user.region,
                isActive: user.isActive,
            },
        });


    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({message: "Internal server error"});
    }

}

const createUser = async (req, res) => {
    try {
        const { email, password, role, region } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({ message: "Email, password, and role are required" });
        }

        const validRoles = Object.values(ROLES);
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        if (role === ROLES.REGIONAL_ADMIN && !region) {
            return res.status(400).json({ message: "Region is required for Regional Admin role" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "email already in use" });
        }   

        const newUser = new User({
            email,
            password,
            role,
            region: role === ROLES.REGIONAL_ADMIN ? region : null,
        });

        await newUser.save();

        res.status(201).json({
            message: "User created successfully",
            user: {
                id: newUser._id,
                email: newUser.email,
                role: newUser.role,
                region: newUser.region,
                isActive: newUser.isActive,
            },
        });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { loginUser, createUser };