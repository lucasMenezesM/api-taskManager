import express from "express";

import * as usersController from "../controllers/users-controllers.js";
import requireAuth from "../authentication/passport-config.js";

const router = express.Router();

//GET A LIST OF USERS
router.get("/", usersController.getUsers);

//SIGN UP A USER
router.post("/signup", usersController.signUpUser);

//LOGIN A USER
router.post("/login", usersController.loginUser);

// GETTING A USER BY ID
router.get("/:userId", usersController.getUserById);

//DELETING A USER
router.delete("/:userId", requireAuth, usersController.deleteUser);

//Updating user information
router.patch("/:userId", requireAuth, usersController.updateUser);

export default router;
