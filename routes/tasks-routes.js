import express from "express";
import * as tasksController from "../controllers/tasks-controllers.js";

// const app = express()
const router = express.Router();

//CREATE A NEW TASK
router.post("/", tasksController.createTask);

//DELETE A TASK
router.delete("/:taskId", tasksController.deleteTask);

// RETURN A LIST OF ALL USER'S PLACES
router.get("/:userId", tasksController.getTasksByUserId);

// UPDATE A TASK
router.patch("/:taskId", tasksController.updateTask);

export default router;
