import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import routes from "./routes";
const app = express();
require("dotenv").config();

const port = process.env.PORT || 3000;

mongoose.connect(process.env.BD as string);
app.use(cors());
app.use(express.json());
app.use(routes);

app.get("/", (req, res) => {
  res.send("App is runing");
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
