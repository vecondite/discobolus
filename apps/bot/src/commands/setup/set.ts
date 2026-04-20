import Eris from "eris";
import { type CommandValue, type CommandContext, type Output } from "../types.js";

export default {
    name: "set",
    description: "setup your server with the bot",
    usage: "set <subcommand>",
    async execute(ctx: CommandContext){
        const { args, bot, msg, prefix, commands } = ctx;

        let output: Output | void;

        if(!args || !args[0] || args.length == 0){
            output = {
                "error": true,
                "message": `No subcommand specified`
            };
        }else{
            const subcommand = commands.get(`set ${args[0]}`)!;
            if(subcommand){
                args.shift();
                output = await subcommand.execute(ctx);
            }else{
                output = {
                    "error": true,
                    "message": `subcommand ${args[0]} not recognized`
                }
            }
        }

        if(!output){
            return bot.createMessage(msg.channel.id, `Subcommand didn't return output.`);
        }

        if(output.error){
            bot.createMessage(msg.channel.id, `${output.message}\n\`\`\`${prefix}help set\`\`\``);
        }else{
            bot.createMessage(msg.channel.id, `${output.message}`);
        }
    }
};