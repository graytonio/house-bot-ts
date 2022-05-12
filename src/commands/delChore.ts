import { CommandInteraction } from "discord.js";
import { CommandParams } from "../global";
import { SlashCommandBuilder } from "@discordjs/builders";

module.exports = function builder({ db }: CommandParams) {
  async function handler(interaction: CommandInteraction) {
    try {
      const choreName = interaction.options.getString("name");
      const result = await db.choreCollection.deleteOne({ name: choreName });
      if (result.acknowledged && result.deletedCount == 1) return interaction.reply(`${choreName} was removed from the rotation`);
      return interaction.reply(`${choreName} is not a registered chore`);
    } catch (e) {
      console.error(`ERROR: ${e}`);
      interaction.reply("Error parsing command");
    }
  }

  const command = new SlashCommandBuilder()
    .setName("removechore")
    .setDescription("Remove a chore from the rotation")
    .addStringOption((option) => option.setName("name").setDescription("Name of chore to delte").setRequired(true));

  return {
    command: command,
    handler: handler,
  };
};
