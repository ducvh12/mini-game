import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';

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

  @ManyToOne('PlayerSession', 'spins')
  @JoinColumn({ name: 'sessionId' })
  session!: any;

  @ManyToOne('Reward', 'spins')
  @JoinColumn({ name: 'rewardId' })
  reward!: any;
}
