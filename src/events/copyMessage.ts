import { Client, Message } from "discord.js";
import {getCurrentUserId, getCurrentUserMessage, saveClonedMessage} from "../utils/utils";
import {ClonedMessage, MessageContent} from "../@types";

export default {
  name: ["messageCreate", "messageUpdate"],
  execute: async (client: Client, oldMessage: Message, newMessage: Message) => {
    const message = newMessage || oldMessage;

    if (["DEFAULT", "REPLY", "THREAD_STARTER_MESSAGE"].includes(message.type)) {
      const currentUserId = await getCurrentUserId();
      const messageContent: MessageContent = {
        content: message.content || " ",
        embeds: message.embeds,
        stickers: message.stickers.map((sticker) => sticker),
        files: message.attachments.map((attachment) => attachment),
      };

      if (message.author.id === currentUserId) {
        if (!newMessage) {
          let clonedMessage;
          if (message.type === "REPLY") {
            const replyToMessage = await message.fetchReference();
            clonedMessage = await replyToMessage.reply(messageContent);
          } else {
            clonedMessage = await message.channel.send(messageContent);
          }

          await saveClonedMessage(message.id, clonedMessage.id, message.channel.id);
        } else {
          try {
            const existingMessageDoc = await getCurrentUserMessage(message.id);

            if(existingMessageDoc && existingMessageDoc.exists) {
              const existingMessageData = existingMessageDoc.data() as ClonedMessage;
              const existingMessage = await message.channel.messages.fetch(existingMessageData.messageId);

              delete messageContent.stickers;

              await existingMessage?.edit(messageContent);
            }
          }catch(e) {
            console.error(e);
            // No message to update
          }
        }
      }
    }
  },
};
