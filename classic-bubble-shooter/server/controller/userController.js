import User from "../model/userModel.js";
import bcrypt from "bcrypt";

// REGISTER USER
export const createUser = async (req, res) => {
    try {
        const { firstname, lastname, email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already registered!"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            firstname,
            lastname,
            email,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({
            message: "User registered successfully!"
        });

    } catch (error) {
        console.log("Registration Error:", error);

        return res.status(500).json({
            message: "Registration failed!"
        });
    }
};


// LOGIN USER
export const loginUser = async (req, res) => {
    try {
        console.log("Received login data:", req.body);

        const { email, password } = req.body;

        // Find user by email
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({
                message: "User not found! Please register first."
            });
        }

        // Compare entered password with encrypted password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            existingUser.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Incorrect password!"
            });
        }

        // Login successful
        return res.status(200).json({
            message: "Login successful!",
            user: {
                id: existingUser._id,
                firstname: existingUser.firstname,
                lastname: existingUser.lastname,
                email: existingUser.email
            }
        });

    } catch (error) {
        console.log("Login Error:", error);

        return res.status(500).json({
            message: "Login failed!"
        });
    }
};
