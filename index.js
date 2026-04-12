var colors = require('colors');

const fs = require("fs");
const path = require("path");

require('dotenv').config();

const Eris = require("eris");
const { dir } = require('console');
const prefix = "%";

const bot = new Eris(`${process.env.TOKEN}`, {
	intents: [
		"guilds",
		"guildMessages",
		"messageContent"
	]
});

const commands = new Map();
const aliases = new Map();

let loaded = 0;
let skipped = 0;
let sendString = "";

function loadCommands(dir, cleartoggle, msg){
	if(cleartoggle){
		commands.clear();
		aliases.clear();
		loaded=0;
		skipped=0;
		sendString="";
	}

	const files = fs.readdirSync(dir);

	for(const file of files){
		const fullpath = path.join(dir, file);

		if(fs.statSync(fullpath).isDirectory()){
			loadCommands(fullpath, false);
			continue;
		}

		const cmd = require(fullpath);
		const dirs = fullpath.split("/");
		const cmddir = dirs.slice(dirs.indexOf("commands")).join("/");

		if(!cmd.name){
			let warning=`${colors.brightYellow("[!]")} Skipped loading ${cmddir}. Missing command name.`;
			sendUpdate(msg, warning);
			console.warn(warning); 
			skipped++;
		}else if(commands.get(cmd.name) || commands.get(aliases.get(cmd.name))){
			let warning=`${colors.brightYellow("[!]")} Skipped loading ${cmddir}. Duplicate command names.`;
			sendUpdate(msg, warning);
			console.warn(warning); 
			skipped++;
		}else if(!cmd.description){
			let warning=`${colors.brightYellow("[!]")} Skipped loading ${cmddir}. Missing command description.`;
			sendUpdate(msg, warning);
			console.warn(warning); 
			skipped++;
		}else if(!cmd.usage){
			let warning=`${colors.brightYellow("[!]")} Skipped loading ${cmddir}. Missing command usage.`;
			sendUpdate(msg, warning);
			console.warn(warning); 
			skipped++;
		}else if(typeof cmd.execute !== "function") {
			let warning=`${colors.brightYellow("[!]")} Skipped loading ${cmddir}. Missing execute function.`;
			sendUpdate(msg, warning);
			console.warn(warning); 
			skipped++;
		}else{
			commands.set(cmd.name, cmd);
			if(cmd.aliases){
				console.log(`${colors.brightGreen("[S]")} Loaded command: ${cmd.name} ( ${cmddir} ) with aliases [${cmd.aliases}]`);

				for (const alias of cmd.aliases) {
					aliases.set(alias, cmd.name);
				}
			}else{
				console.log(`${colors.brightGreen("[S]")} Loaded command: ${cmd.name} ( ${cmddir} ) without any aliases`);
			}
			loaded++;
		}
	}
}

async function sendUpdate(msg, content){
	if (msg) bot.createMessage(msg.channel.id, content);
}

bot.on("ready", () => {
	loadCommands(`${process.cwd()}/commands`, true);
	console.log(`${colors.blue(bot.user.username + "#" + bot.user.discriminator)} is ready to run with ${loaded+skipped} commands detected.`);
	console.log(`Loaded: ${loaded}`);
	console.log(`Skipped: ${skipped}`);
});

bot.on("messageCreate", async (msg) => {
	if (msg.author.bot || !msg.content.startsWith(prefix)) return;
	bot.createMessage(msg.channel.id, `you said ${msg.content}`);

	const args = msg.content.split(" ");
	const command = args[0].slice(1);
	args.shift();

	const cmd = commands.get(command) || commands.get(aliases.get(command));
	if(!cmd) return bot.createMessage(msg.channel.id, `command \`${command}\` not recognized.`);

	if(commands.get(command) && command=="help"){
		cmd.execute(bot, msg, args, commands, aliases, prefix);
	}if(commands.get(command) && command=="refresh"){
		cmd.execute(bot, msg, loadCommands);
	}else{
		await cmd.execute(bot, msg, args);
	}
});

bot.connect()
