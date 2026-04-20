import Eris from "eris";
import { type CommandValue, type CommandContext } from "../types.js";

export default {
    name: "set",
    description: "setup your server with the bot",
    usage: "set <subcommand>",
    async execute(ctx: CommandContext){
        const { args, bot, msg, prefix, commands } = ctx;

        if(!args || !args[0] || args.length == 0){
            bot.createMessage(msg.channel.id, `No subcommand specified`);
        }
    }
};