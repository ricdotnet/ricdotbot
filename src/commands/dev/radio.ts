import { SlashCommandBuilder } from 'discord.js';
import { Command } from '../../command';
import { parseString } from 'xml2js';

export class Radio extends Command {
  readonly isDevCommand: boolean = true;

  async execute(): Promise<void> {
    const response = await fetch(
      'https://playerservices.streamtheworld.com/api/livestream?station=RFM&transports=http%2Chls&version=1.10',
    );
    parseString(await response.text(), (err, result) => {
      if (err) {
        return console.log(err);
      }
      const servers =
        result.live_stream_config.mountpoints[0].mountpoint[0].servers[0].server;
      const randomServerIdx = servers[Math.floor(Math.random() * servers.length)];
      
      console.log(servers[randomServerIdx]);
    });

    this._interaction.reply('hello from radio dev');
  }

  command(): SlashCommandBuilder {
    return <SlashCommandBuilder>(
      new SlashCommandBuilder()
        .setName('radio-dev')
        .setDescription('Start listening to the radio (Dev mode)')
    );
  }
}