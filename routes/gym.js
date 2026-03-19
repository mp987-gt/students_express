import express from 'express';
const router = express.Router();
import db from '../db/connector.js';

router.get('/', async function(req, res, next) {
  const exercise = await db.query('SELECT * FROM gym');

  const modExercise = exercise.rows.map(w => {
    return {
      ...w,
      created_at: w.created_at.toLocaleDateString()
    }
  })
  res.render('gym', { exercise: modExercise || [] });
});

export default router;
