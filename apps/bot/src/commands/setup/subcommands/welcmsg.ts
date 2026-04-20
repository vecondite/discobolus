import Eris from "eris";
import type { CommandContext } from "../../types.js";
import { setMessage } from "@discobolus/db";

export default {
    name: "set welcmsg",
    description: "setup a welcome message",
    aliases: ["set wm"],
    usage: "set welcmsg <welcome message> [channel]",
    async execute(ctx: CommandContext){
        const {bot, args, msg} = ctx;

        let output: string;

        if(!msg.guildID){
            output = `This command can only be used in servers.`
        }else if(args.length==0 || !args[0]){
            output = `Invalid welcome message.`
        }else{
            let channelId: string;
            const channelArg: string = args[args.length - 1]!;
            const isChannelArg: boolean = (channelArg.startsWith("<#") && channelArg.endsWith(">"));
            channelId = isChannelArg ? channelArg.slice(2,-1) : msg.channel.id;
            const message: string = isChannelArg ? args.slice(0, args.length-1).join(" ") : args.join(" ");
            const outMsg: string = await setMessage(message, msg.guildID, channelId);

            output = outMsg
        }

        bot.createMessage(msg.channel.id, output);
    }
}

