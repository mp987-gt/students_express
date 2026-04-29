import express from "express"
const router = express.Router();
import db from "../db/connector.js";
import { registerHousewife, deleteHousewife, updateHousewife, } from "../controllers/dhdController.js";


router.get('/', async function(req, res, next) {
  const dhd = await db.query('SELECT * FROM desperate_housewives_1');

  const modDhd = dhd.rows.map(w => {
    return {
      ...w,
      created_at: w.created_at.toLocaleDateString()
    }
  })
  res.render('dhd', { dhd: modDhd || [] });
});

class Housewifes {
  constructor ({
    id,
    username, 
    password_hash,
    season,
    reason,
    character_notes,
    created_at,
  }) {
    this.id = id;
    this.username = username || Unknown;
    this.password = password_hash;
    this.season = parseInt(season, 10) || 0;
    this.reason = reason;
    this.notes = character_notes;
    this.createdAt = created_at
      ? new Date(created_at).toLocaleString("uk-UA")
      : "Unknown";
  }

   display() {
    console.log(`\n--- [Housewife: ${this.name}] ---`);
    console.table({
      "Id": this.id,
      "Character Name": this.username,
      "Season": this.season,
      "Reason": this.reason,
    });
    console.log("Created at:", this.createdAt);
    console.log("Notes:", this.characterNotes || "No notes provided.");
    console.log("-----------------------");
  }
}
class Validator {
  static validatePassword(pass) {
    if (!pass || pass.length < 8)
      return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(pass))
      return "Password must contain at least one uppercase letter";
    if (!/[0-9]/.test(pass)) 
      return "Password must contain at least one number";
    
    return null;
  }

    static validateUsername(name) {
  if (!name || typeof name !== 'string') {
    return "Username is required and must be a string";
  }
  
  const n = name.trim();
  if (n.length < 3 || n.length > 30) 
    return "Username must be 3-30 characters";
}

    static validateSeason(season) {
      const n = parseInt(season, 10);
      if (season === "" || season === null || season === undefined)
        return "Season is required";
      if (isNaN(n)) 
        return "Season must be a valid number";
      if (n < 1 || n > 8) 
        return "Season must be between 1 and 8 years old";

      return null;
  }

  static  validateReason(reason) {
      if (!reason || typeof reason !== 'string') {
    return "Reason is required and must be a string";
  }
  
  const n = reason.trim();
  if (n.length < 3 || n.length > 400) 
    return "Reason must be 3-400 characters";
}
;
}


const showHousewives = async () => {
  try {
    const result = await db.query(`
      SELECT 
        id, 
        username, 
        password_hash, 
        season, 
        reason, 
        character_notes, 
        created_at 
      FROM desperate_housewives_1
    `);

    if (result.rows.length === 0) {
      console.log("\n[DATABASE] Таблиця порожня. Записів не знайдено.");
    } else {
      console.log(`\n[DATABASE] Знайдено домогосподарок: ${result.rows.length}`);

      result.rows.forEach((row) => {
        const housewife = new Housewifes(row); 
        housewife.display();
      });
    }
  } catch (err) {
    console.error(
      "\n[ERROR] Помилка виводу даних у консоль:",
      err.message,
    );
  }
};

// showHousewives();

router.get('/addHousewife', function(req, res) {
  res.render('forms/dhd/dhd_form', { 
    username: '', season: '', reason: '', character_notes: '' 
  });
});

router.post('/addHousewife', async function(req, res) {
  const {
    username,
    password_hash,
    season,
    reason,
    character_notes
        } = req.body;

    const errors = {
    username: Validator.validateUsername(username),
    breed: Validator.validatePassword(password_hash),
    age_years: Validator.validateSeason(season),
    weight_kg: Validator.validateReason(reason),
  };

  Object.keys(errors).forEach((key) => !errors[key] && delete errors[key]);

  if (Object.keys(errors).length > 0) {
    console.log("Знайдено помилки:", errors);
    return res.render("forms/dhd/dhd_form", {
      title: "ADD NEW HOUSEWIFE",
      errors: errors,
      cat: req.body,
      username: req.body.username,
      isEdit: false,
    });
  }

  try {
    await registerHousewife(username, password_hash, season, reason, character_notes);
    res.redirect('/dhd');
  } catch (err) {
    console.error("Registration Error:", err.message);
    res.status(500).render('forms/dhd/dhd_form', {
      ErrorPassword: "Wrong login or password",
      username, season, reason, character_notes 
    });
  }
});


router.get('/delete/:id', async function(req, res, next) {
  res.render('forms/dhd/dhd_delete', {
    id: req.params.id,
    action: `/dhd/delete`
  });
})

router.post('/delete', async function(req, res, next) {
  const { username, password } = req.body; 

  try {
    await deleteHousewife(username, password);
    res.redirect('/dhd');
  } catch (err) {
    if (err.message === 'Invalid password') {
      res.status(403).send('Invalid password');
    } else {
      res.status(500).send(`!! Error deleting housewife: ${username}`);
    }
  }
});


export default router;