import colors from "colors";

import fs from "fs";
import path from "path";

import * as dotenv from "dotenv";
dotenv.config({path: "./.env"});

import type { CommandContext, CommandValue } from "./commands/types.js";

import * as Eris from "eris";

const prefix = "%";

const bot: Eris.Client = new Eris.Client(`${process.env.TOKEN!}`, {
	intents: [
		"guilds",
		"guildMessages",
		"guildMembers",
		"messageContent"
	]
});

const commands = new Map<string, CommandValue>();
const aliases = new Map<string, string>();

let warnings: string[] = [];
let passes: string[] = [];

let commandPaths: string[] = [];

function locateCommands(dir: string){
	const files = fs.readdirSync(dir);

	for(const file of files){
		const fullpath = path.join(dir, file);

		if(fs.statSync(fullpath).isDirectory()){
			locateCommands(fullpath);
		}else if(file.endsWith(".js") || ( file.endsWith(".ts") && !file.endsWith("d.ts"))){
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

	
	const isTS = import.meta.url.endsWith('.ts');
	const commandsDir = isTS ? path.join(process.cwd(), "apps", "bot", "src", "commands") : path.join(process.cwd(), "apps", "bot", "dist", "commands");
	locateCommands(commandsDir);

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
			warnings.push(`[COMMAND] ${cmddir}. Missing command name.`);
		}else if(commands.get(cmd.name) || commands.get(aliases.get(cmd.name)??"")){
			warnings.push(`[COMMAND] ${cmddir}. Duplicate command names.`);
		}else if(!cmd.description){
			warnings.push(`[COMMAND] ${cmddir}. Missing command description.`);
		}else if(!cmd.usage){
			warnings.push(`[COMMAND] ${cmddir}. Missing command usage.`);
		}else if(typeof cmd.execute !== "function") {
			warnings.push(`[COMMAND] ${cmddir}. Missing execute function.`);
		}else{
			commands.set(cmd.name, cmd);
			if(cmd.aliases){
				const loadedAliases: string[] = [];

				for (const alias of cmd.aliases) {
					if(aliases.get(alias)){
						warnings.push(`Ignored alias "${alias}" of command "${cmd.name}": Duplicate alias names.`);
					}else{
						aliases.set(alias, cmd.name);
						loadedAliases.push(alias);
					}
				}
				
				if(loadedAliases.length==0){
					passes.push(`[COMMAND] ${cmd.name} ( ${cmddir} ) without any aliases`);
				}else{
					passes.push(`[COMMAND] ${cmd.name} ( ${cmddir} ) with aliases [${loadedAliases}]`);
				}
			}else{
				passes.push(`[COMMAND] ${cmd.name} ( ${cmddir} ) without any aliases`);
			}
		}
	};

	return {warnings, passes};
}

let eventPaths: string[] = [];

function locateEvents(dir: string){
	const files = fs.readdirSync(dir);

	for(const file of files){
		const fullpath = path.join(dir, file);

		if(fs.statSync(fullpath).isDirectory()){
			locateEvents(fullpath);
		}else if(file.endsWith(".js") || ( file.endsWith(".ts") && !file.endsWith("d.ts"))){
			eventPaths.push(fullpath);
		}
	}
}

async function loadEvents(cleartoggle: boolean){
	if(cleartoggle){
		eventPaths=[];
	}

	const isTS = import.meta.url.endsWith('.ts');
	const eventsDir = isTS ? path.join(process.cwd(), "apps", "bot", "src", "events") : path.join(process.cwd(), "apps", "bot", "dist", "events");
	locateEvents(eventsDir);

	for(const fullpath of eventPaths) {
		const fileUrl = `file://${fullpath}?update=${Date.now()}`;
        const eventModule = await import(fileUrl);
        const event = eventModule.default || eventModule;

		let dirs = fullpath.split("/");
		if(dirs.length === 1){
			dirs = fullpath.split("\\");
		}
		const eventdir = dirs.slice(dirs.indexOf("events")).join("/");

		if(!event.name){
			warnings.push(`[EVENT] ${eventdir}. Missing event name.`);
		}else if(event.once === undefined){
			warnings.push(`${eventdir}. Missing once? boolean.`);
		}else if(typeof event.execute !== "function") {
			warnings.push(`[EVENT] ${eventdir}. Missing execute function.`);
		}else{
			event.once ? bot.once(event.name, (...args) => event.execute(bot, ...args)) : bot.on(event.name, (...args) => event.execute(bot, ...args));
			passes.push(`[EVENT] ${event.name} ( ${eventdir} ) without any aliases`);
		}
	};

	return {warnings, passes};
}

await loadCommands(true);
await loadEvents(true);

passes.forEach((pass)=>{
	console.log(`${("[LOAD]" as any).brightGreen} ${pass}`);
});
warnings.forEach((warning)=>{
	console.warn(`${("[SKIP]" as any).brightYellow} ${warning}`);
});

console.log(`Loaded: ${passes.length}`);
console.log(`Skipped: ${warnings.length}`);

bot.on("messageCreate", async (msg) => {
	if (msg.author.bot || !msg.content.startsWith(prefix)) return;
//	bot.createMessage(msg.channel.id, `you said ${msg.content}`);
	const args = msg.content.split(" ");
	if(!args[0]) return;
	const command = args[0].slice(1);
	args.shift();

	const cmd = commands.get(command) || commands.get(aliases.get(command)??"");
	if(!cmd) return bot.createMessage(msg.channel.id, `command \`${command}\` not recognized.`);

	const ctx: CommandContext = {
		bot,
		msg,
		args,
		commands,
		aliases,
		prefix,
		loadCommands,
		loadEvents
	}

	await cmd.execute(ctx);
});

bot.connect()