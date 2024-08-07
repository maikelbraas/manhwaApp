import connect from '../utils/Database.js';

class ChapterSaved {

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

export default ChapterSaved;