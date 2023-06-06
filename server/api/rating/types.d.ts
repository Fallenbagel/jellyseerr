import { type IMDBRating } from '@server/api/rating/imdbRadarrProxy';
import { type RTRating } from '@server/api/rating/rottentomatoes';

export interface RatingResponse {
  rt?: RTRating;
  imdb?: IMDBRating;
}
