import { userBaseRouter } from "./base";
import { userRoomRouter } from "./room";

export const userRouter = {
  ...userBaseRouter,
  ...userRoomRouter,
};
