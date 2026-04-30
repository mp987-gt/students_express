import express from "express";
const router = express.Router();
import db from "../db/connector.js";

// GET ALL
router.get("/", async (req, res) => {
  const turtles = await db.query("SELECT * FROM turtles");

  const rowTurtles = turtles.rows.map((t) => ({
    ...t,
    created_at: t.created_at?.toLocaleDateString(),
  }));

  res.render("turtles", { turtles: rowTurtles });
});

// CREATE FORM
router.get("/createTurtle", (req, res) => {
  res.render("forms/turtles_form", {
    title: "Create Turtle",
    action: "/turtles/createTurtle",
    buttonText: "Create",
    item: {},
  });
});

// CREATE
router.post("/createTurtle", async (req, res) => {
  const {
    name_of_turtle,
    species,
    habitat,
    average_lifespan,
    diet,
    additional_info,
  } = req.body;

  if (
    !name_of_turtle ||
    !species ||
    !habitat ||
    !average_lifespan ||
    !diet ||
    !additional_info
  ) {
    return res.render("forms/turtles_form", {
      error: "Fill all fields!",
      action: "/turtles/createTurtle",
      buttonText: "Create",
      item: req.body,
    });
  }

  await db.query(
    `INSERT INTO turtles 
     (name_of_turtle, species, habitat, average_lifespan, diet, additional_info)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [
      name_of_turtle,
      species,
      habitat,
      average_lifespan,
      diet,
      additional_info,
    ]
  );

  res.redirect("/turtles");
});

// EDIT FORM
router.get("/edit/:id", async (req, res) => {
  const result = await db.query("SELECT * FROM turtles WHERE id=$1", [
    req.params.id,
  ]);

  res.render("forms/turtles_form", {
    title: "Edit Turtle",
    action: `/turtles/edit/${req.params.id}`,
    buttonText: "Save",
    item: result.rows[0],
  });
});

// EDIT
router.post("/edit/:id", async (req, res) => {
  const {
    name_of_turtle,
    species,
    habitat,
    average_lifespan,
    diet,
    additional_info,
  } = req.body;

  await db.query(
    `UPDATE turtles SET 
      name_of_turtle=$1,
      species=$2,
      habitat=$3,
      average_lifespan=$4,
      diet=$5,
      additional_info=$6
     WHERE id=$7`,
    [
      name_of_turtle,
      species,
      habitat,
      average_lifespan,
      diet,
      additional_info,
      req.params.id,
    ]
  );

  res.redirect("/turtles");
});

// DELETE
router.get("/delete/:id", async (req, res) => {
  await db.query("DELETE FROM turtles WHERE id=$1", [req.params.id]);
  res.redirect("/turtles");
});

export default router;