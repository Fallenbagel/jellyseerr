import type { MediaType } from '@server/constants/media';
import { getRepository } from '@server/datasource';
import type { BlacklistItem } from '@server/interfaces/api/discoverInterfaces';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import type { ZodNumber, ZodOptional, ZodString } from 'zod';

@Entity()
@Unique(['tmdbId'])
export class Blacklist implements BlacklistItem {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ type: 'varchar' })
  public mediaType: MediaType;

  @Column({ nullable: true, type: 'varchar' })
  title?: string;

  @Column()
  public tmdbId: number;

  @CreateDateColumn()
  public createdAt: Date;

  constructor(init?: Partial<Blacklist>) {
    Object.assign(this, init);
  }

  public static async addToBlacklist({
    blacklistRequest,
  }: {
    blacklistRequest: {
      mediaType: MediaType;
      title?: ZodOptional<ZodString>['_output'];
      tmdbId: ZodNumber['_output'];
    };
  }): Promise<void> {
    const blacklistRepository = getRepository(this);

    const blacklistItem = new this({
      ...blacklistRequest,
    });

    await blacklistRepository.save(blacklistItem);
    return;
  }
}
