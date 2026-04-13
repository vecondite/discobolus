import colors from "colors";

import fs from "fs";
import path from "path";

import * as dotenv from "dotenv";
dotenv.config();

import * as Eris from "eris";

const prefix = "%";

const bot: Eris.Client = new Eris.Client(`${process.env.TOKEN!}`, {
	intents: [
		"guilds",
		"guildMessages",
		"messageContent"
	]
});

const commands = new Map();
const aliases = new Map();

let commandPaths: string[] = [];
let warnings: string[] = [];
let passes: string[] = [];

function locateCommands(dir: string){
	const files = fs.readdirSync(dir);

	for(const file of files){
		const fullpath = path.join(dir, file);

		if(fs.statSync(fullpath).isDirectory()){
			locateCommands(fullpath);
		}else if(file.endsWith(".js")){
			commandPaths.push(fullpath);
		}
	}
}

async function loadCommands(cleartoggle: boolean){
	if(cleartoggle){
		commands.clear();
		aliases.clear();
		commandPaths=[];
		passes=[];
		warnings=[];
	}

	locateCommands(`${process.cwd()}/dist/commands`);

	for(const fullpath of commandPaths) {
		const fileUrl = `file://${fullpath}?update=${Date.now()}`;
        const cmdModule = await import(fileUrl);
        const cmd = cmdModule.default || cmdModule;

		let dirs = fullpath.split("/");
		if(dirs.length === 1){
			dirs = fullpath.split("\\");
		}
		const cmddir = dirs.slice(dirs.indexOf("commands")).join("/");

		if(!cmd.name){
			warnings.push(`Skipped loading ${cmddir}. Missing command name.`);
		}else if(commands.get(cmd.name) || commands.get(aliases.get(cmd.name))){
			warnings.push(`Skipped loading ${cmddir}. Duplicate command names.`);
		}else if(!cmd.description){
			warnings.push(`Skipped loading ${cmddir}. Missing command description.`);
		}else if(!cmd.usage){
			warnings.push(`Skipped loading ${cmddir}. Missing command usage.`);
		}else if(typeof cmd.execute !== "function") {
			warnings.push(`Skipped loading ${cmddir}. Missing execute function.`);
		}else{
			commands.set(cmd.name, cmd);
			if(cmd.aliases){
				passes.push(`Loaded command: ${cmd.name} ( ${cmddir} ) with aliases [${cmd.aliases}]`);

				for (const alias of cmd.aliases) {
					aliases.set(alias, cmd.name);
				}
			}else{
				passes.push(`Loaded command: ${cmd.name} ( ${cmddir} ) without any aliases`);
			}
		}
	};

	return {warnings, passes};
}

bot.on("ready", async () => {
	await loadCommands(true);

	passes.forEach((pass)=>{
		console.log(`${("[S]" as any).brightGreen} ${pass}`);
	});
	warnings.forEach((warning)=>{
		console.warn(`${("[!]" as any).brightYellow} ${warning}`);
	});

	console.log(`Loaded: ${passes.length}`);
	console.log(`Skipped: ${warnings.length}`);

	console.log(`${colors.blue(bot.user.username + "#" + bot.user.discriminator)} is ready to run with ${passes.length+warnings.length} commands detected.`);
});

bot.on("messageCreate", async (msg) => {
	if (msg.author.bot || !msg.content.startsWith(prefix)) return;
//	bot.createMessage(msg.channel.id, `you said ${msg.content}`);
	const args = msg.content.split(" ");
	if(!args[0]) return;
	const command = args[0].slice(1);
	args.shift();

	const cmd = commands.get(command) || commands.get(aliases.get(command));
	if(!cmd) return bot.createMessage(msg.channel.id, `command \`${command}\` not recognized.`);

	if(commands.get(command) && command=="help"){
		cmd.execute(bot, msg, args, commands, aliases, prefix);
	}else if(commands.get(command) && command=="refresh"){
		cmd.execute(bot, msg, loadCommands);
	}else{
		await cmd.execute(bot, msg, args);
	}
});

bot.connect()