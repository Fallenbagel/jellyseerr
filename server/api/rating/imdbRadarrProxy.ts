import ExternalAPI from '@server/api/externalapi';
import cacheManager from '@server/lib/cache';

export type IMDBRadarrProxyResponse = IMDBMovie[];

export interface IMDBMovie {
  ImdbId: string;
  Overview: string;
  Title: string;
  OriginalTitle: string;
  TitleSlug: string;
  Ratings: Rating[];
  MovieRatings: MovieRatings;
  Runtime: number;
  Images: Image[];
  Genres: string[];
  Popularity: number;
  Premier: string;
  InCinema: string;
  PhysicalRelease: any;
  DigitalRelease: string;
  Year: number;
  AlternativeTitles: AlternativeTitle[];
  Translations: Translation[];
  Recommendations: Recommendation[];
  Credits: Credits;
  Studio: string;
  YoutubeTrailerId: string;
  Certifications: Certification[];
  Status: any;
  Collection: Collection;
  OriginalLanguage: string;
  Homepage: string;
  TmdbId: number;
}

export interface Rating {
  Count: number;
  Value: number;
  Origin: string;
  Type: string;
}

export interface MovieRatings {
  Tmdb: Tmdb;
  Imdb: Imdb;
  Metacritic: Metacritic;
  RottenTomatoes: RottenTomatoes;
}

export interface Tmdb {
  Count: number;
  Value: number;
  Type: string;
}

export interface Imdb {
  Count: number;
  Value: number;
  Type: string;
}

export interface Metacritic {
  Count: number;
  Value: number;
  Type: string;
}

export interface RottenTomatoes {
  Count: number;
  Value: number;
  Type: string;
}

export interface Image {
  CoverType: string;
  Url: string;
}

export interface AlternativeTitle {
  Title: string;
  Type: string;
  Language: string;
}

export interface Translation {
  Title: string;
  Overview: string;
  Language: string;
}

export interface Recommendation {
  TmdbId: number;
  Title: string;
}

export interface Credits {
  Cast: Cast[];
  Crew: Crew[];
}

export interface Cast {
  Name: string;
  Order: number;
  Character: string;
  TmdbId: number;
  CreditId: string;
  Images: Image2[];
}

export interface Image2 {
  CoverType: string;
  Url: string;
}

export interface Crew {
  Name: string;
  Job: string;
  Department: string;
  TmdbId: number;
  CreditId: string;
  Images: Image3[];
}

export interface Image3 {
  CoverType: string;
  Url: string;
}

export interface Certification {
  Country: string;
  Certification: string;
}

export interface Collection {
  Name: string;
  Images: any;
  Overview: any;
  Translations: any;
  Parts: any;
  TmdbId: number;
}

export interface IMDBRating {
  title: string;
  url: string;
  criticsScore: number;
}

/**
 * This is a best-effort API. The IMDB API is technically
 * private and getting access costs money/requires approval.
 *
 * Radarr hosts a public proxy that's in use by all Radarr instances.
 */
class IMDBRadarrProxy extends ExternalAPI {
  constructor() {
    super('https://api.radarr.video/v1', {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      nodeCache: cacheManager.getCache('imdb').data,
    });
  }

  /**
   * Search the RT algolia api for the movie title
   *
   * We compare the release date to make sure its the correct
   * match. But it's not guaranteed to have results.
   *
   * @param name Movie name
   * @param year Release Year
   */
  public async getMovieRatings(IMDBid: string): Promise<IMDBRating | null> {
    try {
      const data = await this.get<IMDBRadarrProxyResponse>(
        `/movie/imdb/${IMDBid}`
      );

      if (!data?.length || data[0].ImdbId !== IMDBid) {
        return null;
      }

      return {
        title: data[0].Title,
        url: `https://www.imdb.com/title/${data[0].ImdbId}`,
        criticsScore: data[0].MovieRatings.Imdb.Value,
      };
    } catch (e) {
      throw new Error(
        `[RT API] Failed to retrieve movie ratings: ${e.message}`
      );
    }
  }
}

export default IMDBRadarrProxy;
