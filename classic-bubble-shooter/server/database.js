// import database from "mongoose";

// const databaseConnection=async()=>{
// mongoose
// .connect("mongodb://localhost:27017/bubble_shooter")
// .then(()=>{
//     console.log("Database connected successfully");
// }) 
// .catch((error) =>{
//         console.log("Error while connecting to database",error);
//     });

// };

// export  default databaseConnection;

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const databaseConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("MongoDB Connected Successfully");
    }
    catch (error) {
        console.log("MongoDB Connection Failed:", error.message);
    }
};

export default databaseConnection;