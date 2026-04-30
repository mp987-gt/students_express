import HouseModel from '../models/HouseModel.js';

class HouseController {
    static validateHouseData(data) {
        const errors = [];
        if (!data.street || data.street.trim() === '') errors.push('Вулиця та номер є обов\'язковими.');
        if (!data.house_area || isNaN(parseFloat(data.house_area)) || parseFloat(data.house_area) <= 0) errors.push('Площа будинку має бути числом більшим за нуль.');
        if (data.plot_area && (isNaN(parseFloat(data.plot_area)) || parseFloat(data.plot_area) < 0)) errors.push('Площа ділянки не може бути від\'ємною.');
        if (!data.rooms_count || isNaN(parseInt(data.rooms_count)) || parseInt(data.rooms_count) < 1) errors.push('Кількість кімнат має бути мінімум 1.');
        if (!data.floors_count || isNaN(parseInt(data.floors_count)) || parseInt(data.floors_count) < 1) errors.push('Кількість поверхів має бути мінімум 1.');
        return errors;
    }

    static async list(req, res) {
        try {
            const items = await HouseModel.getAll();
            res.render('houses_list', { items });
        } catch (err) {
            res.status(500).send(err.message);
        }
    }

    static showAddForm(req, res) {
        res.render('forms/houses_form', { item: {} });
    }

    static async add(req, res) {
        const errors = HouseController.validateHouseData(req.body);
        if (errors.length > 0) {
            return res.render('forms/houses_form', { 
                item: { ...req.body, has_garage: req.body.has_garage === 'on', is_renovated: req.body.is_renovated === 'on' }, 
                errors 
            });
        }

        try {
            await HouseModel.create(req.body);
            res.redirect('/houses');
        } catch (err) {
            res.status(500).send(err.message);
        }
    }

    static async showEditForm(req, res) {
        try {
            const item = await HouseModel.getById(req.params.id);
            if (!item) return res.status(404).send('Будинок не знайдено');
            res.render('forms/houses_form', { item });
        } catch (err) {
            console.error("Помилка при відкритті форми:", err);
            res.status(500).send("Помилка: " + err.message);
        }
    }

    static async edit(req, res) {
        const errors = HouseController.validateHouseData(req.body);
        if (errors.length > 0) {
            return res.render('forms/houses_form', { 
                item: { ...req.body, id: req.params.id, has_garage: req.body.has_garage === 'on', is_renovated: req.body.is_renovated === 'on' }, 
                errors 
            });
        }

        try {
            await HouseModel.update(req.params.id, req.body);
            res.redirect('/houses');
        } catch (err) {
            console.error(err);
            res.status(500).send("Помилка бази: " + err.message);
        }
    }

    static async delete(req, res) {
        try {
            await HouseModel.delete(req.params.id);
            res.redirect('/houses');
        } catch (err) {
            res.status(500).send(err.message);
        }
    }
}

export default HouseController;