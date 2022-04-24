import {Client, MessageReaction, PartialMessageReaction, PartialUser, User} from "discord.js";
import {getCurrentUserId} from "../utils/utils";

export default {
  name: "messageReactionAdd",
  execute: async (client: Client, reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => {
    const currentUserId = await getCurrentUserId();

    if (user.id === currentUserId) {
      await reaction.message.react(reaction.emoji);
    }
  },
};
