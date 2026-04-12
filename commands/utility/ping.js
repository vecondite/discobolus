module.exports = {
    name: "ping",
    aliases: [
        "stats",
        "bussin"
    ],
    description: "basic stats of the bot",
    usage: "ping",
    async execute(bot, msg, args){
        bot.createMessage(msg.channel.id, `your message was \`${msg.content}\`. i could recognize the following arguments: \`[${args}]\``);
    }
};