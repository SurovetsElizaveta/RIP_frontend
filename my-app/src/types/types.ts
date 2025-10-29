export interface Route {
  RouteID: number;
  Title: string;
  Distance: number;
  Description: string;
  ImageURL?: string;
  Status: string;
  Delay?: number;
}

export interface SpeedRequest {
  SpeedRequestID: number;
  DepartureDate: string;
  CreationDate: string;
  FormationDate?: string;
  CompletionDate?: string;
  Status: string;
  CreatorLogin: string;
  ModeratorLogin?: string;
}

export interface User {
  UserID: number;
  Login: string;
  IsModerator: boolean;
}