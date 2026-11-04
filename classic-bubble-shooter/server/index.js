import express, { json } from "express";

import databaseConnection from "./database.js";
import bodyParser from "body-parser";
import user from "./routes/userRoute.js";

// databasee    
databaseConnection();

const app= express();

app.use(bodyParser.json());


app.get("/",(req,res)=>{
    res.send("Welcome to bubble shooter game");
});

app.listen(8000,()=>{
    console.log("Server is running on port 8000");
});

app.use("/signup",user);