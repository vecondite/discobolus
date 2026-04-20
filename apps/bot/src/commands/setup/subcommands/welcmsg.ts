import Eris from "eris";
import type { Output, CommandContext } from "../../types.js";
import { setMessage } from "@discobolus/db";

export default {
    name: "set welcmsg",
    description: "setup a welcome message",
    aliases: ["wm"],
    usage: "set welcmsg <welcome message> [channel]",
    async execute(ctx: CommandContext): Promise<Output>{
        const {args, msg} = ctx;
        let output: Output;

        if(!msg.guildID){
            output={
                "error": true,
                "message": `This command can only be used in servers.`
            }
        }else if(args.length==0 || !args[0]){
            output={
                "error": true,
                "message": `Invalid welcome message.`
            }
        }else{
            let channelId: string;
            const channelArg: string = args[args.length - 1]!;
            const isChannelArg: boolean = (channelArg.startsWith("<#") && channelArg.endsWith(">"));
            channelId = isChannelArg ? channelArg.slice(2,-1) : msg.channel.id;
            const message: string = isChannelArg ? args.slice(0, args.length-1).join(" ") : args.join(" ");
            const outMsg: string = await setMessage(message, msg.guildID, channelId);
            output={
                "error": false,
                "message": outMsg
            }
        }

        return output;
    }
}

