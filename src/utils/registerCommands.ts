import fs from "fs";
import { join } from "path";
import { Client } from "./definitions";

const registerCommands = (client: Client, path = "../commands") => {
  const eventFiles = fs
    .readdirSync(join(__dirname, path))
    .filter((file) => file.endsWith(".ts") || file.endsWith("js"));

  for (const file of eventFiles) {
    const { default: command } = require(join(path, file));
    client.commands.set(command.data.name, command);
  }
};

export default registerCommands;
