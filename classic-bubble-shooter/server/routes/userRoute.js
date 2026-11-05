

// import express, { json } from "express";

// import databaseConnection from "../database.js";
// import { createUser } from "../controller/userController.js";
// const userRoute = express.Router();

// userRoute.post("/users", createUser);

// export default userRoute;




// routes/userRoute.js

// import express from "express";
// import { createUser } from "../controller/userController.js";

// const userRoute = express.Router();

// userRoute.post("/users", createUser);

// // Login API
// userRoute.post("/login", loginUser);    

// export default userRoute;



import express from "express";

import {
    createUser,
    loginUser
} from "../controller/userController.js";

const userRoute = express.Router();

// Registration API
userRoute.post("/users", createUser);

// Login API
userRoute.post("/login", loginUser);

export default userRoute;

