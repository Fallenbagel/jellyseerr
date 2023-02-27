import { MediaRequestStatus } from '@server/constants/media';
import { getRepository } from '@server/datasource';
import {
  AfterRemove,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MediaRequest } from './MediaRequest';

@Entity()
class SeasonRequest {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public seasonNumber: number;

  @Column({ type: 'int', default: MediaRequestStatus.PENDING })
  public status: MediaRequestStatus;

  @ManyToOne(() => MediaRequest, (request) => request.seasons, {
    onDelete: 'CASCADE',
  })
  public request: MediaRequest;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  constructor(init?: Partial<SeasonRequest>) {
    Object.assign(this, init);
  }

  @AfterRemove()
  public async handleRemoveParent(): Promise<void> {
    const mediaRequestRepository = getRepository(MediaRequest);
    const requestToBeDeleted = await mediaRequestRepository.findOneOrFail({
      where: { id: this.request.id },
    });

    if (requestToBeDeleted.seasons.length === 0) {
      await mediaRequestRepository.delete({ id: this.request.id });
    }
  }
}

export default SeasonRequest;
