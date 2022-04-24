import {config} from "dotenv";
import {Client, Collection, Command, Intents} from "discord.js";
import {CronJob} from "cron";
import registerEvents from "./utils/registerEvents";
import {cloneUser, getCurrentUserId, initializeFirebase} from "./utils/utils";
import registerCommands from "./utils/registerCommands";

/**
 * Initialize environment files
 */
config();

/**
 * Initialize firebase
 */
initializeFirebase();

/**
 * Initialize Discord client
 */
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_PRESENCES
  ]
});
client.commands = new Collection<unknown, Command>();

const changeToRandomUser = () => {
  client.guilds.fetch(process.env.GUILD_ID as string).then(async (res) => {
    const currentUserId = await getCurrentUserId();
    let user;
    while (!user || user.user.bot || !user.user.avatarURL() || (currentUserId && user.id === currentUserId)) {
      user = res.members.cache.random();
    }

    await cloneUser(client, user);
  });
};

client.once("ready", async () => {
  console.log("Bot online.");

  if (process.env.IS_PROD) {
    client.guilds.fetch().then((guilds) => {
      guilds.forEach((guild) => {
        guild.fetch().then((g) => g.commands.set([]));
      });
    });
  }

  registerCommands(client);

  registerEvents(client);

  const job = new CronJob(
    "0 0 0 * * *",
    changeToRandomUser,
    null,
    false,
    "America/New_York"
  );
  job.start();
});

client.login(process.env.BOT_TOKEN);
