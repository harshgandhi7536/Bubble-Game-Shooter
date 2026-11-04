import Users from "../model/userModel.js";

export const createUser = async (req, res) => {
    try {
        const newUser = new Users(req.body);

        const { email } = newUser;

        const userExists = await Users.findOne({ email });

        if (userExists) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const savedUser = await newUser.save();

        res.status(201).json(savedUser);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};