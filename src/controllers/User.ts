import { Request, Response } from "express";
import { User } from "../models/User";
import admin from "firebase-admin";
import { IUser } from "../types/User";
import { Movie } from "../models/Movie";
import { Comment } from "../models/Comment";

export const getMyProfile = async (req: Request, res: Response) => {
  const userUid = res.locals.user.uid;

  try {
    const userId = await User.findOne({
      uid: userUid,
      deleted: false,
    });

    if (!userId) res.status(404).json({ error: "User not founded" });

    const userData = {
      _id: userId._id,
      uid: userId.uid,
      name: userId.name,
      email: userId.email,
      photoUrl: userId.photoUrl,
      followCount: userId.follow.length,
      followedCount: userId.followed.length,
    };

    res.status(200).json(userData);
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

export const saveStreamList = async (req: Request, res: Response) => {
  const userUid = res.locals.user.uid;
  const { streamList } = req.body;

  if (!streamList)
    return res.status(422).json({ error: "streamList is required" });

  try {
    const user = await User.findOne({ uid: userUid, deleted: false });
    if (!user) return res.status(404).json({ error: "User not found" });

    user.streaming = streamList;

    const userUpdate = await user.save();
    return res.status(200).json(userUpdate);
  } catch (err) {
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

export const getFollow = async (req: Request, res: Response) => {
  const userUid = res.locals.user.uid;

  try {
    const userData = await User.findOne({ uid: userUid, deleted: false })
      .populate("follow", "name photoUrl uid")
      .select("follow");

    if (!userData) return res.status(404).json({ error: "User not found" });

    res.status(200).send(userData);
  } catch (err) {
    return res.status(500).json({
      error: "Error, please try again",
    });
  }
};

export const getFollowed = async (req: Request, res: Response) => {
  const userUid = res.locals.user.uid;

  try {
    const userData = await User.findOne({ uid: userUid, deleted: false })
      .populate("followed", "name photoUrl uid")
      .select("followed");

    if (!userData) return res.status(404).json({ error: "User not found" });

    res.status(200).send(userData);
  } catch (err) {
    return res.status(500).json({
      error: "Error, please try again",
    });
  }
};

export const searchUser = async (req: Request, res: Response) => {
  const userUid = res.locals.user.uid;
  const search = req.query.query;
  let page = req.query.page;
  let pageSkip = page ? parseInt(page.toString()) : 1;
  pageSkip = (pageSkip - 1) * 20;

  if (!search) return res.status(404).json({ error: "search is required" });

  try {
    const user = await User.findOne({ uid: userUid, deleted: false });
    if (!user) return res.status(404).json({ error: "User not found" });

    const searchUser = await User.find({
      name: { $regex: new RegExp(`${search}`, "i") },
      uid: { $ne: userUid },
    })
      .select("uid name photoUrl")
      .skip(pageSkip)
      .limit(20);
    if (!searchUser) return res.status(404).json({ error: "No users founded" });
    return res.status(200).json({ users: searchUser });
  } catch (err) {
    return res.status(500).json({ error: "Error, please try again" });
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  const userUid = res.locals.user.uid;
  const userId = req.params.id;

  try {
    const user = await User.findOne({ uid: userUid, deleted: false });
    if (!user) return res.status(404).json({ error: "User not found" });

    const getUserProfile = await User.findOne({ uid: userId, deleted: false });
    if (!getUserProfile)
      return res.status(404).json({ error: "User not found" });

    const getUserWatchedMoviesCount = await Movie.find({
      uid: getUserProfile._id,
      watched: true,
    }).count();
    const getUserUnWatchedMoviesCount = await Movie.find({
      uid: getUserProfile._id,
      watched: false,
    }).count();

    const getLastWatchedMovies = await Movie.find({
      uid: getUserProfile._id,
      watched: true,
    }).limit(3);

    const getLastComments = await Comment.find({
      uid: getUserProfile._id,
      deleted: false,
    }).limit(10);

    const isFollowed = user.followed.includes(getUserProfile._id);

    const userProfile = {
      follow: getUserProfile.follow.length,
      followed: getUserProfile.followed.length,
      uid: getUserProfile.uid,
      name: getUserProfile.name,
      email: getUserProfile.email,
      photoUrl: getUserProfile.photoUrl,
      streaming: getUserProfile.streaming.length,
      watched: getUserWatchedMoviesCount,
      unwatched: getUserUnWatchedMoviesCount,
      lastwatched: getLastWatchedMovies,
      lastcomments: getLastComments,
      isfollowed: isFollowed,
    };

    return res.status(200).json({ userprofile: userProfile });
  } catch (err) {
    return res.status(500).json({ error: "Error, please try again" });
  }
};

export const getUserLastMovies = async (req: Request, res: Response) => {
  const userUid = res.locals.user.uid;
  const id = req.params.userId;

  try {
    const getUser = await User.findOne({ uid: userUid, deleted: false });
    if (!getUser) return res.status(404).json({ error: "User not found" });

    const userId = await User.findOne({ uid: id, deleted: false });
    if (!userId) return res.status(404).json({ error: "User not found" });

    const lastMovies = await Movie.find({
      uid: userId._id,
      watched: false,
    }).limit(3);
    if (!lastMovies)
      return res.status(404).json({ error: "Last Movies not found" });
    return res.status(200).json({ watched: lastMovies });
  } catch (err) {
    res.status(500).json({ error: "Error, please try again" });
  }
};

export const getUserLastComments = async (req: Request, res: Response) => {
  const userUid = res.locals.user.uid;
  const id = req.params.userId;

  try {
    const getUser = await User.findOne({ uid: userUid, deleted: false });
    if (!getUser) return res.status(404).json({ error: "User not found" });

    const userId = await User.findOne({ uid: id, deleted: false });
    if (!userId) return res.status(404).json({ error: "User not found" });

    const lastComments = await Comment.find({
      uid: userId.id,
      deleted: false,
    })
      .populate("uid")
      .limit(10);

    if (!lastComments) return res.status(404).json({ error: "No Comments" });
    return res.status(200).json({ comments: lastComments });
  } catch (err) {
    res.status(500).json({ error: "Error, please try again" });
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
      if (!userExists.deleted) {
        (userExists.name = user.name),
          (userExists.email = user.email),
          (userExists.photoUrl = user.photoUrl ?? ""),
          userExists.save();
        return res.status(200).send(userExists);
      }

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

    if (userExists.followed.includes(followedExists._id))
      return res.status(404).json({ error: "User followed" });

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

export const saveUserStreaming = async (req: Request, res: Response) => {
  const userId = res.locals.user.uid;
  const { streamings } = req.body;

  if (!streamings)
    return res.status(422).json({ error: "Stream list is required" });

  try {
    const userExists = await User.findOne({ uid: userId, deleted: false });
    if (!userExists) return res.status(404).json({ error: "User not found" });

    userExists.streaming = streamings;
    userExists.save();
    return res.status(200).json(userExists);
  } catch (err) {
    return res.status(500).json({
      error: "Error, please try again",
    });
  }
};
