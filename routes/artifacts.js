import express from 'express';
const router = express.Router();
import { getAllArtifacts, addArtifact, deleteArtifact, updateArtifact } from '../controllers/artifactController.js';
import db from '../db/connector.js';

// Список
router.get('/inventory', async (req, res) => {
    const items = await getAllArtifacts();
    res.render('inventory_page', { items });
});

// Форма створення
router.get('/create', (req, res) => {
    res.render('forms/artifact_form', { title: 'Новий хабар' });
});

// Збереження нового
router.post('/create', async (req, res) => {
    await addArtifact(req.body);
    res.redirect('/artifacts/inventory');
});

// Форма редагування
router.get('/edit/:id', async (req, res) => {
    const result = await db.query('SELECT * FROM artifacts WHERE id = $1', [req.params.id]);
    res.render('forms/artifact_form', { item: result.rows[0], isEdit: true, title: 'Редагування' });
});

// Оновлення
router.post('/edit/:id', async (req, res) => {
    await updateArtifact(req.params.id, req.body);
    res.redirect('/artifacts/inventory');
});

// Видалення
router.post('/delete/:id', async (req, res) => {
    await deleteArtifact(req.params.id);
    res.redirect('/artifacts/inventory');
});

export default router;