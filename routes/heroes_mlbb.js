import express from 'express';
const router = express.Router();
import db from '../db/connector.js';

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

class Hero {
  constructor({ hero_name, hero_class, hero_role, attack_type }) {
    const validClasses = ['tank', 'fighter', 'assassin', 'mage', 'marksman', 'support'];
    const validAttackTypes = ['melee', 'ranged'];

    if (!hero_name) {
      throw new ValidationError("Ім'я героя не може бути пустим рядком");
    } else if (!hero_class || !validClasses.includes(hero_class.toLowerCase())) {
      throw new ValidationError("Клас має бути одним з 'tank', 'fighter', 'assassin', 'mage', 'marksman', 'support'");
    } else if (!hero_role) {
      throw new ValidationError("Роль не може бути пустою");
    } else if (!attack_type || !validAttackTypes.includes(attack_type.toLowerCase())) {
      throw new ValidationError("Тип атаки має бути одним з 'melee', 'ranged'");
    }

    this.hero_name = hero_name;
    this.hero_class = hero_class.toLowerCase();
    this.hero_role = hero_role;
    this.attack_type = attack_type.toLowerCase();
  }
}

router.get('/', async function (req, res, next) {
  const heroes = await db.query('SELECT * FROM heroes_mlbb');

  const rowHeroes = heroes.rows.map(h => {
    return {
      ...h,
      created_at: h.created_at.toLocaleDateString()
    };
  });

  res.render('heroes_mlbb_table', { heroes: rowHeroes || [] });
});

router.get('/add', async function (req, res, next) {
  res.render('forms/heroes_mlbb_form_add');
});

router.post('/add', async function (req, res, next) {
  try {
    const validatedHero = new Hero(req.body);

    const query = `
      INSERT INTO heroes_mlbb (name, hero_class, role, attack_type)
      VALUES ($1, $2, $3, $4)
      RETURNING *`;

    await db.query(query, [
      validatedHero.hero_name,
      validatedHero.hero_class,
      validatedHero.hero_role,
      validatedHero.attack_type,
    ]);

    res.redirect('/heroes_mlbb');
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(400).send(`Помилка додавання героя: ${err.message}`);
    }
    res.status(500).send(`Error: ${err.message}`);
  }
});

router.get('/edit/:id', async function (req, res, next) {
  try {
    const result = await db.query(
      'SELECT * FROM heroes_mlbb WHERE id = $1',
      [req.params.id]
    );

    const item = result.rows[0];

    if (!item) {
      return res.status(404).render('error', {
        message: 'Hero not found',
        error: {}
      });
    }

    res.render('forms/heroes_mlbb_form', {
      title: 'Edit hero',
      mode: 'form',
      pageTitle: 'Edit hero',
      action: `/heroes_mlbb/update/${item.id}`,
      buttonText: 'Save changes',
      item,
      isEdit: true
    });
  } catch (err) {
    next(err);
  }
});

router.post('/update/:id', async function (req, res, next) {
  try {
    const validatedHero = new Hero(req.body);

    await db.query(
      `UPDATE heroes_mlbb
       SET name = $1, hero_class = $2, role = $3, attack_type = $4
       WHERE id = $5`,
      [
        validatedHero.hero_name,
        validatedHero.hero_class,
        validatedHero.hero_role,
        validatedHero.attack_type,
        req.params.id
      ]
    );

    res.redirect('/heroes_mlbb');
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(400).send(`Помилка оновлення героя: ${err.message}`);
    }
    res.status(500).send(`Error: ${err.message}`);
  }
});

router.get('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM heroes_mlbb WHERE id = $1', [id]);
    res.redirect('/heroes_mlbb');
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).send('Could not delete hero');
  }
});

export default router;