import { CommandInteraction } from "discord.js";
import { CommandParams } from "../global";
import { SlashCommandBuilder } from "@discordjs/builders";

function builder({ db }: CommandParams) {
  async function handler(interaction: CommandInteraction) {
    interaction.reply("Pong!");
  }

  const command = new SlashCommandBuilder().setName("ping").setDescription("Test bot is running");

  return {
    command: command,
    handler: handler,
  };
}
module.exports = builder;
