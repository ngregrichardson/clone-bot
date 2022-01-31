import {
  Client as DiscordClient,
  ClientOptions,
  Collection,
  Interaction,
} from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

interface Command {
  data: SlashCommandBuilder;
  execute: (interaction: Interaction) => void;
}

export class Client extends DiscordClient {
  public commands;
  constructor(options: ClientOptions) {
    super(options);
    this.commands = new Collection<string, Command>();
  }
}
