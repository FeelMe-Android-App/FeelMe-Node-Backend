import * as mongoose from "mongoose";
import { IMovie } from "../types/Movie";
import { model, Schema } from "mongoose";

const MovieSchema = new Schema({
  uid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  id: String,
  title: String,
  backdropPath: String,
  createdAt: Date,
  updatedAt: Date,
  watched: Boolean,
});

export const Movie = model<IMovie>("Movie", MovieSchema);
