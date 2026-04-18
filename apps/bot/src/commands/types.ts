import Eris from "eris";

export interface CommandValue {
    name: string;
    description: string;
    usage: string;
    aliases?: string[];
    execute: (ctx: CommandContext) => Promise<void>;
}

export type LoadResult = {
    skips: string[];
    loads: string[];
    unloads: string[];
};

export type CommandContext = {
    bot: Eris.Client;
    msg: Eris.Message | any;
    args: string[];
    commands: Map<string, CommandValue>;
    aliases: Map<string, string>;
    prefix: string;
    loadCommands: (cleartoggle: boolean) => Promise<LoadResult>;
    loadEvents: (cleartoggle: boolean) => {};
};

export type Output = {
  error: boolean;
  message: string;
};