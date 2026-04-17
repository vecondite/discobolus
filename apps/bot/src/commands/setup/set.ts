import Eris from "eris";
import type { CommandContext, Output } from "../types.js";
import welcmsg from "./subcommands/welcmsg.js";

export default {
    name: "set",
    description: "basic stats of the bot",
    usage: "ping",
    async execute(ctx: CommandContext){
        const { args, bot, msg, prefix } = ctx;

        let output: Output;

        if(!args || args.length == 0){
            output = {
                "error": true,
                "message": `No subcommand specified`
            };
        }else if(args[0]==="welcmsg"){
            args.shift();
            output = await welcmsg(args);
        }else{
            args.shift();
            output = {
                "error": true,
                "message": `Subcommand ${args[0]} not recognized`
            }
        }

        if(output.error){
            bot.createMessage(msg.channel.id, `${output.message}\n\`\`\`${prefix}help set\`\`\``);
        }else{
            bot.createMessage(msg.channel.id, `${output.message}`);
        }
    }
};