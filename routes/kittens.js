import express from 'express';
import Kitten from '../models/kittens.js';
const router = express.Router();
import db from '../db/connector.js'; 


router.get('/', async (req, res) => {
  try {
    const kittens = await Kitten.getAll(); 
    res.render('kittens', { kittens });
  } catch (error) {
    console.error(error);
    res.status(500).send('Помилка завантаження сторінки');
  }
});


router.post('/', async (req, res) => {
  try {
    await Kitten.create(req.body);
    res.redirect('/kittens');
  } catch (error) {
    if (error.field) {
      res.status(400).send(`Помилка: ${error.message}`);
    } else {
      res.status(500).send('Помилка збереження');
    }
  }
});

router.get('/edit/:id', async (req, res) => {
  try {
    const kittens = await Kitten.getAll(); 
    const editingKitten = await Kitten.getById(req.params.id); 
    
    if (!editingKitten) return res.status(404).send('Не знайдено');
    
    res.render('kittens', { kittens, editingKitten });
  } catch (error) {
    res.status(500).send('Помилка сервера');
  }
});

router.post('/edit/:id', async (req, res) => {
  try {
    await Kitten.update(req.params.id, req.body);
    res.redirect('/kittens');
  } catch (error) {
    if (error.field) {
      res.status(400).send(`Помилка: ${error.message}`);
    } else {
      res.status(500).send('Помилка оновлення');
    }
  }
});

router.get('/delete/:id', async (req, res) => {
  try {
    await Kitten.delete(req.params.id);
    res.redirect('/kittens');
  } catch (error) {
    res.status(500).send('Помилка видалення');
  }
});

export default router;