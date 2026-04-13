import Eris from "eris";

export default {
    name: "ping",
    aliases: [
        "stats",
        "bussin"
    ],
    description: "basic stats of the bot",
    usage: "ping",
    async execute(bot: Eris.Client, msg: Eris.Message, args: string[]){
        bot.createMessage(msg.channel.id, `your message was \`${msg.content}\`. i could recognize the following arguments: \`[${args}]\``);
    }
};