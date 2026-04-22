import express from 'express';
import { getAllClothing, addClothingItem, deleteClothingItem } from '../controllers/clothingController.js';

const router = express.Router();

// Перегляд всього одягу
router.get('/list', async (req, res) => {
    try {
        const items = await getAllClothing();
        res.render('clothing_page', { items }); // Тобі треба буде створити таку в'юшку
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Видалення
router.post('/delete/:id', async (req, res) => {
    try {
        await deleteClothingItem(req.params.id);
        res.redirect('/clothing/list');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

export default router;
