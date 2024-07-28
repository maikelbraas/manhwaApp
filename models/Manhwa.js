import connect from '../utils/Database.js';
import bcrypt from 'bcryptjs';

class Manhwa {

    static async findManhwaById(id) {
        const query = "SELECT * FROM manhwas WHERE mid = ?";
        const [rows] = await connect.execute(query, [id]);
        return rows;
    }

    static async getDemonManhwa() {
        const query = "SELECT * FROM manhwas WHERE mid LIKE 'mgdemon%'";
        const [rows] = await connect.execute(query);
        return rows;
    }

    static async findManhwaBySlug(slug) {
        const query = "SELECT * FROM manhwas WHERE slug = ?";
        const [rows] = await connect.execute(query, [slug]);
        return rows;
    }

    static async findManhwaByTitle(title) {
        const query = "SELECT * FROM manhwas WHERE title = ?";
        const [rows] = await connect.execute(query, [title]);
        return rows;
    }

    static async create(title, mid, slug, content, media, image, chapters, baseurl, status) {
        try {
            const query = "INSERT INTO manhwas (title, mid, slug, content, media, image, chapters, baseurl, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            const [result] = await connect.execute(query, [title, mid, slug, content, media, image, chapters, baseurl, status]);

            return result.insertId;
        } catch (e) {
            console.log(title, mid, slug, content, media, image, chapters, baseurl, status, e);
        }
    }

    static async update(title, mid, slug, content, media, image, chapters, baseurl, status) {
        try {
            const query = "UPDATE manhwas SET title = ?, content = ?, media = ?, image = ?, chapters = ?, baseurl = ?, status = ? WHERE mid = ? AND slug = ?";
            const [result] = await connect.execute(query, [title, content, media, image, chapters, baseurl, status, mid, slug]);

            return result.insertId;
        } catch (e) {
            console.log(e);
        }
    }

    static async getAllManhwas() {
        const query = `SELECT * FROM manhwas WHERE status != 'Dropped' ORDER BY title ASC`;
        const [rows] = await connect.execute(query);
        return rows;
    }

    static async getManhwa(id) {
        const query = "SELECT * FROM manhwas WHERE id = ?";
        const [rows] = await connect.execute(query, [id]);
        return rows;
    }

    static async getSavedManhwaChapter(manhwaid, userid) {
        const query = "SELECT * FROM chaptersSaved WHERE manhwaid = ? AND userid = ?";
        const [rows] = await connect.execute(query, [manhwaid, userid]);
        return rows;
    }

    static async getSavedManhwas(userid) {
        const query = `SELECT manhwas.id, title, mid, slug, media, image, content, chapters, chapter, baseurl, manhwas.lastUpdate, status, reading FROM manhwas INNER JOIN chaptersSaved ON chaptersSaved.manhwaid = manhwas.mid WHERE userid = ? ORDER BY manhwas.lastUpdate DESC, chaptersSaved.lastUpdate DESC`;
        const [rows] = await connect.execute(query, [userid]);
        return rows;
    }

    static async saveLastRun(lastPage, site) {
        try {
            const query = "INSERT INTO runJson (lastPage, site) VALUES (?, ?)";
            const [result] = await connect.execute(query, [lastPage, site]);

            return result.insertId;
        } catch (e) {
            console.log(e);
        }
    }

    static async getLastRun(site) {
        const query = "SELECT * FROM runJson WHERE site = ? ORDER BY id DESC LIMIT 1";
        const [rows] = await connect.execute(query, [site]);
        return rows;
    }

    static async getLastUpdated() {

    }

    static async deleteSaved(mid, uid) {
        const query = "DELETE FROM chaptersSaved WHERE manhwaid = ? AND userid = ?";
        const [rows] = await connect.execute(query, [mid, uid]);
        return rows;
    }


    static async patchSaved(mid, uid) {
        const query = "UPDATE chaptersSaved SET reading = CASE WHEN reading = 0 THEN 1 ELSE 0 END WHERE manhwaid = ? AND userid = ?";
        const [rows] = await connect.execute(query, [mid, uid]);
        return rows;
    }

    static async saveManhwaChapters(mid, link, number) {
        try {
            const querySearch = "SELECT * FROM manhwa_chapter WHERE manhwamid = ? AND chapter_link = ? AND chapter = ?";
            const [rowsSearch] = await connect.execute(querySearch, [mid, link, number]);
            if (rowsSearch.length > 0)
                return false;

            const query = "INSERT INTO manhwa_chapter (manhwamid, chapter_link, chapter) VALUES (?, ?, ?)";
            const [rows] = await connect.execute(query, [mid, link, number]);
            return rows;
        } catch (e) {
            console.log(e);
        }
    }

    static async findChapterByMidAndLink(mid, link) {
        const query = "SELECT * FROM manhwa_chapter WHERE manhwamid = ? AND chapter_link = ?";
        const [rows] = await connect.execute(query, [mid, link]);
        return rows;
    }

    static async findSavedManhwa(mid, uid) {
        const query = "SELECT * FROM chaptersSaved WHERE manhwaid = ? AND userid = ?";
        const [rows] = await connect.execute(query, [mid, uid]);
        return rows;
    }

    static async getCurrentChapter(mid, chapter) {
        const query = "SELECT * FROM manhwa_chapter WHERE manhwamid = ? AND chapter = ?";
        const [rows] = await connect.execute(query, [mid, chapter]);
        return rows;
    }

}

export default Manhwa;