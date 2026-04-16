import Eris from "eris";
import colors from "colors";

export default {
    name: "ready",
    async execute(bot: Eris.Client){
        console.log(`${colors.blue(bot.user.username + "#" + bot.user.discriminator)} is ready to run.`);
    }
};