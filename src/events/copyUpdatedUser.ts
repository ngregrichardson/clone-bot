import {Client, GuildMember} from "discord.js";
import {cloneUserAvatar, cloneUserName, cloneUserNickname, cloneUserRoles, getCurrentUserId} from "../utils/utils";

export default {
  name: ["guildMemberUpdate"],
  execute: async (client: Client, oldUser: GuildMember, newUser: GuildMember) => {
    const currentUserId = await getCurrentUserId();

    if(newUser.id !== currentUserId) return;

    if(oldUser.nickname !== newUser.nickname) {
      await cloneUserNickname(client, newUser);
    }

    if(oldUser.displayAvatarURL() !== newUser.displayAvatarURL()) {
      await cloneUserAvatar(client, newUser.user);
    }

    if(oldUser.user.username !== newUser.user.username) {
      await cloneUserName(client, newUser.user);
    }

    await cloneUserRoles(client, newUser, oldUser);
  },
};
