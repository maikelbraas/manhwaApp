import connect from '../utils/Database.js';

class Genre {

    static async findGenreByName(name) {
        const query = "SELECT * FROM genres WHERE name = ?";
        const [rows] = await connect.execute(query, [name]);
        return rows;
    }

    static async create(name) {
        const query = "INSERT INTO genres (name) VALUES (?)";
        const [result] = await connect.execute(query, [name]);
        return result.insertId;
    }

    static async createGenreManhwa(manhwaid, genreid) {
        const query = "INSERT INTO manhwa_genre (manhwaid, genreid) VALUES (?, ?)";
        const [result] = await connect.execute(query, [manhwaid, genreid]);
        return result.insertId;
    }

    static async getAllGenresOfManhwa(id) {
        const query =
            "SELECT name FROM manhwa_genre JOIN manhwas ON manhwaid = mid JOIN genres ON genreid = genres.id WHERE manhwaid = ?";
        const [rows] = await connect.execute(query, [id]);
        return rows;
    }

}

export default Genre;