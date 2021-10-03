export interface IFeeling {
  movies?: [
    {
      movieId: number;
      votes: number;
      backdropPath: string;
    }
  ];
  feeling: string;
  emoji: string;
}
