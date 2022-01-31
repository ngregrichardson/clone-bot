/**
 * This file should be run manually (yarn deployCommands) whenever properties of any command changes (the name, description, options, etc.)
 */

import { config } from "dotenv";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import fs from "fs";
import { join } from "path";

config();

const deployCommands = async (path = "../commands") => {
  const commands = [];
  const commandFiles = fs
    .readdirSync(join(__dirname, path))
    .filter((file) => file.endsWith(".js") || file.endsWith(".ts"));

  for (const file of commandFiles) {
    const command = require(join(__dirname, path, file));
    commands.push(command.default.data.toJSON());
  }

  if (commands.length <= 0) return;

  const rest = new REST({ version: "9" }).setToken(
    process.env.BOT_TOKEN as string
  );

  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID as string),
      {
        body: commands,
      }
    );

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
};

deployCommands().catch((e) => console.error(e));
