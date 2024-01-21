import express from "express";
import * as tasksController from "../controllers/tasks-controllers.js";

const router = express.Router();

// RETURN A LIST OF ALL USERS
router.get("/", (req, res) => {
  res.json("Tasks routes works");
});

export default router;
