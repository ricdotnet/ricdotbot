import fs from 'fs';
import path from 'path';
import { Command } from './command';
import { Logger } from '@ricdotnet/logger/dist';

export class Commands extends Map {
  private static _instance: Commands;
  private readonly _commands: Command[] = [];

  private readonly ignoredCommands: string[] = ['add', 'next', 'queue', 'start', 'stop'];
  
  private readonly isDev: boolean = process.env.NODE_ENV === 'development';
  
  constructor() {
    super();
    if (Commands._instance !== undefined) {
      Logger.get().warn('The commands collection is already instantiated.');
      return;
    }

    Commands._instance = this;
  }

  async load() {
    const commandsPath = path.join(__dirname, 'commands');
    const files = this.commandFiles(commandsPath);

    for await (const file of files) {
      if (this.ignoredCommands.find((ic) => file.includes(ic))) {
        continue;
      }
      
      const cmdFile = await import(path.join(commandsPath, file));
      const className = Object.keys(cmdFile)[0];
      const _class = new cmdFile[className]();

      this._commands.push(_class.command().toJSON());
      this.set(_class.command().name, cmdFile[className]);

      Logger.get().info(`Loaded command: ${_class.command().name}`);
    }
  }

  getCommands(): Command[] {
    return this._commands;
  }

  static instance() {
    return Commands._instance;
  }

  private commandFiles(commandsPath: string): string[] {
    return fs.readdirSync(commandsPath, { recursive: true }).filter((file) => {
      const _file = file.toString();
      
      if (this.isDev && this.isDevCommand(_file)) {
        return _file;
      }

      if ((_file.endsWith('.ts') || _file.endsWith('.js')) && !_file.includes('dev/')) {
        return _file;
      }
    }) as string[];
  }
  
  private isDevCommand(file: string): boolean {
    return file.includes('dev/');
  }
}
