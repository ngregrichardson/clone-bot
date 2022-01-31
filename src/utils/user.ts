import { db } from "./firebase";
import { ActivityOptions, GuildMember } from "discord.js";
import { Client } from "./definitions";

export const getCurrentUserId = async (): Promise<string | null> => {
  const userData = await db.collection("config").doc("current").get();
  const user = userData.exists ? userData.data() : null;

  if (user) {
    return user.isDebug ? user.testerId || user.userId : user.userId;
  } else {
    return null;
  }
};

export const changeToUser = async (client: Client, user: GuildMember) => {
  const { guild } = user;
  if (user && client.user) {
    if (user?.presence) {
      const activities: ActivityOptions[] = user.presence.activities.map(
        ({ name, type, url }): ActivityOptions => ({
          name,
          type,
          url: url || undefined,
        })
      );
      await client.user.setPresence({ activities, status: "idle" });
    }
    const avatarUrl = user?.user?.avatarURL();
    if (avatarUrl) {
      await client.user.setAvatar(avatarUrl);
    }
    if (guild.me) {
      await guild.me.setNickname(user.displayName);
      await client.user.setUsername(user.user.username);
      try {
        await guild.me.roles.remove(
          guild.me.roles.cache
            .filter((r) => r.id !== "829194756327342081")
            .map((r) => r.id)
        );
        await guild.me.roles.add(user.roles.cache.map((r) => r.id));
      } catch (e) {
        console.error(e);
      }
    }

    await db.collection("userInfo").doc("current").set({ userId: user.id });
  }
};

export const changeToRandomUser = (client: Client): void => {
  client.guilds.fetch("").then(async (guild) => {
    let user = guild.members.cache.random();
    while (!user || user.user.bot || !user.user.avatarURL()) {
      user = guild.members.cache.random();
    }

    await changeToUser(client, user);
  });
};
