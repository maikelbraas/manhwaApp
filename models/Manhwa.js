import connect from '../utils/Database.js';

class Manhwa {

    static async findManhwaById(id) {
        const query = `SELECT 
m.*,
GROUP_CONCAT(g.name ORDER BY g.name ASC SEPARATOR ', ') AS genres
FROM manhwas m
LEFT JOIN manhwa_genre mg ON m.mid = mg.manhwaid
LEFT JOIN genres g ON mg.genreid = g.id
WHERE m.mid = ?
GROUP BY m.id`;
        const [rows] = await connect.execute(query, [id]);
        return rows;
    }


    static async getLastUpdated() {
        const query = `SELECT 
    m.*,
    GROUP_CONCAT(g.name ORDER BY g.name ASC SEPARATOR ', ') AS genres
FROM manhwas m
LEFT JOIN manhwa_genre mg ON m.mid = mg.manhwaid
LEFT JOIN genres g ON mg.genreid = g.id
GROUP BY m.id
ORDER BY m.lastUpdate DESC LIMIT 10;`;
        const [rows] = await connect.execute(query);
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

    static async getAllManhwasAndGenres() {
        try {
            const query = `SELECT 
    m.*,
    GROUP_CONCAT(g.name ORDER BY g.name ASC SEPARATOR ', ') AS genres
FROM manhwas m
LEFT JOIN manhwa_genre mg ON m.mid = mg.manhwaid
LEFT JOIN genres g ON mg.genreid = g.id
WHERE m.status != 'Dropped'
GROUP BY m.id
ORDER BY m.title ASC;`;
            const [rows] = await connect.execute(query);
            return rows;
        } catch (e) {
            console.log(e);
        }
    }


    static async getAllManhwasLimit(page) {
        page = (parseInt(page) * 6 - 6);
        try {
            const query = `SELECT 
    m.*,
    GROUP_CONCAT(g.name ORDER BY g.name ASC SEPARATOR ', ') AS genres
FROM manhwas m
LEFT JOIN manhwa_genre mg ON m.mid = mg.manhwaid
LEFT JOIN genres g ON mg.genreid = g.id
WHERE m.status != 'Dropped'
GROUP BY m.id
ORDER BY m.title ASC LIMIT 6 OFFSET ${page}`;
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

    static async getAllManhwasByOrigin(origin) {
        try {
            const query = `SELECT * FROM manhwas WHERE status != 'Dropped' AND mid LIKE ?`;
            const [rows] = await connect.execute(query, [origin]);
            return rows;
        } catch (e) {
            console.log(e);
        }
    }

    static async getFilteredManhwa(allowed, denied, page) {
        try {
            let query;
            let rows = [];
            page = page * 6;
            allowed = allowed || []
            denied = denied || []

            const placeholders = allowed.map(() => '?').join(',');
            const excludePlaceholders = denied.map(() => '?').join(',');
            console.log(allowed);
            console.log(denied);
            console.log(placeholders);
            console.log(excludePlaceholders);
            if (allowed.length > 0 && denied.length > 0) {
                query = `SELECT
    m.id,
    m.mid,
    m.title,
    m.content,
    m.slug,
    m.media,
    m.image,
    m.chapters,
    m.baseurl,
    m.lastUpdate,
    m.status,
    COUNT(*) OVER() AS total,
    GROUP_CONCAT(DISTINCT g.name ORDER BY g.name ASC SEPARATOR ', ') AS genres
FROM manhwas m
JOIN (
    SELECT manhwaid
    FROM manhwa_genre
    WHERE genreid IN (${placeholders})
    GROUP BY manhwaid
    HAVING COUNT(DISTINCT genreid) = ?
) mg ON m.mid = mg.manhwaid
LEFT JOIN manhwa_genre mg2 ON m.mid = mg2.manhwaid
LEFT JOIN genres g ON mg2.genreid = g.id
WHERE m.mid NOT IN (
        SELECT DISTINCT manhwaid
        FROM manhwa_genre
        WHERE genreid IN (${excludePlaceholders})
      )
GROUP BY m.mid
ORDER BY m.title ASC 
LIMIT 6 OFFSET ?`;
                [rows] = await connect.execute(query, [...allowed, allowed.length, ...denied, page * 6]);
            } else if (allowed.length > 0 && denied.length == 0) {
                query = `SELECT
    m.id,
    m.mid,
    m.title,
    m.content,
    m.slug,
    m.media,
    m.image,
    m.chapters,
    m.baseurl,
    m.lastUpdate,
    m.status,
    COUNT(*) OVER() AS total,
    GROUP_CONCAT(DISTINCT g.name ORDER BY g.name ASC SEPARATOR ', ') AS genres
FROM manhwas m
JOIN (
    SELECT manhwaid
    FROM manhwa_genre
    WHERE genreid IN (${placeholders})
    GROUP BY manhwaid
    HAVING COUNT(DISTINCT genreid) = ?
) mg ON m.mid = mg.manhwaid
LEFT JOIN manhwa_genre mg2 ON m.mid = mg2.manhwaid
LEFT JOIN genres g ON mg2.genreid = g.id
GROUP BY m.mid
ORDER BY m.title ASC
LIMIT 6 OFFSET ?`;
                [rows] = await connect.execute(query, [...allowed, allowed.length,]);
            } else if (allowed.length == 0 && denied.length > 0) {
                query = `SELECT
                m.id,
                m.mid,
                m.title,
                m.content,
                m.slug,
                m.media,
                m.image,
                m.chapters,
                m.baseurl,
                m.lastUpdate,
                m.status,
    COUNT(*) OVER() AS total,
                GROUP_CONCAT(DISTINCT g.name ORDER BY g.name ASC SEPARATOR ', ') AS genres
            FROM manhwas m
            LEFT JOIN manhwa_genre mg2 ON m.mid = mg2.manhwaid
            LEFT JOIN genres g ON mg2.genreid = g.id
            WHERE m.mid NOT IN (
                    SELECT DISTINCT manhwaid
                    FROM manhwa_genre
                    WHERE genreid IN (${excludePlaceholders})
                  )
            GROUP BY m.mid
            ORDER BY m.title ASC
            LIMIT 6 OFFSET ?`;
                [rows] = await connect.execute(query, [...denied, (page * 6) - 6]);
            }
            return rows;
        } catch (e) {
            console.log(e);
            return [];
        }
    }

}

export default Manhwa;