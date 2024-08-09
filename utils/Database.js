import mysql from 'mysql2/promise';

const connect = mysql.createPool({
    host: process.env.HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
    waitForConnections: true,
    connectionLimit: 130,
    queueLimit: 0
});

export default connect;