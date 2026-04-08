import express from 'express';
import db from '../db/connector.js';
import { getNames } from 'country-list';

const router = express.Router();

const countries = getNames().sort((a, b) => a.localeCompare(b));

function normalizeCountry(value) {
  return String(value || '').trim().toLowerCase();
}

function isValidCountry(country) {
  const normalized = normalizeCountry(country);
  return countries.some((item) => item.toLowerCase() === normalized);
}

function validateStreetFoodForm(formData) {
  const fieldErrors = {};

  const foodName = String(formData.food_name || '').trim();
  const country = String(formData.country || '').trim();

  const spicyLevel =
    formData.spicy_level === '' || formData.spicy_level === undefined
      ? null
      : Number(formData.spicy_level);

  const price =
    formData.price === '' || formData.price === undefined
      ? null
      : Number(formData.price);

  const rating =
    formData.rating === '' || formData.rating === undefined
      ? null
      : Number(formData.rating);

  if (!foodName) {
    fieldErrors.food_name = 'Назва страви є обов’язковою';
  }

  if (!country) {
    fieldErrors.country = 'Країна є обов’язковою';
  } else if (!isValidCountry(country)) {
    fieldErrors.country = 'Оберіть країну зі списку';
  }

  if (
    spicyLevel !== null &&
    (!Number.isInteger(spicyLevel) || spicyLevel < 0 || spicyLevel > 10)
  ) {
    fieldErrors.spicy_level = 'Рівень гостроти повинен бути від 0 до 10';
  }

  if (price !== null && (Number.isNaN(price) || price < 0.01)) {
    fieldErrors.price = 'Ціна повинна бути не меншою за 0.01';
  }

  if (
    rating !== null &&
    (!Number.isInteger(rating) || rating < 1 || rating > 10)
  ) {
    fieldErrors.rating = 'Рейтинг повинен бути від 1 до 10';
  }

  return {
    fieldErrors,
    sanitizedData: {
      food_name: foodName,
      country,
      spicy_level: spicyLevel,
      price,
      rating
    }
  };
}

function buildFormView({
  title,
  pageTitle,
  action,
  buttonText,
  item = {},
  formError = '',
  fieldErrors = {}
}) {
  return {
    title,
    isForm: true,
    pageTitle,
    action,
    buttonText,
    item,
    countries: JSON.stringify(countries),
    formError,
    fieldErrors
  };
}

router.get('/', async function (req, res, next) {
  try {
    const result = await db.query('SELECT * FROM street_food ORDER BY id ASC');

    const preparedStreetFood = (result.rows || []).map((item) => {
      const date = new Date(item.created_at);

      const formattedDate = new Intl.DateTimeFormat('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(date);

      const formattedPrice =
        item.price !== null && item.price !== undefined
          ? `$${Number(item.price).toFixed(2)}`
          : '—';

      return {
        ...item,
        formatted_created_at: formattedDate,
        formatted_price: formattedPrice
      };
    });

    res.render('street_food', {
      title: 'Street Food',
      isForm: false,
      food: preparedStreetFood
    });
  } catch (err) {
    next(err);
  }
});

router.get('/new', function (req, res) {
  res.render(
    'street_food',
    buildFormView({
      title: 'Add food',
      pageTitle: 'Add new food',
      action: '/street_food/create',
      buttonText: 'Create food',
      item: {},
      fieldErrors: {}
    })
  );
});

router.post('/create', async function (req, res, next) {
  try {
    const { fieldErrors, sanitizedData } = validateStreetFoodForm(req.body);

    if (Object.keys(fieldErrors).length > 0) {
      return res.status(400).render(
        'street_food',
        buildFormView({
          title: 'Add food',
          pageTitle: 'Add new food',
          action: '/street_food/create',
          buttonText: 'Create food',
          item: req.body,
          fieldErrors
        })
      );
    }

    const { food_name, country, spicy_level, price, rating } = sanitizedData;

    await db.query(
      `
      INSERT INTO street_food (food_name, country, spicy_level, price, rating)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [food_name, country, spicy_level, price, rating]
    );

    res.redirect('/street_food');
  } catch (err) {
    next(err);
  }
});

router.get('/edit/:id', async function (req, res, next) {
  try {
    const result = await db.query(
      'SELECT * FROM street_food WHERE id = $1',
      [req.params.id]
    );

    const item = result.rows[0];

    if (!item) {
      return res.status(404).render('error', {
        message: 'Food not found',
        error: {}
      });
    }

    res.render(
      'street_food',
      buildFormView({
        title: 'Edit food',
        pageTitle: 'Edit food',
        action: `/street_food/update/${item.id}`,
        buttonText: 'Save changes',
        item,
        fieldErrors: {}
      })
    );
  } catch (err) {
    next(err);
  }
});

router.post('/update/:id', async function (req, res, next) {
  try {
    const { fieldErrors, sanitizedData } = validateStreetFoodForm(req.body);

    if (Object.keys(fieldErrors).length > 0) {
      return res.status(400).render(
        'street_food',
        buildFormView({
          title: 'Edit food',
          pageTitle: 'Edit food',
          action: `/street_food/update/${req.params.id}`,
          buttonText: 'Save changes',
          item: {
            id: req.params.id,
            ...req.body
          },
          fieldErrors
        })
      );
    }

    const { food_name, country, spicy_level, price, rating } = sanitizedData;

    await db.query(
      `
      UPDATE street_food
      SET food_name = $1,
          country = $2,
          spicy_level = $3,
          price = $4,
          rating = $5
      WHERE id = $6
      `,
      [food_name, country, spicy_level, price, rating, req.params.id]
    );

    res.redirect('/street_food');
  } catch (err) {
    next(err);
  }
});

router.post('/delete/:id', async function (req, res, next) {
  try {
    await db.query('DELETE FROM street_food WHERE id = $1', [req.params.id]);
    res.redirect('/street_food');
  } catch (err) {
    next(err);
  }
});

export default router;