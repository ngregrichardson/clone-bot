import {Client, MessageReaction, PartialMessageReaction, PartialUser, User} from "discord.js";
import {getCurrentUserId} from "../utils/utils";

export default {
  name: "messageReactionRemove",
  execute: async (client: Client, reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => {
    const currentUserId = await getCurrentUserId();

    if (user.id === currentUserId) {
      const react = reaction.message.reactions.cache.find(
          (r) => r.emoji === reaction.emoji
      );
      if (client.user && react) {
        await react.users.remove(client.user.id);
      }
    }
  },
};
