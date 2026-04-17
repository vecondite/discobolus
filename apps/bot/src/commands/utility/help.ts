import Eris from "eris";
import {type CommandContext, type CommandValue} from "../types.js";

export default {
    name: "help",
    description: "usage of all commands of the bot",
    usage: "help [command]",
    async execute(ctx: CommandContext){
        const {bot, msg, args, commands, aliases, prefix} = ctx;
        let output: string;

        if(args.length==0){
            let commandList="";

            for(const [name, command] of commands){
                if(!command.aliases){
                    commandList+=`${name}\n`;
                }else{
                    commandList+=`${name} (${command.aliases})\n`
                }
            }

            output = `List of commands:\`\`\`\n${commandList}\`\`\`\nMore Help:\`\`\`${prefix}help <command>\`\`\``;
        }else{
            if(!args[0]) return;
            
            const command = commands.get(args[0]) || commands.get(aliases.get(args[0]) ?? "");
            if(!command){
                output = `Command not found. For a list of commands: \`\`\`${prefix}help\`\`\``
            }else{
                if(command.aliases){
                    output = `# ${command.name}\nAliases:\n\`\`\`${command.aliases}\`\`\`\nDescription:\`\`\`${command.description}\`\`\`\nUsage: \`\`\`${prefix}${command.usage}\`\`\``
                }else{
                    output = `# ${command.name}\nDescription:\`\`\`${command.description}\`\`\`\nUsage: \`\`\`${prefix}${command.usage}\`\`\``
                }
            }
        }

        bot.createMessage(msg.channel.id, output);
    }
};