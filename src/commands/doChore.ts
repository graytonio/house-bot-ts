import { CommandInteraction, GuildMember } from "discord.js";
import { CommandParams } from "../global";
import { SlashCommandBuilder } from "@discordjs/builders";
import { createMention } from "../toolbox";

module.exports = function builder({ db }: CommandParams) {
  async function handler(interaction: CommandInteraction) {
    try {
      let allMembers = await db.membersCollection.find({}).toArray();
      const choreName = interaction.options.getString("chore");

      const assignment = await db.choreLogCollection.findOne({ name: choreName }, { sort: { ts: -1 } });
      if (!assignment) return interaction.reply(`${choreName} is not a chore. Are you ok?`);

      const prevAssignments = await db.choreLogCollection.find({ name: choreName }, { sort: { ts: -1 }, limit: allMembers.length - 1 }).toArray();
      const pastMembers = prevAssignments.map((assignment) => assignment.person);

      console.log(pastMembers);

      let members = allMembers.filter((member) => !pastMembers.includes(member.id)).map((member) => member.id);

      if (members.length > 1) {
        const member = interaction.member;
        if (!(member instanceof GuildMember)) return interaction.reply("Error assigning chore");
        let index = members.indexOf(member.id);
        if (index > -1) members.splice(index, 1);
      }

      const newAssignment = members[Math.floor(Math.random() * members.length)];
      await db.choreLogCollection.insertOne({ name: assignment.name, person: newAssignment, ts: Date.now() });
      interaction.reply(`${createMention(newAssignment)} you have been assigned the chore ${assignment.name}`);
    } catch (e) {
      console.error(`ERROR: ${e}`);
      interaction.reply("Error parsing command");
    }
  }

  const command = new SlashCommandBuilder()
    .setName("dochore")
    .setDescription("Complete a chore")
    .addStringOption((option) => option.setName("chore").setDescription("Name of the chore to assign").setRequired(true));

  return {
    command: command,
    handler: handler,
  };
};
