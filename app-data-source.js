const {DataSource} = require('typeorm');
const path = require('path');

const postgreSQL = new DataSource({
    type:'postgres',
    host: 'db.toapita.com',
    port: 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: true,
    ssl: { rejectUnauthorized: false },
    entities: [path.join(__dirname, 'entities', '*.entities.js')]
})

module.exports = postgreSQL;