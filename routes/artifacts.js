import express from 'express';
const router = express.Router();

import { getAllArtifacts, addArtifact, deleteArtifact, updateArtifact } from '../controllers/artifactController.js';
import db from '../db/connector.js';

const renderOptions = { layout: 'artifact/layout' };

// List artifacts
router.get('/inventory', async (req, res) => {
    try {
        const items = await getAllArtifacts();
        res.render('artifact/inventory_page', {
            ...renderOptions,
            items
        });
    } catch (err) {
        console.error("Error fetching inventory:", err);
        res.status(500).send("Failed to load inventory");
    }
});

// Create page
router.get('/create', (req, res) => {
    res.render('forms/artifact_form', {
        ...renderOptions,
        title: 'New Artifact',
        isEdit: false
    });
});

// Create artifact
router.post('/create', async (req, res) => {
    try {
        await addArtifact(req.body);
        res.redirect('/artifacts/inventory');
    } catch (err) {
        console.error("Error creating artifact:", err);
        res.status(500).send("Failed to create artifact");
    }
});

// Edit page
router.get('/edit/:id', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM artifacts WHERE id = $1',
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send("Artifact not found");
        }

        res.render('forms/artifact_form', {
            ...renderOptions,
            item: result.rows[0],
            isEdit: true,
            title: 'Edit Artifact'
        });
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database access error");
    }
});

// Update artifact
router.post('/edit/:id', async (req, res) => {
    try {
        await updateArtifact(req.params.id, req.body);
        res.redirect('/artifacts/inventory');
    } catch (err) {
        console.error("Error updating artifact:", err);
        res.status(500).send("Failed to update artifact");
    }
});

// Delete artifact
router.post('/delete/:id', async (req, res) => {
    try {
        await deleteArtifact(req.params.id);
        res.redirect('/artifacts/inventory');
    } catch (err) {
        console.error("Error deleting artifact:", err);
        res.status(500).send("Failed to delete artifact");
    }
});

export default router;
