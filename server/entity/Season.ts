import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { MediaStatus } from '../constants/media';
import Media from './Media';
import SeasonEpisodes from './SeasonEpisodes';

@Entity()
class Season {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public seasonNumber: number;

  @Column({ type: 'int', default: MediaStatus.UNKNOWN })
  public status: MediaStatus;

  @Column({ type: 'int', default: MediaStatus.UNKNOWN })
  public status4k: MediaStatus;

  @ManyToOne(() => Media, (media) => media.seasons, { onDelete: 'CASCADE' })
  public media: Promise<Media>;

  @OneToMany(() => SeasonEpisodes, (seasonEpisodes) => seasonEpisodes.season, {
    onDelete: 'CASCADE',
  })
  public seasonEpisodes: SeasonEpisodes[];

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  constructor(init?: Partial<Season>) {
    Object.assign(this, init);
  }
}

export default Season;
