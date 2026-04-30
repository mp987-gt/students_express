import express from 'express';
const router = express.Router();
import db from '../db/connector.js';


// класи 
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

class Song {
  constructor({ title, artist, genre, duration }) {
    if (!title || !title.trim()) {
      throw new ValidationError("Назва пісні не може бути порожньою");
    } else if (!artist || !artist.trim()) {
      throw new ValidationError("Виконавець не може бути порожнім");
    } else if (!genre || !genre.trim()) {
      throw new ValidationError("Жанр не може бути порожнім");
    } else if (!duration) {
      throw new ValidationError("Тривалість обов'язкова");
    }

    const dur = Number(duration);
    if (isNaN(dur) || dur < 1) {
      throw new ValidationError("Тривалість має бути числом більше 0");
    }

    this.title = title.trim();
    this.artist = artist.trim();
    this.genre = genre.trim();
    this.duration = dur;
  }
}

// Головна сторінка 
router.get('/', async function (req, res) {
  try {
    const result = await db.query('SELECT * FROM songs ORDER BY id ASC');
    res.render('spotify', { tracks: result.rows || [] });
  } catch (err) {
    res.status(500).send("Помилка бази даних: " + err.message);
  }
});

// Форма створення
router.get('/create', (req, res) => {
  res.render('forms/spotify_form', { 
    title: 'ADD NEW TRACK', 
    item: {}, 
    isUpdate: false,
    action: '/spotify/create' 
  });
});

// Обробка створення 
router.post('/create', async function (req, res) {
  try {
    const validSong = new Song(req.body);
    const query = `
      INSERT INTO songs (title, artist, genre, duration)
      VALUES ($1, $2, $3, $4)`;
    
    await db.query(query, [
      validSong.title,
      validSong.artist,
      validSong.genre,
      validSong.duration
    ]);
    res.redirect('/spotify');
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(400).send(`Помилка валідації: ${err.message}`);
    }
    res.status(500).send(`Помилка сервера: ${err.message}`);
  }
});

// Форма редагування 
router.get('/update/:id', async function (req, res) {
  try {
    const result = await db.query('SELECT * FROM songs WHERE id = $1', [req.params.id]);
    const item = result.rows[0];

    if (!item) return res.status(404).send("Трек не знайдено");

    res.render('forms/spotify_form', {
      title: 'EDIT TRACK',
      item,
      isUpdate: true,
      action: `/spotify/update/${item.id}`
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Обробка оновлення 
router.post('/update/:id', async function (req, res) {
  try {
    const validSong = new Song(req.body);
    const query = `
      UPDATE songs
      SET title = $1, artist = $2, genre = $3, duration = $4
      WHERE id = $5`;
    
    await db.query(query, [
      validSong.title,
      validSong.artist,
      validSong.genre,
      validSong.duration,
      req.params.id
    ]);
    res.redirect('/spotify');
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(400).send(`Помилка оновлення: ${err.message}`);
    }
    res.status(500).send(err.message);
  }
});

// Видалення
router.get("/delete/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM songs WHERE id = $1", [req.params.id]);
    res.redirect("/spotify");
  } catch (err) {
    res.status(500).send("Не вдалося видалити трек");
  }
});

export default router;