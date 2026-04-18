import Eris from "eris";
import type { Output } from "../../types.js";

export default {
    skip: "subcommand."
}

export async function welcmsg(bot: Eris.Client, msg: Eris.Message, args: string[]){
    let output: Output;

    if(!msg.guildID){
        output={
            "error": true,
            "message": `This command can only be used in servers.`
        }
    }else if(args.length==0){
        output={
            "error": true,
            "message": `Invalid welcome message.`
        }
    }else{
        console.log(args);
        const guild = bot.guilds.get(msg.guildID);
        args[1] ? console.log(`Channel: ${args[1]}`) : console.log(`Channel: ${msg.channel.id}`);
        output={
            "error": false,
            "message": `Welcome message set to ${args[0]}`
        }
    }

    return output;
}