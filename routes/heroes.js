import express from 'express';
const router = express.Router();
import db from '../db/connector.js';

router.get('/', async function(req, res, next) {
  try {
    const heroes = await db.query('SELECT * FROM heroes ORDER BY id ASC');
    const rowheroes = heroes.rows.map(s => {
      return {
        ...s,
        created_at_time: s.created_at ? s.created_at.toLocaleTimeString() : '', 
        created_at_date: s.created_at ? s.created_at.toLocaleDateString() : ''
      }
    });
    res.render('heroes', { heroes: rowheroes || [] });
  } catch (err) {
    console.error("Помилка отримання даних:", err.message);
    res.status(500).send("Database Error");
  }
});

router.get("/add", (req, res) => {
  res.render("forms/heroes_form", { isEdit: false });
});

router.post("/add", async (req, res) => {
  try {
    const { hero_name, hero_class, hero_role, attack_type } = req.body;

    const query = `
      INSERT INTO heroes (name, primary_attribute, role, attack_type)
      VALUES ($1, $2, $3, $4)
    `;

    await db.query(query, [
      hero_name || "Unknown",
      hero_class || "Unknown", 
      hero_role || "Unknown",
      attack_type || "Unknown" 
    ]);
    res.redirect("/heroes"); 
  } catch (err) {
    console.error("DATABASE ERROR:", err.message);
    res.status(500).send("Database Error: " + err.message);
  }
});

router.get("/edit/:id", async (req, res) => {
  try {
    const heroId = req.params.id;
    const result = await db.query('SELECT * FROM heroes WHERE id = $1', [heroId]);
    
    if (result.rows.length === 0) {
      return res.status(404).send("Hero not found");
    }

    res.render("forms/heroes_form", { 
      isEdit: true, 
      hero: result.rows[0] 
    });
  } catch (err) {
    console.error("Помилка бази даних:", err.message);
    res.status(500).send("Database Error: " + err.message);
  }
});

router.post("/edit/:id", async (req, res) => {
  try {
    const heroId = req.params.id;
    const { hero_name, hero_class, hero_role, attack_type } = req.body;

    const query = `
      UPDATE heroes 
      SET name = $1, primary_attribute = $2, role = $3, attack_type = $4
      WHERE id = $5
    `;

    await db.query(query, [
      hero_name, 
      hero_class, 
      hero_role, 
      attack_type, 
      heroId
    ]);
    res.redirect("/heroes"); 
  } catch (err) {
    console.error("Помилка оновлення:", err.message);
    res.status(500).send("Database Error: " + err.message);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const heroId = req.params.id;
    await db.query('DELETE FROM heroes WHERE id = $1', [heroId]);
    res.sendStatus(200);
  } catch (err) {
    console.error("Помилка при видаленні:", err.message);
    res.status(500).send("Database Error: " + err.message);
  }
});

export default router;