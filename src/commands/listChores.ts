import { CommandInteraction, MessageEmbed } from "discord.js";
import { CommandParams } from "../global";
import { SlashCommandBuilder } from "@discordjs/builders";
import { asyncForEach, createMention, getUserFromMention } from "../toolbox";

module.exports = function builder({ db }: CommandParams) {
  async function handler(interaction: CommandInteraction) {
    try {
      const chores = await db.choreCollection.find({}).toArray();

      const embed = new MessageEmbed();
      embed.setTitle("Current Chore Assignments");

      if (chores.length <= 0) return interaction.reply("No chores are registered");

      await asyncForEach(chores, async (chore) => {
        let assignment = await db.choreLogCollection.findOne({ name: chore.name }, { sort: { ts: -1 } });
        let person = assignment ? await getUserFromMention(assignment.person, interaction.client) : null;
        embed.addField(chore.name, person ? createMention(person.id) : "No One", true);
      });

      interaction.reply({ embeds: [embed] });
    } catch (e) {
      console.error(`ERROR: ${e}`);
      interaction.reply(`Error parsing command`);
    }
  }

  const command = new SlashCommandBuilder().setName("listchores").setDescription("List chores currently in rotation");

  return {
    command: command,
    handler: handler,
  };
};
