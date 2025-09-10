import { eventIterator } from "@orpc/server";
import { protectedProcedure } from "@/lib/orpc";
import {
  newMessagePublisher,
  roomMemberJoinedPublisher,
  roomMemberLeftPublisher,
} from "@/lib/publishers";
import {
  OnNewMessageInput,
  OnNewMessageOutput,
  OnRoomJoinInput,
  OnRoomJoinOutput,
  OnRoomLeaveInput,
  OnRoomLeaveOutput,
} from "@/lib/schemas";

export const sseRouter = {
  onNewMessage: protectedProcedure
    .input(OnNewMessageInput)
    .output(eventIterator(OnNewMessageOutput))
    .handler(async function* ({ signal }) {
      for await (const payload of newMessagePublisher.subscribe("new-message", {
        signal,
      })) {
        yield payload;
      }
    }),

  onRoomJoin: protectedProcedure
    .input(OnRoomJoinInput)
    .output(eventIterator(OnRoomJoinOutput))
    .handler(async function* ({ signal }) {
      for await (const payload of roomMemberJoinedPublisher.subscribe(
        "user-joined",
        { signal }
      )) {
        yield payload;
      }
    }),

  onRoomLeave: protectedProcedure
    .input(OnRoomLeaveInput)
    .output(eventIterator(OnRoomLeaveOutput))
    .handler(async function* ({ signal }) {
      for await (const payload of roomMemberLeftPublisher.subscribe(
        "user-left",
        {
          signal,
        }
      )) {
        yield payload;
      }
    }),
};
