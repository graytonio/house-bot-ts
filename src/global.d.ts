import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Interaction } from "discord.js";
import { Db, Document, Collection } from "mongodb";

interface Config {
  DISCORD_TOKEN: string;
  DISCORD_ID: string;
  MONGO_URI: string;
  MONGO_DB_NAME: string;
}

interface Database {
  db: Db;
  choreCollection: Collection;
  membersCollection: Collection;
  choreLogCollection: Collection;
}

interface CommandParams {
  db: Database;
}

interface Command {
  command: SlashCommandBuilder;
  handler(params: CommandInteraction): void;
}

interface CommandCollection {
  [key: string]: Command;
}
