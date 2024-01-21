import HttpError from "../models/http-error.js";
import User from "../models/users-model.js";

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { config } from "dotenv";

config();

async function getUsers(req, res, next) {
  try {
    const result = await User.find({}, "-password");
    console.log(result);
    res.json(result);
  } catch (err) {
    next(new HttpError("Could not retrieve users", 500));
  }
}

async function signUpUser(req, res, next) {
  const { name, email, password } = req.body;

  let user;
  try {
    user = await User.find({ email: email });
  } catch (err) {
    next(new HttpError("Creating user failed", 500));
  }
  console.log(user);
  if (user.length > 0) return next(new HttpError("User already created", 400));

  const hash = bcrypt.hashSync(password, 10);

  const newUser = new User({
    name,
    email,
    password: hash,
    tasks: [],
  });

  try {
    const result = await newUser.save();

    const token = jwt.sign({ userId: newUser.id }, process.env.privateKey);

    res
      .status(201)
      .json({ message: "User created" }, { user: newUser }, { token: token });
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

  const match = bcrypt.compareSync(password, user.password);

  if (!match) return next(new HttpError("Invalid credentials", 400));

  const token = jwt.sign({ userId: newUser.id }, process.env.privateKey);

  res.json({ message: "User logged in" }, { token: token });
}

export { getUsers, signUpUser, loginUser };
