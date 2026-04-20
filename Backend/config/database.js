import { Sequelize } from 'sequelize';

import 'dotenv/config';

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: process.env.NODE_ENV === 'production' ? {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    } : {},
    pool: {
        max: 5,
        min: 0,
        idle: 10000,
        acquire: 30000,
    },
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('PostgreSQL connected successfully.');
    } catch (error) {
        console.error('Unable to connect to the database: ', error)
        process.exit(1);

    }
}

export { sequelize, connectDB };    
