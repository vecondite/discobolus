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

const events = new Map<string, (...args: any[]) => any>();

let skips: string[] = [];
let loads: string[] = [];
let unloads: string[] = [];

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
		loads=[];
		skips=[];
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
			skips.push(`[COMMAND] ${cmddir}: Missing command name.`);
		}else if(commands.get(cmd.name) || commands.get(aliases.get(cmd.name)??"")){
			skips.push(`[COMMAND] ${cmddir}: Duplicate command names.`);
		}else if(!cmd.description){
			skips.push(`[COMMAND] ${cmddir}: Missing command description.`);
		}else if(!cmd.usage){
			skips.push(`[COMMAND] ${cmddir}: Missing command usage.`);
		}else if(typeof cmd.execute !== "function") {
			skips.push(`[COMMAND] ${cmddir}: Missing execute function.`);
		}else{
			commands.set(cmd.name, cmd);
			if(cmd.aliases){
				const loadedAliases: string[] = [];

				for (const alias of cmd.aliases) {
					if(aliases.get(alias)){
						skips.push(`Ignored alias "${alias}" of command "${cmd.name}": Duplicate alias names.`);
					}else{
						aliases.set(alias, cmd.name);
						loadedAliases.push(alias);
					}
				}
				
				if(loadedAliases.length==0){
					loads.push(`[COMMAND] ${cmd.name} ( ${cmddir} ) without any aliases`);
				}else{
					loads.push(`[COMMAND] ${cmd.name} ( ${cmddir} ) with aliases [${loadedAliases}]`);
				}
			}else{
				loads.push(`[COMMAND] ${cmd.name} ( ${cmddir} ) without any aliases`);
			}

			if(cmd.name.split(" ").length>1){
				const commandSplit: string[] = cmd.name.split(" ");
				const mainCommand: CommandValue = commands.get(commandSplit[0]!)!;
				const subCommand: CommandValue = commands.get(cmd.name)!;

				if(!mainCommand.subcommands) mainCommand.subcommands=new Map<string, CommandValue>;

				mainCommand.subcommands?.set(cmd.name, subCommand);
			}
		}
	};

	return {skips, loads, unloads};
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
		for(const [key, value] of events){
			bot.off(key, value);
			unloads.push(`[EVENT] ${key} unloaded (refresh).`)
		}
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
			skips.push(`[EVENT] ${eventdir}: Missing event name.`);
		}else if(event.once === undefined){
			skips.push(`${eventdir}: Missing once? boolean.`);
		}else if(typeof event.execute !== "function") {
			skips.push(`[EVENT] ${eventdir}: Missing execute function.`);
		}else{
			const listener = (...args: any[]) => event.execute(bot, ...args);
			event.once ? bot.once(event.name, listener) : bot.on(event.name, listener);
			events.set(event.name, listener);
			loads.push(`[EVENT] ${event.name} ( ${eventdir} ) without any aliases`);
		}
	};

	return {skips, loads, unloads};
}

await loadCommands(true);
await loadEvents(true);

unloads.forEach((unload)=>{
	console.log(`${("[UNLOAD]" as any).brightMagenta} ${unload}`);
});
loads.forEach((load)=>{
	console.log(`${("[LOAD]" as any).brightGreen} ${load}`);
});
skips.forEach((skip)=>{
	console.warn(`${("[SKIP]" as any).brightYellow} ${skip}`);
});

console.log(`Loaded: ${loads.length}`);
console.log(`Skipped: ${skips.length}`);

bot.on("messageCreate", async (msg) => {
	if (msg.author.bot || !msg.content.startsWith(prefix)) return;
//	bot.createMessage(msg.channel.id, `you said ${msg.content}`);
	const args = msg.content.split(" ");
	if(!args[0]) return;
	const command: string = args[0].slice(1);
	args.shift();

	const cmd: CommandValue = commands.get(command) || commands.get(aliases.get(command)??"")!;
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