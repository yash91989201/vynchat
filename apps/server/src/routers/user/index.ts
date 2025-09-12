import { userBaseRouter } from "./base";
import { userFollowingRouter } from "./following";
import { userRoomRouter } from "./room";

export const userRouter = {
  ...userBaseRouter,
  ...userRoomRouter,
  ...userFollowingRouter,
};
