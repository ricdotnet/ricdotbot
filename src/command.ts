import { CommandInteraction } from 'discord.js';

export abstract class Command {
  protected readonly _interaction: CommandInteraction;
  readonly isDevCommand: boolean = false;

  protected constructor(interaction: CommandInteraction) {
    this._interaction = interaction;
  }

  async execute() {}

  commandName(): string {
    return this._interaction.commandName;
  }

  guildId(): string {
    if (!this._interaction.guildId) {
      throw new Error('This interaction had no guild id set');
    }

    return this._interaction.guildId;
  }

  userId(): string {
    if (!this._interaction.user.id) {
      throw new Error('This interaction had no user id set');
    }

    return this._interaction.user.id;
  }

  username(): string {
    return this._interaction.user.username;
  }
  
  async defer(): Promise<void> {
    await this._interaction.deferReply();
  }
}
