

import express, { json } from "express";

import databaseConnection from "../database.js";
import { createUser } from "../controller/userController.js";
const userRoute = express.Router();

userRoute.post("/users", createUser);

export default userRoute;