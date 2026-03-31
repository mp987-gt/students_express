import express from "express"
const router = express.Router();
import db from "../db/connector.js";


router.get('/', async function(req, res, next) {
  const dhd = await db.query('SELECT * FROM desperate_housewives');

  const modDhd = dhd.rows.map(w => {
    return {
      ...w,
      created_at: w.created_at.toLocaleDateString()
    }
  })
  res.render('dhd', { dhd: modDhd || [] });
});


router.get('/addHousewife', async function(req, res, next) {
  res.render('forms/dhd_form');
})

router.post('/addHousewife', async function(req, res, next) {
  console.log("Submitted data: ", req.body);

  

const { username, season, reason, character_notes } = req.body;

  async function addHousewife(username, season, reason, character_notes) {
   try {
      const query = `
      INSERT INTO desperate_housewives (
            username, season, reason, character_notes
        )
        VALUES ($1, $2, $3, $4) 
        RETURNING *`;
   const res = await db.query(query, [username, season, reason, character_notes]);

   } catch (err) 
      { console.error(err)
        throw err;
   }
}

try {
    await addHousewife(username, season, reason, character_notes);
    
    res.redirect('/dhd');
  } catch (err) {
    res.status(500).send("Помилка при додаванні домогосподарки. Можливо, вона вже існує.");
  }
});

router.get("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM desperate_housewives WHERE id = $1", [id]);
    res.redirect("/dhd");
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).send("Could not delete gun");
  }
});

export default router;