import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { PlayerSession } from './entities/PlayerSession';
import { Reward } from './entities/Reward';
import { SpinLog } from './entities/SpinLog';
import { EventConfig } from './entities/EventConfig';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/wheel_minigame',
  synchronize: true, // Auto-create tables (only for development)
  logging: false,
  entities: [PlayerSession, Reward, SpinLog, EventConfig],
  subscribers: [],
  migrations: [],
});

let isInitialized = false;

export async function getDataSource() {
  if (!isInitialized) {
    await AppDataSource.initialize();
    isInitialized = true;
    console.log('✅ Database connected');
  }
  return AppDataSource;
}
