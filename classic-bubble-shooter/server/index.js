import express from "express";
import cors from "cors";

import databaseConnection from "./database.js";

import user from "./routes/userRoute.js";
import game from "./routes/gameRoute.js";

const app = express();

// Database connection
databaseConnection();

// Middleware
app.use(cors({
    origin: "http://localhost:5173"
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
app.listen(8000, () => {
    console.log("Server is running on port 8000");
});