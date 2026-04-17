import {guildPool, initDB} from "./connect.js"

export async function getMessage(id: string){
    await initDB();
    const [rows] = await guildPool.query(
        "SELECT * FROM welcome_messages WHERE gid = ?",
        [id]
    );

    return rows;
}