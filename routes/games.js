import express from 'express';
const router = express.Router();
import db from '../db/connector.js';

const port = 3000;
const app = express();

router.get('/', async function(req, res, next) {
  const weapon = await db.query('SELECT * FROM games_info');

  const modWeapons = weapon.rows.map(w => {
    return {
      ...w,
      created_at: w.created_at.toLocaleDateString()
    }
  })
  res.render('games.hbs', { weapons: modWeapons || [] });
});

export default router;

app.use('/', router)

app.listen(port, () => {
  console.log(`Example app listening on port 127.0.0.1:${port}`)
});
