import * as mongoose from "mongoose";
import { IComment } from "../types/Comment";
import { model, Schema } from "mongoose";

const CommentSchema = new Schema({
  uid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  comment: String,
  movieId: Number,
  backdropPath: String,
  createdAt: Date,
  updatedAt: Date,
  deleted: Boolean,
});

export const Comment = model<IComment>("Comment", CommentSchema);
