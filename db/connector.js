import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DB_URL,
});

const createTableQueries = [];

createTableQueries.push(`
 CREATE TABLE IF NOT EXISTS SLONIKI (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    age TEXT NOT NULL,
    place_of_birth TEXT NOT NULL,           
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
      `);
createTableQueries.push(`
 CREATE TABLE IF NOT EXISTS deadSpace (
    id SERIAL PRIMARY KEY,
    name_of_gun TEXT NOT NULL UNIQUE,
    damage_type TEXT NOT NULL,
    damage_dealth TEXT NOT NULL,
    reload_seconds TEXT NOT NULL,
    additional_info TEXT NOT NULL,           
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
      `);
for await (const query of createTableQueries) {
    try {
        console.log(query.slice(0, query.indexOf('(')).trim()+"...")
        await pool.query(query);
    } catch(err) {
        console.error("query execution error: ", err.message);
    }
}

console.log("CONNECTED!!!!!✅ ")

export default pool;
