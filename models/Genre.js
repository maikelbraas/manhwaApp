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

    static async checkIfGenreManhwaExists(manhwaid, genreid) {

        const query = "SELECT * FROM manhwa_genre WHERE manhwaid = ? AND genreid = ?";
        const [rows] = await connect.execute(query, [manhwaid, genreid]);
        if (rows.length > 0)
            return true;
        else
            return false;
    }

    static async getAllGenresOfManhwa(id) {
        const query =
            "SELECT name FROM manhwa_genre JOIN manhwas ON manhwaid = mid JOIN genres ON genreid = genres.id WHERE manhwaid = ?";
        const [rows] = await connect.execute(query, [id]);
        return rows;
    }

    static async getAllGenres() {
        const query =
            "SELECT * FROM genres";
        const [rows] = await connect.execute(query);
        return rows;
    }

}

export default Genre;