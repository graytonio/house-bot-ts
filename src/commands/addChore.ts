import { CommandInteraction } from "discord.js";
import { CommandParams } from "../global";
import { SlashCommandBuilder } from "@discordjs/builders";

module.exports = function builder({ db }: CommandParams) {
  async function handler(interaction: CommandInteraction) {
    try {
      const choreName = interaction.options.getString("name");
      const result = await db.choreCollection.insertOne({ name: choreName });
      if (result.acknowledged && result.insertedId) return interaction.reply(`${choreName} added as a chore`);
      return interaction.reply(`An error occured while trying trying to add ${choreName}`);
    } catch (e) {
      console.error(`ERROR: ${e}`);
      interaction.reply("Error parsing command");
    }
  }

  const command = new SlashCommandBuilder()
    .setName("addchore")
    .setDescription("Add a chore to the rotation")
    .addStringOption((option) => option.setName("name").setDescription("Name of new chore").setRequired(true));

  return {
    command: command,
    handler: handler,
  };
};
