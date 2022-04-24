import {Collection, CommandInteraction} from "discord.js";

declare module "discord.js" {
    export interface Client {
        commands: Collection<unknown, Command>
    }

    export interface Command {
        name: string,
        description: string,
        execute: (interaction: CommandInteraction) => Promise<SomeType>
    }
}
