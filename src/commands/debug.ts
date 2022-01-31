import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { db } from "../utils/firebase";

const execute = async (interaction: CommandInteraction) => {
  const testerId = interaction.options.getString("testerid");
  const userData = await db.collection("config").doc("current").get();
  const user = userData.exists ? userData.data() : null;

  console.log(testerId);

  await db
    .collection("config")
    .doc("current")
    .update({
      isDebug: user ? !user.isDebug : true,
      testerId: testerId || user?.testerId || null,
    });
  await interaction.reply({
    content: `The bot is in ${!user?.isDebug ? "production" : "debug"} mode.`,
    ephemeral: true,
  });
};

export default {
  data: new SlashCommandBuilder()
    .setName("debug")
    .setDescription("Toggles the debug mode of the bot.")
    .addStringOption((option) =>
      option
        .setName("testerid")
        .setDescription("The id of the user to test with.")
    ),
  execute,
};
