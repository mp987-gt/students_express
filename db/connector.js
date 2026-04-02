import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false
    }
});

const createTableQueries = [];
createTableQueries.push(`
    CREATE TABLE IF NOT EXISTS heroes (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,              
        primary_attribute TEXT,        
        role TEXT,       
        attack_type TEXT,          
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`);
createTableQueries.push(`
 CREATE TABLE IF NOT EXISTS sloniki (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    age TEXT NOT NULL,
    place_of_birth TEXT NOT NULL,           
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
      `);
createTableQueries.push(`
    CREATE TABLE IF NOT EXISTS product (
    id SERIAL PRIMARY KEY,
    barcode TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    price INT,
    quantity INT
    );
  `);

createTableQueries.push(`
<<<<<<< HEAD
    CREATE TABLE IF NOT EXISTS street_food (
    id SERIAL PRIMARY KEY,
    food_name TEXT NOT NULL,
    country TEXT NOT NULL,
    spicy_level INTEGER CHECK (spicy_level BETWEEN 0 AND 10),
    price NUMERIC(6,2),
    rating INTEGER CHECK (rating BETWEEN 1 AND 10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `)
createTableQueries.push(`
    CREATE TABLE IF NOT EXISTS SLONIKI (
=======
 CREATE TABLE IF NOT EXISTS deadSpace (
>>>>>>> 92b4e9dcbf4f6b2468e87a5878e999b8ace7f40a
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
        console.log(query.slice(0, query.indexOf('(')).trim() + "...")
        await pool.query(query);
    } catch (err) {
        console.error("query execution error: ", err.message);
    }
}

console.log("CONNECTED!!!!!✅ ")
<<<<<<< HEAD

export default pool;
=======
      
export default pool;
>>>>>>> 92b4e9dcbf4f6b2468e87a5878e999b8ace7f40a
