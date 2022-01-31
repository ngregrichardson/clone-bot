import { Message } from "discord.js";
import { getCurrentUserId } from "../utils/user";
import { Client } from "../utils/definitions";

const execute = async (client: Client, message: Message) => {
  if (["DEFAULT", "REPLY", "THREAD_STARTER_MESSAGE"].includes(message.type)) {
    const currentUserId = await getCurrentUserId();
    const messageContent = {
      content: message.content || " ",
      embeds: message.embeds,
      stickers: message.stickers.map((sticker) => sticker),
      files: message.attachments.map((attachment) => attachment),
    };
    if (message.author.id === currentUserId) {
      if (message.type === "REPLY") {
        const replyToMessage = await message.fetchReference();
        await replyToMessage.reply(messageContent);
      } else {
        message.channel.send(messageContent);
      }
    }
  }
};

export default {
  name: "messageCreate",
  once: false,
  execute,
};
