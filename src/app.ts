import { config } from "dotenv";
import { ActivityOptions, Client, Intents } from "discord.js";
import { CronJob } from "cron";
import { join } from "path";
import JSONdb from "simple-json-db";

/**
 * Initialize environment files
 */
config();

/**
 * Initialize Discord client
 */
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_MESSAGES,
  ],
});

/**
 * Initialize database layer
 */
const db = new JSONdb(join(__dirname, "db.json"));

const changeToRandomUser = async (): Promise<void> => {
  console.log("running");
  client.guilds.fetch("623603821796392991").then(async (res) => {
    let user = res.members.cache.random();
    while (!user || user.user.bot || !user.user.avatarURL()) {
      user = res.members.cache.random();
    }

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
      if (res.me) {
        await res.me.setNickname(user.displayName);
        await client.user.setUsername(user.user.username);
        try {
          await res.me.roles.remove(
            res.me.roles.cache
              .filter((r) => r.id !== "829194756327342081")
              .map((r) => r.id)
          );
          await res.me.roles.add(user.roles.cache.map((r) => r.id));
        } catch (e) {
          console.error(e);
        }
      }

      db.set("currentUserId", user.id as unknown as object);
    }
  });
};

client.once("ready", () => {
  console.log("Bot online.");
  const job = new CronJob(
    "0 0 0 * * *",
    changeToRandomUser,
    null,
    db.has("currentUserId"),
    "America/New_York"
  );
  job.start();
});

client.on("messageCreate", async (message) => {
  if (["DEFAULT", "REPLY", "THREAD_STARTER_MESSAGE"].includes(message.type)) {
    const currentUserId = getCurrentUserId();
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
});

client.on("messageReactionAdd", async (reaction, user) => {
  const currentUserId = getCurrentUserId();
  if (user.id === currentUserId) {
    await reaction.message.react(reaction.emoji);
  }
});

client.on("messageReactionRemove", async (reaction, user) => {
  const currentUserId = getCurrentUserId();
  if (user.id === currentUserId) {
    const react = reaction.message.reactions.cache.find(
      (r) => r.emoji === reaction.emoji
    );
    if (client.user && react) {
      await react.users.remove(client.user.id);
    }
  }
});

const getCurrentUserId = (): string | null => {
  if (db.has("currentUserId")) {
    return db.get("currentUserId") as unknown as string;
  } else {
    return null;
  }
};

const initialize = async (): Promise<void> => {
  await client.login(process.env.BOT_TOKEN);
  if (process.env.ENVIRONMENT === "dev") {
    db.set("currentUserId", process.env.TESTER_ID as unknown as object);
  }
};

initialize().catch((e) => console.error(e));
