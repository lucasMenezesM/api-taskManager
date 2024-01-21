import express from "express";
import morgan from "morgan";
import { config } from "dotenv";
import mongoose from "mongoose";

import taskRoutes from "./routes/tasks-routes.js";
import usersRoutes from "./routes/users-routes.js";
import HttpError from "./models/http-error.js";

config();

const port = 5000;

const app = express();
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/tasks", taskRoutes);
app.use("/api/users", usersRoutes);

app.use((req, res) => {
  throw new HttpError("Could not find this route", 404);
});

app.use((error, req, res, next) => {
  if (res.headerSent) return next(error);

  res
    .status(error.code || 500)
    .json({ message: error.message || "An unknown error has occurred" });
});

app.get("/", (req, res) => {
  res.json({ message: "works" });
});

mongoose
  .connect(process.env.DB_CONNECTION)
  .then(() => {
    console.log("DataBase connected");
    app.listen(port, () => {
      console.log("server running on port " + port);
    });
  })
  .catch((err) => console.log(err));
