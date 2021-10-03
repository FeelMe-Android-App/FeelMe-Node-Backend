import * as mongoose from "mongoose";
import { model, Schema } from "mongoose";
import { IUser } from "../types/User";

const UserSchema = new Schema({
  uid: String,
  name: String,
  email: String,
  photoUrl: String,
  follow: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  followed: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  deleted: Boolean,
  createdAt: Date,
  updatedAt: Date,
  streaming: [],
});

export const User = model<IUser>("User", UserSchema);
