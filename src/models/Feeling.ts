import * as mongoose from "mongoose";
import { model, Schema } from "mongoose";
import { IFeeling } from "../types/Feeling";

const FeelingSchema = new Schema({
  movies: [
    {
      movieId: Number,
      votes: Number,
      backdropPath: String,
    },
  ],
  feeling: String,
  emoji: String,
});

export const Feeling = model<IFeeling>("Feeling", FeelingSchema);
