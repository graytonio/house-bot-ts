import { CommandInteraction, GuildMember, User } from "discord.js";
import { CommandParams } from "../global";
import { SlashCommandBuilder } from "@discordjs/builders";
import { createMention } from "../toolbox";

module.exports = function builder({ db }: CommandParams) {
  async function handler(interaction: CommandInteraction) {
    try {
      const member = interaction.options.getMentionable("name");
      if (!(member instanceof GuildMember)) return interaction.reply("Error parsing member mention");

      const result = await db.membersCollection.insertOne({ name: member.user.tag, id: member.id });
      if (result.acknowledged && result.insertedId) return interaction.reply(`${createMention(member.id)} added as a member`);
      return interaction.reply(`An error occured while trying trying to add ${createMention(member.id)}`);
    } catch (e) {
      console.error(`ERROR: ${e}`);
      interaction.reply("Error parsing command");
    }
  }

  const command = new SlashCommandBuilder()
    .setName("addmember")
    .setDescription("Add a member to the rotation")
    .addMentionableOption((option) => option.setName("name").setDescription("Name of the new member").setRequired(true));

  return {
    command: command,
    handler: handler,
  };
};
