import connect from '../utils/Database.js';
import bcrypt from 'bcryptjs';

class User {

    static async findByUsernameOrEmail(username) {
        const query = "SELECT * FROM users WHERE username = ?";
        const [rows] = await connect.execute(query, [username]);
        return rows;
    }

    static async create(username, password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = "INSERT INTO users (username, password) VALUES (?, ?)";
        const [result] = await connect.execute(query, [username, hashedPassword]);
        return result.insertId;
    }


    static async saveChapter(chapter, manhwa, user) {
        const query = "INSERT INTO chaptersSaved (manhwaid, chapter, userid) VALUES (?, ?, ?)";
        const [result] = await connect.execute(query, [manhwa, chapter, user]);
        return result.insertId;
    }

    static async updateChapter(chapter, manhwa, user) {
        const query = "UPDATE chaptersSaved SET chapter = ? WHERE userid = ? AND manhwaid = ?";
        const [result] = await connect.execute(query, [chapter, user, manhwa]);
        return result.insertId;
    }

    static async getChapter(userid, manhwa) {
        const query = "SELECT * FROM chaptersSaved WHERE userid = ? AND manhwaid = ?";
        const [rows] = await connect.execute(query, [userid, manhwa]);
        return rows;
    }


}

export default User;