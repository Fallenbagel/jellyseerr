import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Issue from './Issue';
import { User } from './User';

@Entity()
class IssueComment {
  @PrimaryGeneratedColumn()
  public id: number;

  @ManyToOne(() => User, {
    eager: true,
    onDelete: 'CASCADE',
  })
  public user: User;

  @ManyToOne(() => Issue, (issue) => issue.comments, {
    onDelete: 'CASCADE',
  })
  public issue: Issue;

  @Column({ type: 'text' })
  public message: string;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  constructor(init?: Partial<IssueComment>) {
    Object.assign(this, init);
  }
}

export default IssueComment;
