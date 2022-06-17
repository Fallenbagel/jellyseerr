import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MediaStatus } from '../constants/media';
import Season from './Season';

@Entity()
class SeasonEpisodes {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ type: 'int', default: 0 })
  episodeNumber: number;

  @Column({ type: 'int', default: MediaStatus.UNKNOWN })
  public status: MediaStatus;

  @ManyToOne(() => Season, (season) => season.seasonEpisodes, {
    onDelete: 'CASCADE',
  })
  public season: Season;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  constructor(init?: Partial<SeasonEpisodes>) {
    Object.assign(this, init);
  }
}

export default SeasonEpisodes;
