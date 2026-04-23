import pool from '../db/index.js';

export const getAllClothing = async () => {
    const res = await pool.query("SELECT * FROM clothing ORDER BY id");
    return res.rows;
};

export const addClothingItem = async (data) => {
    const query = `
        INSERT INTO clothing
        (name, brand, category, size, color, price, material, stock_quantity)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`;
    const values = [data.name, data.brand, data.category, data.size, data.color, data.price, data.material, data.quantity];
    const res = await pool.query(query, values);
    return res.rows[0];
};

export const deleteClothingItem = async (id) => {
    await pool.query("DELETE FROM clothing WHERE id = $1", [id]);
};
