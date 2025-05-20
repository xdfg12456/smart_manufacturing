import mysql from 'mysql2/promise'

const pool = mysql.createPool({
    host: 'localhost',
    port: 8080,
    user: 'root',
    password: '0',
    database: 'manufacture',
    waitForConnections: true,
})

export default pool