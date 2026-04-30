import db from '../db/connector.js';

class Movie {
    constructor({ title, director, release_year, rating, genre, status, poster_url }) {
        this.title = title;
        this.director = director;
        this.release_year = release_year;
        this.rating = rating;
        this.genre = genre;
        this.status = status;
        this.poster_url = poster_url;
    }

    toJSON() {
        const currentYear = new Date().getFullYear();
        return {
            title: this.title,
            director: this.director,
            movie_age: currentYear - this.release_year + " years old",
            formatted_rating: this.rating + " / 10",
            genre: this.genre,
        };
    }
}

export class MovieValidator {
    constructor(movieData) {
        this.movie = movieData;
    }

    validateText(value, name) {
        if (!value || value.trim().length < 1) {
            throw new Error(`Будь ласка, вкажіть ${name}.`);
        }
    }

    validate() {
        const { title, director, release_year, rating } = this.movie;

        this.validateText(title, 'назву фільму');
        this.validateText(director, 'режисера');

        if (release_year < 1895 || release_year > 2030) {
            throw new Error("Рік має бути від 1895 до 2030.");
        }

        if (rating < 0 || rating > 10) {
            throw new Error("Рейтинг має бути від 0 до 10.");
        }
    }
}

export class MovieService {
    constructor(movieData) {
        this.movie = new Movie(movieData);
    }

    async create() {
        const { title, director, release_year, rating, genre, status, poster_url } = this.movie;
        const query = `
            INSERT INTO movies (title, director, release_year, rating, genre, status, poster_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
        const res = await db.query(query, [title, director, release_year, rating, genre, status, poster_url]);
        return res.rows[0];
    }

    async update(id) {
        const { title, director, release_year, rating, genre, status, poster_url } = this.movie;
        const query = `
            UPDATE movies SET title=$1, director=$2, release_year=$3, rating=$4, genre=$5, status=$6, poster_url=$7 
            WHERE id=$8 RETURNING *`;
        const res = await db.query(query, [title, director, release_year, rating, genre, status, poster_url, id]);
        return res.rows[0];
    }

    static async delete(id) {
        await db.query('DELETE FROM movies WHERE id = $1', [id]);
        return true;
    }
}