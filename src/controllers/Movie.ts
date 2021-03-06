import { Request, Response } from "express";
import { User } from "../models/User";
import { Movie } from "../models/Movie";
import { IMovie } from "../types/Movie";
import { Comment } from "../models/Comment";

export const getUnwatchedMovieList = async (req: Request, res: Response) => {
  const userUid = res.locals.user.uid;
  let page = req.query.page;
  let pageSkip = page ? parseInt(page.toString()) : 1;
  pageSkip = (pageSkip - 1) * 20;

  try {
    const user = await User.findOne({ uid: userUid, deleted: false });
    if (!user) return res.status(404).json({ error: "User not founded" });

    const movieList = await Movie.find({ uid: user._id, watched: false })
      .sort({ updatedAt: -1 })
      .select("id title backdropPath")
      .skip(pageSkip)
      .limit(20);
    if (!movieList || movieList.length === 0)
      return res.status(422).json({ error: "No more itens to show" });
    return res.status(200).json({ unwatched: movieList });
  } catch (err) {
    res.status(404).json({ error: "Error, please try again" });
  }
};

export const getWatchedMovieList = async (req: Request, res: Response) => {
  const userUid = res.locals.user.uid;
  let page = req.query.page;
  let pageSkip = page ? parseInt(page.toString()) : 1;
  pageSkip = (pageSkip - 1) * 20;

  try {
    const user = await User.findOne({ uid: userUid, deleted: false });
    if (!user) return res.status(404).json({ error: "User not founded" });

    const movieList = await Movie.find({ uid: user._id, watched: true })
      .sort({ updatedAt: -1 })
      .select("id title backdropPath")
      .skip(pageSkip)
      .limit(20);
    if (!movieList || movieList.length === 0)
      return res.status(422).json({ error: "No more itens to show" });
    return res.status(200).json({ watched: movieList });
  } catch (err) {
    res.status(404).json({ error: "Error, please try again" });
  }
};

export const getUserUnWatchedMovieList = async (
  req: Request,
  res: Response
) => {
  const userUid = res.locals.user.uid;
  const userProfileId = req.params.userId;
  let page = req.query.page;
  let pageSkip = page ? parseInt(page.toString()) : 1;
  pageSkip = (pageSkip - 1) * 20;

  try {
    const user = await User.findOne({ uid: userUid, deleted: false });
    if (!user) return res.status(404).json({ error: "User not founded" });

    const userData = await User.findOne({
      uid: userProfileId,
      followed: { $in: user._id },
      deleted: false,
    });
    if (!userData) return res.status(404).json({ error: "User not founded" });

    const movieList = await Movie.find({ uid: user._id, watched: false })
      .sort({ updatedAt: -1 })
      .select("id title backdropPath")
      .skip(pageSkip)
      .limit(20);
    if (!movieList || movieList.length === 0)
      return res.status(422).json({ error: "No more itens to show" });
    return res.status(200).json(movieList);
  } catch (err) {
    res.status(404).json({ error: "Error, please try again" });
  }
};

export const getUserWatchedMovieList = async (req: Request, res: Response) => {
  const userUid = res.locals.user.uid;
  const userProfileId = req.params.userId;
  let page = req.query.page;
  let pageSkip = page ? parseInt(page.toString()) : 1;
  pageSkip = (pageSkip - 1) * 20;

  try {
    const user = await User.findOne({
      uid: userUid,
      followed: { $in: userUid },
      deleted: false,
    });
    if (!user) return res.status(404).json({ error: "User not founded" });

    const userData = await User.findOne({ uid: user._id, deleted: false });
    if (!userData) return res.status(404).json({ error: "User not founded" });

    const movieList = await Movie.find({ uid: user._id, watched: true })
      .sort({ updatedAt: -1 })
      .select("id title backdropPath")
      .skip(pageSkip)
      .limit(20);
    if (!movieList || movieList.length === 0)
      return res.status(422).json({ error: "No more itens to show" });
    return res.status(200).json({ watched: movieList });
  } catch (err) {
    res.status(404).json({ error: "Error, please try again" });
  }
};

export const saveUnwatchedMovieToList = async (req: Request, res: Response) => {
  const userUid = res.locals.user.uid;
  const movieId = req.params.movieId;
  const { backdropPath, title } = req.body;

  if (!backdropPath)
    return res.status(422).json({ error: "backdropPath param is required" });
  if (!title) return res.status(422).json({ error: "title param is required" });

  try {
    const user = await User.findOne({ uid: userUid, deleted: false });
    if (!user) return res.status(404).json({ error: "User not founded" });

    const movieDetails = await Movie.findOne({ id: movieId, uid: user.id });
    if (movieDetails)
      return res.status(404).json({ error: "Movie already exists" });

    const newMovie: IMovie = {
      uid: user._id,
      id: movieId,
      title,
      backdropPath,
      createdAt: new Date(),
      updatedAt: new Date(),
      watched: false,
    };

    const saveMovie = await Movie.create(newMovie);
    return res.status(201).json({ unwatched: saveMovie });
  } catch (err) {
    res.status(404).json({ error: "Error, please try again" });
  }
};

export const saveWatchedMovieToList = async (req: Request, res: Response) => {
  const userUid = res.locals.user.uid;
  const movieId = req.params.movieId;
  const backdropPath = req.body.backdropPath ?? "";
  const title = req.body.title ?? "";

  try {
    const user = await User.findOne({ uid: userUid, deleted: false });
    if (!user) return res.status(404).json({ error: "User not founded" });
    const movieDetails = await Movie.findOne({ id: movieId, uid: user.id });
    if (movieDetails) {
      movieDetails.watched = true;
      movieDetails.save();
      return res.status(200).json(movieDetails);
    }

    const newMovie: IMovie = {
      uid: user._id,
      id: movieId,
      title,
      backdropPath,
      createdAt: new Date(),
      updatedAt: new Date(),
      watched: true,
    };

    const saveMovie = await Movie.create(newMovie);
    return res.status(201).json(saveMovie);
  } catch (err) {
    res.status(404).json({ error: "Error, please try again" });
  }
};

export const removeMovieFromListWatched = async (
  req: Request,
  res: Response
) => {
  const userUid = res.locals.user.uid;
  const movieId = req.params.movieId;

  try {
    const user = await User.findOne({ uid: userUid, deleted: false });
    if (!user) return res.status(404).json({ error: "User not founded" });

    const movieDetails = await Movie.findOne({ id: movieId, uid: user.id });
    if (!movieDetails)
      return res.status(404).json({ error: "Movie not founded" });

    movieDetails.watched = false;
    const updatedMovie = movieDetails.update();
    return res.status(200).send(updatedMovie);
  } catch (err) {
    res.status(404).json({ error: "Error, please try again" });
  }
};

export const removeMovieFromList = async (req: Request, res: Response) => {
  const userUid = res.locals.user.uid;
  const movieId = req.params.movieId;

  try {
    const user = await User.findOne({ uid: userUid, deleted: false });
    if (!user) return res.status(404).json({ error: "User not founded" });

    const movieDetails = await Movie.findOne({ id: movieId, uid: user.id });
    if (!movieDetails)
      return res.status(404).json({ error: "Movie not founded" });

    movieDetails.remove();
    return res.status(204).send();
  } catch (err) {
    res.status(404).json({ error: "Error, please try again" });
  }
};

export const movieDetails = async (req: Request, res: Response) => {
  const userUid = res.locals.user.uid;
  const movieId = req.params.movieId;

  try {
    const user = await User.findOne({ uid: userUid, deleted: false });
    if (!user) return res.status(404).json({ error: "User not founded" });

    const movieDetails = await Movie.findOne({ id: movieId, uid: user.id });
    if (!movieDetails) return res.json({ movieStatus: "" });
    return movieDetails.watched
      ? res.json({ movieDetails: "watched" })
      : res.json({ movieDetails: "saved" });
  } catch (err) {
    res.status(404).json({ error: "Error, please try again" });
  }
};

export const getFriendsMovies = async (req: Request, res: Response) => {
  const userUid = res.locals.user.uid;
  try {
    const user = await User.findOne({ uid: userUid, deleted: false });
    if (!user) return res.status(404).json({ error: userUid });
    if (user.follow.length === 0)
      return res.status(422).json({ error: "No friends" });
    const lastFriendsMovie = await Movie.find({ uid: { $in: user.follow } })
      .populate("uid", "uid name photoUrl")
      .sort({ updatedAt: -1 })
      .skip(0)
      .limit(20);
    if (!lastFriendsMovie)
      return res.status(404).json({ error: "No friends activity" });
    res.status(200).json({ friendsMovies: lastFriendsMovie });
  } catch (err) {
    res.status(404).json({ error: "Error, please try again" });
  }
};
