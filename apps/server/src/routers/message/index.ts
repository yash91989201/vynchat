import { message } from "@/db/schema";
import { protectedProcedure } from "@/lib/orpc";
import { SendMessageInput, SendMessageOutput } from "@/lib/schemas";
import { supabase } from "@/lib/supabase";

export const messageRouter = {
  send: protectedProcedure
    .input(SendMessageInput)
    .output(SendMessageOutput)
    .handler(async ({ context, input }) => {
      const userId = context.session.user.id;

      // Insert into DB
      const [newMessage] = await context.db
        .insert(message)
        .values({
          roomId: input.roomId,
          senderId: userId,
          content: input.content,
        })
        .returning();

      await supabase.channel(`room:${input.roomId}`).send({
        type: "broadcast",
        event: "message",
        payload: newMessage,
      });

      return newMessage;
    }),
};
