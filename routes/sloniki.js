import express from 'express';
const router = express.Router();
import db from '../db/connector.js';

router.get('/', async function(req, res, next) {
  const sloniki = await db.query('SELECT * FROM sloniki');
  const rowSloniki = sloniki.rows.map(s => {
    return {
      ...s,
      created_at_time: s.created_at.toLocaleTimeString(), 
      created_at_date: s.created_at.toLocaleDateString()
    }
  })

  res.render('sloniki', { sloniki: rowSloniki || [] });
});

export default router;