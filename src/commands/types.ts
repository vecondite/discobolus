import Eris from "eris";

export interface CommandValue {
    name: string;
    description: string;
    usage: string;
    aliases?: string[];
    execute: (
        bot: Eris.Client, 
        msg: Eris.Message, 
        args: string[], 
        commands: Map<string, CommandValue>, 
        aliases: Map<string, string>, 
        prefix: string
    ) => Promise<void>;
}

export type LoadResult = {
    warnings: string[];
    passes: string[];
};