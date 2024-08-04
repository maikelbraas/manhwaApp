import connect from '../utils/Database.js';
import bcrypt from 'bcryptjs';

class Manhwa {

    static async findManhwaById(id) {
        const query = "SELECT * FROM manhwas WHERE mid = ?";
        const [rows] = await connect.execute(query, [id]);
        return rows;
    }


    static async getLastUpdated() {
        const query = `SELECT * FROM manhwas WHERE status != 'Dropped' ORDER BY lastUpdate DESC LIMIT 10`;
        const [rows] = await connect.execute(query);
        for (let row of rows) {
            const queryGenres = 'SELECT * FROM manhwa_genre WHERE manhwaid = ?';
            const [genres] = await connect.execute(queryGenres, [row.mid]);
            row.genres = [];
            for (let genre of genres) {
                const queryGenresName = 'SELECT * FROM genres WHERE id = ?';
                const [genresName] = await connect.execute(queryGenresName, [genre.genreid]);
                row.genres.push(genresName[0].name);
            }
        }
        return rows;
    }

    static async getDemonManhwa() {
        const query = "SELECT * FROM manhwas WHERE mid LIKE 'mgdemon%'";
        const [rows] = await connect.execute(query);
        return rows;
    }

    static async updateImageOfManhwa(mid, imagename) {
        try {
            const query = "UPDATE manhwas SET image = ? WHERE mid = ?";
            const [result] = await connect.execute(query, [imagename, mid]);

            return result.insertId;
        } catch (e) {
            console.log(e);
        }
    }

    static async findManhwaBySlug(slug) {
        const query = "SELECT * FROM manhwas WHERE slug = ?";
        const [rows] = await connect.execute(query, [slug]);
        return rows;
    }

    static async findManhwaByTitle(title) {
        try {
            const query = "SELECT * FROM manhwas WHERE title = ?";
            const [rows] = await connect.execute(query, [title]);
            return rows;
        } catch (e) {
            console.log(e);
        }
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
        try {
            const query = `SELECT * FROM manhwas WHERE status != 'Dropped' ORDER BY title ASC`;
            const [rows] = await connect.execute(query);
            return rows;
        } catch (e) {
            console.log(e);
        }
    }

    static async getManhwa(id) {
        try {
            const query = "SELECT * FROM manhwas WHERE id = ?";
            const [rows] = await connect.execute(query, [id]);
            return rows;
        } catch (e) {
            console.log(e);
        }
    }

    static async getSavedManhwaChapter(manhwaid, userid) {
        try {
            const query = "SELECT * FROM chaptersSaved WHERE manhwaid = ? AND userid = ?";
            const [rows] = await connect.execute(query, [manhwaid, userid]);
            return rows;
        } catch (e) {
            console.log(e);
        }
    }

    static async getSavedManhwas(userid) {
        try {
            const query = `SELECT manhwas.id, title, mid, slug, media, image, content, chapters, chapter, baseurl, manhwas.lastUpdate, status, reading FROM manhwas INNER JOIN chaptersSaved ON chaptersSaved.manhwaid = manhwas.mid WHERE userid = ? ORDER BY manhwas.lastUpdate DESC, chaptersSaved.lastUpdate DESC`;
            const [rows] = await connect.execute(query, [userid]);
            return rows;
        } catch (e) {
            console.log(e);
        }
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

    static async deleteSaved(mid, uid) {
        const query = "DELETE FROM chaptersSaved WHERE manhwaid = ? AND userid = ?";
        const [rows] = await connect.execute(query, [mid, uid]);
        const querySelect = "SELECT manhwaid FROM chaptersSaved WHERE manhwaid = ?";
        const [selectedRows] = await connect.execute(querySelect, [mid]);
        if (selectedRows.length < 1) {
            const queryDelete = "DELETE FROM manhwa_chapter WHERE manhwamid = ?";
            await connect.execute(queryDelete, [mid]);
        }
        return rows;
    }


    static async patchSaved(mid, uid) {
        try {
            const query = "UPDATE chaptersSaved SET reading = CASE WHEN reading = 0 THEN 1 ELSE 0 END WHERE manhwaid = ? AND userid = ?";
            const [rows] = await connect.execute(query, [mid, uid]);
            return rows;
        } catch (e) {
            console.log(e);
        }
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
        try {
            const query = "SELECT * FROM manhwa_chapter WHERE manhwamid = ? AND chapter_link = ?";
            const [rows] = await connect.execute(query, [mid, link]);
            return rows;
        } catch (e) {
            console.log(e);
        }
    }

    static async findSavedManhwa(mid) {
        try {
            const query = "SELECT * FROM chaptersSaved WHERE manhwaid = ?";
            const [rows] = await connect.execute(query, [mid]);
            return rows;
        } catch (e) {
            console.log(e);
        }
    }

    static async getCurrentChapter(mid, chapter) {
        try {
            const query = "SELECT * FROM manhwa_chapter WHERE manhwamid = ? AND chapter = ?";
            const [rows] = await connect.execute(query, [mid, chapter]);
            return rows;
        } catch (e) {
            console.log(e);
        }
    }

    static async getCurrentChapter(mid, chapter) {
        try {
            const query = "SELECT * FROM manhwa_chapter WHERE manhwamid = ? AND chapter = ?";
            const [rows] = await connect.execute(query, [mid, chapter]);
            return rows;
        } catch (e) {
            console.log(e);
        }
    }

    static async getNextChapter(mid, chapter) {
        try {
            const query = "SELECT * FROM manhwa_chapter WHERE manhwamid = ? AND chapter > ? ORDER BY chapter ASC LIMIT 1";
            const [rows] = await connect.execute(query, [mid, chapter]);
            return rows;
        } catch (e) {
            console.log(e);
        }
    }

}

export default Manhwa;