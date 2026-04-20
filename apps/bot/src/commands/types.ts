import Eris from "eris";

export interface CommandValue {
    name: string;
    description: string;
    usage: string;
    aliases?: string[];
    subcommands?: Map<string, CommandValue>
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