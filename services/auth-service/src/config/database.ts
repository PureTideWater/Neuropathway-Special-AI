/**
 * Database Configuration
 * PostgreSQL connection using Sequelize
 */

import { Sequelize } from 'sequelize';
import { logger } from '../utils/logger';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://pathwise_user:password@localhost:5432/pathwise';

export const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  logging: (msg) => logger.debug(msg),
  pool: {
    max: 10,
    min: 2,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
  },
});

export async function connectDB(): Promise<void> {
  try {
    await sequelize.authenticate();
    logger.info('PostgreSQL connection established successfully');

    // In production, run migrations here
    // await sequelize.sync({ alter: true });
  } catch (error) {
    logger.error('Unable to connect to database', error as Error);
    throw error;
  }
}

export default sequelize;
