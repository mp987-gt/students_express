import express from 'express';
const router = express.Router();
import db from '../db/connector.js';

class Validator {
  name(name) {
    if (!name || name.length < 2) return false;
    if (!/^[A-Za-zA-Яа-яІіЇїЄє]/.test(name)) return false;
    if (!/^[A-Za-zA-Яа-яIiЇїЄє0-9\s\-:.!]+$/.test(name)) return false;
    return true;
  }

  age(age) {
    const num = Number(age);
    return !isNaN(num) && num >= 0 && num <= 150;
  }

  country(country) {
    if (!country || country.length < 2) return false;
    if (!/^[A-Za-zA-Яа-яІіЇїЄє]/.test(country)) return false;
    if (!/^[A-Za-zA-Яа-яIiЇїЄє0-9\s\-:.!]+$/.test(country)) return false;
    return true;
  }

  all(name, age, country) {
    return this.name(name) && this.age(age) && this.country(country);
  }
}

class PresidentService {
  async getAll() {
    const result = await db.query('SELECT * FROM president ORDER BY id ASC');
    return result.rows.map(p => ({
      ...p,
      created_at: p.created_at.toLocaleDateString()
    }));
  }

  async getById(id) {
    const result = await db.query('SELECT * FROM president WHERE id = $1', [id]);
    return result.rows[0];
  }

  async create(name, age, country) {
    await db.query('INSERT INTO president (name, age, country) VALUES ($1, $2, $3)', [name, age, country]);
  }

  async update(id, name, age, country) {
    const result = await db.query(
      'UPDATE president SET name = $2, age = $3, country = $4 WHERE id = $1 RETURNING *',
      [id, name, age, country]
    );
    return result.rows[0];
  }

  async delete(id) {
    const result = await db.query('DELETE FROM president WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
}

const validator = new Validator();
const presidentService = new PresidentService();

router.get('/', async (req, res, next) => {
  try {
    const president = await presidentService.getAll();
    res.render('president', { president });
  } catch (err) {
    next(err);
  }
});

router.get('/create', (req, res) => {
  res.render('forms/president_form', { action: '/president/create', president: {} });
});

router.post('/create', async (req, res, next) => {
  const name = req.body.name?.trim();
  const age = req.body.age;
  const country = req.body.country?.trim();

  if (!validator.all(name, age, country)) {
    return res.status(400).send("Validation failed");
  }

  try {
    await presidentService.create(name, age, country);
    res.redirect('/president');
  } catch (err) {
    next(err);
  }
});

router.get('/update/:id', async (req, res, next) => {
  try {
    const president = await presidentService.getById(req.params.id);
    res.render('forms/president_form', { action: `/president/update/${req.params.id}`, president });
  } catch (err) {
    next(err);
  }
});

router.post('/update/:id', async (req, res, next) => {
  const id = req.params.id;
  const name = req.body.name?.trim();
  const age = req.body.age;
  const country = req.body.country?.trim();

  if (!validator.all(name, age, country)) {
    return res.status(400).send("Validation failed");
  }

  try {
    const updated = await presidentService.update(id, name, age, country);
    console.log("president was updated:", updated);
    res.redirect('/president');
  } catch (err) {
    next(err);
  }
});

router.get('/delete/:id', async (req, res, next) => {
  try {
    const deleted = await presidentService.delete(req.params.id);
    console.log("president was deleted:", deleted);
    res.redirect('/president');
  } catch (err) {
    next(err);
  }
});

export default router;