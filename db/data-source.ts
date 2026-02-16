import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { PlayerSession } from './entities/PlayerSession';
import { Reward } from './entities/Reward';
import { SpinLog } from './entities/SpinLog';
import { EventConfig } from './entities/EventConfig';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/wheel_minigame',
  synchronize: false, // Auto-create tables (only for development)
  logging: false,
  entities: [PlayerSession, Reward, SpinLog, EventConfig],
  subscribers: [],
  migrations: [],
});

let initPromise: Promise<DataSource> | null = null;

export async function getDataSource() {
  if (AppDataSource.isInitialized) return AppDataSource;

  if (!initPromise) {
    initPromise = AppDataSource.initialize();
  }

  await initPromise;
  console.log('✅ Database connected');
  return AppDataSource;
}
