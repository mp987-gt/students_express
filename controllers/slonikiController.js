import db from '../db/connector.js';
import bcrypt from 'bcrypt';
import Slonik from '../models/Slonik.js';
import { ValidationError, AuthError, NotFoundError } from '../errors/slonikErrors.js';

const SALT_ROUNDS = 10;

export async function registerSlonik(data) {
  const newSlonik = new Slonik(data);
  
  newSlonik.validate();

  try {
    const hash = await bcrypt.hash(newSlonik.password, SALT_ROUNDS);
    const query = `
      INSERT INTO sloniki (username, password_hash, age, place_of_birth)
      VALUES ($1, $2, $3, $4) 
      RETURNING *`;
      const res = await db.query(query, [
        newSlonik.username, 
        hash, 
        newSlonik.age, 
        newSlonik.place_of_birth
      ]);    
    console.log(`✓ Slonik registered successfully: @${res.rows[0].username}`);
    return res.rows[0];
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function deleteSlonik(username, password) {
  const res = await db.query('SELECT * FROM sloniki WHERE username = $1', [username]);
  
  if (res.rows.length === 0) {
    // Помилка піде в errors.username
    throw new NotFoundError('This slonik doesn`t exists', 'username');
  }

  const slonik = res.rows[0];
  const isMatch = await bcrypt.compare(password, slonik.password_hash);
  
  if (!isMatch) {
    // Помилка піде в errors.password
    throw new AuthError('Error password', 'password');
  }

  await db.query('DELETE FROM sloniki WHERE username = $1', [username]);
  return true;
}

export async function updateSlonik(currentUsername, password, updateData) {
  const res = await db.query('SELECT * FROM sloniki WHERE username = $1', [currentUsername]);
  if (res.rows.length === 0) {
    throw new Error('Slonik not found');
  }

  const slonik = res.rows[0];
  const isMatch = await bcrypt.compare(password, slonik.password_hash);
  
  if (!isMatch) {
    throw new Error('Invalid password');
  }

  const fields = [];
  const values = [];
  let index = 1;

  // перебираємо поля, які треба змінити і не оновлюємо пусті
  for (const [key, value] of Object.entries(updateData)) {
    if (value && key !== 'password') { 
      fields.push(`${key} = $${index}`);
      values.push(value);
      index++;
    }
  }

  if (fields.length === 0) {
    throw new Error('No data provided for update');
  }

  values.push(currentUsername);
  const query = `UPDATE sloniki SET ${fields.join(', ')} WHERE username = $${index} RETURNING *`;

  const updateRes = await db.query(query, values);
  return updateRes.rows[0];
}

export function checkPassword(password) {
  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*]).*$/;
  if (password.length < 8) {
    throw new ValidationError('Password must be at least 8 characters long.', 'password');
  }
  if (!passwordRegex.test(password)) {
    throw new ValidationError("Password is too weak (requires capital letter, number, and special character)", 'password');
  }
}

export function checkAge(age) {
  if (age < 0) {
    throw new ValidationError("Age cannot be negative", "age");
  }
  if (age > 100) {
    throw new ValidationError("Elephants don't live that long.", "age");
  }
}

export function checkUsername(username) {
const hasLetter = /[a-zA-Z]/.test(username); 

  if (!hasLetter) {
    throw new Error("The username must contain at least one letter");
  }
}

export function checkPlaceOfBirth(place_of_birth) {
if (place_of_birth.length < 2) {
    throw new Error("The field with place of birth is required, enter at least 2 symbols");
  }
}