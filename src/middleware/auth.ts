import admin from "firebase-admin";
import { Request, Response, NextFunction } from "express";
import firebaseApp from "../config/firebase";

const firebaseAuth = (req: Request, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).send("No token provided");

  const parts = auth.split(" ");
  if (parts.length !== 2) return res.status(401).send("Invalid header");

  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme))
    return res.status(401).send("Token malformated");

  admin
    .auth(firebaseApp)
    .verifyIdToken(token)
    .then((decodedToken) => {
      res.locals.user = decodedToken;
      next();
    })
    .catch((error) => {
      res.status(401).send(error);
    });
};

export default firebaseAuth;
