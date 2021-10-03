import { Request, Response } from "express";
import { Feeling } from "../models/Feeling";
import { User } from "../models/User";

export const voteFeeling = async (req: Request, res: Response) => {
  const userUid = res.locals.user.uid;
  const feelingId = parseInt(req.params.feelingId);
  const movieId = parseInt(req.params.movieId);
  const backdropPath = req.params.backdropPath ?? "";

  try {
    const user = await User.findOne({
      uid: userUid,
      deleted: false,
    });

    if (!user) return res.status(404).json({ error: "User not founded" });

    const feeling = await Feeling.findOne({ id: feelingId });
    if (!feeling) return res.status(404).json({ error: "Feeling not found" });

    const movieExists = await Feeling.findOne({
      _id: feeling._id,
      movies: { $elemMatch: { movieId: movieId } },
    });

    if (movieExists) {
      await Feeling.findOneAndUpdate(
        { _id: feeling._id, movies: { $elemMatch: { movieId: movieId } } },
        {
          $inc: {
            "movies.$.votes": 1,
          },
        }
      );
    } else {
      const movie = {
        movieId,
        votes: 1,
        backdropPath,
      };

      await Feeling.findOneAndUpdate(
        { _id: feeling._id },
        {
          $push: { movies: movie },
        }
      );
    }

    res.status(204).send();
  } catch (err) {
    return res.status(500).json({
      error: err,
    });
  }
};

export const getFeeling = async (req: Request, res: Response) => {
  try {
    const feelings = await Feeling.find().select("_id id feeling emoji");
    if (!feelings) res.status(200).send([]);
    res.status(200).send(feelings);
  } catch (err) {
    return res.status(500).json({
      error: "Error, please try again",
    });
  }
};

export const saveFeeling = async (req: Request, res: Response) => {
  try {
    const { feeling, emoji } = req.body;

    if (!feeling) return res.status(422).send({ error: "feeling is required" });
    if (!emoji) return res.status(422).send({ error: "emoji is required" });

    const feelingExists = await Feeling.findOne({ feeling: feeling });

    if (feelingExists)
      return res.status(404).json({ error: "Feeling already exists" });

    const newFeeling = await Feeling.create({
      feeling,
      emoji,
    });

    return res.status(201).json(newFeeling);
  } catch (err) {
    return res.status(500).json({
      error: "Error, please try again",
    });
  }
};

export const updateFeeling = async (req: Request, res: Response) => {
  try {
    const feelingId = req.params.feelingId;
    const { feeling, emoji } = req.body;

    if (!feeling) return res.status(422).send({ error: "feeling is required" });
    if (!emoji) return res.status(422).send({ error: "emoji is required" });

    const feelingExists = await Feeling.findOne({ _id: feelingId });

    if (!feelingExists)
      return res.status(404).json({ error: "Feeling not exists" });

    feelingExists.feeling = feeling;
    feelingExists.emoji = emoji;
    feelingExists.save();
    return res.status(200).json(feelingExists);
  } catch (err) {
    return res.status(500).json({
      error: "Error, please try again",
    });
  }
};
