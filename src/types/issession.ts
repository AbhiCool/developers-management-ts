import { Session } from "express-session";

export interface ISession extends Session {
  userId?: number;
  isAdmin?: number;
}