import Eris from "eris";
import { getMessage } from "@discobolus/db";

export default {
    name: "guildMemberAdd",
    once: false,
    async execute(bot: Eris.Client, guild: Eris.Guild, member: Eris.Member){
        const messages: any = await getMessage(guild.id);
        console.log(messages);
        await bot.createMessage("1492781559718088725", `<@${member.user.id}> just joined the server!`);
    }
};