import type { RowDataPacket } from "mysql2";
import {guildPool, initDB} from "./connect.js"

interface WelcomeMessage extends RowDataPacket {
  gid: string;
  cid: string;
  message: string;
}

export async function getMessages(id: string): Promise<WelcomeMessage[]>{
    await initDB();
    const [rows] = await guildPool.execute<WelcomeMessage[]>(
        `
        SELECT * FROM welcome_messages WHERE gid = ?
        `,
        [id]
    );

    return rows;
}

export async function setMessage(message: string, guildId: string, channelId: string): Promise<string>{
    await initDB();

    let output: string;
    
    try{
        await guildPool.execute(
            `
            INSERT INTO welcome_messages (gid, cid, message)
            VALUES (?, ?, ?)
            `,
            [guildId, channelId, message]
        );
        output = `Saved welcome message to be sent in <#${channelId}> as ${message}.`;
    }catch(err){
        console.error(err);
        output = "An error occured while saving the data to the database";
    }

    return output;
}