import connect from '../utils/Database.js';
import bcrypt from 'bcryptjs';

class User {

    static async findByUsername(username) {
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

}

export default User;