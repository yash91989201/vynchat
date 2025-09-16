import { roomAdminRouter } from "./admin";
import { roomBaseRouter } from "./base";
import { roomChatRouter } from "./chat";

type RoomRouter = typeof roomBaseRouter &
  typeof roomChatRouter &
  typeof roomAdminRouter;

export const roomRouter: RoomRouter = {
  ...roomBaseRouter,
  ...roomChatRouter,
  ...roomAdminRouter,
};
