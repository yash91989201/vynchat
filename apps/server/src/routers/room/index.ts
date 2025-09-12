import { roomBaseRouter } from "./base";
import { roomChatRouter } from "./chat";

type RoomRouter = typeof roomBaseRouter & typeof roomChatRouter;

export const roomRouter: RoomRouter = {
  ...roomBaseRouter,
  ...roomChatRouter,
};
