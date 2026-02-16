import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, Index } from 'typeorm';
import type { SpinLog } from './SpinLog';

@Entity('rewards')
@Index(['status'])
export class Reward {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  type!: string; // "money", "gift", "blessing", "joke"

  @Column()
  value!: string;

  @Column('float')
  probability!: number;

  @Column({ default: 0 })
  quantityLimit!: number; // 0 = unlimited

  @Column({ default: 0 })
  quantityRemaining!: number;

  @Column({ default: 'active' })
  status!: string; // "active", "inactive"

  @Column('text')
  message!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(
    () => require('./SpinLog').SpinLog,
    (spin: SpinLog) => spin.reward
  )
  spins!: SpinLog[];
}
