import express from 'express';
const router = express.Router();
import db from '../db/connector.js';
import { registerSlonik, deleteSlonik, updateSlonik, checkPassword, checkAge, checkUsername, checkPlaceOfBirth } from '../controllers/slonikiController.js';

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

router.get('/create', async function(req, res, next) {
  res.render('forms/sloniki/sloniki_form', { formData: {} });
});

router.post('/create', async function(req, res, next) {
  try {
    await registerSlonik(req.body);
    res.redirect('/sloniki');
  } catch (err) {
    const errorMessage = err.message

    res.render('forms/sloniki/sloniki_form', {
      errorUsername: (err.field === "username" || err.message.toLowerCase().includes("username")) ? err.message : null,
      errorAge: (err.field === "age" || err.message.toLowerCase().includes("age")) ? err.message : null,
      errorPassword: (err.field === "password" || err.message.toLowerCase().includes("password")) ? err.message : null,
      errorPlaceOfBirth: (err.field === "place_of_birth" || err.message.toLowerCase().includes("birth")) ? err.message : null,

      formData: req.body
    });
  };
});

router.get('/delete', async function(req, res, next) {
  res.render('forms/sloniki/deleteSloniki');
})

router.post('/delete', async function(req, res, next) {
  const { username, password } = req.body;
  
  try {
    await deleteSlonik(username, password);
    res.redirect('/sloniki');
  } catch (err) {
    const errors = {};
    
    if (err.field) {
      errors[err.field] = err.message;
    } else {
      errors.general = err.message;
    }

    // Повертаємо на сторінку з об'єктом помилок та старими даними
    res.render('forms/sloniki/deleteSloniki', { 
      errors, 
      username 
    });
  }
});



router.get('/update', (req, res) => {
  res.render('forms/sloniki/updateSloniki'); 
});

router.post('/update', async (req, res) => {
  const { currentUsername, password, newUsername, newAge, new_place_of_birth } = req.body;
  const updateData = {
    username: newUsername,
    age: newAge,
    place_of_birth: new_place_of_birth
  };

  try {
    await updateSlonik(currentUsername, password, updateData);
    res.redirect('/sloniki');
  } catch (err) {
    if (err.message === 'Invalid password') {
      res.status(403).send('Error: invalid password');
    } else {
      res.status(500).send('Error updating');
    }
  }
});

export default router;