import { PersonCreditCast, PersonCreditCrew } from '../../models/Person';

export interface PersonCombinedCreditsResponse {
  id: number;
  cast: PersonCreditCast[];
  crew: PersonCreditCrew[];
}
