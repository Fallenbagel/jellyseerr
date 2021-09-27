import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User';

@Entity()
export class UserPushSubscription {
  @PrimaryGeneratedColumn()
  public id: number;

  @ManyToOne(() => User, (user) => user.pushSubscriptions, {
    eager: true,
    onDelete: 'CASCADE',
  })
  public user: User;

  @Column()
  public endpoint: string;

  @Column()
  public p256dh: string;

  @Column({ unique: true })
  public auth: string;

  constructor(init?: Partial<UserPushSubscription>) {
    Object.assign(this, init);
  }
}
