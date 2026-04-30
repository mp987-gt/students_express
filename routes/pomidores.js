import express from "express";
import pool from "../db.js";

const router = express.Router();

/* GET ALL */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM pomidores ORDER BY id ASC");
    res.render("pomidores", {
      pomidores: result.rows
    });
  } catch (err) {
    console.error(err.message);
  }
});

/* CREATE FORM */
router.get("/create", (req, res) => {
  res.render("pomidores", {
    mode: "create",
    pageTitle: "Add Tomato",
    action: "/pomidores/create"
  });
});

/* CREATE */
router.post("/create", async (req, res) => {
  const {
    name,
    variety,
    color,
    weight_grams,
    sweetness_level,
    price_per_kg
  } = req.body;

  try {
    await pool.query(
      `INSERT INTO pomidores 
      (name, variety, color, weight_grams, sweetness_level, price_per_kg)
      VALUES ($1,$2,$3,$4,$5,$6)`,
      [name, variety, color, weight_grams, sweetness_level, price_per_kg]
    );

    res.redirect("/pomidores");
  } catch (err) {
    console.error(err.message);
  }
});

/* EDIT FORM */
router.get("/edit/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM pomidores WHERE id=$1",
      [req.params.id]
    );

    res.render("pomidores", {
      mode: "edit",
      pageTitle: "Edit Tomato",
      action: "/pomidores/edit/" + req.params.id,
      item: result.rows[0]
    });
  } catch (err) {
    console.error(err.message);
  }
});

/* UPDATE */
router.post("/edit/:id", async (req, res) => {
  const {
    name,
    variety,
    color,
    weight_grams,
    sweetness_level,
    price_per_kg
  } = req.body;

  try {
    await pool.query(
      `UPDATE pomidores SET
        name=$1,
        variety=$2,
        color=$3,
        weight_grams=$4,
        sweetness_level=$5,
        price_per_kg=$6
      WHERE id=$7`,
      [
        name,
        variety,
        color,
        weight_grams,
        sweetness_level,
        price_per_kg,
        req.params.id
      ]
    );

    res.redirect("/pomidores");
  } catch (err) {
    console.error(err.message);
  }
});

/* DELETE */
router.get("/delete/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM pomidores WHERE id=$1", [
      req.params.id
    ]);

    res.redirect("/pomidores");
  } catch (err) {
    console.error(err.message);
  }
});

export default router;