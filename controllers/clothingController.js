import pool from '../db/connector.js';

export const getAllClothing = async () => {
    const res = await pool.query("SELECT * FROM clothing ORDER BY id ASC");
    return res.rows;
};

export const addClothingItem = async (data) => {
    const query = `
        INSERT INTO clothing (type, brand, size, price, stock_quantity) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING *`;
    
    const values = [data.type, data.brand, data.size, data.price, data.stock];
    const res = await pool.query(query, values);
    return res.rows[0];
};

export const deleteClothingItem = async (id) => {
    await pool.query("DELETE FROM clothing WHERE id = $1", [id]);
};
