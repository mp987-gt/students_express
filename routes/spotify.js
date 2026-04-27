import express from 'express';
const router = express.Router();
import db from '../db/connector.js';
import { body, validationResult } from 'express-validator';

// валідація
const songValidationRules = [
    body('title')
        .trim()
        .notEmpty().withMessage('Назва треку обовʼязкова')
        .isLength({ max: 100 }).withMessage('Назва не може перевищувати 100 символів'),

    body('artist')
        .trim()
        .notEmpty().withMessage('Виконавець обовʼязковий')
        .isLength({ max: 100 }).withMessage('Виконавець не може перевищувати 100 символів'),

    body('genre')
        .trim()
        .notEmpty().withMessage('Жанр обовʼязковий'),

    body('duration')
        .notEmpty().withMessage('Тривалість обовʼязкова')
        .isInt({ min: 1, max: 3600 }).withMessage('Тривалість має бути числом від 1 до 3600 секунд'),
];

// перевірка
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const isUpdate = req.path.startsWith('/update');
        return res.status(422).render('forms/spotify_form', {
            item: req.body,
            isUpdate,
            errors: errors.array(),
        });
    }
    next();
};

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
    res.render('forms/spotify_form', { item: {}, isUpdate: false, errors: [] });
});

// Форма редагування
router.get('/update/:id', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM songs WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).send("Track not found");
        res.render('forms/spotify_form', { item: result.rows[0], isUpdate: true, errors: [] });
    } catch (err) {
        res.status(500).send("SQL Error: " + err.message);
    }
});

// Обробка створення 
router.post('/create', songValidationRules, validate, async (req, res) => {
    const { title, artist, genre, duration } = req.body;
    try {
        await db.query(
            'INSERT INTO songs (title, artist, genre, duration) VALUES ($1, $2, $3, $4)',
            [title, artist, genre, duration]
        );
        res.redirect('/spotify');
    } catch (err) {
        res.status(500).send("❌ SQL Error: " + err.message);
    }
});

// Обробка оновлення 
router.post('/update/:id', songValidationRules, validate, async (req, res) => {
    const { title, artist, genre, duration } = req.body;
    try {
        await db.query(
            'UPDATE songs SET title=$1, artist=$2, genre=$3, duration=$4 WHERE id=$5',
            [title, artist, genre, duration, req.params.id]
        );
        res.redirect('/spotify');
    } catch (err) {
        res.status(500).send("❌ Update Error: " + err.message);
    }
});

// Видалення
router.get('/delete/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM songs WHERE id = $1', [req.params.id]);
        res.redirect('/spotify');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

export default router;