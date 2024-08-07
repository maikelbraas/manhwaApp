import connect from '../utils/Database.js';

class Page {

    static async getUpdates() {
        const query = "SELECT * FROM siteUpdates ORDER BY date DESC";
        const [rows] = await connect.execute(query);
        return rows;
    }

    static async postUpdate(title, content) {
        const query = "INSERT INTO siteUpdates SET title = ?, content = ?";
        await connect.execute(query, [title, content]);
        return true;
    }


}

export default Page;