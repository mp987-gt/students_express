import express from 'express';
const router = express.Router();
import db from '../db/connector.js';

//VALIDATION
const validateHouseData = (data) => {
    const errors = [];
    
    if (!data.street || data.street.trim() === '') {
        errors.push('Вулиця та номер є обов\'язковими.');
    }
    
    if (!data.house_area || isNaN(parseFloat(data.house_area)) || parseFloat(data.house_area) <= 0) {
        errors.push('Площа будинку має бути числом більшим за нуль.');
    }
    
    if (data.plot_area && (isNaN(parseFloat(data.plot_area)) || parseFloat(data.plot_area) < 0)) {
        errors.push('Площа ділянки не може бути від\'ємною.');
    }
    
    if (!data.rooms_count || isNaN(parseInt(data.rooms_count)) || parseInt(data.rooms_count) < 1) {
        errors.push('Кількість кімнат має бути мінімум 1.');
    }
    
    if (!data.floors_count || isNaN(parseInt(data.floors_count)) || parseInt(data.floors_count) < 1) {
        errors.push('Кількість поверхів має бути мінімум 1.');
    }

    return errors;
};
// ---------------------------------------

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
    res.render('forms/houses_form', { item: {} }); 
});

// ADD
router.post('/add', async (req, res) => {
    const { street, house_area, rooms_count, floors_count, house_color, plot_area, has_garage, is_renovated, extra_info } = req.body;

    // VALIDATION
    const errors = validateHouseData(req.body);
    if (errors.length > 0) {
        return res.render('forms/houses_form', { 
            item: { ...req.body, has_garage: has_garage === 'on', is_renovated: is_renovated === 'on' }, 
            errors 
        });
    }

    try {
        await db.query(`
            INSERT INTO houses (street, house_area, rooms_count, floors_count, house_color, plot_area, has_garage, is_renovated, extra_info)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [street, parseFloat(house_area), parseInt(rooms_count), parseInt(floors_count), house_color, parseFloat(plot_area) || 0, has_garage === 'on', is_renovated === 'on', extra_info]
        );
        res.redirect('/houses');
    } catch (err) { res.status(500).send(err.message); }
});

// EDIT (GET)
router.get('/edit/:id', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM houses WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).send('Будинок не знайдено');
        res.render('forms/houses_form', { item: result.rows[0] }); 
    } catch (err) {
        console.error("Помилка при відкритті форми редагування:", err);
        res.status(500).send("Помилка: " + err.message);
    }
});

// UPDATE (POST)
router.post('/edit/:id', async (req, res) => {
    const { street, house_area, rooms_count, floors_count, house_color, plot_area, has_garage, is_renovated, extra_info } = req.body;
    
    // VALIDATION
    const errors = validateHouseData(req.body);
    if (errors.length > 0) {
        return res.render('forms/houses_form', { 
            item: { ...req.body, id: req.params.id, has_garage: has_garage === 'on', is_renovated: is_renovated === 'on' }, 
            errors 
        });
    }

    try {
        await db.query(`
            UPDATE houses SET 
            street=$1, house_area=$2, rooms_count=$3, floors_count=$4, house_color=$5, 
            plot_area=$6, has_garage=$7, is_renovated=$8, extra_info=$9 
            WHERE id=$10`, 
            [
                street, parseFloat(house_area), parseInt(rooms_count), parseInt(floors_count), 
                house_color, parseFloat(plot_area) || 0, has_garage === 'on', is_renovated === 'on', 
                extra_info, req.params.id
            ]
        );
        res.redirect('/houses');
    } catch (err) { 
        console.error(err);
        res.status(500).send("Помилка бази: " + err.message); 
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