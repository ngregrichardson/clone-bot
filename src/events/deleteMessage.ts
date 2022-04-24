import {Client, Message} from "discord.js";
import {getCurrentUserId, getCurrentUserMessage} from "../utils/utils";
import {ClonedMessage} from "../@types";

export default {
  name: "messageDelete",
  execute: async (client: Client, message: Message) => {

    const currentUserId = await getCurrentUserId();

    if (message.author.id === currentUserId) {
      try {
        const existingMessageDoc = await getCurrentUserMessage(message.id);

        if(existingMessageDoc && existingMessageDoc.exists) {
          const existingMessageData = existingMessageDoc.data() as ClonedMessage;
          const existingMessage = await message.channel.messages.fetch(existingMessageData.messageId);

          await existingMessage?.delete();
          await existingMessageDoc.ref.delete();
        }
      }catch {
        // No message to update
      }
    }
  },
};
