import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';

@Entity()
class OverrideRule {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ type: 'int', nullable: true })
  public radarrServiceId?: number;

  @Column({ type: 'int', nullable: true })
  public sonarrServiceId?: number;

  @Column({ nullable: true })
  public genre?: string;

  @Column({ nullable: true })
  public language?: string;

  @ManyToMany(() => User)
  @JoinTable()
  public users: User[];

  @Column({ type: 'int', nullable: true })
  public profileId?: number;

  @Column({ nullable: true })
  public rootFolder?: string;

  @Column({ type: 'simple-array', nullable: true })
  public tags?: number[];

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  constructor(init?: Partial<OverrideRule>) {
    Object.assign(this, init);
  }
}

export default OverrideRule;
