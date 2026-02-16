import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, Index } from 'typeorm';
import { SpinLog } from './SpinLog';

@Entity('player_sessions')
@Index(['ipAddress', 'createdAt'])
export class PlayerSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  playerName!: string;

  @Column()
  ipAddress!: string;

  @Column()
  userAgent!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ default: 0 })
  spinsUsedToday!: number;

  @Column({ nullable: true })
  lastSpinAt?: Date;

  // @OneToMany(
  //   () => require('./SpinLog').SpinLog,
  //   (spin: SpinLog) => spin.session
  // )
  // spins!: SpinLog[];
}
