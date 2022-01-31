import { Interaction } from "discord.js";
import { Client } from "../utils/definitions";

const execute = async (client: Client, interaction: Interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (e) {
    console.error(e);
    await interaction.reply({
      content: "There was an error executing this command",
      ephemeral: true,
    });
  }
};

export default {
  name: "interactionCreate",
  once: false,
  execute,
};
