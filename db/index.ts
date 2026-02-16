import { ObjectLiteral } from 'typeorm';
import { getDataSource } from './data-source';
import { PlayerSession } from './entities/PlayerSession';
import { Reward } from './entities/Reward';
import { SpinLog } from './entities/SpinLog';
import { EventConfig } from './entities/EventConfig';

export async function getRepository<T extends ObjectLiteral>(entity: new () => T) {
  const dataSource = await getDataSource();
  return dataSource.getRepository<T>(entity);
}

export { PlayerSession, Reward, SpinLog, EventConfig, getDataSource };