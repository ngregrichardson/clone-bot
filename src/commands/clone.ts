import {SlashCommandBuilder} from "@discordjs/builders";
import {CommandInteraction} from "discord.js";
import {cloneUser} from "../utils/utils";

const execute = async (interaction: CommandInteraction) => {
    if(!interaction.guild) return;

    if(interaction.guild.ownerId !== interaction.user.id) {
        await interaction.reply("You do not have access to use this command.");
    }

    let user = interaction.options.getUser("user");

    if(!user) {
        user = interaction.user;
    }

    const guildMember = await interaction.guild.members.fetch(user.id);

    if(guildMember) {
        await interaction.deferReply({ ephemeral: true });

        await cloneUser(interaction.client, guildMember);

        await interaction.editReply({content: `${user} has been cloned.` });
    }
};

export default {
    data: new SlashCommandBuilder()
        .setName("clone")
        .setDescription("Clone a specific user.")
        .addUserOption(option => option.setName("user").setDescription("The user to clone.")),
    execute,
};
