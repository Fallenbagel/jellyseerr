import { RadarrProfile, RadarrRootFolder } from '../../api/radarr';
import { LanguageProfile } from '../../api/sonarr';

export interface ServiceCommonServer {
  id: number;
  name: string;
  is4k: boolean;
  isDefault: boolean;
  activeProfileId: number;
  activeDirectory: string;
  activeLanguageProfileId?: number;
  activeAnimeProfileId?: number;
  activeAnimeDirectory?: string;
  activeAnimeLanguageProfileId?: number;
}

export interface ServiceCommonServerWithDetails {
  server: ServiceCommonServer;
  profiles: RadarrProfile[];
  rootFolders: Partial<RadarrRootFolder>[];
  languageProfiles?: LanguageProfile[];
}
