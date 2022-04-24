import {Client, Interaction} from "discord.js";

export default {
    name: 'interactionCreate',
    execute: async (client: Client, interaction: Interaction) => {
        if(!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if(!command) return;

        try {
            await command.execute(interaction);
        }catch(error) {
            console.error(error);
            if(!interaction.replied) {
                await interaction.reply({content: "There was an error while executing this command!", ephemeral: true });
            }else {
                await interaction.editReply({content: "There was an error while executing this command!" });
            }
        }
    }
}
