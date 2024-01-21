import express from "express";
import * as tasksController from "../controllers/tasks-controllers.js";
import requireAuth from "../authentication/passport-config.js";

// const app = express()
const router = express.Router();

//CREATE A NEW TASK - Require Authentication
router.post("/", requireAuth, tasksController.createTask);

//DELETE A TASK - Require Authentication
router.delete("/:taskId", requireAuth, tasksController.deleteTask);

// RETURN A LIST OF ALL USER'S PLACES
router.get("/:userId", tasksController.getTasksByUserId);

// UPDATE A TASK - Require Authentication
router.patch("/:taskId", requireAuth, tasksController.updateTask);

export default router;
