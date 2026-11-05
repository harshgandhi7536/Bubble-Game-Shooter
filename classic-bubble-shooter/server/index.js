
// // index.js

// import express from "express";
// import cors from "cors";
// import databaseConnection from "./database.js";
// import user from "./routes/userRoute.js";

// const app = express();

// // Database connection
// databaseConnection();

// // Middleware
// app.use(cors({
//     origin: "http://localhost:5173",
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type"]
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

// // Start server LAST
// app.listen(8000, () => {
//     console.log("Server is running on port 8000");
// });




import express from "express";
import cors from "cors";
import databaseConnection from "./database.js";
import user from "./routes/userRoute.js";

const app = express();

databaseConnection();

app.use(cors({
    origin: "http://localhost:5173"
}));

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Welcome to bubble shooter game");
});

app.get("/test", (req, res) => {
    res.send("Backend is working!");
});

app.use("/signup", user);

app.listen(8000, () => {
    console.log("Server is running on port 8000");
});