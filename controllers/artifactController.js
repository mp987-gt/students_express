import pool from '../db/connector.js';

// Get all artifacts
export const getAllArtifacts = async () => {
    try {
        const res = await pool.query("SELECT * FROM artifacts ORDER BY id ASC");
        return res.rows;
    } catch (err) {
        console.error("Error fetching artifacts:", err.message);
        throw err;
    }
};

// Create a new artifact
export const addArtifact = async (data) => {
    try {
        const query = `
            INSERT INTO artifacts 
            (name, origin_anomaly, rarity, radiation_level, weight, market_value, stalker_owner, properties_notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
            RETURNING *`;

        const values = [
            data.name,
            data.origin_anomaly,
            data.rarity || 'Common',
            parseFloat(data.radiation_level) || 0,
            parseFloat(data.weight) || 0,
            parseInt(data.market_value) || 0,
            data.stalker_owner,
            data.properties_notes
        ];

        const res = await pool.query(query, values);
        return res.rows[0];
    } catch (err) {
        console.error("Error creating artifact:", err.message);
        throw err;
    }
};

// Update artifact fields
export const updateArtifact = async (id, updateData) => {
    try {
        const query = `
            UPDATE artifacts 
            SET market_value = $1, stalker_owner = $2, properties_notes = $3
            WHERE id = $4 
            RETURNING *`;

        const values = [
            parseInt(updateData.market_value) || 0,
            updateData.stalker_owner,
            updateData.properties_notes,
            id
        ];

        const res = await pool.query(query, values);

        if (res.rows.length === 0) throw new Error("Artifact not found");
        return res.rows[0];
    } catch (err) {
        console.error("Error updating artifact:", err.message);
        throw err;
    }
};

// Delete artifact
export const deleteArtifact = async (id) => {
    try {
        const res = await pool.query(
            "DELETE FROM artifacts WHERE id = $1 RETURNING *",
            [id]
        );

        if (res.rows.length === 0) throw new Error("Artifact not found");
        return res.rows[0];
    } catch (err) {
        console.error("Error deleting artifact:", err.message);
        throw err;
    }
};
