import { Request, Response } from "express";
import { User } from "../models/User";
import admin from "firebase-admin";
import { IUser } from "../types/User";

export const getUserProfile = async (req: Request, res: Response) => {
  const userUid = res.locals.user.uid;

  try {
    const userId = await User.findOne({
      uid: userUid,
      deleted: false,
    }).populate("follow followed", "name photoUrl uid");

    if (!userId) res.status(404).json({ error: "User not founded" });

    res.status(200).json(userId);
  } catch (err) {
    res.status(404).json({ error: "User not found" });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  const userUid = res.locals.user.uid;
  const { name, email, photoUrl } = req.body;

  if (!name && !email && !photoUrl)
    return res
      .status(422)
      .json({ error: "Params name, email or photoUrl is required" });

  try {
    const userData = await User.findOne({ uid: userUid, deleted: false });
    if (!userData) return res.status(404).json({ error: "User not found" });

    userData.name = name ?? userData.name;
    userData.photoUrl = photoUrl ?? userData.photoUrl;
    userData.updatedAt = new Date();

    const userUpdate = await userData.save();
    return res.status(200).json(userUpdate);
  } catch (e) {
    return res.status(500).json({
      error: "Error, please try again",
    });
  }
};

export const deleteUserProfile = async (req: Request, res: Response) => {
  const userUid = res.locals.user.uid;

  try {
    const userData = await User.findOne({ uid: userUid, deleted: false });
    if (!userData) return res.status(404).json({ error: "User not found" });

    userData.deleted = true;

    await userData.save();
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({
      error: "Error, please try again",
    });
  }
};

export const saveUserProfile = async (req: Request, res: Response) => {
  const user: admin.auth.DecodedIdToken = res.locals.user;
  const userData: IUser = {
    uid: user.uid,
    name: user.name,
    email: user.email ?? "",
    photoUrl: user.photoUrl ?? "",
    follow: [],
    followed: [],
    streaming: [],
    deleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    const userExists = await User.findOne({ uid: user.uid });

    if (userExists) {
      if (!userExists.deleted)
        return res.status(409).send({ error: "User already exists" });

      userExists.deleted = false;
      await userExists.save();
      return res.status(200).send(userExists);
    } else {
      const newUser = await User.create(userData);
      res.status(201).json(newUser);
    }
  } catch (err) {
    return res.status(500).json({
      error: "Error, please try again",
    });
  }
};

export const followUser = async (req: Request, res: Response) => {
  //Id do usuário que será seguido
  const followedUserId = req.params.userId;
  const userId = res.locals.user.uid;

  try {
    //Verifica se o usuário que será seguido existe no banco
    const followedExists = await User.findOne({
      uid: followedUserId,
      deleted: false,
    });
    if (!followedExists)
      return res.status(404).json({ error: "Followed user not founded" });

    //Verifica se o usuário atual existe no banco
    const userExists = await User.findOne({ uid: userId, deleted: false });
    if (!userExists)
      return res.status(404).json({ error: "Follow user not founded" });

    //Salva o usuário atual como seguidor no usuário que foi seguido
    await User.updateOne(
      { _id: followedExists._id },
      {
        $push: {
          followed: userExists._id,
        },
      }
    );

    //Salva o usuário seguido como seguidos no usuário atual
    await User.updateOne(
      { _id: userExists._id },
      {
        $push: {
          follow: followedExists._id,
        },
      }
    );

    res.status(204).send();
  } catch (err) {
    return res.status(500).json({
      error: "Error, please try again",
    });
  }
};

export const unfollowUser = async (req: Request, res: Response) => {
  //Id do usuário que deixará de ser seguido
  const followedUserId = req.params.userId;
  const userId = res.locals.user.uid;

  try {
    //Verifica se o usuário que deixará de ser seguido existe no banco
    const followedExists = await User.findOne({
      uid: followedUserId,
      deleted: false,
    });
    if (!followedExists)
      return res.status(404).json({ error: "Followed user not founded" });

    //Verifica se o usuário atual existe no banco
    const userExists = await User.findOne({ uid: userId, deleted: false });
    if (!userExists)
      return res.status(404).json({ error: "Follow user not founded" });

    //Remove o usuário atual dos seguidores no usuário seguido
    await User.updateOne(
      { _id: followedExists._id },
      {
        $unset: {
          followed: userExists._id,
        },
      }
    );

    //Remove da listagem de seguidos do usuário atual
    await User.updateOne(
      { _id: userExists._id },
      {
        $unset: {
          follow: followedExists._id,
        },
      }
    );

    res.status(204).send();
  } catch (err) {
    return res.status(500).json({
      error: "Error, please try again",
    });
  }
};
