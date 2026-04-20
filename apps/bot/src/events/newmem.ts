import Eris from "eris";
import { getMessages } from "@discobolus/db";

export default {
    name: "guildMemberAdd",
    once: false,
    async execute(bot: Eris.Client, guild: Eris.Guild, member: Eris.Member){
        const welcomes = await getMessages(guild.id);

        if(welcomes.length===0){
            return;
        }

        for(const welcome of welcomes){
            const formattedMessage: string = welcome.message.replaceAll(`{user}`, `<@${member.user.id}>`)
            await bot.createMessage(welcome.cid, `${formattedMessage}`);
        }
    }
};