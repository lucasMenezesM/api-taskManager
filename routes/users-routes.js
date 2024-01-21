import express from "express";
import * as usersController from "../controllers/users-controllers.js";

const router = express.Router();

//GET A LIST OF USERS
router.get("/", usersController.getUsers);

//SIGN UP A USER
router.post("/signup", usersController.signUpUser);

//LOGIN A USER
router.post("/login", usersController.loginUser);

//DELETING A USER
router.delete("/:userId", usersController.deleteUser);

export default router;
