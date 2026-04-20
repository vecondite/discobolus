import mysql from "mysql2";

const baseConfig = {
  host: process.env.HOST!,
  user: process.env.USERNAME!,
  password: process.env.PASSWORD!,
};

const mainPool = mysql.createPool({
  host: process.env.HOST!,
  user: process.env.USERNAME!,
  password: process.env.PASSWORD!,
}).promise();

export const guildPool = mysql.createPool({
    ...baseConfig,
    database: "guilds",
}).promise();

export async function initDB(){
    await mainPool.query(`CREATE DATABASE IF NOT EXISTS guilds`);
    await guildPool.query(`
        CREATE TABLE IF NOT EXISTS welcome_messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            gid VARCHAR(20),
            cid VARCHAR(20),
            message TEXT
        )
    `)
};