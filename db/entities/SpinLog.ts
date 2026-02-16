import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

import type { PlayerSession } from './PlayerSession';
import type { Reward } from './Reward';

@Entity('spin_logs')
@Index(['createdAt'])
@Index(['sessionId'])
@Index(['ipAddress'])
export class SpinLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  sessionId!: string;

  @Column()
  playerName!: string;

  @Column()
  rewardId!: string;

  @Column()
  rewardName!: string;

  @Column()
  rewardValue!: string;

  @Column()
  ipAddress!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(
    () => require('./PlayerSession').PlayerSession,
    (session: PlayerSession) => session.spins,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'sessionId' })
  session!: PlayerSession;

  @ManyToOne(
    () => require('./Reward').Reward,
    (reward: Reward) => reward.spins,
    { onDelete: 'SET NULL' }
  )
  @JoinColumn({ name: 'rewardId' })
  reward!: Reward;
}
