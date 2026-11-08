// import express from "express";
// import cors from "cors";

// import databaseConnection from "./database.js";

// import user from "./routes/userRoute.js";
// import game from "./routes/gameRoute.js";

// const app = express();

// // Database connection
// databaseConnection();

// // Middleware
// app.use(cors({
//     origin: "http://localhost:5173"
// }));

// app.use(express.json());

// // Home route
// app.get("/", (req, res) => {
//     res.send("Welcome to bubble shooter game");
// });

// // Test route
// app.get("/test", (req, res) => {
//     res.send("Backend is working!");
// });

// // User routes
// app.use("/signup", user);

// // Game routes
// app.use("/api/games", game);

// // Start server
// app.listen(8000, () => {
//     console.log("Server is running on port 8000");
// });






// import express from "express";
// import cors from "cors";

// import databaseConnection from "./database.js";

// import user from "./routes/userRoute.js";
// import game from "./routes/gameRoute.js";

// const app = express();

// // Database connection
// databaseConnection();

// // Allowed frontend URLs
// const allowedOrigins = [
//     "http://localhost:5173",
//     process.env.FRONTEND_URL
// ].filter(Boolean);

// // Middleware
// app.use(cors({
//     origin: (origin, callback) => {
//         if (!origin || allowedOrigins.includes(origin)) {
//             callback(null, true);
//         } else {
//             callback(new Error("Not allowed by CORS"));
//         }
//     }
// }));

// app.use(express.json());

// // Home route
// app.get("/", (req, res) => {
//     res.send("Welcome to bubble shooter game");
// });

// // Test route
// app.get("/test", (req, res) => {
//     res.send("Backend is working!");
// });

// // User routes
// app.use("/signup", user);

// // Game routes
// app.use("/api/games", game);

// // Start server
// // const PORT = process.env.PORT || 8000;

// // app.listen(PORT, () => {
// //     console.log(`Server is running on port ${PORT}`);

// const PORT = process.env.PORT || 8000;

// const startServer = async () => {
//     try {
//         await databaseConnection();

//         app.listen(PORT, () => {
//             console.log(`Server is running on port ${PORT}`);
//         });
//     } catch (error) {
//         console.error("Server startup failed:", error.message);
//         process.exit(1);
//     }
// };

// startServer();





import express from "express";
import cors from "cors";

import databaseConnection from "./database.js";

import user from "./routes/userRoute.js";
import game from "./routes/gameRoute.js";

const app = express();

// Allowed frontend URLs
const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL
].filter(Boolean);

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    }
}));

app.use(express.json());

// Home route
app.get("/", (req, res) => {
    res.send("Welcome to bubble shooter game");
});

// Test route
app.get("/test", (req, res) => {
    res.send("Backend is working!");
});

// User routes
app.use("/signup", user);

// Game routes
app.use("/api/games", game);

// Start server
const PORT = process.env.PORT || 8000;

const startServer = async () => {
    try {
        await databaseConnection();

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};

startServer();
