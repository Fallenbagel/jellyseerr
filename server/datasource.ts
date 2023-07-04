import 'reflect-metadata';
import type { DataSourceOptions, EntityTarget, Repository } from 'typeorm';
import { DataSource } from 'typeorm';

const devConfig: DataSourceOptions = {
  type: 'sqlite',
  database: process.env.CONFIG_DIRECTORY
    ? `${process.env.CONFIG_DIRECTORY}/db/db.sqlite3`
    : 'config/db/db.sqlite3',
  synchronize: true,
  migrationsRun: false,
  logging: false,
  enableWAL: true,
  entities: ['server/entity/**/*.ts'],
  migrations: ['server/migration/**/*.ts'],
  subscribers: ['server/subscriber/**/*.ts'],
};

const prodConfig: DataSourceOptions = {
  type: 'sqlite',
  database: process.env.CONFIG_DIRECTORY
    ? `${process.env.CONFIG_DIRECTORY}/db/db.sqlite3`
    : 'config/db/db.sqlite3',
  synchronize: false,
  migrationsRun: false,
  logging: false,
  enableWAL: true,
  entities: ['dist/entity/**/*.js'],
  migrations: ['dist/migration/**/*.js'],
  subscribers: ['dist/subscriber/**/*.js'],
};

const postgresDevConfig: DataSourceOptions = {
  type: 'postgres',
  name: 'pgdb',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME ?? 'jellyseerr',
  synchronize: true,
  migrationsRun: false,
  logging: false,
  entities: ['server/entity/**/*.ts'],
  migrations: ['server/migration/**/*.ts'],
  subscribers: ['server/subscriber/**/*.ts'],
};

const postgresProdConfig: DataSourceOptions = {
  type: 'postgres',
  name: 'pgdb',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME ?? 'jellyseerr',
  synchronize: false,
  migrationsRun: false,
  logging: false,
  entities: ['dist/entity/**/*.js'],
  migrations: ['dist/migration/**/*.js'],
  subscribers: ['dist/subscriber/**/*.js'],
};

export const isPgsql = process.env.DB_TYPE === 'postgres';

function getDataSource(): DataSourceOptions {
  if (process.env.NODE_ENV === 'production') {
    if (isPgsql) {
      return postgresProdConfig;
    }
    return prodConfig;
  } else if (isPgsql) {
    return postgresDevConfig;
  }
  return devConfig;
}

const dataSource = new DataSource(getDataSource());

export const getRepository = <Entity extends object>(
  target: EntityTarget<Entity>
): Repository<Entity> => {
  return dataSource.getRepository(target);
};

export default dataSource;
