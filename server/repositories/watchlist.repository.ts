import { getRepository } from '@server/datasource';
import { Watchlist } from '@server/entity/Watchlist';

export const UserRepository = getRepository(Watchlist).extend({
  // findByName(firstName: string, lastName: string) {
  //   return this.createQueryBuilder("user")
  //     .where("user.firstName = :firstName", { firstName })
  //     .andWhere("user.lastName = :lastName", { lastName })
  //     .getMany()
  // },
});
