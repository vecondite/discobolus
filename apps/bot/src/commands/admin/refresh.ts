import colors from "colors";
import Eris from "eris";
import type { CommandContext } from "../types.js";

export default {
    name: "refresh",
    description: "refresh bot commands",
    usage: "refresh",
    async execute(ctx: CommandContext){
        const {bot, msg, loadCommands, loadEvents} = ctx
        let updates = "";
        const { warnings, passes } = await loadCommands(true);
        await loadEvents(true);
        passes.forEach((pass)=>{
            //console.log(`${("[LOAD]" as any).brightGreen} ${pass}`);
            updates+=`[LOAD] ${pass}\n`;
        });
        warnings.forEach((warning)=>{
            //console.warn(`${("[SKIP]" as any).brightYellow} ${warning}`);
            updates+=`[SKIP] ${warning}\n`;
        });
        bot.createMessage(msg.channel.id, `\`\`\`${updates}\`\`\``);
        //console.log(`Loaded: ${passes.length}`);
        //console.log(`Skipped: ${warnings.length}`);
    }
};