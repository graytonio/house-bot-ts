import { CommandInteraction, GuildMember } from "discord.js";
import { CommandParams } from "../global";
import { SlashCommandBuilder } from "@discordjs/builders";
import { createMention } from "../toolbox";

module.exports = function builder({ db }: CommandParams) {
  async function handler(interaction: CommandInteraction) {
    try {
      const choreName = interaction.options.getString("chore");
      const member = interaction.options.getMentionable("member");
      if (!(member instanceof GuildMember)) return interaction.reply("Error parsing member mention");

      const chore = await db.choreCollection.findOne({ name: choreName });
      if (!chore) return interaction.reply(`${choreName} is not a chore`);

      await db.choreLogCollection.insertOne({ name: choreName, person: member.id, ts: Date.now() });
      interaction.reply(`${createMention(member.id)} has been assigned the chore ${choreName}`);
    } catch (e) {
      console.error(`ERROR: ${e}`);
      interaction.reply("Error parsing command");
    }
  }

  const command = new SlashCommandBuilder()
    .setName("assignchore")
    .setDescription("Assign a chore to a member")
    .addStringOption((option) => option.setName("chore").setDescription("Name of the chore to assign").setRequired(true))
    .addMentionableOption((option) => option.setName("member").setDescription("Name of member to assign to").setRequired(true));

  return {
    command: command,
    handler: handler,
  };
};
