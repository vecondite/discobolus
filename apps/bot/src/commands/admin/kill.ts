import Eris from "eris";

export default {
    name: "kill",
    aliases: [
        "shutdown",
    ],
    description: "kill the bot process",
    usage: "ping",
    async execute(bot: Eris.Client, msg: Eris.Message, args: string[]){
        await bot.createMessage(msg.channel.id, `\`\`\`Killing bot process.\`\`\``);
        process.exit();
    }
};