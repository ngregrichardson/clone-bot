import {
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  User,
} from "discord.js";
import { getCurrentUserId } from "../utils/user";
import { Client } from "../utils/definitions";

const execute = async (
  client: Client,
  reaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser
) => {
  const currentUserId = await getCurrentUserId();
  if (user.id === currentUserId) {
    await reaction.message.react(reaction.emoji);
  }
};

export default {
  name: "messageReactionAdd",
  once: false,
  execute,
};
