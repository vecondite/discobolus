module.exports = {
    name: "refresh",
    description: "refresh bot commands",
    usage: "refresh",
    async execute(bot, msg, loadCommands){
        loadCommands(`${process.cwd()}/commands`, true, msg);
    }
};