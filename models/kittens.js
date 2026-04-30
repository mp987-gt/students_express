import db from '../db/connector.js';

class Kitten {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.breed = data.breed;
    this.color = data.color;
    this.fur_type = data.fur_type;
    this.energy_level = data.energy_level;
    this.created_at = data.created_at;
  }

  validate() {
    if (!this.name || this.name.trim().length < 2) {
      const err = new Error("Ім'я кошеняти має містити мінімум 2 символи");
      err.field = "name";
      throw err;
    }
    if (this.energy_level && (this.energy_level < 0 || this.energy_level > 100)) {
      const err = new Error("Рівень енергії має бути від 0 до 100");
      err.field = "energy_level";
      throw err;
    }
  }

  get formattedDate() {
    if (!this.created_at) return '—';
    return new Date(this.created_at).toLocaleDateString('uk-UA') + ' ' + 
           new Date(this.created_at).toLocaleTimeString('uk-UA');
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      breed: this.breed,
      color: this.color,
      fur_type: this.fur_type,
      energy_level: this.energy_level,
      created_at: this.formattedDate
    };
  }

  static async getAll() {
    const { rows } = await db.query('SELECT * FROM kittens ORDER BY id ASC');
    return rows.map(row => new Kitten(row).toJSON());
  }

  static async getById(id) {
    const { rows } = await db.query('SELECT * FROM kittens WHERE id = $1', [id]);
    if (rows.length === 0) return null;
    return new Kitten(rows[0]).toJSON();
  }

  static async create(data) {
    const kitten = new Kitten(data);
    kitten.validate(); 
    await db.query(
      `INSERT INTO kittens (name, breed, color, fur_type, energy_level) VALUES ($1, $2, $3, $4, $5)`,
      [kitten.name, kitten.breed, kitten.color, kitten.fur_type, kitten.energy_level || 0]
    );
  }

  static async update(id, data) {
    const kitten = new Kitten(data);
    kitten.validate(); 
    await db.query(
      `UPDATE kittens SET name = $1, breed = $2, color = $3, fur_type = $4, energy_level = $5 WHERE id = $6`,
      [kitten.name, kitten.breed, kitten.color, kitten.fur_type, kitten.energy_level || 0, id]
    );
  }

  static async delete(id) {
    await db.query('DELETE FROM kittens WHERE id = $1', [id]);
  }
}

export default Kitten;