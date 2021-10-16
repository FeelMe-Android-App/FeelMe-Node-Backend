import * as express from "express";
import {
  createComment,
  deleteUserComment,
  editUserComment,
  getFriendsComments,
  getFriendsMovies,
  getMovieComments,
  getMyComments,
  getUserComments,
} from "./controllers/Comment";
import {
  getFeeling,
  saveFeeling,
  updateFeeling,
  voteFeeling,
} from "./controllers/Feeling";
import {
  getUnwatchedMovieList,
  getUserUnWatchedMovieList,
  getUserWatchedMovieList,
  getWatchedMovieList,
  movieDetails,
  removeMovieFromList,
  removeMovieFromListWatched,
  saveUnwatchedMovieToList,
  saveWatchedMovieToList,
} from "./controllers/Movie";
import {
  getUserProfile,
  saveUserProfile,
  updateUserProfile,
  deleteUserProfile,
  followUser,
  unfollowUser,
  getFollow,
  getFollowed,
  saveUserStreaming,
  saveStreamList,
} from "./controllers/User";
import firebaseAuth from "./middleware/auth";
const routes = express.Router();

routes.get("/myprofile", firebaseAuth, getUserProfile);
routes.patch("/myprofile", firebaseAuth, updateUserProfile);
routes.post("/myprofile/streaming", firebaseAuth, saveStreamList);
routes.delete("/myprofile", firebaseAuth, deleteUserProfile);
routes.get("/myprofile/follow", firebaseAuth, getFollow);
routes.get("/myprofile/followed", firebaseAuth, getFollowed);
routes.get("/myprofile/unwatchedmovies", firebaseAuth, getUnwatchedMovieList);
routes.get("/myprofile/watchedmovies", firebaseAuth, getWatchedMovieList);
routes.post("/user", firebaseAuth, saveUserProfile);
routes.post("/user/:userId/follow", firebaseAuth, followUser);
routes.post("/user/:userId/unfollow", firebaseAuth, unfollowUser);
routes.get("/user/friendsMovies", firebaseAuth, getFriendsMovies);
routes.get("/comment", firebaseAuth, getMyComments);
routes.get("/comment/:movieId", firebaseAuth, getMovieComments);
routes.get("/comment/:userId", firebaseAuth, getUserComments);
routes.get("/friendscomment", firebaseAuth, getFriendsComments);
routes.post("/comment/:movieId", firebaseAuth, createComment);
routes.delete("/comment/:commentId", firebaseAuth, deleteUserComment);
routes.put("/comment/:commentId", firebaseAuth, editUserComment);

routes.get(
  "/user/:userId/unwatchedmovies",
  firebaseAuth,
  getUserUnWatchedMovieList
);
routes.get("/user/:userId/watchedmovie", firebaseAuth, getUserWatchedMovieList);
routes.get("/movie/:movieId", firebaseAuth, movieDetails);
routes.post("/movie/:movieId/add", firebaseAuth, saveUnwatchedMovieToList);
routes.post("/movie/:movieId/watched", firebaseAuth, saveWatchedMovieToList);
routes.delete(
  "/movie/:movieId/watched",
  firebaseAuth,
  removeMovieFromListWatched
);
routes.delete("/movie/:movieId", firebaseAuth, removeMovieFromList);

routes.post("/feeling/:feelingId/:movieId/vote", firebaseAuth, voteFeeling);
routes.get("/feeling", getFeeling);
routes.post("/feeling", saveFeeling);
routes.put("/feeling/:feelingId", updateFeeling);

routes.post("/user/streamings", firebaseAuth, saveUserStreaming);

export default routes;
