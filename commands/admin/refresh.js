const colors = require("colors");

module.exports = {
    name: "refresh",
    description: "refresh bot commands",
    usage: "refresh",
    async execute(bot, msg, loadCommands){
        let updates = "";
        const { warnings, passes } = loadCommands(true);
        passes.forEach((pass)=>{
            console.log(`${colors.brightGreen("[S]")} ${pass}`);
            updates+=`${pass}\n`;
        });
        warnings.forEach((warning)=>{
            console.warn(`${colors.brightYellow("[!]")} ${warning}`);
            updates+=`${warning}\n`;
        });
        bot.createMessage(msg.channel.id, `\`\`\`${updates}\`\`\``);
        console.log(`Loaded: ${passes.length}`);
        console.log(`Skipped: ${warnings.length}`);
    }
};