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
        const { skips, loads, unloads } = await loadCommands(true);
        await loadEvents(true);
        unloads.forEach((unload)=>{
            //console.warn(`${("[SKIP]" as any).brightYellow} ${skip}`);
            updates+=`[UNLOAD] ${unload}\n`;
        });
        loads.forEach((load)=>{
            //console.log(`${("[LOAD]" as any).brightGreen} ${load}`);
            updates+=`[LOAD] ${load}\n`;
        });
        skips.forEach((skip)=>{
            //console.warn(`${("[SKIP]" as any).brightYellow} ${skip}`);
            updates+=`[SKIP] ${skip}\n`;
        });
        bot.createMessage(msg.channel.id, `\`\`\`${updates}\`\`\``);
        //console.log(`Loaded: ${loads.length}`);
        //console.log(`Skipped: ${skips.length}`);
    }
};