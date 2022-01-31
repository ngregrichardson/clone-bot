import { config } from "dotenv";
import { Intents } from "discord.js";
import { initializeFirebase } from "./utils/firebase";
import registerEvents from "./utils/registerEvents";
import { Client } from "./utils/definitions";
import registerCommands from "./utils/registerCommands";

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

const initialize = async (): Promise<void> => {
  config();
  initializeFirebase();
  await client.login(process.env.BOT_TOKEN);
  registerEvents(client);
  registerCommands(client);
};

initialize().catch((e) => console.error(e));
