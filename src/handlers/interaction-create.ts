import { Client, Events, Interaction } from 'discord.js';
import { Commands } from '../commands';
import { Command } from '../command';
import { Logger } from '@ricdotnet/logger/dist';
import {
  createOrUpdateExistingUserAndMember,
  updateLastCommand,
} from '../../prisma/queries';

export class InteractionCreate {
  constructor(client: Client) {
    client.on(Events.InteractionCreate, this.onInteractionCreate);
  }

  async onInteractionCreate(interaction: Interaction) {
    if (!interaction.isChatInputCommand() || !interaction.guildId) return;
    const commandName = interaction.commandName;
    const commandClass = Commands.instance().get(commandName);
    const guildId = interaction.guildId;
    const userId = interaction.user.id;
    const now = new Date();

    const log = {
      guildId: guildId,
      command: commandName,
      username: interaction.user.username,
      userId,
      date: now,
    };
    Logger.get().info(`Interaction incoming: ${JSON.stringify(log)}`);

    if (!commandClass) {
      interaction.reply('This command does not exist.');
      return;
    }

    const command: Command = new commandClass(interaction);

    try {
      if (!command.isDevCommand) {
        // update last command entry
        await updateLastCommand(guildId, now);

        // check if member & user exists
        await createOrUpdateExistingUserAndMember(
          guildId,
          userId,
          now,
          commandName,
        );
      }

      await command.execute();

      // biome-ignore lint/suspicious/noExplicitAny: its just an error
    } catch (err: any) {
      Logger.get().error(err);
    }
  }
}
