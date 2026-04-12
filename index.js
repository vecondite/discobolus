require('dotenv').config()
const Eris = require("eris");
const prefix = "%";

const bot = new Eris(`${process.env.TOKEN}`, {
	intents: [
		"guilds",
		"guildMessages",
		"messageContent"
	]
});

bot.on("ready", () => {
	console.log(`${bot.user.username} is ready!`);
});

bot.on("messageCreate", (msg) => {
	if (msg.author.bot || !msg.content.startsWith(prefix)) return;
	bot.createMessage(msg.channel.id, `you said ${msg.content}`);
});

bot.connect();
