import { Request, Response } from "express";
import { Comment } from "../models/Comment";
import { User } from "../models/User";
import { IComment } from "../types/Comment";
const ObjectId = require("mongoose").Types.ObjectId;

export const getMyComments = async (req: Request, res: Response) => {
  const userUid = res.locals.user.uid;
  let page = req.query.page;
  let pageSkip = page ? parseInt(page.toString()) : 1;
  pageSkip = (pageSkip - 1) * 20;

  try {
    const user = await User.findOne({
      uid: userUid,
      deleted: false,
    });

    if (!user) return res.status(404).json({ error: "User not founded" });

    const comments = await Comment.find({
      uid: user._id,
      deleted: false,
    })
      .skip(pageSkip)
      .limit(20);
    if (!comments || comments.length === 0)
      return res.status(404).json({ error: "No comments founded" });

    return res.status(200).json({ comments: comments });
  } catch (err) {
    res.status(404).json({ error: "Error, please try again" });
  }
};

export const getMovieComments = async (req: Request, res: Response) => {
  const userUid = res.locals.user.uid;
  let page = req.query.page;
  let pageSkip = page ? parseInt(page.toString()) : 1;
  pageSkip = (pageSkip - 1) * 20;

  try {
    const user = await User.findOne({ uid: userUid, deleted: false });
    if (!user) return res.status(404).json({ error: "User not founded" });

    const userFriends = user.followed;
    if (!userFriends || userFriends.length === 0)
      return res.status(404).json({ error: "User do not have friends" });

    const comments = await Comment.find({
      uid: { $in: userFriends },
      deleted: false,
    })
      .skip(pageSkip)
      .limit(20);

    if (!comments || comments.length === 0)
      return res.status(422).json({ error: "No more itens to show" });
    return res.status(200).json({ comments: comments });
  } catch (err) {
    res.status(404).json({ error: "Error, please try again" });
  }
};

export const getUserComments = async (req: Request, res: Response) => {
  const userUid = res.locals.user.uid;
  const userProfile = req.params.userId;
  let page = req.query.page;
  let pageSkip = page ? parseInt(page.toString()) : 1;
  pageSkip = (pageSkip - 1) * 20;

  try {
    const user = await User.findOne({ uid: userUid, deleted: false });
    if (!user) return res.status(404).json({ error: "User not founded" });

    const userProfileData = await User.findOne({
      uid: userProfile,
      deleted: false,
      followed: { $in: userUid },
    });
    if (!userProfileData)
      res.status(404).json({ error: "User profile not founded" });

    const comments = await Comment.find({ uid: userProfile })
      .skip(pageSkip)
      .limit(20);
    if (!comments || comments.length === 0)
      return res.status(422).json({ error: "No more itens to show" });
    res.status(200).json({ comments: comments });
  } catch (err) {
    res.status(404).json({ error: "Error, please try again" });
  }
};

export const getFriendsComments = async (req: Request, res: Response) => {
  const userUid = res.locals.user.uid;
  let page = req.query.page;
  let pageSkip = page ? parseInt(page.toString()) : 1;
  pageSkip = (pageSkip - 1) * 20;

  try {
    const user = await User.findOne({ uid: userUid, deleted: false });
    if (!user) return res.status(404).json({ error: "User not founded" });

    const friendsComments = await Comment.find({ uid: { $in: user.follow } })
      .skip(pageSkip)
      .limit(20);
    if (!friendsComments || friendsComments.length === 0)
      return res.status(422).json({ error: "No more itens to show" });
    res.status(200).json({ comments: friendsComments });
  } catch (err) {
    res.status(404).json({ error: "Error, please try again" });
  }
};

export const createComment = async (req: Request, res: Response) => {
  const userUid = res.locals.user.uid;
  const movieId = parseInt(req.params.movieId);
  const { comment, backdropPath } = req.body;

  if (!comment)
    return res.status(422).json({ error: "Param comment is required" });
  if (!backdropPath)
    return res.status(422).json({ error: "Param backdropPath is required" });

  try {
    const user = await User.findOne({ uid: userUid, deleted: false });
    if (!user) return res.status(404).json({ error: "User not founded" });

    const commentData: IComment = {
      uid: user._id,
      comment,
      movieId,
      backdropPath,
      createdAt: new Date(),
      updatedAt: new Date(),
      deleted: false,
    };

    const commentResult = await Comment.create(commentData);
    return res.status(201).json({ comments: commentResult });
  } catch (err) {
    res.status(404).json({ error: err });
  }
};

export const deleteUserComment = async (req: Request, res: Response) => {
  const userUid = res.locals.user.uid;
  const commentId = req.params.commentId;

  try {
    const user = await User.findOne({ uid: userUid, deleted: false });
    if (!user) return res.status(404).json({ error: "User not founded" });

    const comment = await Comment.findOne({ uid: userUid, _id: commentId });
    if (!comment) return res.status(404).json({ error: "Comment not founded" });

    comment.delete();
    return res.status(204).send();
  } catch (err) {
    res.status(404).json({ error: "Error, please try again" });
  }
};

export const editUserComment = async (req: Request, res: Response) => {
  const userUid = res.locals.user.uid;
  const commentId = req.params.commentId;
  const comment = req.body.comment;

  if (!comment)
    return res.status(422).json({ error: "Comment param is required" });

  try {
    const user = await User.findOne({ uid: userUid, deleted: false });
    if (!user) return res.status(404).json({ error: "User not founded" });

    const commentData = await Comment.findOne({ uid: userUid, _id: commentId });
    if (!commentData)
      return res.status(404).json({ error: "Comment not founded" });

    commentData.comment = comment;

    comment.save();
    return res.status(200).json(commentData);
  } catch (err) {
    res.status(404).json({ error: "Error, please try again" });
  }
};
