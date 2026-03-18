import express from 'express';
const router = express.Router();
import db from '../db/connector.js';

const port = 3000; 
const app = express()

router.get('/', async function(req, res, next) {
  const students = await db.query('SELECT * FROM students');

  res.render('index.hbs', { students: students.rows || [] });
});

router.get('/create', async function(req, res, next) {
  res.render('forms/student_form.hbs');
})

router.post('/create', async function(req, res, next) {
  console.log("Submitted data: ", req.body);
  
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;

  if (!firstName || firstName.length === 0 || !lastName || lastName.length === 0) {
    return res.status(400).send("Something is empty :D");
  }
    const query = `
        INSERT INTO students (
            firstName,
            lastName
        ) 
        VALUES ($1, $2) 
        RETURNING *`;

    const values = [firstName, lastName];
   
    try {
       const res = await db.query(query, values);
       console.log('student was added:', res.rows[0]);
    } catch (err) {
        console.error('Error:', err.message);
    }
   res.redirect(`/`);

});

export default router;

app.use(express.urlencoded({ extended: true }));
app.use('/', router)

app.listen(port, () => {
  console.log(`Example app listening on port 127.0.0.1:${port}`)
});

