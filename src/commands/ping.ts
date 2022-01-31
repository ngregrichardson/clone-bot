import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

const execute = async (interaction: CommandInteraction) => {
  await interaction.reply({ content: "Pong!", ephemeral: true });
};

export default {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies if the bot is online."),
  execute,
};
