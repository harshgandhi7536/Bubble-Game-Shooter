// import Users from "../model/userModel.js";

// export const createUser = async (req, res) => {
//     try {
//         const newUser = new Users(req.body);

//         const { email } = newUser;

//         const userExists = await Users.findOne({ email });

//         if (userExists) {
//             return res.status(400).json({
//                 message: "User already exists"
//             });
//         }

//         const savedUser = await newUser.save();

//         res.status(201).json(savedUser);

//     } catch (error) {
//         res.status(500).json({
//             message: error.message
//         });
//     }
// };


// import User from "../model/userModel.js";
// import bcrypt from "bcrypt";

// export const createUser = async (req, res) => {

//     try {

//         // 1. Receive data from frontend
//         const { firstname, lastname, email, password } = req.body;

//         // 2. Check existing email
//         const existingUser = await User.findOne({ email });

//         if (existingUser) {
//             return res.status(400).json({
//                 message: "Email already registered!"
//             });
//         }

//         // 3. Encrypt password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // 4. Create user object
//         const newUser = new User({
//             firstname,
//             lastname,
//             email,
//             password: hashedPassword
//         });

//         // 5. Save in MongoDB
//         await newUser.save();

//         res.status(201).json({
//             message: "User registered successfully!"
//         });

//     } catch (error) {

//         console.log("Registration Error:", error);

//         res.status(500).json({
//             message: "Registration failed!"
//         });

//     }
// };




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
