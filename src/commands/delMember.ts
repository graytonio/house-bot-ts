import { CommandInteraction, GuildMember } from "discord.js";
import { CommandParams } from "../global";
import { SlashCommandBuilder } from "@discordjs/builders";
import { createMention } from "../toolbox";

module.exports = function builder({ db }: CommandParams) {
  async function handler(interaction: CommandInteraction) {
    try {
      const member = interaction.options.getMentionable("name");
      if (!(member instanceof GuildMember)) return interaction.reply("Error parsing member mention");

      const result = await db.membersCollection.deleteOne({ id: member.id });
      if (result.acknowledged && result.deletedCount == 1) return interaction.reply(`${createMention(member.id)} removed as a member`);
      return interaction.reply(`An error occured while trying trying to remove ${createMention(member.id)}`);
    } catch (e) {
      console.error(`ERROR: ${e}`);
      interaction.reply("Error parsing command");
    }
  }

  const command = new SlashCommandBuilder()
    .setName("removemember")
    .setDescription("Remove a member from the rotation")
    .addMentionableOption((option) => option.setName("name").setDescription("Name of the member to delete").setRequired(true));

  return {
    command: command,
    handler: handler,
  };
};
