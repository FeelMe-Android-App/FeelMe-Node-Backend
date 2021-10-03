export interface IUser {
  uid: string;
  name: string;
  email: string;
  photoUrl: string;
  follow: string[];
  followed: string[];
  deleted: boolean;
  streaming?: number[];
  createdAt: Date;
  updatedAt: Date;
}
