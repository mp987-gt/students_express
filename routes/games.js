import express from 'express';
const router = express.Router();
import db from '../db/connector.js';

class gamesRouter {
  constructor() {
    this.router = express.Router();
    this.regexName = /^[A-Z0-9][a-zA-Z0-9\s\-:!._]*$/;
    this.regexMode = /^(Online|Offline|Both)$/;
    this.regexCost = /^([0-9][0-9]*[$])$/;
    this.initRoutes();
  }

  initRoutes() {
    this.router.get('/', this.getAll.bind(this));
    this.router.get('/create', this.getCreateForm.bind(this));
    this.router.post('/create', this.create.bind(this));
    this.router.get('/update/:id', this.getUpdateForm.bind(this));
    this.router.post('/update/:id', this.update.bind(this));
    this.router.get('/delete/:id', this.delete.bind(this));
  }

  validate(name, mode, cost, res) {
    if (this.regexName.test(name)) {
      res.status(400).send("Invalid game name: use only letters, numbers, spaces and -:!._ — must start with a capital letter or number (English only)");
    }
    if (this.regexMode.test(mode)) {
      res.status(400).send("Invalid game mode: use exactly Online, Offline or Both");
    }
    if (this.regexCost.test(cost)) {
      res.status(400).send("Invalid game cost: use numbers with $ at the end (e.g. 0$ for free)");
    }
    return true;
  }

  async getAll(req, res, next) {
    const games = await db.query('SELECT * FROM games_info');
    const rowGames = games.rows.map(w => ({
      ...w,
      created_at: w.created_at.toLocaleDateString()
    }));
    res.render('games', { games: rowGames || [] });
  }

  async getCreateForm(req, res, next) {
    res.render('forms/games_form');
  }

  async create(req, res, next) {

    const { name, mode, cost } = req.body;
    if (!this.validate(name, mode, cost, res)) return;

    const query = `
      INSERT INTO games_info (game_name, game_mode, cost)
      VALUES ($1, $2, $3)
    `;

    try {
      const result = await db.query(query, [name, mode, cost]);
    } catch (err) {
      console.error('Error:', err.message);
    }

    res.redirect('/games');
  }

  async getUpdateForm(req, res, next) {
    res.render('forms/games_form');
  }

  async update(req, res, next) {

    const { id } = req.params;
    const { name, mode, cost } = req.body;
    if (!this.validate(name, mode, cost, res)) return;

    const query = `
      UPDATE games_info SET 
        game_name = $2,
        game_mode = $3,
        cost = $4
        WHERE id = $1
        `;

    try {
      const result = await db.query(query, [id, name, mode, cost]);
    } catch (err) {
      console.error('Error:', err.message);
    }

    res.redirect('/games');
  }

  async delete(req, res, next) {
    const { id } = req.params;

    const query = `DELETE FROM games_info WHERE id = $1`;

    try {
      const result = await db.query(query, [id]);
    } catch (err) {
      console.error('Error:', err.message);
    }

    res.redirect('/games');
  }
}

export default gamesRouter;