import Eris from "eris";
import type { CommandContext } from "../types.js";

export default {
    name: "kill",
    aliases: [
        "shutdown",
    ],
    description: "kill the bot process",
    usage: "ping",
    async execute(ctx: CommandContext){
        const {bot, msg} = ctx;
        await bot.createMessage(msg.channel.id, `\`\`\`Killing bot process.\`\`\``);
        process.exit();
    }
};