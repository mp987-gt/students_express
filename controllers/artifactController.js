import pool from '../db/connector.js';

// 1. Отримати всі артефакти (READ)
export const getAllArtifacts = async () => {
    try {
        const res = await pool.query("SELECT * FROM artifacts ORDER BY id ASC");
        return res.rows;
    } catch (err) {
        console.error("Помилка при отриманні списку:", err.message);
        throw err;
    }
};

// 2. Додати новий артефакт (CREATE)
export const addArtifact = async (data) => {
    try {
        const query = `
            INSERT INTO artifacts 
            (name, origin_anomaly, rarity, radiation_level, weight, market_value, stalker_owner, properties_notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
            RETURNING *`;
        
        const values = [
            data.name, 
            data.anomaly, 
            data.rarity || 'Common', 
            data.rad || 0, 
            data.weight || 0, 
            data.value || 0, 
            data.owner, 
            data.notes
        ];

        const res = await pool.query(query, values);
        return res.rows[0];
    } catch (err) {
        console.error("Помилка при додаванні:", err.message);
        throw err;
    }
};

// 3. Оновити дані артефакту (UPDATE)
// Наприклад, змінити ціну або власника
export const updateArtifact = async (id, updateData) => {
    try {
        const query = `
            UPDATE artifacts 
            SET market_value = $1, stalker_owner = $2, properties_notes = $3
            WHERE id = $4 
            RETURNING *`;
        
        const values = [updateData.value, updateData.owner, updateData.notes, id];
        const res = await pool.query(query, values);
        
        if (res.rows.length === 0) throw new Error("Артефакт не знайдено");
        return res.rows[0];
    } catch (err) {
        console.error("Помилка при оновленні:", err.message);
        throw err;
    }
};

// 4. Видалити артефакт (DELETE)
export const deleteArtifact = async (id) => {
    try {
        const res = await pool.query("DELETE FROM artifacts WHERE id = $1 RETURNING *", [id]);
        if (res.rows.length === 0) throw new Error("Об'єкт для видалення не знайдено");
        return res.rows[0];
    } catch (err) {
        console.error("Помилка при видаленні:", err.message);
        throw err;
    }
};
