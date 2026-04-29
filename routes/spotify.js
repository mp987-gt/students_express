import express from 'express';
const router = express.Router();
import db from '../db/connector.js';

// валідація

function validateSongBody({ title, artist, genre, duration }) {
    const errors = [];

    if (!title || !title.trim())
        errors.push('Title is required');
    else if (title.trim().length > 200)
        errors.push('Title must be ≤ 200 characters');

    if (!artist || !artist.trim())
        errors.push('Artist is required');
    else if (artist.trim().length > 200)
        errors.push('Artist must be ≤ 200 characters');

    if (!genre || !genre.trim())
        errors.push('Genre is required');
    else if (genre.trim().length > 100)
        errors.push('Genre must be ≤ 100 characters');

    const dur = Number(duration);
    if (!duration && duration !== 0)
        errors.push('Duration is required');
    else if (!Number.isInteger(dur) || dur < 1 || dur > 86400)
        errors.push('Duration must be a whole number between 1 and 86400 seconds');

    return errors;
}

function validateId(id) {
    const n = Number(id);
    if (!Number.isInteger(n) || n < 1)
        return 'ID must be a positive integer';
    return null;
}

// Головна сторінка
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM songs ORDER BY id ASC');
        res.render('spotify', { tracks: result.rows });
    } catch (err) {
        res.status(500).send("Database Error: " + err.message);
    }
});

// Форма створення
router.get('/create', (req, res) => {
    res.render('forms/spotify_form', { item: {}, isUpdate: false });
});

// Форма редагування
router.get('/update/:id', async (req, res) => {
    const idError = validateId(req.params.id);
    if (idError) return res.status(400).send(idError);

    try {
        const result = await db.query('SELECT * FROM songs WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).send("Track not found");
        res.render('forms/spotify_form', { item: result.rows[0], isUpdate: true });
    } catch (err) {
        res.status(500).send("SQL Error: " + err.message);
    }
});

// Обробка створення
router.post('/create', async (req, res) => {
    const { title, artist, genre, duration } = req.body;

    const errors = validateSongBody({ title, artist, genre, duration });
    if (errors.length > 0) return res.status(400).send(errors.join('<br>'));

    try {
        const query = 'INSERT INTO songs (title, artist, genre, duration) VALUES ($1, $2, $3, $4)';
        await db.query(query, [title.trim(), artist.trim(), genre.trim(), Number(duration)]);
        res.redirect('/spotify');
    } catch (err) {
        res.status(500).send("❌ SQL Error: " + err.message);
    }
});

// Обробка оновлення..
router.post('/update/:id', async (req, res) => {
    const idError = validateId(req.params.id);
    if (idError) return res.status(400).send(idError);

    const { title, artist, genre, duration } = req.body;
    const errors = validateSongBody({ title, artist, genre, duration });
    if (errors.length > 0) return res.status(400).send(errors.join('<br>'));

    try {
        const query = 'UPDATE songs SET title=$1, artist=$2, genre=$3, duration=$4 WHERE id=$5';
        await db.query(query, [title.trim(), artist.trim(), genre.trim(), Number(duration), req.params.id]);
        res.redirect('/spotify');
    } catch (err) {
        res.status(500).send("❌ Update Error: " + err.message);
    }
});

// Видалення
router.get('/delete/:id', async (req, res) => {
    const idError = validateId(req.params.id);
    if (idError) return res.status(400).send(idError);

    try {
        await db.query('DELETE FROM songs WHERE id = $1', [req.params.id]);
        res.redirect('/spotify');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

export default router;