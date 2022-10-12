import type { PersonCreditCast, PersonCreditCrew } from '@server/models/Person';

export interface PersonCombinedCreditsResponse {
  id: number;
  cast: PersonCreditCast[];
  crew: PersonCreditCrew[];
}
