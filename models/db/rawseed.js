import pg from "pg";
import fs from "fs/promises";
import path from "path";

const { Client } = pg;

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

function getDate() {
    const now = new Date();
    const pad = (num) => num.toString().padStart(2, "0");
    const YYYY = now.getFullYear();
    const MM = pad(now.getMonth() + 1);
    const DD = pad(now.getDate());
    const HH = pad(now.getHours());
    const MN = pad(now.getMinutes());
    const SS = pad(now.getSeconds());
    const dateString = `${YYYY}${MM}${DD}${HH}${MN}${SS}`;
    return dateString;
}

async function writeJson(dir, fileName, data) {
    const filePath = path.join(dir, fileName);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
    console.log(`Wrote ${filePath}`);
}

async function backupTable(dir, tableName, fileName) {
    const result = await client.query(`SELECT * FROM ${tableName}`);
}
