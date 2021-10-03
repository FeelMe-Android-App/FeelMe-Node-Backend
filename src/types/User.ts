export interface IUser {
  uid: string;
  name: string;
  email: string;
  photoUrl: string;
  follow: string[];
  followCount?: number;
  followed: string[];
  followedCount?: number;
  deleted: boolean;
  streaming?: number[];
  createdAt: Date;
  updatedAt: Date;
}
