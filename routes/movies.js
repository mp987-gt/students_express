import express from 'express';
const router = express.Router();
import db from '../db/connector.js';
import { MovieValidator, MovieService } from '../controllers/movieController.js'; 

router.get('/', async function(req, res) {
    try {
        const moviesData = await db.query('SELECT * FROM movies ORDER BY id ASC');
        res.render('movies', { movies: moviesData.rows || [] });
    } catch (err) {
        console.error(err);
        res.status(500).send("Помилка завантаження фільмів");
    }
});

router.post('/create', async function(req, res) {
    try {
        new MovieValidator(req.body).validate();
        await new MovieService(req.body).create();
        res.redirect('/movies');
    } catch (err) {
        console.error('Помилка при створенні:', err.message);
        res.status(400).send(`Помилка валідації: ${err.message}. <br><a href="/movies">Назад</a>`);
    }
});

router.get('/edit/:id', async function(req, res) {
    try {
        const result = await db.query('SELECT * FROM movies WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).send("Фільм не знайдено");
        res.render('forms/movies_form', { movie: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).send("Помилка сервера");
    }
});

router.post('/edit/:id', async function(req, res) {
    try {
        new MovieValidator(req.body).validate();
        await new MovieService(req.body).update(req.params.id);
        res.redirect('/movies');
    } catch (err) {
        console.error('Помилка при оновленні:', err.message);
        res.status(400).send(`Помилка оновлення: ${err.message}. <br><a href="/movies/edit/${req.params.id}">Назад</a>`);
    }
});

router.post('/delete/:id', async function(req, res) {
    try {
        await MovieService.delete(req.params.id);
        res.redirect('/movies');
    } catch (err) {
        console.error('Помилка при видаленні:', err.message);
        res.status(500).send("Сталася помилка при видаленні фільму.");
    }
});

export default router;
