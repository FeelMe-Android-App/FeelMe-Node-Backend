export interface IMovie {
  uid: string;
  id: string;
  title: string;
  backdropPath?: string;
  watched: boolean;
  createdAt: Date;
  updatedAt: Date;
}
