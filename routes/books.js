import express from "express";
import pool from "../db.js";

const router = express.Router();

/* SHOW ALL BOOKS */
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM books ORDER BY id ASC"
        );

        res.render("books", {
            books: result.rows
        });

    } catch (error) {
        console.log(error.message);
    }
});

/* CREATE PAGE */
router.get("/createBook", (req, res) => {
    res.render("books", {
        mode: "create",
        pageTitle: "Create Book",
        action: "/books/createBook"
    });
});

/* CREATE BOOK */
router.post("/createBook", async (req, res) => {
    try {
        const { title, author, genre, pages, price } = req.body;

        await pool.query(
            `
            INSERT INTO books
            (title, author, genre, pages, price)
            VALUES ($1,$2,$3,$4,$5)
            `,
            [title, author, genre, pages, price]
        );

        res.redirect("/books");

    } catch (error) {
        console.log(error.message);
    }
});

/* EDIT PAGE */
router.get("/edit/:id", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM books WHERE id = $1",
            [req.params.id]
        );

        res.render("books", {
            mode: "edit",
            pageTitle: "Edit Book",
            action: `/books/edit/${req.params.id}`,
            item: result.rows[0]
        });

    } catch (error) {
        console.log(error.message);
    }
});

/* UPDATE BOOK */
router.post("/edit/:id", async (req, res) => {
    try {
        const { title, author, genre, pages, price } = req.body;

        await pool.query(
            `
            UPDATE books
            SET title = $1,
                author = $2,
                genre = $3,
                pages = $4,
                price = $5
            WHERE id = $6
            `,
            [title, author, genre, pages, price, req.params.id]
        );

        res.redirect("/books");

    } catch (error) {
        console.log(error.message);
    }
});

/* DELETE BOOK */
router.get("/delete/:id", async (req, res) => {
    try {
        await pool.query(
            "DELETE FROM books WHERE id = $1",
            [req.params.id]
        );

        res.redirect("/books");

    } catch (error) {
        console.log(error.message);
    }
});

export default router;