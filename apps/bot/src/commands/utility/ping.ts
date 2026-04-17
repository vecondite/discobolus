import Eris from "eris";
import type { CommandContext } from "../types.js";

export default {
    name: "ping",
    aliases: [
        "stats",
        "bussin"
    ],
    description: "basic stats of the bot",
    usage: "ping",
    async execute(ctx: CommandContext){
        const {bot, msg, args} = ctx;
        bot.createMessage(msg.channel.id, `your message was \`${msg.content}\`. i could recognize the following arguments: \`[${args}]\``);
    }
};