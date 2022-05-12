import { Client } from "discord.js";

export function createMention(id: string) {
  return `<@${id}>`;
}

export async function asyncForEach<Type>(array: Type[], callback: (elem: Type, index: number, arr: Type[]) => void) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

export async function getUserFromMention(mention: string, client: Client) {
  if (!mention) return;

  if (mention.startsWith("<@") && mention.endsWith(">")) {
    mention = mention.slice(2, -1);

    if (mention.startsWith("!")) {
      mention = mention.slice(1);
    }
  }

  return await client.users.fetch(mention);
}
