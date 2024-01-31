import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { config } from "dotenv";

import HttpError from "../models/http-error.js";
import User from "../models/users-model.js";
import Task from "../models/tasks-model.js";

config();

const salt = 10;

async function getUsers(req, res, next) {
  try {
    const result = await User.find({}, "-password");
    console.log(result);
    res.json(result);
  } catch (err) {
    next(new HttpError("Could not retrieve users", 500));
  }
}

async function getUserById(req, res, next) {
  const { userId } = req.params;

  let user;
  try {
    user = await User.findOne({ _id: userId }, "-password");
  } catch (err) {
    return next(
      new HttpError("Something went wrong, could not find user.", 500)
    );
  }

  if (!user) return next(new HttpError("Could not find this user", 404));

  res.json({ user: user });
}

async function signUpUser(req, res, next) {
  const { name, email, password } = req.body;

  let user;
  try {
    user = await User.findOne({ email: email });
  } catch (err) {
    next(new HttpError("Creating user failed", 500));
  }

  if (user) return next(new HttpError("User already created", 400));

  const hash = bcrypt.hashSync(password, salt);

  const newUser = new User({
    name,
    email,
    password: hash,
    tasks: [],
  });

  try {
    const result = await newUser.save();

    const token = jwt.sign({ userId: newUser.id }, process.env.privateKey);

    res.status(201).json({
      message: "User created",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        tasks: newUser.tasks,
      },
      token: token,
    });
  } catch (err) {
    console.log(err);
    next(new HttpError("Creating user failed", 500));
  }
}

async function loginUser(req, res, next) {
  const { email, password } = req.body;
  console.log(req.body);

  let user;
  try {
    user = await User.findOne({ email: email });
  } catch (err) {
    next(new HttpError("Could not login, try again later", 500));
  }
  console.log("user", user);

  if (!user) return next(new HttpError("Invalid credentials", 400));

  const match = await bcrypt.compare(password, user.password);

  if (!match) return next(new HttpError("Invalid credentials", 400));

  const token = jwt.sign({ userId: user.id }, process.env.privateKey);

  res.json({
    message: "User logged in",
    token: token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      tasks: user.tasks,
    },
  });
}

async function deleteUser(req, res, next) {
  const { userId } = req.params;

  let user;
  try {
    user = await User.findById(userId).populate("tasks");
  } catch (err) {
    console.log(err);
    return next(new HttpError("Could not delete user, try again later", 500));
  }

  if (!user) return next(new HttpError("User Id not found", 400));

  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    await user.deleteOne({ session: session });
    user.tasks.map(async (task) => await Task.findByIdAndDelete(task._id));

    await session.commitTransaction();

    res.json({ message: "The user and all related places were deleted." });
  } catch (err) {
    console.log(err);
    return next(new HttpError("Could not delete user, try again later", 500));
  }
}

async function updateUser(req, res, next) {
  const { userId } = req.params;

  const { name, email, newPassword, confirmPassword } = req.body;

  let user;
  try {
    user = await User.findOne({ _id: userId });
  } catch (err) {
    console.log(err);
    return next(new HttpError("Something went wrong. Try again later", 500));
  }

  if (!user) return next(new HttpError("Could not find user", 500));

  const match = await bcrypt.compare(confirmPassword, user.password);

  if (!match) return next(new HttpError("Invalid password", 401));

  let result;
  try {
    if (newPassword.length > 0) {
      const hash = bcrypt.hashSync(newPassword, salt);

      result = await User.findByIdAndUpdate(user._id, {
        name,
        email,
        password: hash,
      });
    } else {
      result = await User.findByIdAndUpdate(user._id, {
        name,
        email,
      });
    }
    console.log(result);
  } catch (err) {
    console.log(err);
    return next(
      new HttpError("Could not update user data. Try again later.", 500)
    );
  }

  res.json({
    message: "user data updated successfully",
    user: { name: user.name, email: user.email, id: user._id },
  });
}

export { getUsers, signUpUser, loginUser, deleteUser, getUserById, updateUser };
