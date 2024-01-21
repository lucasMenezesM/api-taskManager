import HttpError from "../models/http-error.js";
import User from "../models/users-model.js";
import Task from "../models/tasks-model.js";
import mongoose from "mongoose";

// GETTING ALL TASKS BY USER ID
async function getTasksByUserId(req, res, next) {
  const { userId } = req.params;
  console.log("params", req.params);
  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    next(new HttpError("Could not retrieve tasks, try again later", 500));
  }

  if (!user) return next(new HttpError("User Id not found", 400));

  try {
    const tasks = await Task.find({ user_id: userId });
    res.json({ tasks: tasks });
  } catch (err) {
    next(new HttpError("Could not retrieve tasks, try again later", 500));
  }
}

//*todo INCLUDE TASK CREATED IN THE TASK LIST OF THE USER
// CREATING NEW TASK
async function createTask(req, res, next) {
  const { name, description, user_id } = req.body;

  let user;
  try {
    user = await User.findById(user_id);
  } catch (err) {
    next(new HttpError("Could not create this task, try again later", 500));
  }

  if (!user) return next(new HttpError("User Id not found", 400));

  const newTask = new Task({
    name,
    description,
    creation_date: new Date(),
    user_id,
    completed: false,
  });

  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    await newTask.save({ session: session });
    user.tasks.push(newTask);
    await user.save({ session: session });

    await session.commitTransaction();

    res.status(201).json({ message: "task created", task: newTask });
  } catch (err) {
    console.log(err);
    return next(
      new HttpError("Could not create this task, try again later", 500)
    );
  }
}

async function updateTask(req, res, next) {
  const { taskId } = req.params;
  const { name, description } = req.body;

  try {
    const result = await Task.findByIdAndUpdate(taskId, {
      name: name,
      description: description,
    });

    if (!result) return next(new HttpError("Taks Id not found", 404));

    res.json({ message: "Place updated" });
  } catch (err) {
    console.log(err);
    return next(
      new HttpError("Could not update this task, try again later", 500)
    );
  }
}

async function deleteTask(req, res, next) {
  const { taskId } = req.params;

  let deletedTask;
  try {
    deletedTask = await Task.findById(taskId).populate("user_id");
  } catch (err) {
    console.log(err);
    return next(
      new HttpError("Could not delete this task, try again later", 500)
    );
  }

  if (!deletedTask)
    return next(new HttpError("Could not delete. Task not found", 404));

  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    await deletedTask.deleteOne({ session: session });
    deletedTask.user_id.tasks.pull(deletedTask);
    await deletedTask.user_id.save({ session: session });

    await session.commitTransaction();

    res.json({ message: "Task deleted" });
  } catch (err) {
    console.log(err);
    return next(
      new HttpError("Could not delete this task, try again later", 500)
    );
  }
}

export { getTasksByUserId, createTask, updateTask, deleteTask };
