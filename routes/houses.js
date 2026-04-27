import express from 'express';
import { body, validationResult } from 'express-validator'; 
import db from '../db/connector.js';

const router = express.Router();


const houseValidation = [
    body('street').trim().notEmpty().withMessage('Назва вулиці обов’язкова'),
    body('house_area').isFloat({ min: 1 }).withMessage('Площа будинку має бути числом більше 0'),
    body('rooms_count').isInt({ min: 1 }).withMessage('Кількість кімнат має бути цілим числом (мінімум 1)'),
    body('floors_count').isInt({ min: 1 }).withMessage('Кількість поверхів має бути цілим числом (мінімум 1)'),
    body('house_color').trim().notEmpty().withMessage('Колір обов’язковий'),
    body('plot_area').isFloat({ min: 0 }).withMessage('Площа ділянки має бути числом'),
    body('extra_info').optional({ checkFalsy: true }).trim()
];


const handleValidationErrors = (view) => (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render(view, { 
            item: { ...req.body, id: req.params.id }, 
            errors: errors.array() 
        });
    }
    next();
};


// LIST
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM houses ORDER BY id ASC');
        res.render('houses_list', { items: result.rows });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get('/add', (req, res) => {
    res.render('forms/houses_form', { item: {}, errors: [] }); 
});

// ADD
router.post('/add', houseValidation, handleValidationErrors('forms/houses_form'), async (req, res) => {
    const { street, house_area, rooms_count, floors_count, house_color, plot_area, has_garage, is_renovated, extra_info } = req.body;
    try {
        await db.query(`
            INSERT INTO houses (street, house_area, rooms_count, floors_count, house_color, plot_area, has_garage, is_renovated, extra_info)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [street, parseFloat(house_area), parseInt(rooms_count), parseInt(floors_count), house_color, parseFloat(plot_area), has_garage === 'on', is_renovated === 'on', extra_info]
        );
        res.redirect('/houses');
    } catch (err) { res.status(500).send(err.message); }
});

// EDIT
router.get('/edit/:id', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM houses WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).send('Будинок не знайдено');

        res.render('forms/houses_form', { item: result.rows[0], errors: [] }); 
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// UPDATE 
router.post('/edit/:id', houseValidation, handleValidationErrors('forms/houses_form'), async (req, res) => {
    const { street, house_area, rooms_count, floors_count, house_color, plot_area, extra_info } = req.body;
    
    try {
        await db.query(`
            UPDATE houses SET 
            street=$1, house_area=$2, rooms_count=$3, floors_count=$4, house_color=$5, 
            plot_area=$6, has_garage=$7, is_renovated=$8, extra_info=$9 
            WHERE id=$10`, 
            [
                street, 
                parseFloat(house_area), 
                parseInt(rooms_count), 
                parseInt(floors_count), 
                house_color, 
                parseFloat(plot_area), 
                req.body.has_garage === 'on', 
                req.body.is_renovated === 'on', 
                extra_info,
                req.params.id
            ]
        );
        res.redirect('/houses');
    } catch (err) { 
        res.status(500).send(err.message); 
    }
});

// DELETE
router.get('/delete/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM houses WHERE id = $1', [req.params.id]);
        res.redirect('/houses');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

export default router;