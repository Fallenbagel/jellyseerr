import { MediaType } from '@server/constants/media';
import { z } from 'zod';

export const blacklistAdd = z.object({
  tmdbId: z.coerce.number(),
  mediaType: z.nativeEnum(MediaType),
  title: z.coerce.string().optional(),
  user: z.coerce.number(),
});
