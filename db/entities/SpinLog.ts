import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

import { PlayerSession } from './PlayerSession';
import { Reward } from './Reward';

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
    () => PlayerSession,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'sessionId' })
  session!: PlayerSession;

  @ManyToOne(
    () => Reward
  )
  @JoinColumn({ name: 'rewardId' })
  reward!: Reward;
}
