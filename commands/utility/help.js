module.exports = {
    name: "help",
    description: "usage of all commands of the bot",
    usage: "help [command]",
    async execute(bot, msg, args, commands, aliases, prefix){
        for(const [cmd, name] of commands){
            console.log(cmd);
        }

        //bot.createMessage(msg.channel.id)
    }
};