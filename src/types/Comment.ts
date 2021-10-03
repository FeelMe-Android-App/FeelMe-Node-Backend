export interface IComment {
  uid: string;
  comment: string;
  movieId: number;
  backdropPath?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deleted: boolean;
}
