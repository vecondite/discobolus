import colors from "colors";
import Eris from "eris";

export default {
    name: "refresh",
    description: "refresh bot commands",
    usage: "refresh",
    async execute(
        bot: Eris.Client,
        msg: Eris.Message,
        loadCommands: (cleartoggle: boolean) => { warnings: string[], passes: string[] }
    ){
        let updates = "";
        const { warnings, passes } = await loadCommands(true);
        passes.forEach((pass)=>{
            //console.log(`${("[S]" as any).brightGreen} ${pass}`);
            updates+=`${pass}\n`;
        });
        warnings.forEach((warning)=>{
            //console.warn(`${("[!]" as any).brightYellow} ${warning}`);
            updates+=`${warning}\n`;
        });
        bot.createMessage(msg.channel.id, `\`\`\`${updates}\`\`\``);
        //console.log(`Loaded: ${passes.length}`);
        //console.log(`Skipped: ${warnings.length}`);
    }
};