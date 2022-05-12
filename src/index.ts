import { config } from "dotenv";
config();

import { Command, CommandCollection, CommandParams, Config } from "./global";
import path from "path";
import fs from "fs";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { Client, Intents } from "discord.js";
import connect from "./db";

function fatalError(message: string) {
  console.error(message);
  process.exit(1);
}

function parseENV(): Config | void {
  const DISCORD_TOKEN = process.env["DISCORD_TOKEN"];
  const DISCORD_ID = process.env["DISCORD_ID"];
  const MONGO_URI = process.env["MONGO_URI"];
  const MONGO_DB_NAME = process.env["MONGO_DB_NAME"];

  if (!DISCORD_TOKEN) return fatalError("DISCORD_TOKEN must be defined");
  if (!DISCORD_ID) return fatalError("DISCORD_ID must be defined");
  if (!MONGO_URI) return fatalError("MONGO_URI must be defined");
  if (!MONGO_DB_NAME) return fatalError("MONGO_DB_NAME must be defined");

  return {
    DISCORD_TOKEN,
    DISCORD_ID,
    MONGO_URI,
    MONGO_DB_NAME,
  };
}

function loadCommandHandlers({ commands_dir = path.join(__dirname, "commands"), handler_params }: { commands_dir?: string; handler_params: CommandParams }): CommandCollection {
  const handlers: CommandCollection = {};
  console.log("Loading Command Handlers...");
  fs.readdirSync(commands_dir).forEach((file) => {
    try {
      let handler: Command = require(path.join(commands_dir, file))(handler_params);
      handlers[handler.command.name.toLowerCase()] = handler;
    } catch (e) {
      console.log(`Failed to load command ${file}`);
      console.error(e);
    }
  });
  console.log("Command Handlers Loaded");
  return handlers;
}

async function registerCommands({ handlers, client_id, token, dev_guild = "", dev = false }: { handlers: CommandCollection; client_id: string; token: string; dev_guild?: string; dev?: boolean }) {
  const body = Object.keys(handlers).map((key) => handlers[key].command);
  const rest = new REST({ version: "9" }).setToken(token);

  try {
    console.log("Refreshing (/) Commands...");
    if (dev) await rest.put(Routes.applicationGuildCommands(client_id, dev_guild), { body: body });
    else await rest.put(Routes.applicationCommands(client_id), { body: body });
    console.log("(/) Commands Updated");
  } catch (e) {
    console.log("Error refreshing (/) commands");
    console.error(e);
  }
}

async function registerEventHandlers({
  handlers,
  client_id,
  token,
  dev_guild = "",
  dev = false,
}: {
  handlers: CommandCollection;
  client_id: string;
  token: string;
  dev_guild?: string;
  dev?: boolean;
}) {
  const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

  await registerCommands({ handlers, client_id, token, dev_guild, dev });

  client.on(`ready`, () => {
    console.log(`Logged in as ${client.user?.tag}`);
  });

  client.on(`interactionCreate`, async (interaction) => {
    if (!interaction.isCommand()) return;

    const handler = handlers[interaction.commandName].handler;
    if (handler == null) interaction.reply(`${interaction.commandName} is not a command`);
    await handler(interaction);
  });

  client.on("guildCreate", async () => {
    registerCommands({ handlers, client_id, token, dev_guild, dev });
  });

  client.login(token);
}

async function main() {
  const config = parseENV();
  if (!config) return;

  const db = await connect({ uri: config.MONGO_URI, db_name: config.MONGO_DB_NAME });
  if (!db) return;

  const handlers = loadCommandHandlers({ handler_params: { db } });
  await registerEventHandlers({ handlers: handlers, client_id: config.DISCORD_ID, token: config.DISCORD_TOKEN, dev_guild: "379815890276843521", dev: true });
}
main();
