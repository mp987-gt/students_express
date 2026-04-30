import express from 'express';
const router = express.Router();
import db from '../db/connector.js';

class ProductValidator {
  constructor() {
    this.regexBarcode  = /^([0-9]{8,13})$/;
    this.regexName     = /^([A-ZА-Я][a-zа-я0-9\s]{3,20})$/;
    this.regexPrice    = /^([0-9][0-9]*)$/;
    this.regexQuantity = /^[0-9]+$/;
  }

  validate(barcode, name, price, quantity) {
    if (!this.regexBarcode.test(barcode))
      return "Invalid product barcode you can use only numbers, min 8, max 13";
    if (!this.regexName.test(name))
      return "Invalid product name you can use only letters, numbers and spaces and it should start with capital letter or number / only english and ukraine letters";
    if (!this.regexPrice.test(price))
      return "Invalid product price you can use only numbers and must be $ at the end";
    if (!this.regexQuantity.test(quantity))
      return "Invalid product quantity you can use only numbers";
    return null;
  }
}

class ProductRepository {
  constructor() {
    this.db = db;
  }

  async getAll() {
    const result = await this.db.query('SELECT * FROM product');
    return result.rows.map(s => ({
      ...s,
      created_at_date: s.created_at.toLocaleDateString()
    }));
  }

  async getById(id) {
    const result = await this.db.query('SELECT * FROM product WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async create(barcode, name, price, quantity) {
    const query = `
      INSERT INTO product (barcode, name, price, quantity)
      VALUES ($1, $2, $3, $4)
    `;
    await this.db.query(query, [
      barcode  || 'Unknown',
      name     || 'Unknown',
      price    || 'Unknown',
      quantity || 'Unknown'
    ]);
  }

  async update(id, barcode, name, price, quantity) {
    const query = `
      UPDATE product
      SET barcode = $1, name = $2, price = $3, quantity = $4
      WHERE id = $5
    `;
    await this.db.query(query, [barcode, name, price, quantity, id]);
  }

  async delete(id) {
    await this.db.query('DELETE FROM product WHERE id = $1', [id]);
  }
}

class ProductController {
  constructor() {
    this.validator  = new ProductValidator();
    this.repository = new ProductRepository();

    this.list           = this.list.bind(this);
    this.renderAddForm  = this.renderAddForm.bind(this);
    this.add            = this.add.bind(this);
    this.renderEditForm = this.renderEditForm.bind(this);
    this.update         = this.update.bind(this);
    this.delete         = this.delete.bind(this);
  }

  async list(req, res) {
    const product = await this.repository.getAll();
    res.render('product', { product });
  }

  renderAddForm(req, res) {
    res.render('forms/product_form', {
      isEdit: false,
      action: '/product/add'
    });
  }

  async add(req, res) {
    try {
      const { barcode, name, price, quantity } = req.body;

      const error = this.validator.validate(barcode, name, price, quantity);
      if (error) return res.status(400).send(error);

      await this.repository.create(barcode, name, price, quantity);
      res.redirect('/product');
    } catch (err) {
      console.error('DATABASE ERROR:', err.message);
      res.status(500).send('Database Error: ' + err.message);
    }
  }

  async renderEditForm(req, res) {
    try {
      const { id } = req.params;
      const product = await this.repository.getById(id);
      if (!product) return res.status(400).send('Product not found');

      res.render('forms/product_form', {
        product,
        isEdit: true,
        action: `/product/update/${id}`
      });
    } catch (err) {
      res.status(500).send('Error loading edit form');
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { barcode, name, price, quantity } = req.body;

      const error = this.validator.validate(barcode, name, price, quantity);
      if (error) return res.status(400).send(error);

      await this.repository.update(id, barcode, name, price, quantity);
      res.redirect('/product');
    } catch (err) {
      res.status(500).send('Error updating product data');
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      await this.repository.delete(id);
      res.redirect('/product');
    } catch (err) {
      res.status(500).send('Could not delete product');
    }
  }
}

const productController = new ProductController();

router.get('/',            productController.list);
router.get('/add',         productController.renderAddForm);
router.post('/add',        productController.add);
router.get('/edit/:id',    productController.renderEditForm);
router.post('/update/:id', productController.update);
router.get('/delete/:id',  productController.delete);

export default router;