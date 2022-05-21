# [1.1.0](https://github.com/fallenbagel/jellyseerr/compare/v1.0.2...v1.1.0) (2022-05-21)


### Bug Fixes

* add Discord ID setting to general user settings page ([#2406](https://github.com/fallenbagel/jellyseerr/issues/2406)) ([eff665e](https://github.com/fallenbagel/jellyseerr/commit/eff665ef4b688aac881408790304b77bd9a31ddb))
* add missing route guards to issues pages ([#2235](https://github.com/fallenbagel/jellyseerr/issues/2235)) ([c79dc9f](https://github.com/fallenbagel/jellyseerr/commit/c79dc9f70f512dbec0e3460ee78dbc9feccfbbb1))
* address unhandled promise rejections & bump node to v16.13 ([#2398](https://github.com/fallenbagel/jellyseerr/issues/2398)) ([8cba486](https://github.com/fallenbagel/jellyseerr/commit/8cba486249fed88232e93a688c8bfe0f6179c589))
* allow basic HTTP auth in hostname validation ([#2307](https://github.com/fallenbagel/jellyseerr/issues/2307)) ([d48a7ba](https://github.com/fallenbagel/jellyseerr/commit/d48a7ba518f9c79d70e499037cb730eb3efe2c08))
* **api:** return queried user's requests instead of own requests ([#2174](https://github.com/fallenbagel/jellyseerr/issues/2174)) ([0edb1f4](https://github.com/fallenbagel/jellyseerr/commit/0edb1f452b6ff4a49ae2bde15f7273769788cf4f))
* **api:** use query builder for user requests endpoint ([#2119](https://github.com/fallenbagel/jellyseerr/issues/2119)) ([a20f395](https://github.com/fallenbagel/jellyseerr/commit/a20f395c94c97dd7ddbc25590f15def2c9bf13c9))
* apply request overrides iff override & selected servers match ([#2164](https://github.com/fallenbagel/jellyseerr/issues/2164)) ([50ce198](https://github.com/fallenbagel/jellyseerr/commit/50ce198471b1a3777a183d68904bbfb39ebd4523))
* **auth:** resolve local/password authentication issues ([#2677](https://github.com/fallenbagel/jellyseerr/issues/2677)) ([b75fc7b](https://github.com/fallenbagel/jellyseerr/commit/b75fc7b2384ce760432620faaa92277dcd42b8e1))
* **css:** rename form-input to form-input-area ([#2613](https://github.com/fallenbagel/jellyseerr/issues/2613)) ([086f0b6](https://github.com/fallenbagel/jellyseerr/commit/086f0b6ce23f607d20c2cec3c73b2e4d1ce9b426))
* disable user-import from mediaserver for non-plex mediaservers until implemented ([4db8e54](https://github.com/fallenbagel/jellyseerr/commit/4db8e5464d6ce3450e2687a0cbee126961d847d2))
* **docker:** explicitly install python3 ([#2273](https://github.com/fallenbagel/jellyseerr/issues/2273)) [skip ci] ([f1cd087](https://github.com/fallenbagel/jellyseerr/commit/f1cd0878a5c74bddc864f5f8ce9e2f041bdde5ec))
* don't allow login for unimported Jellyfin users if not set in settings ([72ca694](https://github.com/fallenbagel/jellyseerr/commit/72ca694f212ab616ca7b7fe02e428ff61f79c67c))
* **email:** do not attempt to display logo if app URL not configured ([#2125](https://github.com/fallenbagel/jellyseerr/issues/2125)) ([b3b421a](https://github.com/fallenbagel/jellyseerr/commit/b3b421a67408a4a48d23c15341fcdf7aaf19b25a))
* **email:** enclose PGP encryption logic in try/catch ([#2519](https://github.com/fallenbagel/jellyseerr/issues/2519)) ([a76b608](https://github.com/fallenbagel/jellyseerr/commit/a76b608ab796944c0c660e3296a7aca6615d69f3))
* **email:** use decrypted private key ([#2232](https://github.com/fallenbagel/jellyseerr/issues/2232)) ([8d29685](https://github.com/fallenbagel/jellyseerr/commit/8d2968572a569ed77a4d7c14ae1dc69935fa847e))
* fix usertype from local user to mediaServerType ([25bee8b](https://github.com/fallenbagel/jellyseerr/commit/25bee8b9f70d7948191ba9cf07d16427da81d425))
* **frontend:** disable autocomplete on search field ([#2592](https://github.com/fallenbagel/jellyseerr/issues/2592)) ([82d1617](https://github.com/fallenbagel/jellyseerr/commit/82d16177bf763fe8097b4aae326793e3e21e847d))
* **frontend:** more issues-related fixes ([#2234](https://github.com/fallenbagel/jellyseerr/issues/2234)) ([3ec4a9c](https://github.com/fallenbagel/jellyseerr/commit/3ec4a9c76e1f31bee5c8801b389721bf8e5884e0))
* **frontend:** notification type validation ([#2207](https://github.com/fallenbagel/jellyseerr/issues/2207)) ([2f204b9](https://github.com/fallenbagel/jellyseerr/commit/2f204b995269a53ae36f2a8733f27ae6ab70da5a))
* **frontend:** setup page backdrops ([#2251](https://github.com/fallenbagel/jellyseerr/issues/2251)) ([78a8091](https://github.com/fallenbagel/jellyseerr/commit/78a8091bcd29a7cf50cc7c493c28710389817adf))
* **frontend:** theme-color meta tag ([#2420](https://github.com/fallenbagel/jellyseerr/issues/2420)) ([ff28c9b](https://github.com/fallenbagel/jellyseerr/commit/ff28c9bfebf4a930e2542ee3b3c35f8af4e1b97e))
* **frontend:** use consistent formatting & strings ([#2231](https://github.com/fallenbagel/jellyseerr/issues/2231)) ([2164471](https://github.com/fallenbagel/jellyseerr/commit/216447121b686b6d01a31b95ec0c8eb005f6b103))
* **frontend:** various fixes ([#2524](https://github.com/fallenbagel/jellyseerr/issues/2524)) ([c3dbd0d](https://github.com/fallenbagel/jellyseerr/commit/c3dbd0d6913946e0e1b5308edfbb5ca744740223))
* handle Plex library settings migration failure gracefully ([#2254](https://github.com/fallenbagel/jellyseerr/issues/2254)) ([ed53810](https://github.com/fallenbagel/jellyseerr/commit/ed53810fb33f70722361c67d176ff4edf531ba45))
* **holiday:** remove special holiday slider ([22f2037](https://github.com/fallenbagel/jellyseerr/commit/22f2037ea6c5a0ba2ffa4d69f2b7cf42bdcf8575))
* **issues:** only allow edit of own comments & do not allow non-admin delete of issues with comments ([#2248](https://github.com/fallenbagel/jellyseerr/issues/2248)) ([bba09d6](https://github.com/fallenbagel/jellyseerr/commit/bba09d69c1bc55c2f35db5a7986e7c935cc9619c))
* jellyfin user signin after manual user import ([36c3c9d](https://github.com/fallenbagel/jellyseerr/commit/36c3c9d7c60176a5c4090b86313743b3ce433406))
* **lang:** add missing string ([#2370](https://github.com/fallenbagel/jellyseerr/issues/2370)) ([d36c1d2](https://github.com/fallenbagel/jellyseerr/commit/d36c1d29295020efb76bac21a443b6f9049802f3))
* **lang:** rename 'Media' notification types for clarity ([#2400](https://github.com/fallenbagel/jellyseerr/issues/2400)) ([399b037](https://github.com/fallenbagel/jellyseerr/commit/399b0379186ed34dcc436bd95330fd1a05fef4b3))
* **lang:** string edits ([#2229](https://github.com/fallenbagel/jellyseerr/issues/2229)) ([ab20c21](https://github.com/fallenbagel/jellyseerr/commit/ab20c21184639e1c7725f7cae96249c6fa157351))
* **lang:** translations update from Hosted Weblate ([#2625](https://github.com/fallenbagel/jellyseerr/issues/2625)) ([19cdedd](https://github.com/fallenbagel/jellyseerr/commit/19cdedd2a6656b1a852e1cc653bbdb140e978b51))
* **lang:** translations update from Hosted Weblate ([#2639](https://github.com/fallenbagel/jellyseerr/issues/2639)) ([418a533](https://github.com/fallenbagel/jellyseerr/commit/418a533588bbbdbbbb4caee1ef91d57c1ca35717))
* **lang:** translations update from Weblate ([#2212](https://github.com/fallenbagel/jellyseerr/issues/2212)) ([85aec4f](https://github.com/fallenbagel/jellyseerr/commit/85aec4f8925746ebae9bcc99d8480b78ccfd851e))
* **logs:** handle log message nested extra properties ([#2459](https://github.com/fallenbagel/jellyseerr/issues/2459)) ([d777940](https://github.com/fallenbagel/jellyseerr/commit/d7779408d162949b2eafcacefc8eabe53fae229f))
* **logs:** handle unexpected log messages ([#2303](https://github.com/fallenbagel/jellyseerr/issues/2303)) ([f284e4a](https://github.com/fallenbagel/jellyseerr/commit/f284e4ab978e502d2cc08e76226a8ebac91bb48f))
* **logs:** lazily parse log message label ([#2359](https://github.com/fallenbagel/jellyseerr/issues/2359)) ([5af06bd](https://github.com/fallenbagel/jellyseerr/commit/5af06bd87226fbc6176b0c5e362824793165a34e))
* **notif:** correct issue notif action URLs ([#2333](https://github.com/fallenbagel/jellyseerr/issues/2333)) ([dc7f959](https://github.com/fallenbagel/jellyseerr/commit/dc7f959cb422a8d89bcebc78377f1513412e542c))
* **notif:** duplicate notification check logic ([#2424](https://github.com/fallenbagel/jellyseerr/issues/2424)) ([10651ba](https://github.com/fallenbagel/jellyseerr/commit/10651baa675993f7109989bbac67f54661c8693f))
* **notif:** only send MEDIA_AVAILABLE notifications for non-declined requests ([#2343](https://github.com/fallenbagel/jellyseerr/issues/2343)) ([fcb0dcf](https://github.com/fallenbagel/jellyseerr/commit/fcb0dcf5be64bf9ca814bfe119586908922099c5))
* **notif:** show event in pop up notification for slack ([#2413](https://github.com/fallenbagel/jellyseerr/issues/2413)) ([d4438c8](https://github.com/fallenbagel/jellyseerr/commit/d4438c82e3753c9b29b6269ad406d263b3fcef4c)), closes [#2408](https://github.com/fallenbagel/jellyseerr/issues/2408)
* only run scheduled mediaserver jobs that apply to the current mediaserver ([791106a](https://github.com/fallenbagel/jellyseerr/commit/791106a7f5b8356b67119300bad245f587f6dc5f))
* play on Jellyfin for TV shows ([d0c5481](https://github.com/fallenbagel/jellyseerr/commit/d0c5481d22ddceee0b5c3d7d82029f44c46dbbd0))
* plex Login ([9d54776](https://github.com/fallenbagel/jellyseerr/commit/9d54776a2c4c23a61d5e619ca952b9e5d947a79b))
* **plex:** correctly generate uuid for safari ([#2614](https://github.com/fallenbagel/jellyseerr/issues/2614)) ([d06f2cd](https://github.com/fallenbagel/jellyseerr/commit/d06f2cdb08bfa6f05cf7cec2c408a258fa926b09))
* **plex:** find TV series in addition to movies from IMDb IDs ([#1830](https://github.com/fallenbagel/jellyseerr/issues/1830)) ([30644f6](https://github.com/fallenbagel/jellyseerr/commit/30644f65ea2e8437676422ae0b083c642a836887))
* **plex:** include 'Overseerr' in X-Plex-Device-Name header ([#2635](https://github.com/fallenbagel/jellyseerr/issues/2635)) ([d4f9650](https://github.com/fallenbagel/jellyseerr/commit/d4f9650cd07704a97f8b591b7de7351c1e85b825))
* **plex:** use unique client identifier ([#2602](https://github.com/fallenbagel/jellyseerr/issues/2602)) ([648b346](https://github.com/fallenbagel/jellyseerr/commit/648b346cbe5a941c7e1ec4ddfb276fb0e27ed502))
* **plex:** user import ([#2442](https://github.com/fallenbagel/jellyseerr/issues/2442)) ([86dff12](https://github.com/fallenbagel/jellyseerr/commit/86dff12cdeef6dca92527dd31757a3a4c7f921bf))
* **radarr:** correctly check for existing movies ([#2490](https://github.com/fallenbagel/jellyseerr/issues/2490)) ([5d4b06b](https://github.com/fallenbagel/jellyseerr/commit/5d4b06bbcc6cf6d328f6b4a86c4c0f9b0f3aff3e))
* **radarr:** remove PreDB minimum availability option ([#2386](https://github.com/fallenbagel/jellyseerr/issues/2386)) ([3e5eb4e](https://github.com/fallenbagel/jellyseerr/commit/3e5eb4e148a9f88b871abc4ee1784b870f691534))
* relax jellyfin url validation to allow local domains ([3a010f8](https://github.com/fallenbagel/jellyseerr/commit/3a010f821189414efd334b4cad2a300501f40a18))
* replaced unknown job with jellyfin in jobsandcache and added translations for it ([f09b86a](https://github.com/fallenbagel/jellyseerr/commit/f09b86aa87d84af1ddee07390a04dd8543cff8a6))
* **requests:** check for existing media of same type when requesting ([#2445](https://github.com/fallenbagel/jellyseerr/issues/2445)) ([eb9ca2e](https://github.com/fallenbagel/jellyseerr/commit/eb9ca2e86f3be3f4ff8ee2e7c4aecdf337d8976d))
* **requests:** do not fail request edits if acting user lacks Manage Users permission ([#2338](https://github.com/fallenbagel/jellyseerr/issues/2338)) ([91bfff7](https://github.com/fallenbagel/jellyseerr/commit/91bfff71b7c05c9b9aad2c95282533eefbb6b2e7))
* **scripts:** update migration scripts ([#2208](https://github.com/fallenbagel/jellyseerr/issues/2208)) [skip ci] ([d0ac74e](https://github.com/fallenbagel/jellyseerr/commit/d0ac74ea4bbfcf3d25d30cbd422d9df1c1259a18))
* secure session cookie ([#2308](https://github.com/fallenbagel/jellyseerr/issues/2308)) ([7f330af](https://github.com/fallenbagel/jellyseerr/commit/7f330aff2e1d3546e8dd1a3e4b037b9beb1cc7f0))
* **servarr:** handle baseurl error when testing connection ([#2294](https://github.com/fallenbagel/jellyseerr/issues/2294)) ([93b5ea2](https://github.com/fallenbagel/jellyseerr/commit/93b5ea20ca590996f6dc90713a76800180d0621c))
* **servarr:** handle servaarr server being unavailable when scanning downloads ([#2358](https://github.com/fallenbagel/jellyseerr/issues/2358)) ([488874f](https://github.com/fallenbagel/jellyseerr/commit/488874fc17e4e4719e90d383b83b1e1a5217213b))
* **sonarr:** monitor existing series upon request approval ([#2553](https://github.com/fallenbagel/jellyseerr/issues/2553)) ([aa062d9](https://github.com/fallenbagel/jellyseerr/commit/aa062d921c425d4b64bfdb28a5f102b0c92f7d87))
* **sonarr:** only scan seasons that exist in TMDb ([#2523](https://github.com/fallenbagel/jellyseerr/issues/2523)) ([6168185](https://github.com/fallenbagel/jellyseerr/commit/61681857b123802aaeff02a8f61b1ba046c5d333))
* sort collection parts by release date ([#2368](https://github.com/fallenbagel/jellyseerr/issues/2368)) ([1b3797c](https://github.com/fallenbagel/jellyseerr/commit/1b3797cf6e6ef6b3d8c81e644382f6e3f68cfaaa))
* **tautulli:** fetch additional user history as necessary to return 20 unique media ([#2446](https://github.com/fallenbagel/jellyseerr/issues/2446)) ([7d19de6](https://github.com/fallenbagel/jellyseerr/commit/7d19de6a4af6297be18140ca59402b40f7bbb30b))
* **ui:** Fix webhook URL validation regex ([#864](https://github.com/fallenbagel/jellyseerr/issues/864)) ([726f62b](https://github.com/fallenbagel/jellyseerr/commit/726f62b9b69b5078e718f129e26abdf358f5cb06))
* **ui:** refinements for 'About' page ([#2173](https://github.com/fallenbagel/jellyseerr/issues/2173)) ([084a842](https://github.com/fallenbagel/jellyseerr/commit/084a842a4f9b6caaed22edbe77bc9e414bc1f387))
* **ui:** request badge styling in request list ([#2302](https://github.com/fallenbagel/jellyseerr/issues/2302)) ([f2375c9](https://github.com/fallenbagel/jellyseerr/commit/f2375c902b79dcb1f349500862775ae57ea7d406))


### Features

* **about:** show config directory ([#2600](https://github.com/fallenbagel/jellyseerr/issues/2600)) ([0c7373c](https://github.com/fallenbagel/jellyseerr/commit/0c7373c7e89a4ff717efaa7d6a5854f7ccd6a8d3))
* add emby detail url support ([88c2c5e](https://github.com/fallenbagel/jellyseerr/commit/88c2c5ebcddd1eb8aea4a4e72c68a91197dec065))
* add production countries to movie/TV detail pages ([#2170](https://github.com/fallenbagel/jellyseerr/issues/2170)) ([30b20df](https://github.com/fallenbagel/jellyseerr/commit/30b20df37a9604ba1c066f89e54a5482a09575ea))
* add quotas, advanced options, and toggles to collection request modal ([#1742](https://github.com/fallenbagel/jellyseerr/issues/1742)) ([af40212](https://github.com/fallenbagel/jellyseerr/commit/af40212a738f8d6d9a5bf26dc20c0c87780d6020))
* allow Jellyfin to set a playback URL different to the Jellyfin host specified during setup ([9fbc407](https://github.com/fallenbagel/jellyseerr/commit/9fbc4074e491bbeba7880fd54c99d4e3c95c7d01))
* **api:** add additional request counts ([#2426](https://github.com/fallenbagel/jellyseerr/issues/2426)) ([2535edc](https://github.com/fallenbagel/jellyseerr/commit/2535edcc7fd6ec66fd45ad754c03929f1fe94871))
* **discord:** add 'Enable Mentions' setting ([#1779](https://github.com/fallenbagel/jellyseerr/issues/1779)) ([5f7538a](https://github.com/fallenbagel/jellyseerr/commit/5f7538ae2bf9c6e2feea385cc299bd08df071218))
* display release dates for theatrical, digital, and physical release types ([#1492](https://github.com/fallenbagel/jellyseerr/issues/1492)) ([a4dca23](https://github.com/fallenbagel/jellyseerr/commit/a4dca2356b7605026f7bc45b691496e765c3328c))
* dynamically fetch login screen backdrop images ([#2206](https://github.com/fallenbagel/jellyseerr/issues/2206)) ([3486d0b](https://github.com/fallenbagel/jellyseerr/commit/3486d0bf5520cbdff60bd8fd023caed76c452973))
* **frontend:** add Discovery+ to network slider ([#2345](https://github.com/fallenbagel/jellyseerr/issues/2345)) ([2ded8f5](https://github.com/fallenbagel/jellyseerr/commit/2ded8f5484168bd7b8f45124d9ebdd296a5708d5))
* **frontend:** add Hulu to network slider ([#2204](https://github.com/fallenbagel/jellyseerr/issues/2204)) ([1e402f7](https://github.com/fallenbagel/jellyseerr/commit/1e402f710b53c11855aab0abdb4b12c51c30b022))
* **frontend:** open media management slideover on status badge click ([#2407](https://github.com/fallenbagel/jellyseerr/issues/2407)) ([1f5785d](https://github.com/fallenbagel/jellyseerr/commit/1f5785d6c53b2ca2da67a8ccee72165c052c61a1))
* implement import users from Jellyfin button ([9e2f3f0](https://github.com/fallenbagel/jellyseerr/commit/9e2f3f06393e71ba5d1c0ba3c9512b64a3ce3ad7))
* initialize Jellyfin/Emby users with local login ([103350f](https://github.com/fallenbagel/jellyseerr/commit/103350fe146fbf212b12a3348bcfb40399e1a0fc))
* issues ([#2180](https://github.com/fallenbagel/jellyseerr/issues/2180)) ([e402c42](https://github.com/fallenbagel/jellyseerr/commit/e402c42aaa7d795cd724856a2e23615bb1a3695d))
* **jobs:** allow modifying job schedules ([#1440](https://github.com/fallenbagel/jellyseerr/issues/1440)) ([82614ca](https://github.com/fallenbagel/jellyseerr/commit/82614ca4410782a12d65b4c0a6526ff064be1241))
* **lang:** add Albanian display language ([#2605](https://github.com/fallenbagel/jellyseerr/issues/2605)) ([3d32462](https://github.com/fallenbagel/jellyseerr/commit/3d32462f50b4ced0d9205b79003c35d6d1c948a3))
* **lang:** add Czech and Danish display languages ([#2176](https://github.com/fallenbagel/jellyseerr/issues/2176)) ([8d8db6c](https://github.com/fallenbagel/jellyseerr/commit/8d8db6cf5d98d4e498a31db339d02f8a98057c8d))
* **lang:** add Polish display language ([#2261](https://github.com/fallenbagel/jellyseerr/issues/2261)) ([c760cea](https://github.com/fallenbagel/jellyseerr/commit/c760ceaa5f36c77fa3ce320fae1b4597d2d8b976))
* **lang:** translated using Weblate (Chinese (Traditional)) ([#2272](https://github.com/fallenbagel/jellyseerr/issues/2272)) ([d401e33](https://github.com/fallenbagel/jellyseerr/commit/d401e33249cbbca6e707479e5f0207e298ef3248))
* **lang:** translations update from Hosted Weblate ([#2277](https://github.com/fallenbagel/jellyseerr/issues/2277)) ([92732fc](https://github.com/fallenbagel/jellyseerr/commit/92732fcb42c56242d16daab00e2d38740b92dea0))
* **lang:** translations update from Hosted Weblate ([#2315](https://github.com/fallenbagel/jellyseerr/issues/2315)) ([6245be1](https://github.com/fallenbagel/jellyseerr/commit/6245be1e10dda67c869b59522c1290e7c100145f))
* **lang:** translations update from Hosted Weblate ([#2320](https://github.com/fallenbagel/jellyseerr/issues/2320)) ([68112fa](https://github.com/fallenbagel/jellyseerr/commit/68112faefbd64d5c71d3eff21620767f88ccfc34))
* **lang:** translations update from Hosted Weblate ([#2325](https://github.com/fallenbagel/jellyseerr/issues/2325)) ([febf067](https://github.com/fallenbagel/jellyseerr/commit/febf0677b880d2fed2822ce510db7cbb0826a920))
* **lang:** translations update from Hosted Weblate ([#2336](https://github.com/fallenbagel/jellyseerr/issues/2336)) ([3f7ef7a](https://github.com/fallenbagel/jellyseerr/commit/3f7ef7af97a807ef38041f4f2642b565aa33d066))
* **lang:** translations update from Hosted Weblate ([#2341](https://github.com/fallenbagel/jellyseerr/issues/2341)) ([33fe0bd](https://github.com/fallenbagel/jellyseerr/commit/33fe0bdd1e00da40e85b4e4b4780134b31a105d2))
* **lang:** translations update from Hosted Weblate ([#2346](https://github.com/fallenbagel/jellyseerr/issues/2346)) ([50dc934](https://github.com/fallenbagel/jellyseerr/commit/50dc9341dd98cb2d8ef3ef6471882a5a9b060afa))
* **lang:** translations update from Hosted Weblate ([#2364](https://github.com/fallenbagel/jellyseerr/issues/2364)) ([d437cc2](https://github.com/fallenbagel/jellyseerr/commit/d437cc25392e9c0881888371ffabc82892a1b15c))
* **lang:** translations update from Hosted Weblate ([#2366](https://github.com/fallenbagel/jellyseerr/issues/2366)) ([cc2b2bc](https://github.com/fallenbagel/jellyseerr/commit/cc2b2bc7a8ecd89e1feb38a907596b16df9bf0fc))
* **lang:** translations update from Hosted Weblate ([#2374](https://github.com/fallenbagel/jellyseerr/issues/2374)) ([b9bedac](https://github.com/fallenbagel/jellyseerr/commit/b9bedac7d7ba85223ecf1d9b93b96e2a490d571a))
* **lang:** translations update from Hosted Weblate ([#2379](https://github.com/fallenbagel/jellyseerr/issues/2379)) ([bd93168](https://github.com/fallenbagel/jellyseerr/commit/bd93168ba1ed650baf4024569bb6a76811a99820))
* **lang:** translations update from Hosted Weblate ([#2389](https://github.com/fallenbagel/jellyseerr/issues/2389)) ([d2241a4](https://github.com/fallenbagel/jellyseerr/commit/d2241a41877d126a802fc53c925d258af31f34fd))
* **lang:** translations update from Hosted Weblate ([#2404](https://github.com/fallenbagel/jellyseerr/issues/2404)) ([1b29b15](https://github.com/fallenbagel/jellyseerr/commit/1b29b15d7c9a7ec918cb59116d60e1ae2e797dc4))
* **lang:** translations update from Hosted Weblate ([#2405](https://github.com/fallenbagel/jellyseerr/issues/2405)) ([879df20](https://github.com/fallenbagel/jellyseerr/commit/879df20022c8c5d9b32858ac5499d3e4369fc064))
* **lang:** translations update from Hosted Weblate ([#2414](https://github.com/fallenbagel/jellyseerr/issues/2414)) ([88536b1](https://github.com/fallenbagel/jellyseerr/commit/88536b1f9d6e8c1a11e1adf91b85bab4f34b751c))
* **lang:** translations update from Hosted Weblate ([#2425](https://github.com/fallenbagel/jellyseerr/issues/2425)) ([e9d4b63](https://github.com/fallenbagel/jellyseerr/commit/e9d4b6327b50a005ee6c2c3292b6f107e90fc50c))
* **lang:** translations update from Hosted Weblate ([#2428](https://github.com/fallenbagel/jellyseerr/issues/2428)) ([f8b1bcc](https://github.com/fallenbagel/jellyseerr/commit/f8b1bccda44371bb6f3f8f4ceeab900b1df3de31))
* **lang:** translations update from Hosted Weblate ([#2436](https://github.com/fallenbagel/jellyseerr/issues/2436)) ([99c0407](https://github.com/fallenbagel/jellyseerr/commit/99c04072e9f7be8191f25cbcfd5103017b8796eb))
* **lang:** translations update from Hosted Weblate ([#2452](https://github.com/fallenbagel/jellyseerr/issues/2452)) ([b5bd6ee](https://github.com/fallenbagel/jellyseerr/commit/b5bd6ee78f3d4aa14f0c440d1f2a8323dccfa399))
* **lang:** translations update from Hosted Weblate ([#2457](https://github.com/fallenbagel/jellyseerr/issues/2457)) ([92b2d32](https://github.com/fallenbagel/jellyseerr/commit/92b2d32d2e1e1d319410a9e357e1304065a77598))
* **lang:** translations update from Hosted Weblate ([#2489](https://github.com/fallenbagel/jellyseerr/issues/2489)) ([ec08fa6](https://github.com/fallenbagel/jellyseerr/commit/ec08fa67934715ff4a4d618d5b9ff97853913b78))
* **lang:** translations update from Hosted Weblate ([#2508](https://github.com/fallenbagel/jellyseerr/issues/2508)) ([9f4ae34](https://github.com/fallenbagel/jellyseerr/commit/9f4ae34da76707a40e2c89a50c722ffa1c0327c0))
* **lang:** translations update from Hosted Weblate ([#2531](https://github.com/fallenbagel/jellyseerr/issues/2531)) ([54b32eb](https://github.com/fallenbagel/jellyseerr/commit/54b32ebfd6b2eb6aeeea98c25939166eda8cc17f))
* **lang:** translations update from Hosted Weblate ([#2541](https://github.com/fallenbagel/jellyseerr/issues/2541)) ([4549ed3](https://github.com/fallenbagel/jellyseerr/commit/4549ed389e4f25c0946dc01526387e5ac000c3cf))
* **lang:** translations update from Hosted Weblate ([#2611](https://github.com/fallenbagel/jellyseerr/issues/2611)) ([81c75c8](https://github.com/fallenbagel/jellyseerr/commit/81c75c800edf6d36a1082a291ef7e308f338d005))
* **lang:** translations update from Hosted Weblate ([#2629](https://github.com/fallenbagel/jellyseerr/issues/2629)) ([1d0cbd2](https://github.com/fallenbagel/jellyseerr/commit/1d0cbd2e761072be0b4b3de461397ad9f9f681f3))
* **lang:** translations update from Hosted Weblate ([#2645](https://github.com/fallenbagel/jellyseerr/issues/2645)) ([341e3b8](https://github.com/fallenbagel/jellyseerr/commit/341e3b8f0657e09f53ad0b813b051290947343c0))
* **lang:** translations update from Weblate ([#2101](https://github.com/fallenbagel/jellyseerr/issues/2101)) ([c73cf7b](https://github.com/fallenbagel/jellyseerr/commit/c73cf7b19cbc19e97a777c0facb9264fb0113093))
* **lang:** translations update from Weblate ([#2179](https://github.com/fallenbagel/jellyseerr/issues/2179)) ([e3312ce](https://github.com/fallenbagel/jellyseerr/commit/e3312cef33821c8cb76a4a63bd565c78d67b3e0b))
* **lang:** translations update from Weblate ([#2185](https://github.com/fallenbagel/jellyseerr/issues/2185)) ([dce10f7](https://github.com/fallenbagel/jellyseerr/commit/dce10f743f52cb04036e2cdaee280e26a81b253b))
* **lang:** translations update from Weblate ([#2202](https://github.com/fallenbagel/jellyseerr/issues/2202)) ([492d8e3](https://github.com/fallenbagel/jellyseerr/commit/492d8e3daa5fb99aa9df2a18978085d5ddd581e7))
* **lang:** translations update from Weblate ([#2210](https://github.com/fallenbagel/jellyseerr/issues/2210)) ([0a6ef6c](https://github.com/fallenbagel/jellyseerr/commit/0a6ef6cc81376f7a02f1483109be7ae4ab851c48))
* **lang:** translations update from Weblate ([#2226](https://github.com/fallenbagel/jellyseerr/issues/2226)) ([62b3dc5](https://github.com/fallenbagel/jellyseerr/commit/62b3dc5471c28f4d0e4399cb3bc8bfab94cff5ea))
* **lang:** translations update from Weblate ([#2241](https://github.com/fallenbagel/jellyseerr/issues/2241)) ([2b0b8e0](https://github.com/fallenbagel/jellyseerr/commit/2b0b8e05d9c95ff9218cea858a920a2815871186))
* **lang:** translations update from Weblate ([#2244](https://github.com/fallenbagel/jellyseerr/issues/2244)) ([0828b00](https://github.com/fallenbagel/jellyseerr/commit/0828b008badc8b512316799a6787bb7c403658d5))
* **lang:** translations update from Weblate ([#2247](https://github.com/fallenbagel/jellyseerr/issues/2247)) ([8c49309](https://github.com/fallenbagel/jellyseerr/commit/8c49309c35c31f7bcd0b84b0a307febc16842f68))
* **lang:** translations update from Weblate ([#2252](https://github.com/fallenbagel/jellyseerr/issues/2252)) ([99d5000](https://github.com/fallenbagel/jellyseerr/commit/99d50004e58f6b4594df0a171f6bc668635ec50c))
* **lang:** translations update from Weblate ([#2265](https://github.com/fallenbagel/jellyseerr/issues/2265)) ([b1b367a](https://github.com/fallenbagel/jellyseerr/commit/b1b367aac625ed3eb865832c94c2352e5a5c40f5))
* **logs:** use separate json file to parse logs for log viewer ([#2399](https://github.com/fallenbagel/jellyseerr/issues/2399)) ([ce31bef](https://github.com/fallenbagel/jellyseerr/commit/ce31bef8a125c5492f2a1cfef0dcf3d8a4e9ee11))
* **notif:** 4K media notifications ([#2324](https://github.com/fallenbagel/jellyseerr/issues/2324)) ([88a8c1a](https://github.com/fallenbagel/jellyseerr/commit/88a8c1aa596e1113d6da52e5e8cbe443abc6384f))
* **notif:** add Gotify agent ([#2196](https://github.com/fallenbagel/jellyseerr/issues/2196)) ([e0b6abe](https://github.com/fallenbagel/jellyseerr/commit/e0b6abe4796f5a324c0ff78cff317fcaead671f1)), closes [#2183](https://github.com/fallenbagel/jellyseerr/issues/2183) [#2183](https://github.com/fallenbagel/jellyseerr/issues/2183) [#2077](https://github.com/fallenbagel/jellyseerr/issues/2077) [#2183](https://github.com/fallenbagel/jellyseerr/issues/2183) [#2183](https://github.com/fallenbagel/jellyseerr/issues/2183) [#2183](https://github.com/fallenbagel/jellyseerr/issues/2183) [#2077](https://github.com/fallenbagel/jellyseerr/issues/2077) [#2183](https://github.com/fallenbagel/jellyseerr/issues/2183) [#2183](https://github.com/fallenbagel/jellyseerr/issues/2183) [#2183](https://github.com/fallenbagel/jellyseerr/issues/2183)
* **notif:** add Pushbullet and Pushover agents to user notification settings ([#1740](https://github.com/fallenbagel/jellyseerr/issues/1740)) ([aeb7a48](https://github.com/fallenbagel/jellyseerr/commit/aeb7a48d72cec3fa2b857030aad3eaa0a457a896))
* **notif:** add Pushbullet channel tag ([#2198](https://github.com/fallenbagel/jellyseerr/issues/2198)) ([f9200b7](https://github.com/fallenbagel/jellyseerr/commit/f9200b7977208f9b8267ce3a74bd8a86d6f28f7b))
* **notif:** issue notifications ([#2242](https://github.com/fallenbagel/jellyseerr/issues/2242)) ([c9ffac3](https://github.com/fallenbagel/jellyseerr/commit/c9ffac33f7c04d926f8c45295703689d42fe87af))
* **plex:** selective user import ([#2188](https://github.com/fallenbagel/jellyseerr/issues/2188)) ([9cb97db](https://github.com/fallenbagel/jellyseerr/commit/9cb97db13ced5df2dc595cd9033470b1a0750093))
* remove email requirement for jellyfin/emby non-admin users ([3e1e11d](https://github.com/fallenbagel/jellyseerr/commit/3e1e11d9d93e5d055c92989361a3ced3b77b1d39))
* **search:** close search bar when hitting return ([#2260](https://github.com/fallenbagel/jellyseerr/issues/2260)) ([b423dc1](https://github.com/fallenbagel/jellyseerr/commit/b423dc167d12f0ba49f902876bceb2e876e35f58))
* **search:** filter search results by year ([#2460](https://github.com/fallenbagel/jellyseerr/issues/2460)) ([72c825d](https://github.com/fallenbagel/jellyseerr/commit/72c825d2a5109688bcc1991a30249284bf281500))
* **search:** search by id ([#2082](https://github.com/fallenbagel/jellyseerr/issues/2082)) ([b31cdbf](https://github.com/fallenbagel/jellyseerr/commit/b31cdbf074d5dbecbbf6da135a9b686aea9e3c0e))
* **servarr:** auto fill base url when testing service if missing ([#1995](https://github.com/fallenbagel/jellyseerr/issues/1995)) ([739f667](https://github.com/fallenbagel/jellyseerr/commit/739f667b54d8dec258b74d0cd8fd8b3b88dcf8d5))
* Tautulli integration ([#2230](https://github.com/fallenbagel/jellyseerr/issues/2230)) ([0842c23](https://github.com/fallenbagel/jellyseerr/commit/0842c233d0fc56d44824cad18749492cd52cbed5))
* **tautulli:** validate upon saving settings ([#2511](https://github.com/fallenbagel/jellyseerr/issues/2511)) ([1dc900d](https://github.com/fallenbagel/jellyseerr/commit/1dc900d5ce9689d179c9d2f554abc74ca50bd9cb))
* **ui:** add trakt external link ([#2367](https://github.com/fallenbagel/jellyseerr/issues/2367)) ([4e56bae](https://github.com/fallenbagel/jellyseerr/commit/4e56bae98508c1a60aeb3a08560ba1c00acce7e7))
* **ui:** allow admins to edit & approve request from advanced request modal ([#2067](https://github.com/fallenbagel/jellyseerr/issues/2067)) ([340f1a2](https://github.com/fallenbagel/jellyseerr/commit/340f1a211952bd2e8f40f0ea4622b52dbe934e85))
* **ui:** link processing/requested status badges to service URL ([#1761](https://github.com/fallenbagel/jellyseerr/issues/1761)) ([032c14a](https://github.com/fallenbagel/jellyseerr/commit/032c14a22680f62f8106943297b081b68645ce61))
* verify Plex server access during auth for existing users with Plex IDs ([#2458](https://github.com/fallenbagel/jellyseerr/issues/2458)) ([85bb30e](https://github.com/fallenbagel/jellyseerr/commit/85bb30e252c27047ae367491f0e5bb92a7d52605))

## [1.29.1](https://github.com/sct/overseerr/compare/v1.29.0...v1.29.1) (2022-04-06)

### Bug Fixes

- **auth:** resolve local/password authentication issues ([#2677](https://github.com/sct/overseerr/issues/2677)) ([b75fc7b](https://github.com/sct/overseerr/commit/b75fc7b2384ce760432620faaa92277dcd42b8e1))

# [1.29.0](https://github.com/sct/overseerr/compare/v1.28.0...v1.29.0) (2022-04-01)

### Bug Fixes

- add Discord ID setting to general user settings page ([#2406](https://github.com/sct/overseerr/issues/2406)) ([eff665e](https://github.com/sct/overseerr/commit/eff665ef4b688aac881408790304b77bd9a31ddb))
- address unhandled promise rejections & bump node to v16.13 ([#2398](https://github.com/sct/overseerr/issues/2398)) ([8cba486](https://github.com/sct/overseerr/commit/8cba486249fed88232e93a688c8bfe0f6179c589))
- **css:** rename form-input to form-input-area ([#2613](https://github.com/sct/overseerr/issues/2613)) ([086f0b6](https://github.com/sct/overseerr/commit/086f0b6ce23f607d20c2cec3c73b2e4d1ce9b426))
- **email:** enclose PGP encryption logic in try/catch ([#2519](https://github.com/sct/overseerr/issues/2519)) ([a76b608](https://github.com/sct/overseerr/commit/a76b608ab796944c0c660e3296a7aca6615d69f3))
- **frontend:** disable autocomplete on search field ([#2592](https://github.com/sct/overseerr/issues/2592)) ([82d1617](https://github.com/sct/overseerr/commit/82d16177bf763fe8097b4aae326793e3e21e847d))
- **frontend:** theme-color meta tag ([#2420](https://github.com/sct/overseerr/issues/2420)) ([ff28c9b](https://github.com/sct/overseerr/commit/ff28c9bfebf4a930e2542ee3b3c35f8af4e1b97e))
- **frontend:** various fixes ([#2524](https://github.com/sct/overseerr/issues/2524)) ([c3dbd0d](https://github.com/sct/overseerr/commit/c3dbd0d6913946e0e1b5308edfbb5ca744740223))
- **lang:** rename 'Media' notification types for clarity ([#2400](https://github.com/sct/overseerr/issues/2400)) ([399b037](https://github.com/sct/overseerr/commit/399b0379186ed34dcc436bd95330fd1a05fef4b3))
- **lang:** translations update from Hosted Weblate ([#2625](https://github.com/sct/overseerr/issues/2625)) ([19cdedd](https://github.com/sct/overseerr/commit/19cdedd2a6656b1a852e1cc653bbdb140e978b51))
- **lang:** translations update from Hosted Weblate ([#2639](https://github.com/sct/overseerr/issues/2639)) ([418a533](https://github.com/sct/overseerr/commit/418a533588bbbdbbbb4caee1ef91d57c1ca35717))
- **logs:** handle log message nested extra properties ([#2459](https://github.com/sct/overseerr/issues/2459)) ([d777940](https://github.com/sct/overseerr/commit/d7779408d162949b2eafcacefc8eabe53fae229f))
- **notif:** duplicate notification check logic ([#2424](https://github.com/sct/overseerr/issues/2424)) ([10651ba](https://github.com/sct/overseerr/commit/10651baa675993f7109989bbac67f54661c8693f))
- **notif:** show event in pop up notification for slack ([#2413](https://github.com/sct/overseerr/issues/2413)) ([d4438c8](https://github.com/sct/overseerr/commit/d4438c82e3753c9b29b6269ad406d263b3fcef4c)), closes [#2408](https://github.com/sct/overseerr/issues/2408)
- **plex:** correctly generate uuid for safari ([#2614](https://github.com/sct/overseerr/issues/2614)) ([d06f2cd](https://github.com/sct/overseerr/commit/d06f2cdb08bfa6f05cf7cec2c408a258fa926b09))
- **plex:** find TV series in addition to movies from IMDb IDs ([#1830](https://github.com/sct/overseerr/issues/1830)) ([30644f6](https://github.com/sct/overseerr/commit/30644f65ea2e8437676422ae0b083c642a836887))
- **plex:** include 'Overseerr' in X-Plex-Device-Name header ([#2635](https://github.com/sct/overseerr/issues/2635)) ([d4f9650](https://github.com/sct/overseerr/commit/d4f9650cd07704a97f8b591b7de7351c1e85b825))
- **plex:** use unique client identifier ([#2602](https://github.com/sct/overseerr/issues/2602)) ([648b346](https://github.com/sct/overseerr/commit/648b346cbe5a941c7e1ec4ddfb276fb0e27ed502))
- **plex:** user import ([#2442](https://github.com/sct/overseerr/issues/2442)) ([86dff12](https://github.com/sct/overseerr/commit/86dff12cdeef6dca92527dd31757a3a4c7f921bf))
- **radarr:** correctly check for existing movies ([#2490](https://github.com/sct/overseerr/issues/2490)) ([5d4b06b](https://github.com/sct/overseerr/commit/5d4b06bbcc6cf6d328f6b4a86c4c0f9b0f3aff3e))
- **radarr:** remove PreDB minimum availability option ([#2386](https://github.com/sct/overseerr/issues/2386)) ([3e5eb4e](https://github.com/sct/overseerr/commit/3e5eb4e148a9f88b871abc4ee1784b870f691534))
- **requests:** check for existing media of same type when requesting ([#2445](https://github.com/sct/overseerr/issues/2445)) ([eb9ca2e](https://github.com/sct/overseerr/commit/eb9ca2e86f3be3f4ff8ee2e7c4aecdf337d8976d))
- **sonarr:** monitor existing series upon request approval ([#2553](https://github.com/sct/overseerr/issues/2553)) ([aa062d9](https://github.com/sct/overseerr/commit/aa062d921c425d4b64bfdb28a5f102b0c92f7d87))
- **sonarr:** only scan seasons that exist in TMDb ([#2523](https://github.com/sct/overseerr/issues/2523)) ([6168185](https://github.com/sct/overseerr/commit/61681857b123802aaeff02a8f61b1ba046c5d333))
- **tautulli:** fetch additional user history as necessary to return 20 unique media ([#2446](https://github.com/sct/overseerr/issues/2446)) ([7d19de6](https://github.com/sct/overseerr/commit/7d19de6a4af6297be18140ca59402b40f7bbb30b))

### Features

- **about:** show config directory ([#2600](https://github.com/sct/overseerr/issues/2600)) ([0c7373c](https://github.com/sct/overseerr/commit/0c7373c7e89a4ff717efaa7d6a5854f7ccd6a8d3))
- **api:** add additional request counts ([#2426](https://github.com/sct/overseerr/issues/2426)) ([2535edc](https://github.com/sct/overseerr/commit/2535edcc7fd6ec66fd45ad754c03929f1fe94871))
- **discord:** add 'Enable Mentions' setting ([#1779](https://github.com/sct/overseerr/issues/1779)) ([5f7538a](https://github.com/sct/overseerr/commit/5f7538ae2bf9c6e2feea385cc299bd08df071218))
- **frontend:** open media management slideover on status badge click ([#2407](https://github.com/sct/overseerr/issues/2407)) ([1f5785d](https://github.com/sct/overseerr/commit/1f5785d6c53b2ca2da67a8ccee72165c052c61a1))
- **lang:** add Albanian display language ([#2605](https://github.com/sct/overseerr/issues/2605)) ([3d32462](https://github.com/sct/overseerr/commit/3d32462f50b4ced0d9205b79003c35d6d1c948a3))
- **lang:** translations update from Hosted Weblate ([#2379](https://github.com/sct/overseerr/issues/2379)) ([bd93168](https://github.com/sct/overseerr/commit/bd93168ba1ed650baf4024569bb6a76811a99820))
- **lang:** translations update from Hosted Weblate ([#2389](https://github.com/sct/overseerr/issues/2389)) ([d2241a4](https://github.com/sct/overseerr/commit/d2241a41877d126a802fc53c925d258af31f34fd))
- **lang:** translations update from Hosted Weblate ([#2404](https://github.com/sct/overseerr/issues/2404)) ([1b29b15](https://github.com/sct/overseerr/commit/1b29b15d7c9a7ec918cb59116d60e1ae2e797dc4))
- **lang:** translations update from Hosted Weblate ([#2405](https://github.com/sct/overseerr/issues/2405)) ([879df20](https://github.com/sct/overseerr/commit/879df20022c8c5d9b32858ac5499d3e4369fc064))
- **lang:** translations update from Hosted Weblate ([#2414](https://github.com/sct/overseerr/issues/2414)) ([88536b1](https://github.com/sct/overseerr/commit/88536b1f9d6e8c1a11e1adf91b85bab4f34b751c))
- **lang:** translations update from Hosted Weblate ([#2425](https://github.com/sct/overseerr/issues/2425)) ([e9d4b63](https://github.com/sct/overseerr/commit/e9d4b6327b50a005ee6c2c3292b6f107e90fc50c))
- **lang:** translations update from Hosted Weblate ([#2428](https://github.com/sct/overseerr/issues/2428)) ([f8b1bcc](https://github.com/sct/overseerr/commit/f8b1bccda44371bb6f3f8f4ceeab900b1df3de31))
- **lang:** translations update from Hosted Weblate ([#2436](https://github.com/sct/overseerr/issues/2436)) ([99c0407](https://github.com/sct/overseerr/commit/99c04072e9f7be8191f25cbcfd5103017b8796eb))
- **lang:** translations update from Hosted Weblate ([#2452](https://github.com/sct/overseerr/issues/2452)) ([b5bd6ee](https://github.com/sct/overseerr/commit/b5bd6ee78f3d4aa14f0c440d1f2a8323dccfa399))
- **lang:** translations update from Hosted Weblate ([#2457](https://github.com/sct/overseerr/issues/2457)) ([92b2d32](https://github.com/sct/overseerr/commit/92b2d32d2e1e1d319410a9e357e1304065a77598))
- **lang:** translations update from Hosted Weblate ([#2489](https://github.com/sct/overseerr/issues/2489)) ([ec08fa6](https://github.com/sct/overseerr/commit/ec08fa67934715ff4a4d618d5b9ff97853913b78))
- **lang:** translations update from Hosted Weblate ([#2508](https://github.com/sct/overseerr/issues/2508)) ([9f4ae34](https://github.com/sct/overseerr/commit/9f4ae34da76707a40e2c89a50c722ffa1c0327c0))
- **lang:** translations update from Hosted Weblate ([#2531](https://github.com/sct/overseerr/issues/2531)) ([54b32eb](https://github.com/sct/overseerr/commit/54b32ebfd6b2eb6aeeea98c25939166eda8cc17f))
- **lang:** translations update from Hosted Weblate ([#2541](https://github.com/sct/overseerr/issues/2541)) ([4549ed3](https://github.com/sct/overseerr/commit/4549ed389e4f25c0946dc01526387e5ac000c3cf))
- **lang:** translations update from Hosted Weblate ([#2611](https://github.com/sct/overseerr/issues/2611)) ([81c75c8](https://github.com/sct/overseerr/commit/81c75c800edf6d36a1082a291ef7e308f338d005))
- **lang:** translations update from Hosted Weblate ([#2629](https://github.com/sct/overseerr/issues/2629)) ([1d0cbd2](https://github.com/sct/overseerr/commit/1d0cbd2e761072be0b4b3de461397ad9f9f681f3))
- **lang:** translations update from Hosted Weblate ([#2645](https://github.com/sct/overseerr/issues/2645)) ([341e3b8](https://github.com/sct/overseerr/commit/341e3b8f0657e09f53ad0b813b051290947343c0))
- **logs:** use separate json file to parse logs for log viewer ([#2399](https://github.com/sct/overseerr/issues/2399)) ([ce31bef](https://github.com/sct/overseerr/commit/ce31bef8a125c5492f2a1cfef0dcf3d8a4e9ee11))
- **notif:** add Gotify agent ([#2196](https://github.com/sct/overseerr/issues/2196)) ([e0b6abe](https://github.com/sct/overseerr/commit/e0b6abe4796f5a324c0ff78cff317fcaead671f1)), closes [#2183](https://github.com/sct/overseerr/issues/2183) [#2183](https://github.com/sct/overseerr/issues/2183) [#2077](https://github.com/sct/overseerr/issues/2077) [#2183](https://github.com/sct/overseerr/issues/2183) [#2183](https://github.com/sct/overseerr/issues/2183) [#2183](https://github.com/sct/overseerr/issues/2183) [#2077](https://github.com/sct/overseerr/issues/2077) [#2183](https://github.com/sct/overseerr/issues/2183) [#2183](https://github.com/sct/overseerr/issues/2183) [#2183](https://github.com/sct/overseerr/issues/2183)
- **notif:** add Pushbullet channel tag ([#2198](https://github.com/sct/overseerr/issues/2198)) ([f9200b7](https://github.com/sct/overseerr/commit/f9200b7977208f9b8267ce3a74bd8a86d6f28f7b))
- **plex:** selective user import ([#2188](https://github.com/sct/overseerr/issues/2188)) ([9cb97db](https://github.com/sct/overseerr/commit/9cb97db13ced5df2dc595cd9033470b1a0750093))
- **search:** filter search results by year ([#2460](https://github.com/sct/overseerr/issues/2460)) ([72c825d](https://github.com/sct/overseerr/commit/72c825d2a5109688bcc1991a30249284bf281500))
- **search:** search by id ([#2082](https://github.com/sct/overseerr/issues/2082)) ([b31cdbf](https://github.com/sct/overseerr/commit/b31cdbf074d5dbecbbf6da135a9b686aea9e3c0e))
- Tautulli integration ([#2230](https://github.com/sct/overseerr/issues/2230)) ([0842c23](https://github.com/sct/overseerr/commit/0842c233d0fc56d44824cad18749492cd52cbed5))
- **tautulli:** validate upon saving settings ([#2511](https://github.com/sct/overseerr/issues/2511)) ([1dc900d](https://github.com/sct/overseerr/commit/1dc900d5ce9689d179c9d2f554abc74ca50bd9cb))
- **ui:** add trakt external link ([#2367](https://github.com/sct/overseerr/issues/2367)) ([4e56bae](https://github.com/sct/overseerr/commit/4e56bae98508c1a60aeb3a08560ba1c00acce7e7))
- verify Plex server access during auth for existing users with Plex IDs ([#2458](https://github.com/sct/overseerr/issues/2458)) ([85bb30e](https://github.com/sct/overseerr/commit/85bb30e252c27047ae367491f0e5bb92a7d52605))

# [1.28.0](https://github.com/sct/overseerr/compare/v1.27.0...v1.28.0) (2022-01-01)

### Bug Fixes

- add missing route guards to issues pages ([#2235](https://github.com/sct/overseerr/issues/2235)) ([c79dc9f](https://github.com/sct/overseerr/commit/c79dc9f70f512dbec0e3460ee78dbc9feccfbbb1))
- allow basic HTTP auth in hostname validation ([#2307](https://github.com/sct/overseerr/issues/2307)) ([d48a7ba](https://github.com/sct/overseerr/commit/d48a7ba518f9c79d70e499037cb730eb3efe2c08))
- **docker:** explicitly install python3 ([#2273](https://github.com/sct/overseerr/issues/2273)) [skip ci] ([f1cd087](https://github.com/sct/overseerr/commit/f1cd0878a5c74bddc864f5f8ce9e2f041bdde5ec))
- **email:** use decrypted private key ([#2232](https://github.com/sct/overseerr/issues/2232)) ([8d29685](https://github.com/sct/overseerr/commit/8d2968572a569ed77a4d7c14ae1dc69935fa847e))
- **frontend:** more issues-related fixes ([#2234](https://github.com/sct/overseerr/issues/2234)) ([3ec4a9c](https://github.com/sct/overseerr/commit/3ec4a9c76e1f31bee5c8801b389721bf8e5884e0))
- **frontend:** setup page backdrops ([#2251](https://github.com/sct/overseerr/issues/2251)) ([78a8091](https://github.com/sct/overseerr/commit/78a8091bcd29a7cf50cc7c493c28710389817adf))
- **frontend:** use consistent formatting & strings ([#2231](https://github.com/sct/overseerr/issues/2231)) ([2164471](https://github.com/sct/overseerr/commit/216447121b686b6d01a31b95ec0c8eb005f6b103))
- handle Plex library settings migration failure gracefully ([#2254](https://github.com/sct/overseerr/issues/2254)) ([ed53810](https://github.com/sct/overseerr/commit/ed53810fb33f70722361c67d176ff4edf531ba45))
- **issues:** only allow edit of own comments & do not allow non-admin delete of issues with comments ([#2248](https://github.com/sct/overseerr/issues/2248)) ([bba09d6](https://github.com/sct/overseerr/commit/bba09d69c1bc55c2f35db5a7986e7c935cc9619c))
- **lang:** add missing string ([#2370](https://github.com/sct/overseerr/issues/2370)) ([d36c1d2](https://github.com/sct/overseerr/commit/d36c1d29295020efb76bac21a443b6f9049802f3))
- **lang:** string edits ([#2229](https://github.com/sct/overseerr/issues/2229)) ([ab20c21](https://github.com/sct/overseerr/commit/ab20c21184639e1c7725f7cae96249c6fa157351))
- **lang:** translations update from Weblate ([#2212](https://github.com/sct/overseerr/issues/2212)) ([85aec4f](https://github.com/sct/overseerr/commit/85aec4f8925746ebae9bcc99d8480b78ccfd851e))
- **logs:** handle unexpected log messages ([#2303](https://github.com/sct/overseerr/issues/2303)) ([f284e4a](https://github.com/sct/overseerr/commit/f284e4ab978e502d2cc08e76226a8ebac91bb48f))
- **logs:** lazily parse log message label ([#2359](https://github.com/sct/overseerr/issues/2359)) ([5af06bd](https://github.com/sct/overseerr/commit/5af06bd87226fbc6176b0c5e362824793165a34e))
- **notif:** correct issue notif action URLs ([#2333](https://github.com/sct/overseerr/issues/2333)) ([dc7f959](https://github.com/sct/overseerr/commit/dc7f959cb422a8d89bcebc78377f1513412e542c))
- **notif:** only send MEDIA_AVAILABLE notifications for non-declined requests ([#2343](https://github.com/sct/overseerr/issues/2343)) ([fcb0dcf](https://github.com/sct/overseerr/commit/fcb0dcf5be64bf9ca814bfe119586908922099c5))
- **requests:** do not fail request edits if acting user lacks Manage Users permission ([#2338](https://github.com/sct/overseerr/issues/2338)) ([91bfff7](https://github.com/sct/overseerr/commit/91bfff71b7c05c9b9aad2c95282533eefbb6b2e7))
- secure session cookie ([#2308](https://github.com/sct/overseerr/issues/2308)) ([7f330af](https://github.com/sct/overseerr/commit/7f330aff2e1d3546e8dd1a3e4b037b9beb1cc7f0))
- **servarr:** handle baseurl error when testing connection ([#2294](https://github.com/sct/overseerr/issues/2294)) ([93b5ea2](https://github.com/sct/overseerr/commit/93b5ea20ca590996f6dc90713a76800180d0621c))
- **servarr:** handle servaarr server being unavailable when scanning downloads ([#2358](https://github.com/sct/overseerr/issues/2358)) ([488874f](https://github.com/sct/overseerr/commit/488874fc17e4e4719e90d383b83b1e1a5217213b))
- sort collection parts by release date ([#2368](https://github.com/sct/overseerr/issues/2368)) ([1b3797c](https://github.com/sct/overseerr/commit/1b3797cf6e6ef6b3d8c81e644382f6e3f68cfaaa))
- **ui:** request badge styling in request list ([#2302](https://github.com/sct/overseerr/issues/2302)) ([f2375c9](https://github.com/sct/overseerr/commit/f2375c902b79dcb1f349500862775ae57ea7d406))

### Features

- add production countries to movie/TV detail pages ([#2170](https://github.com/sct/overseerr/issues/2170)) ([30b20df](https://github.com/sct/overseerr/commit/30b20df37a9604ba1c066f89e54a5482a09575ea))
- add quotas, advanced options, and toggles to collection request modal ([#1742](https://github.com/sct/overseerr/issues/1742)) ([af40212](https://github.com/sct/overseerr/commit/af40212a738f8d6d9a5bf26dc20c0c87780d6020))
- **frontend:** add Discovery+ to network slider ([#2345](https://github.com/sct/overseerr/issues/2345)) ([2ded8f5](https://github.com/sct/overseerr/commit/2ded8f5484168bd7b8f45124d9ebdd296a5708d5))
- issues ([#2180](https://github.com/sct/overseerr/issues/2180)) ([e402c42](https://github.com/sct/overseerr/commit/e402c42aaa7d795cd724856a2e23615bb1a3695d))
- **lang:** add Polish display language ([#2261](https://github.com/sct/overseerr/issues/2261)) ([c760cea](https://github.com/sct/overseerr/commit/c760ceaa5f36c77fa3ce320fae1b4597d2d8b976))
- **lang:** translated using Weblate (Chinese (Traditional)) ([#2272](https://github.com/sct/overseerr/issues/2272)) ([d401e33](https://github.com/sct/overseerr/commit/d401e33249cbbca6e707479e5f0207e298ef3248))
- **lang:** translations update from Hosted Weblate ([#2277](https://github.com/sct/overseerr/issues/2277)) ([92732fc](https://github.com/sct/overseerr/commit/92732fcb42c56242d16daab00e2d38740b92dea0))
- **lang:** translations update from Hosted Weblate ([#2315](https://github.com/sct/overseerr/issues/2315)) ([6245be1](https://github.com/sct/overseerr/commit/6245be1e10dda67c869b59522c1290e7c100145f))
- **lang:** translations update from Hosted Weblate ([#2320](https://github.com/sct/overseerr/issues/2320)) ([68112fa](https://github.com/sct/overseerr/commit/68112faefbd64d5c71d3eff21620767f88ccfc34))
- **lang:** translations update from Hosted Weblate ([#2325](https://github.com/sct/overseerr/issues/2325)) ([febf067](https://github.com/sct/overseerr/commit/febf0677b880d2fed2822ce510db7cbb0826a920))
- **lang:** translations update from Hosted Weblate ([#2336](https://github.com/sct/overseerr/issues/2336)) ([3f7ef7a](https://github.com/sct/overseerr/commit/3f7ef7af97a807ef38041f4f2642b565aa33d066))
- **lang:** translations update from Hosted Weblate ([#2341](https://github.com/sct/overseerr/issues/2341)) ([33fe0bd](https://github.com/sct/overseerr/commit/33fe0bdd1e00da40e85b4e4b4780134b31a105d2))
- **lang:** translations update from Hosted Weblate ([#2346](https://github.com/sct/overseerr/issues/2346)) ([50dc934](https://github.com/sct/overseerr/commit/50dc9341dd98cb2d8ef3ef6471882a5a9b060afa))
- **lang:** translations update from Hosted Weblate ([#2364](https://github.com/sct/overseerr/issues/2364)) ([d437cc2](https://github.com/sct/overseerr/commit/d437cc25392e9c0881888371ffabc82892a1b15c))
- **lang:** translations update from Hosted Weblate ([#2366](https://github.com/sct/overseerr/issues/2366)) ([cc2b2bc](https://github.com/sct/overseerr/commit/cc2b2bc7a8ecd89e1feb38a907596b16df9bf0fc))
- **lang:** translations update from Hosted Weblate ([#2374](https://github.com/sct/overseerr/issues/2374)) ([b9bedac](https://github.com/sct/overseerr/commit/b9bedac7d7ba85223ecf1d9b93b96e2a490d571a))
- **lang:** translations update from Weblate ([#2226](https://github.com/sct/overseerr/issues/2226)) ([62b3dc5](https://github.com/sct/overseerr/commit/62b3dc5471c28f4d0e4399cb3bc8bfab94cff5ea))
- **lang:** translations update from Weblate ([#2241](https://github.com/sct/overseerr/issues/2241)) ([2b0b8e0](https://github.com/sct/overseerr/commit/2b0b8e05d9c95ff9218cea858a920a2815871186))
- **lang:** translations update from Weblate ([#2244](https://github.com/sct/overseerr/issues/2244)) ([0828b00](https://github.com/sct/overseerr/commit/0828b008badc8b512316799a6787bb7c403658d5))
- **lang:** translations update from Weblate ([#2247](https://github.com/sct/overseerr/issues/2247)) ([8c49309](https://github.com/sct/overseerr/commit/8c49309c35c31f7bcd0b84b0a307febc16842f68))
- **lang:** translations update from Weblate ([#2252](https://github.com/sct/overseerr/issues/2252)) ([99d5000](https://github.com/sct/overseerr/commit/99d50004e58f6b4594df0a171f6bc668635ec50c))
- **lang:** translations update from Weblate ([#2265](https://github.com/sct/overseerr/issues/2265)) ([b1b367a](https://github.com/sct/overseerr/commit/b1b367aac625ed3eb865832c94c2352e5a5c40f5))
- **notif:** 4K media notifications ([#2324](https://github.com/sct/overseerr/issues/2324)) ([88a8c1a](https://github.com/sct/overseerr/commit/88a8c1aa596e1113d6da52e5e8cbe443abc6384f))
- **notif:** add Pushbullet and Pushover agents to user notification settings ([#1740](https://github.com/sct/overseerr/issues/1740)) ([aeb7a48](https://github.com/sct/overseerr/commit/aeb7a48d72cec3fa2b857030aad3eaa0a457a896))
- **notif:** issue notifications ([#2242](https://github.com/sct/overseerr/issues/2242)) ([c9ffac3](https://github.com/sct/overseerr/commit/c9ffac33f7c04d926f8c45295703689d42fe87af))
- **search:** close search bar when hitting return ([#2260](https://github.com/sct/overseerr/issues/2260)) ([b423dc1](https://github.com/sct/overseerr/commit/b423dc167d12f0ba49f902876bceb2e876e35f58))
- **ui:** allow admins to edit & approve request from advanced request modal ([#2067](https://github.com/sct/overseerr/issues/2067)) ([340f1a2](https://github.com/sct/overseerr/commit/340f1a211952bd2e8f40f0ea4622b52dbe934e85))

# [1.27.0](https://github.com/sct/overseerr/compare/v1.26.1...v1.27.0) (2021-10-19)

### Bug Fixes

- **api:** return queried user's requests instead of own requests ([#2174](https://github.com/sct/overseerr/issues/2174)) ([0edb1f4](https://github.com/sct/overseerr/commit/0edb1f452b6ff4a49ae2bde15f7273769788cf4f))
- **api:** use query builder for user requests endpoint ([#2119](https://github.com/sct/overseerr/issues/2119)) ([a20f395](https://github.com/sct/overseerr/commit/a20f395c94c97dd7ddbc25590f15def2c9bf13c9))
- apply request overrides iff override & selected servers match ([#2164](https://github.com/sct/overseerr/issues/2164)) ([50ce198](https://github.com/sct/overseerr/commit/50ce198471b1a3777a183d68904bbfb39ebd4523))
- **email:** do not attempt to display logo if app URL not configured ([#2125](https://github.com/sct/overseerr/issues/2125)) ([b3b421a](https://github.com/sct/overseerr/commit/b3b421a67408a4a48d23c15341fcdf7aaf19b25a))
- **frontend:** notification type validation ([#2207](https://github.com/sct/overseerr/issues/2207)) ([2f204b9](https://github.com/sct/overseerr/commit/2f204b995269a53ae36f2a8733f27ae6ab70da5a))
- **scripts:** update migration scripts ([#2208](https://github.com/sct/overseerr/issues/2208)) [skip ci] ([d0ac74e](https://github.com/sct/overseerr/commit/d0ac74ea4bbfcf3d25d30cbd422d9df1c1259a18))
- **ui:** refinements for 'About' page ([#2173](https://github.com/sct/overseerr/issues/2173)) ([084a842](https://github.com/sct/overseerr/commit/084a842a4f9b6caaed22edbe77bc9e414bc1f387))

### Features

- display release dates for theatrical, digital, and physical release types ([#1492](https://github.com/sct/overseerr/issues/1492)) ([a4dca23](https://github.com/sct/overseerr/commit/a4dca2356b7605026f7bc45b691496e765c3328c))
- dynamically fetch login screen backdrop images ([#2206](https://github.com/sct/overseerr/issues/2206)) ([3486d0b](https://github.com/sct/overseerr/commit/3486d0bf5520cbdff60bd8fd023caed76c452973))
- **frontend:** add Hulu to network slider ([#2204](https://github.com/sct/overseerr/issues/2204)) ([1e402f7](https://github.com/sct/overseerr/commit/1e402f710b53c11855aab0abdb4b12c51c30b022))
- **jobs:** allow modifying job schedules ([#1440](https://github.com/sct/overseerr/issues/1440)) ([82614ca](https://github.com/sct/overseerr/commit/82614ca4410782a12d65b4c0a6526ff064be1241))
- **lang:** add Czech and Danish display languages ([#2176](https://github.com/sct/overseerr/issues/2176)) ([8d8db6c](https://github.com/sct/overseerr/commit/8d8db6cf5d98d4e498a31db339d02f8a98057c8d))
- **lang:** translations update from Weblate ([#2101](https://github.com/sct/overseerr/issues/2101)) ([c73cf7b](https://github.com/sct/overseerr/commit/c73cf7b19cbc19e97a777c0facb9264fb0113093))
- **lang:** translations update from Weblate ([#2179](https://github.com/sct/overseerr/issues/2179)) ([e3312ce](https://github.com/sct/overseerr/commit/e3312cef33821c8cb76a4a63bd565c78d67b3e0b))
- **lang:** translations update from Weblate ([#2185](https://github.com/sct/overseerr/issues/2185)) ([dce10f7](https://github.com/sct/overseerr/commit/dce10f743f52cb04036e2cdaee280e26a81b253b))
- **lang:** translations update from Weblate ([#2202](https://github.com/sct/overseerr/issues/2202)) ([492d8e3](https://github.com/sct/overseerr/commit/492d8e3daa5fb99aa9df2a18978085d5ddd581e7))
- **lang:** translations update from Weblate ([#2210](https://github.com/sct/overseerr/issues/2210)) ([0a6ef6c](https://github.com/sct/overseerr/commit/0a6ef6cc81376f7a02f1483109be7ae4ab851c48))
- **plex-scan:** plex scanner improvements ([#2105](https://github.com/sct/overseerr/issues/2105)) ([afda9c7](https://github.com/sct/overseerr/commit/afda9c7dc222137b0e6654a6beb4737cf2c1752e))
- **servarr:** auto fill base url when testing service if missing ([#1995](https://github.com/sct/overseerr/issues/1995)) ([739f667](https://github.com/sct/overseerr/commit/739f667b54d8dec258b74d0cd8fd8b3b88dcf8d5))
- **ui:** link processing/requested status badges to service URL ([#1761](https://github.com/sct/overseerr/issues/1761)) ([032c14a](https://github.com/sct/overseerr/commit/032c14a22680f62f8106943297b081b68645ce61))

## [1.26.1](https://github.com/sct/overseerr/compare/v1.26.0...v1.26.1) (2021-09-20)

### Bug Fixes

- **rt-api:** correctly format movie urls ([4c6009b](https://github.com/sct/overseerr/commit/4c6009bc2c3ff5f657a806363e3bdf7cd83d4261))

# [1.26.0](https://github.com/sct/overseerr/compare/v1.25.0...v1.26.0) (2021-09-19)

### Bug Fixes

- **email:** omit links when application URL is not configured ([#1806](https://github.com/sct/overseerr/issues/1806)) ([1133a34](https://github.com/sct/overseerr/commit/1133a34ffdf95c4d036be0264fe7f94f64007e8f))
- **lang:** minor changes to password reset strings ([#1798](https://github.com/sct/overseerr/issues/1798)) ([a41245c](https://github.com/sct/overseerr/commit/a41245c703688743ec24f9b4a53e70f3340daa0f))
- **notif:** truncate media overviews ([#1800](https://github.com/sct/overseerr/issues/1800)) ([42e45f3](https://github.com/sct/overseerr/commit/42e45f38e5ede7df0fc4bdb20a970917b2361569))
- **plex:** do not fail to scan empty libraries ([#1771](https://github.com/sct/overseerr/issues/1771)) ([6789b87](https://github.com/sct/overseerr/commit/6789b8701cb644d9a3f1384f30b3dff707201ef7))
- **quota:** block multi-season requests that would exceed a user's quota ([#1874](https://github.com/sct/overseerr/issues/1874)) ([8a55f85](https://github.com/sct/overseerr/commit/8a55f85d3ef14ccb83b139acb35d0746431637be))
- **rt-api:** use rotten-tomatoes 2.0 search api for movies ([a11bb49](https://github.com/sct/overseerr/commit/a11bb49663ec345332c4dd70ddbb49ce230b5c3c))
- **ui:** center logo on password reset pages ([#1807](https://github.com/sct/overseerr/issues/1807)) ([b8e82b5](https://github.com/sct/overseerr/commit/b8e82b5b4d3cb49ec372e3dce3cd89dff440ffd0))
- **ui:** change sidebar breakpoint to lg ([#1972](https://github.com/sct/overseerr/issues/1972)) ([70bd9e9](https://github.com/sct/overseerr/commit/70bd9e9308b607206b60a2a36a511de6e397a3db))
- **ui:** do not allow submission of invalid form inputs ([#1799](https://github.com/sct/overseerr/issues/1799)) ([910d00c](https://github.com/sct/overseerr/commit/910d00c19522a70125bfb5e5081a7ef4000e7f54))
- **ui:** do not display negative remaining quota ([#1859](https://github.com/sct/overseerr/issues/1859)) ([3841fb0](https://github.com/sct/overseerr/commit/3841fb06ebe1e09250362cc6cb401fdca12eef7f))
- **ui:** fix notifications settings buttons overflowing ([#1911](https://github.com/sct/overseerr/issues/1911)) ([0ce18b2](https://github.com/sct/overseerr/commit/0ce18b21ca547af6c083c3f248e22b7daf92aef0))
- **ui:** sort 'Request As' user dropdown by display name ([#2099](https://github.com/sct/overseerr/issues/2099)) ([bb09f8e](https://github.com/sct/overseerr/commit/bb09f8eaf70f6d0c981f31bd5f3c8afb2fe101ab))
- **webpush:** load user in push sub query ([#1894](https://github.com/sct/overseerr/issues/1894)) ([6f2db6a](https://github.com/sct/overseerr/commit/6f2db6a6ccf299262cf86d91acf639b921f28286))
- correct logo filename ([#1805](https://github.com/sct/overseerr/issues/1805)) ([f95be83](https://github.com/sct/overseerr/commit/f95be832f95a68b114ff24a65ffa0ebbd71b4121))

### Features

- list streaming providers on movie/TV detail pages ([#1778](https://github.com/sct/overseerr/issues/1778)) ([98ece67](https://github.com/sct/overseerr/commit/98ece67655a5dffe894974e337a3603afeed0236))
- **lang:** add Simplified Chinese display language ([#2032](https://github.com/sct/overseerr/issues/2032)) ([590ea7e](https://github.com/sct/overseerr/commit/590ea7e40460e381377b212d00869f191908b41f))
- **lang:** translated using Weblate (German) ([#1791](https://github.com/sct/overseerr/issues/1791)) ([15f7941](https://github.com/sct/overseerr/commit/15f7941269075b7e12de8bbc0f98418af70df380))
- **lang:** translations update from Weblate ([#1772](https://github.com/sct/overseerr/issues/1772)) ([6a75a05](https://github.com/sct/overseerr/commit/6a75a05c2348455d5374132a2574d988879d543a))
- **lang:** translations update from Weblate ([#1796](https://github.com/sct/overseerr/issues/1796)) ([57b52fc](https://github.com/sct/overseerr/commit/57b52fc9cccd3fac93cdb68e36cf652ddbcdf86c))
- **lang:** translations update from Weblate ([#1910](https://github.com/sct/overseerr/issues/1910)) ([fe89fd5](https://github.com/sct/overseerr/commit/fe89fd5f12460cb1b3acb09fb16b62497ef50f5f))
- **lang:** translations update from Weblate ([#2058](https://github.com/sct/overseerr/issues/2058)) ([db42c46](https://github.com/sct/overseerr/commit/db42c4678145d2a9676aa71b6773607b696f7cea))
- **notif:** Restyle HTML email notifications Part 2 ([#1917](https://github.com/sct/overseerr/issues/1917)) ([376149d](https://github.com/sct/overseerr/commit/376149d6ebb4db28d949391115f475afdd4e7d48))
- **ui:** add 'show more/less...' for studios on movie details page ([#1770](https://github.com/sct/overseerr/issues/1770)) ([680ea0c](https://github.com/sct/overseerr/commit/680ea0c87a9ae143413354680c421d62bccd869d))
- new logo, who dis? ([#1802](https://github.com/sct/overseerr/issues/1802)) ([beb5637](https://github.com/sct/overseerr/commit/beb5637d9f5c01d773eaee93035b7c195c2ae5f2))

# [1.25.0](https://github.com/sct/overseerr/compare/v1.24.0...v1.25.0) (2021-06-10)

### Bug Fixes

- **frontend:** add missing route guards to settings pages ([#1700](https://github.com/sct/overseerr/issues/1700)) ([78fc1f7](https://github.com/sct/overseerr/commit/78fc1f7b7d9ef912077066a3605fed6237fb4c8a))
- **locale:** set locale based on user settings upon login ([#1584](https://github.com/sct/overseerr/issues/1584)) ([f48312e](https://github.com/sct/overseerr/commit/f48312e833ed5d48c41179d0eadbc66d45486d8a))
- **notif:** include year in Media Available notifications ([#1672](https://github.com/sct/overseerr/issues/1672)) ([11aa712](https://github.com/sct/overseerr/commit/11aa712eb0e8796874c96fbcc9b51b523108e2d4))
- **plex:** disable library sync if Plex not configured, and disable scan if no libraries ([#1764](https://github.com/sct/overseerr/issues/1764)) ([22238fe](https://github.com/sct/overseerr/commit/22238fe4f711267d001be95942b3151c536e0c18))
- **plex:** do not fail to import Plex users when Plex Home has managed users ([#1699](https://github.com/sct/overseerr/issues/1699)) ([310cdb3](https://github.com/sct/overseerr/commit/310cdb36df1601bca5e57f0bc796c44111b8435f))
- **plex:** sync libraries after saving settings ([#1592](https://github.com/sct/overseerr/issues/1592)) ([9749d72](https://github.com/sct/overseerr/commit/9749d723fc0a282b291c06ee68a6e174dcec1c5b))
- **requests:** appropriately set modifiedBy user for new requests ([#1684](https://github.com/sct/overseerr/issues/1684)) ([a3f04b3](https://github.com/sct/overseerr/commit/a3f04b3f3522d46dc65178bddd1e986426e48050))
- **requests:** do not prevent duplicate requests if other requests are declined ([de0759c](https://github.com/sct/overseerr/commit/de0759c26a9e857e2b8d7244673625fc79ee4660))
- **requests:** prevent duplicate movie requests ([126d866](https://github.com/sct/overseerr/commit/126d8665ee2808fc0bc37df4ca61f3e63be096e2))
- check that application URL and email agent are configured for password reset/generation ([#1724](https://github.com/sct/overseerr/issues/1724)) ([091d66a](https://github.com/sct/overseerr/commit/091d66a1928d3c69a11eab2a789b4639b5ba9817))
- correctly display error messages ([#1653](https://github.com/sct/overseerr/issues/1653)) ([31cb717](https://github.com/sct/overseerr/commit/31cb7176d286e706575a2dc8003df13f3e737106))
- handle null values in User email transform ([#1712](https://github.com/sct/overseerr/issues/1712)) ([4a042f1](https://github.com/sct/overseerr/commit/4a042f12be6510ee47de3a7e025497f8d132d6a1))
- **lang:** only set locale once at page load and move subsequent updates back into Layout ([14756f4](https://github.com/sct/overseerr/commit/14756f4b208c5b201a6e632b43e7a21c5bec6f9c)), closes [#1662](https://github.com/sct/overseerr/issues/1662)
- **locale:** properly restore display language upon page refresh ([#1646](https://github.com/sct/overseerr/issues/1646)) ([e85d1ce](https://github.com/sct/overseerr/commit/e85d1ce94ec45d8f5d086722cfd88e0e2c5b4bb6))
- **notifications:** default webpush notification agent to enabled for users for settings response ([7520e24](https://github.com/sct/overseerr/commit/7520e24e9287e214dd31224f1201e9b6385fd567)), closes [#1663](https://github.com/sct/overseerr/issues/1663)
- **quotas:** do not count already-requested seasons when editing TV request ([#1649](https://github.com/sct/overseerr/issues/1649)) ([808ccf1](https://github.com/sct/overseerr/commit/808ccf1c6975f853db6dc89f4d9f1f5488dbaae3))
- **requests:** remove requestedBy user param from existing movie request check ([#1569](https://github.com/sct/overseerr/issues/1569)) ([788f3dc](https://github.com/sct/overseerr/commit/788f3dc435ae224fcc4d4cb2890b1b9b494c64e8))
- **sensitiveinput:** do not capture enter key input ([#1650](https://github.com/sct/overseerr/issues/1650)) ([bb8d14b](https://github.com/sct/overseerr/commit/bb8d14b5ffd840eff0c2a00e1b5d318677a5ca5f))
- **sonarr:** do not mark media as failed if there is no season data on TVDB ([#1691](https://github.com/sct/overseerr/issues/1691)) ([0cd7fa0](https://github.com/sct/overseerr/commit/0cd7fa0f1a00d129339be13550a4f694c820a0e9))
- **tv:** don't show duplicate air date ([#1666](https://github.com/sct/overseerr/issues/1666)) ([e1f5feb](https://github.com/sct/overseerr/commit/e1f5febe7bbf27e77b6f5d057c2c3f7e22898734))
- **ui:** add clarification to user settings ([#1644](https://github.com/sct/overseerr/issues/1644)) ([2ef57e9](https://github.com/sct/overseerr/commit/2ef57e9b1a5b4d0a1499921f4e26b0b0712d7ded))
- **ui:** correct horizontal overflow behavior of settings tabs ([#1667](https://github.com/sct/overseerr/issues/1667)) ([e6d5f0a](https://github.com/sct/overseerr/commit/e6d5f0abfebdc24f25d08822b57a8eb7bc48e137))
- **ui:** hide advanced request options when there is only one choice ([#1591](https://github.com/sct/overseerr/issues/1591)) ([6b26188](https://github.com/sct/overseerr/commit/6b26188d888a1f80bd36a1968e41333bab2af794))
- **ui:** improve QuotaSelector display of unlimited and singular values ([#1704](https://github.com/sct/overseerr/issues/1704)) ([59b2ec1](https://github.com/sct/overseerr/commit/59b2ec11fa8868bf6873ffa80f4999ae10d65637))
- perform case-insensitive match for local user email addresses ([#1633](https://github.com/sct/overseerr/issues/1633)) ([928b8a7](https://github.com/sct/overseerr/commit/928b8a71cf361b7bc2b8957c621f5b66c4657b1e))
- **ui:** apply pointer cursor style for clickable status badges ([#1632](https://github.com/sct/overseerr/issues/1632)) ([6968caa](https://github.com/sct/overseerr/commit/6968caa35a70c172bdd57c984fde6cb6a04a1470))
- **ui:** remove delete button from request cards ([#1635](https://github.com/sct/overseerr/issues/1635)) ([6b37242](https://github.com/sct/overseerr/commit/6b37242a3f5a3b332d259f4814d235d751ae2491))
- switch PGP regex to span multiple lines ([#1598](https://github.com/sct/overseerr/issues/1598)) ([d0703aa](https://github.com/sct/overseerr/commit/d0703aa37772759e8e28b5da7187e97e7aadc495))
- **ui:** hide Plex alert after setup and add local login warning to local user modal ([#1600](https://github.com/sct/overseerr/issues/1600)) ([694d0ff](https://github.com/sct/overseerr/commit/694d0ffcf6b3e3fa00175400fa4217a7d6eb787f))

### Features

- **lang:** add Greek display language ([#1605](https://github.com/sct/overseerr/issues/1605)) ([2241564](https://github.com/sct/overseerr/commit/22415642e8602809e3507e5b13dc2f8de3000003))
- **lang:** translations update from Weblate ([#1585](https://github.com/sct/overseerr/issues/1585)) ([361ea77](https://github.com/sct/overseerr/commit/361ea77588db3dc04a51dd3a62c73ae1297cdce2))
- **lang:** translations update from Weblate ([#1603](https://github.com/sct/overseerr/issues/1603)) ([2efa7fa](https://github.com/sct/overseerr/commit/2efa7faf20d05a5fc423e0151c6b46fe6212d096))
- **lang:** translations update from Weblate ([#1639](https://github.com/sct/overseerr/issues/1639)) ([d22400d](https://github.com/sct/overseerr/commit/d22400dbc9320743498eeb8e6a4dcbccf1a4d52d))
- **lang:** translations update from Weblate ([#1676](https://github.com/sct/overseerr/issues/1676)) ([8a80571](https://github.com/sct/overseerr/commit/8a805716e3e34ae8d081ad47f9d4cd68f88b0116))
- **lang:** translations update from Weblate ([#1703](https://github.com/sct/overseerr/issues/1703)) ([6a3649f](https://github.com/sct/overseerr/commit/6a3649f620e518ff07a48c17ce1182aaedff398a))
- **lang:** translations update from Weblate ([#1727](https://github.com/sct/overseerr/issues/1727)) ([60c3ced](https://github.com/sct/overseerr/commit/60c3ced9e2466568eecde93c88410c87ff0b796f))
- **lang:** translations update from Weblate ([#1746](https://github.com/sct/overseerr/issues/1746)) ([37a4df6](https://github.com/sct/overseerr/commit/37a4df646cc3e3101360037f1b6f061a734eb5e2))
- **lang:** translations update from Weblate ([#1768](https://github.com/sct/overseerr/issues/1768)) ([dedf95e](https://github.com/sct/overseerr/commit/dedf95e574a15a708866c381353e58ce3b3a1a61))
- add display name to create local user modal ([#1631](https://github.com/sct/overseerr/issues/1631)) ([44c3edb](https://github.com/sct/overseerr/commit/44c3edb98568ba15eb525e665115429cfb15d28b))
- allow users to select notification types ([#1512](https://github.com/sct/overseerr/issues/1512)) ([e605989](https://github.com/sct/overseerr/commit/e60598905b2d6eef7c1872d0c9e92e6d70508ae8))
- **notif:** prevent manage-request users receiving auto-approve notif from their requests ([#1707](https://github.com/sct/overseerr/issues/1707)) ([#1709](https://github.com/sct/overseerr/issues/1709)) ([9ead8bb](https://github.com/sct/overseerr/commit/9ead8bb1f1680b522550f963502c83e2f99d1e96))
- **plex:** add support for custom Plex Web App URLs ([#1581](https://github.com/sct/overseerr/issues/1581)) ([a640a91](https://github.com/sct/overseerr/commit/a640a91390f1411637ad379a8253002fdf60480f))
- **pwa:** add notification badge icon ([#1695](https://github.com/sct/overseerr/issues/1695)) ([9b3b6a9](https://github.com/sct/overseerr/commit/9b3b6a9170b25209e54c74aa9e96659bc2d19edd))
- **ui:** request list item & request card improvements ([#1532](https://github.com/sct/overseerr/issues/1532)) ([d7b9b1a](https://github.com/sct/overseerr/commit/d7b9b1a525ec6d1d81ad6fe4e55994dd8428988f))
- **webpush:** add warning to web push settings re: HTTPS requirement ([#1599](https://github.com/sct/overseerr/issues/1599)) ([0c4fb64](https://github.com/sct/overseerr/commit/0c4fb6446be425905a120df5be9a28b052e884c0))

### Reverts

- **deps:** revert back to typeorm 0.2.32 ([4368c3a](https://github.com/sct/overseerr/commit/4368c3aa4f88425ec08f3b555419e572cfa320e3))
- **deps:** use 10.1.3 until css import issue is resolved ([2254248](https://github.com/sct/overseerr/commit/2254248abc0f2051a9dd28d9663c7ab1d0b547b6))
- **requests:** go back to old modifiedBy request values for now ([0918b25](https://github.com/sct/overseerr/commit/0918b254132b0541999486e1f0679d0c0cd65864))

# [1.24.0](https://github.com/sct/overseerr/compare/v1.23.2...v1.24.0) (2021-05-05)

### Bug Fixes

- **api:** do not try to transform empty values passed to user notificationTypes ([ef3f977](https://github.com/sct/overseerr/commit/ef3f9778aa81f8ed39dcd835d63d94f2248e0204)), closes [#1501](https://github.com/sct/overseerr/issues/1501)
- **backend:** properly set request media status ([#1541](https://github.com/sct/overseerr/issues/1541)) ([b7b55e2](https://github.com/sct/overseerr/commit/b7b55e275cb2f1f61c3057cb8ab4cb1027f6356d))
- **css:** don't target button globally ([#1510](https://github.com/sct/overseerr/issues/1510)) ([f78b9c1](https://github.com/sct/overseerr/commit/f78b9c1ca9648eb10b010e526d9b9db09648b154))
- **css:** fix cog icon size on media detail pages ([#1520](https://github.com/sct/overseerr/issues/1520)) ([26ddc03](https://github.com/sct/overseerr/commit/26ddc03b2c01b343c24f1c359b78c587310cc747))
- **email:** parse sender hostname from application URL ([#1518](https://github.com/sct/overseerr/issues/1518)) ([3baa55c](https://github.com/sct/overseerr/commit/3baa55c690dd9ba39768b8b271595cb6b09fe6da))
- **lang:** correct overwritten email toast strings ([11a5e8d](https://github.com/sct/overseerr/commit/11a5e8d95bc2a2f16adf1e48d2ef38b508a6ace5))
- **locale:** default user locale should be the server setting ([#1574](https://github.com/sct/overseerr/issues/1574)) ([549103f](https://github.com/sct/overseerr/commit/549103f6f6d5624201e425df7d7814f0f67863b9))
- **pwa:** add Discover shortcut and fix/optimize icons ([#1525](https://github.com/sct/overseerr/issues/1525)) ([e1dc62b](https://github.com/sct/overseerr/commit/e1dc62b0a5b64202701aff821837ed11dd3f12db))
- **radarr:** only process Radarr movies which are either monitored or downloaded ([#1511](https://github.com/sct/overseerr/issues/1511)) ([85899ab](https://github.com/sct/overseerr/commit/85899ab49a27542390e91443531905737224338d))
- **ui:** add missing margins on button SVGs on Plex Settings page ([#1546](https://github.com/sct/overseerr/issues/1546)) ([5e588be](https://github.com/sct/overseerr/commit/5e588be8127b50dd83477f7f3a65f18de774e8af))
- **ui:** add user profile links to RequestBlock and change 'ETA' string in DownloadBlock ([#1551](https://github.com/sct/overseerr/issues/1551)) ([e4d0029](https://github.com/sct/overseerr/commit/e4d0029f7b4245b8606e2447c54629def40c7761))
- **ui:** apply rounded-l-only to SensitiveInput textareas and increase visible text input area ([#1561](https://github.com/sct/overseerr/issues/1561)) ([1123fce](https://github.com/sct/overseerr/commit/1123fce089b86251dcafebf77743d60a6e396bee))
- **ui:** correct RegionSelector z-index ([#1567](https://github.com/sct/overseerr/issues/1567)) ([e912a00](https://github.com/sct/overseerr/commit/e912a00880f856fa9621e8587ef1cc6513a3d49c))
- **ui:** correct toasts being in the wrong position on smaller screens ([2ecd9d7](https://github.com/sct/overseerr/commit/2ecd9d7b1391b8fc83e9c12a18bab105e7148f0f))
- **ui:** default to text input type for SensitiveInputs ([#1568](https://github.com/sct/overseerr/issues/1568)) ([e2acf88](https://github.com/sct/overseerr/commit/e2acf8887cb0456c80308bd1b7f3bbe1930e8cff))
- **ui:** explicitly specify width/height of Listbox dropdown icon ([#1514](https://github.com/sct/overseerr/issues/1514)) ([802e40a](https://github.com/sct/overseerr/commit/802e40a5dfa00f897f9d5a741718a319f74ff030))
- **ui:** improve form usability ([#1563](https://github.com/sct/overseerr/issues/1563)) ([26580ea](https://github.com/sct/overseerr/commit/26580eaa218702bc5841718310e340d049c50332))
- **ui:** show warning if user has both a default non-4K server and a non-default 4K server ([#1478](https://github.com/sct/overseerr/issues/1478)) ([4faddf3](https://github.com/sct/overseerr/commit/4faddf3810e20851c7ae1251ff0187fa13d7b0f6))
- **webpush:** only prompt user to allow notifications if enabled in user settings ([#1552](https://github.com/sct/overseerr/issues/1552)) ([b05b177](https://github.com/sct/overseerr/commit/b05b177776a5d22bf3b5e93bad4358f4007b879a))
- correctly fall back to English name in LanguageSelector ([#1537](https://github.com/sct/overseerr/issues/1537)) ([189313e](https://github.com/sct/overseerr/commit/189313e94a16e694d192d157642d77f664fd709b))
- do not set locale when modifying other users ([#1499](https://github.com/sct/overseerr/issues/1499)) ([4858771](https://github.com/sct/overseerr/commit/48587719e9474139c7bbc2970b1c7d1d17b78a81))

### Features

- **email:** replace 'Enable SSL' setting with more descriptive/clear 'Encryption Method' setting ([#1549](https://github.com/sct/overseerr/issues/1549)) ([69ab7cc](https://github.com/sct/overseerr/commit/69ab7cc660bea43b70bdb646eabd3866c1b5a90f))
- **inputs:** add support for toggling security on input fields ([#1404](https://github.com/sct/overseerr/issues/1404)) ([4fd452d](https://github.com/sct/overseerr/commit/4fd452dd1880f597a0acda812d567e7cb6c16d83))
- **lang:** translated using Weblate (Spanish) ([#1553](https://github.com/sct/overseerr/issues/1553)) ([e3d5e33](https://github.com/sct/overseerr/commit/e3d5e33ec3e43d36ec832d6ca47f330fc7675088))
- **lang:** translations update from Weblate ([#1497](https://github.com/sct/overseerr/issues/1497)) ([9a95a07](https://github.com/sct/overseerr/commit/9a95a073916c9968b8ef348d0805d77400ea203a))
- **lang:** translations update from Weblate ([#1527](https://github.com/sct/overseerr/issues/1527)) ([1a6d4bd](https://github.com/sct/overseerr/commit/1a6d4bddc016f4aaad83b945e103b19be4d0da31))
- **lang:** translations update from Weblate ([#1558](https://github.com/sct/overseerr/issues/1558)) ([6c9991d](https://github.com/sct/overseerr/commit/6c9991d474a5cd95d9a0a10104bd79d8a9f3ada9))
- **lang:** translations update from Weblate ([#1566](https://github.com/sct/overseerr/issues/1566)) ([93c441e](https://github.com/sct/overseerr/commit/93c441ef6665291ca3698368e4b093c843726036))
- add server default locale setting ([#1536](https://github.com/sct/overseerr/issues/1536)) ([f256a44](https://github.com/sct/overseerr/commit/f256a444c57f2d92c1c4918d4ff6e223ef85ecd2))
- **notif:** add LunaSea agent ([#1495](https://github.com/sct/overseerr/issues/1495)) ([4e6fb00](https://github.com/sct/overseerr/commit/4e6fb00a4a59545817add1544c0b1555078809a4))
- **notif:** show success/failure toast for test notifications ([#1442](https://github.com/sct/overseerr/issues/1442)) ([079645c](https://github.com/sct/overseerr/commit/079645c2c74edfb7e4f583de2ac72bb9824f6524))
- **perms:** add separate REQUEST_MOVIE and REQUEST_TV permissions ([#1474](https://github.com/sct/overseerr/issues/1474)) ([91b9e0f](https://github.com/sct/overseerr/commit/91b9e0f67996a442b5c0117fe09e2d69c163fafb))
- **pwa:** add shortcuts to PWA ([#1509](https://github.com/sct/overseerr/issues/1509)) ([ed99e49](https://github.com/sct/overseerr/commit/ed99e4976dc2700fe84c70af4887c1a431bba92c))
- add option to only allow Plex sign-in from existing users ([#1496](https://github.com/sct/overseerr/issues/1496)) ([db49b20](https://github.com/sct/overseerr/commit/db49b2024d399d90f2d1500b262374efc42f333c))
- PWA Support ([#1488](https://github.com/sct/overseerr/issues/1488)) ([28830d4](https://github.com/sct/overseerr/commit/28830d4ef809efa92a5879a81cac11ff52ea3d1f))

## [1.23.2](https://github.com/sct/overseerr/compare/v1.23.1...v1.23.2) (2021-04-21)

### Bug Fixes

- **lang:** add missing '4K' from singular case of approve/deny 4K request strings ([#1481](https://github.com/sct/overseerr/issues/1481)) ([a822b01](https://github.com/sct/overseerr/commit/a822b019220e86e362a2570e7024289450b4ed46))
- **ui:** change 'Disable Auto-Search' checkbox to 'Enable Automatic Search' ([#1476](https://github.com/sct/overseerr/issues/1476)) ([1a311d2](https://github.com/sct/overseerr/commit/1a311d211d78731c9089e66ed5387c1b5afe33c0))
- better error message when creating a user with an existing email ([f13f1c9](https://github.com/sct/overseerr/commit/f13f1c94515b5bd51382fa18ad96a2ccfd06e50d)), closes [#1441](https://github.com/sct/overseerr/issues/1441)
- set editRequest attribute as necessary, allow users to edit their own pending requests, and show 'View Request' button on series pages ([#1446](https://github.com/sct/overseerr/issues/1446)) ([89455ad](https://github.com/sct/overseerr/commit/89455ad9b783d04d993a0009c351b1096f2b222e))
- **api:** add check for 4K request perms to request creation endpoint ([#1450](https://github.com/sct/overseerr/issues/1450)) ([4449241](https://github.com/sct/overseerr/commit/4449241a8f63fdaeaa4995aa7ec34127c322b9dd))
- **notif:** include year in notifications ([#1439](https://github.com/sct/overseerr/issues/1439)) ([4e98f56](https://github.com/sct/overseerr/commit/4e98f567534a650e26b0244990b7ca549cecbe89))
- **plex:** add support for plex.direct URLs ([#1437](https://github.com/sct/overseerr/issues/1437)) ([db07770](https://github.com/sct/overseerr/commit/db077700e42ab1d2c870213fd55bbdee74002775))
- **radarr:** search in addition to monitoring existing movies ([#1449](https://github.com/sct/overseerr/issues/1449)) ([3ae7d00](https://github.com/sct/overseerr/commit/3ae7d0098b225562499d7c8a74b8b6c3e8893ad9))
- **ui:** adjust user list buttons on mobile ([#1452](https://github.com/sct/overseerr/issues/1452)) ([5d1b741](https://github.com/sct/overseerr/commit/5d1b741f55665c528e299a09464dff6d66f72666))
- **ui:** align icons in user dropdown ([eb5d152](https://github.com/sct/overseerr/commit/eb5d1528869959cdf642e6fefc1a8f4dcf51b84e))

## [1.23.1](https://github.com/sct/overseerr/compare/v1.23.0...v1.23.1) (2021-04-16)

### Bug Fixes

- **api:** correctly check if update is available for release versions ([190cbd6](https://github.com/sct/overseerr/commit/190cbd6559c51a02ec09b267891f3033add6afc8))

# [1.23.0](https://github.com/sct/overseerr/compare/v1.22.0...v1.23.0) (2021-04-16)

### Bug Fixes

- **api:** allow server owner to delete other admin accounts ([2ac6fe7](https://github.com/sct/overseerr/commit/2ac6fe7f6d666d64228d11cde24865acc54c7ce7))
- **backend:** do not log error when user has no server access ([#1419](https://github.com/sct/overseerr/issues/1419)) ([fc14037](https://github.com/sct/overseerr/commit/fc14037ec1c0b7450d892fa9be8176f5b9ff9d73))
- **frontend:** add crossorigin attribute to webmanifest link ([#1376](https://github.com/sct/overseerr/issues/1376)) ([82ca2f5](https://github.com/sct/overseerr/commit/82ca2f59349407e3b1b5cd4f321e196f37044df0))
- **frontend:** autofill with Plex server address ([#1381](https://github.com/sct/overseerr/issues/1381)) ([d9e314b](https://github.com/sct/overseerr/commit/d9e314bad295463d26d8ffe92728f3b5eee4ad05))
- **frontend:** handle media items/requests no longer having a valid tmdb id ([b5ac2f5](https://github.com/sct/overseerr/commit/b5ac2f5a2c5dda808eca177359f125d6e03d1b0f)), closes [#517](https://github.com/sct/overseerr/issues/517)
- **lang:** remove unused strings & correct manageModalNoRequests strings ([#1413](https://github.com/sct/overseerr/issues/1413)) ([190a5c0](https://github.com/sct/overseerr/commit/190a5c0723d4aeafc4ad6103d52c2042a4eaed0e))
- **plex:** do not use SSL for local servers ([#1418](https://github.com/sct/overseerr/issues/1418)) ([9233fc0](https://github.com/sct/overseerr/commit/9233fc078579df8a193344ba45bafb0d5c2cb9af))
- **plex:** use server 'address' returned by Plex API ([#1379](https://github.com/sct/overseerr/issues/1379)) ([33542c9](https://github.com/sct/overseerr/commit/33542c9b2dc53b1e036a7d9571cf467c3d3dc8af))
- **quotas:** Time value of a quota was being ignored ([d3c6bc1](https://github.com/sct/overseerr/commit/d3c6bc1619c39b1e6225d405efaad5df99a27406))
- **ui:** allow canceling from request list & hide edit button for own requests ([#1401](https://github.com/sct/overseerr/issues/1401)) ([bed850d](https://github.com/sct/overseerr/commit/bed850dce9ad0d0b52c3c628225aea938164c38b))
- **ui:** close sidebar on mobile when clicking version status ([ad67381](https://github.com/sct/overseerr/commit/ad673813976669797202c2cefc50274aca84989d))
- **ui:** correctly set autocomplete attribute for password fields ([#1430](https://github.com/sct/overseerr/issues/1430)) ([4b5e355](https://github.com/sct/overseerr/commit/4b5e355df9e291a5cb550483c7dad6c43f03d3a7))
- **ui:** dim password field when password generation option is selected ([#1427](https://github.com/sct/overseerr/issues/1427)) ([e8bbd44](https://github.com/sct/overseerr/commit/e8bbd4497a5eab6357fa7b37c9906285b3d1f64f))
- **ui:** hide alert when email notifs are already configured ([#1335](https://github.com/sct/overseerr/issues/1335)) ([5117987](https://github.com/sct/overseerr/commit/5117987feaed21ccc19e64b04a15f2b77c22b880))
- fall back to English genre names ([#1352](https://github.com/sct/overseerr/issues/1352)) ([e43106a](https://github.com/sct/overseerr/commit/e43106a434548840acecaf1276a5cebdc30e1345))
- fix outofdate string & display version status badge in Settings > About ([#1417](https://github.com/sct/overseerr/issues/1417)) ([4eb9209](https://github.com/sct/overseerr/commit/4eb92098ba1f141bf74875ce76816a615763de5f))
- various fixes for new tags feature ([#1369](https://github.com/sct/overseerr/issues/1369)) ([b4450a3](https://github.com/sct/overseerr/commit/b4450a308c56f767fbaa769d574a1b3f8e221d59))
- **ui:** link request card status badge to Plex media URL ([#1361](https://github.com/sct/overseerr/issues/1361)) ([7a5c4a3](https://github.com/sct/overseerr/commit/7a5c4a30b5735fe6fbe821a8fcfdb4bcbeca68b3))

### Features

- **lang:** Translations update from Weblate ([#1429](https://github.com/sct/overseerr/issues/1429)) ([a54241c](https://github.com/sct/overseerr/commit/a54241c775705fadc7c044f5312307f28f9a854b))
- change alpha warning to beta warning ([03fd21b](https://github.com/sct/overseerr/commit/03fd21bebc3ffa34ce983b524d09e74b8ab2d057))
- **lang:** translated using Weblate (Catalan) ([#1351](https://github.com/sct/overseerr/issues/1351)) ([35c13a8](https://github.com/sct/overseerr/commit/35c13a87467b4deabab3cb2cd1cab1b24ab51875))
- **lang:** translations update from Weblate ([#1360](https://github.com/sct/overseerr/issues/1360)) ([8ee7693](https://github.com/sct/overseerr/commit/8ee7693a1f00a2f735b2555c7f8180c8a2c6144f))
- **lang:** translations update from Weblate ([#1416](https://github.com/sct/overseerr/issues/1416)) ([dceca4d](https://github.com/sct/overseerr/commit/dceca4dd97f78f2e3aef678edcd5755c781f5249))
- add overseerr version and update availability status to sidebar ([ecf1312](https://github.com/sct/overseerr/commit/ecf13123d21d765d67bfa7f9b6509b0f2af62cee))
- **lang:** translations update from Weblate ([#1388](https://github.com/sct/overseerr/issues/1388)) ([9b199b2](https://github.com/sct/overseerr/commit/9b199b27d806e290cf0551e2d2ede6add61770aa))
- **lang:** translations update from Weblate ([#1396](https://github.com/sct/overseerr/issues/1396)) ([3daf57e](https://github.com/sct/overseerr/commit/3daf57e9a12e4973dbc56656379ab2dbcb3c2619))
- **notif:** allow users to enable/disable specific agents ([#1172](https://github.com/sct/overseerr/issues/1172)) ([46c4ee1](https://github.com/sct/overseerr/commit/46c4ee1625cf3e74bd885ecfc254b1e46cf44f29))
- **webhook:** include requestedBy user in payload ([#1385](https://github.com/sct/overseerr/issues/1385)) ([e605687](https://github.com/sct/overseerr/commit/e60568758097d07f9d4b201ffdf34f0c32ba9cf3))
- radarr/sonarr tag support ([#1366](https://github.com/sct/overseerr/issues/1366)) ([a306ebc](https://github.com/sct/overseerr/commit/a306ebc2d18317d8dbe4ccd3f24c22f55ffcd6a6))

# [1.22.0](https://github.com/sct/overseerr/compare/v1.21.1...v1.22.0) (2021-04-01)

### Bug Fixes

- **android:** adaptive icons for Android devices ([#1274](https://github.com/sct/overseerr/issues/1274)) ([a65e3d5](https://github.com/sct/overseerr/commit/a65e3d5bb6924cbde30b26ff8acf535e5274efee))
- **backend:** fix getShowByTvdbId() error message ([#1314](https://github.com/sct/overseerr/issues/1314)) [skip ci] ([fe8d346](https://github.com/sct/overseerr/commit/fe8d34607b07095dce51b29ef7aaae0485573f14))
- **db:** enable WAL journal mode ([aa205ff](https://github.com/sct/overseerr/commit/aa205ffa975d02ef0be30626e7c946a42679a847))
- **frontend:** 'Recent Requests' slider should link to request list w/ same filter ([#1235](https://github.com/sct/overseerr/issues/1235)) ([49782c0](https://github.com/sct/overseerr/commit/49782c0b730cce9f0bad14e9c83842b5b0bfe11e))
- **frontend:** call mutate after changing public settings ([#1302](https://github.com/sct/overseerr/issues/1302)) ([c8f67cf](https://github.com/sct/overseerr/commit/c8f67cf866ada791e4129a0bbae16b9eac41f32e))
- **frontend:** include language parameter in TMDb links ([#1344](https://github.com/sct/overseerr/issues/1344)) ([1d88be9](https://github.com/sct/overseerr/commit/1d88be9341a8ff9e1f39b02556b489cdbd06392b))
- **frontend:** redirect from /setup if already initialized ([#1238](https://github.com/sct/overseerr/issues/1238)) ([8016503](https://github.com/sct/overseerr/commit/80165038fd214897e3520a420f971341e7b94865))
- **frontend:** use correct path to user profile in request modal quota dropdown ([#1307](https://github.com/sct/overseerr/issues/1307)) ([f990585](https://github.com/sct/overseerr/commit/f9905859148088afec53549b81611b07bf19d3b9))
- **frontend:** use HTTPS to fetch TMDb assets for network/studio sliders ([#1343](https://github.com/sct/overseerr/issues/1343)) ([c886ea6](https://github.com/sct/overseerr/commit/c886ea6c0578cb7532d6c09266a76bfad8598b9d))
- **frontend:** use next/image to serve login page images ([cbf4519](https://github.com/sct/overseerr/commit/cbf45196b023f60c8e4cf7602c0295f886fe610c)), closes [#1207](https://github.com/sct/overseerr/issues/1207)
- **lang:** allow proper localization of comma-delimited lists ([#1264](https://github.com/sct/overseerr/issues/1264)) ([173408a](https://github.com/sct/overseerr/commit/173408a1f269f09c724843ba087ef3f85b2832ad))
- **lang:** change 'Extra Data' string to 'Additional Data' ([#1226](https://github.com/sct/overseerr/issues/1226)) ([665e164](https://github.com/sct/overseerr/commit/665e16475f3fa2ea6118340d9ea2d30b98abb238))
- **lang:** correct mismatched language strings ([#1246](https://github.com/sct/overseerr/issues/1246)) ([8ebc829](https://github.com/sct/overseerr/commit/8ebc8292504cdc57a148ab69bcb4e1514ef018c6))
- **lang:** correct strings for library sync button & user import toast ([#1252](https://github.com/sct/overseerr/issues/1252)) ([cb5ca7a](https://github.com/sct/overseerr/commit/cb5ca7acf38dcc2e27ec31d88434a11757cdb469))
- **lang:** edit setting label strings for verb tense consistency ([#1214](https://github.com/sct/overseerr/issues/1214)) ([6d7671d](https://github.com/sct/overseerr/commit/6d7671dd80fea632e5cef29fc0b4968bffe231b0))
- **lang:** fix overwritten/shared string ([#1212](https://github.com/sct/overseerr/issues/1212)) ([dfd4ff9](https://github.com/sct/overseerr/commit/dfd4ff9229822b0ce79ba322376194cbb6fd233d))
- **lang:** remove 'requires and' ([#1215](https://github.com/sct/overseerr/issues/1215)) ([cb852fd](https://github.com/sct/overseerr/commit/cb852fded18f53806c23ec6f215385072b2a867b))
- **lang:** remove unused strings ([#1330](https://github.com/sct/overseerr/issues/1330)) ([13e1595](https://github.com/sct/overseerr/commit/13e1595c6ebff32ca905d9bd3dd781e241545e83))
- **lang:** UI string edits, round 2 ([#1202](https://github.com/sct/overseerr/issues/1202)) ([ea1863a](https://github.com/sct/overseerr/commit/ea1863ac3a5d3051e07815d07df0d3f2abd9166f))
- **log:** fix typo in base scanner logging ([#1329](https://github.com/sct/overseerr/issues/1329)) [skip ci] ([b0b04ca](https://github.com/sct/overseerr/commit/b0b04ca1c7218ad5b67d9ec8b3fac5af78a4c132))
- **logs:** add i18n strings for new log page changes ([8c51c28](https://github.com/sct/overseerr/commit/8c51c28f546b9c2d38ff7f20d59bb08a599e8146))
- **notifications:** correctly send notifications for users that do not have any user settings yet ([d3a25b9](https://github.com/sct/overseerr/commit/d3a25b935aae35dd97ef0f168ac7e2898126a9a5)), closes [#1324](https://github.com/sct/overseerr/issues/1324)
- **overseerr-api.yml:** fixed pushbullet & webhook API definition refs and descriptions ([#1288](https://github.com/sct/overseerr/issues/1288)) [skip ci] ([3b003b7](https://github.com/sct/overseerr/commit/3b003b770120f7d150c64ff098b626015c030794))
- **plex:** always send Overseerr for the device name to the plex.tv api ([f7146e4](https://github.com/sct/overseerr/commit/f7146e41899a59f75b963e1cc9dac9eddf24aebe)), closes [#1244](https://github.com/sct/overseerr/issues/1244)
- **ui:** add validation to hostname/IP fields ([#1206](https://github.com/sct/overseerr/issues/1206)) ([f49a024](https://github.com/sct/overseerr/commit/f49a02449c4928aef56cecbf908cf585ea0d4fca))
- **ui:** better regex matching when parsing logs ([#1225](https://github.com/sct/overseerr/issues/1225)) ([2d737f2](https://github.com/sct/overseerr/commit/2d737f276095a8ca9abea360ef29134e9f639a39))
- **ui:** button w/ dropdown z-indices ([#1230](https://github.com/sct/overseerr/issues/1230)) ([015671f](https://github.com/sct/overseerr/commit/015671f5be7a9f0f5c38db5a11a4b3c788dfaade))
- **ui:** center role under title cards on person detail pages ([#1205](https://github.com/sct/overseerr/issues/1205)) ([4a61518](https://github.com/sct/overseerr/commit/4a6151873a3a3c5e45f9817131774a2c52957138))
- **ui:** correctly enable the request button when partial requests are disabled with no quota ([16a611b](https://github.com/sct/overseerr/commit/16a611b9dfc3c66483640f4f5364646f41d37159))
- **ui:** correctly paginate request list ([67fbb40](https://github.com/sct/overseerr/commit/67fbb401ac6ba05e58b8dfefd5954b28316254f2))
- **ui:** correctly show quota display on tv request modal when only series quota is set ([3f1f85a](https://github.com/sct/overseerr/commit/3f1f85a80edfd2a4e9627162ff29ca6bcf2d8583))
- **ui:** display asterisk indicator on required field labels ([#1236](https://github.com/sct/overseerr/issues/1236)) ([380d361](https://github.com/sct/overseerr/commit/380d36119f19a20ad67f79b3fb5db4036a093cac))
- **ui:** do not check isValid on Sonarr/Radarr modals for the test button ([0974a4c](https://github.com/sct/overseerr/commit/0974a4c971358b7a64668f9a63fc356234a656c9))
- **ui:** do not require numeric value in FormattedRelativeTime ([#1234](https://github.com/sct/overseerr/issues/1234)) ([3642b1e](https://github.com/sct/overseerr/commit/3642b1e84a20fef72428b3e240c86d35be8be8a2))
- **ui:** filter out server options that do not match request type (non-4K or 4K) ([#1183](https://github.com/sct/overseerr/issues/1183)) ([28a6a70](https://github.com/sct/overseerr/commit/28a6a70e1ecc125f4cf4900e599ad0d4d7b55e3b))
- **ui:** fix label formatting in general user settings ([#1275](https://github.com/sct/overseerr/issues/1275)) ([8546b0e](https://github.com/sct/overseerr/commit/8546b0ef53d232256b62cf08466e692a6971c16b))
- **ui:** fix regex matching when parsing label from logs ([#1231](https://github.com/sct/overseerr/issues/1231)) ([4a00617](https://github.com/sct/overseerr/commit/4a00617fe47064ea50f95a02f29832a419ab13a3))
- **ui:** gracefully handle lengthy titles & long words in overviews ([#1338](https://github.com/sct/overseerr/issues/1338)) ([d8bcb99](https://github.com/sct/overseerr/commit/d8bcb99b2fd3b24a5119ba5ff213a640425ff553))
- **ui:** hide 'show details' button if there are no additional details ([#1254](https://github.com/sct/overseerr/issues/1254)) ([6210f12](https://github.com/sct/overseerr/commit/6210f12e8e9f593d629d22278d78310482ca0cfa))
- **ui:** increase page size dropdown width when necessary ([#1216](https://github.com/sct/overseerr/issues/1216)) ([75c72b9](https://github.com/sct/overseerr/commit/75c72b987eb52b907ffd8af33f15ecc58213fc12))
- **ui:** restore saved states of quota override checkboxes ([#1282](https://github.com/sct/overseerr/issues/1282)) ([2059fc1](https://github.com/sct/overseerr/commit/2059fc1cd4d48c7d80e761b7d41b7ec122d82769))
- **ui:** sort regions & languages by their localized names rather than their TMDb English names ([#1157](https://github.com/sct/overseerr/issues/1157)) ([d76bf32](https://github.com/sct/overseerr/commit/d76bf32c9dcc83ebd0bae979726b1456a9028d8b))
- **ui:** tweak request list design ([#1201](https://github.com/sct/overseerr/issues/1201)) ([d226fc7](https://github.com/sct/overseerr/commit/d226fc79b8d5f1263d4b80a7a1772074020ec94f))
- **ui:** use appropriate cursor type for disabled UI elements ([#1184](https://github.com/sct/overseerr/issues/1184)) ([b767a58](https://github.com/sct/overseerr/commit/b767a58b011cc317a889cb8c2889b3210bec5fae))
- **ui:** use appropriate cursor type for readonly input fields ([#1208](https://github.com/sct/overseerr/issues/1208)) ([9ec2c46](https://github.com/sct/overseerr/commit/9ec2c468cbbcbd41b94bbf9f3cfeb43eed09f36e))
- **ui:** use correct colspan for 'No results.' message in Settings > Logs ([#1325](https://github.com/sct/overseerr/issues/1325)) ([5c135c9](https://github.com/sct/overseerr/commit/5c135c9974ebfcbdb434dafd459d1035624df6ed))
- fetch localized person details from TMDb ([#1243](https://github.com/sct/overseerr/issues/1243)) ([1d7a938](https://github.com/sct/overseerr/commit/1d7a938ef8b0b8c20fda5024121de2a217ef4127))

### Features

- **frontend:** add apple splash for pwa ([232def9](https://github.com/sct/overseerr/commit/232def972b9156afcbd83592708dbf8b5866ee24))
- **frontend:** add apple tv+ to network slider ([3dc27ff](https://github.com/sct/overseerr/commit/3dc27ffd9bb054e6cda58872939dbc352877d184)), closes [#1219](https://github.com/sct/overseerr/issues/1219)
- **frontend:** allow selecting multiple original languages ([a908c07](https://github.com/sct/overseerr/commit/a908c07670532b0ca7f766065bb4653ce2376e6f))
- **lang:** add Catalan to language picker ([#1309](https://github.com/sct/overseerr/issues/1309)) ([77911c0](https://github.com/sct/overseerr/commit/77911c03e98aa3c2c6c062a01c22b030704309c2))
- **lang:** translations update from Weblate ([#1178](https://github.com/sct/overseerr/issues/1178)) ([3c89010](https://github.com/sct/overseerr/commit/3c89010629bc16f225f1d3936abe9f4e47a0d7c7))
- **lang:** translations update from Weblate ([#1224](https://github.com/sct/overseerr/issues/1224)) ([c1975b3](https://github.com/sct/overseerr/commit/c1975b33f1115a95068be000b7f479a401f0f0ae))
- **lang:** translations update from Weblate ([#1237](https://github.com/sct/overseerr/issues/1237)) ([dabd32a](https://github.com/sct/overseerr/commit/dabd32a18b42980059c7a7a7450514ca827a5d3b))
- **lang:** translations update from Weblate ([#1256](https://github.com/sct/overseerr/issues/1256)) ([e9b1a9e](https://github.com/sct/overseerr/commit/e9b1a9e80e6b8285fa451a8551c5832a850c1746))
- **lang:** translations update from Weblate ([#1281](https://github.com/sct/overseerr/issues/1281)) ([bec1d3d](https://github.com/sct/overseerr/commit/bec1d3dde834b9a50e24c5894c362e5982ff3bd5))
- **lang:** translations update from Weblate ([#1305](https://github.com/sct/overseerr/issues/1305)) ([1b129c0](https://github.com/sct/overseerr/commit/1b129c0b3863ea3c5ad34c66b3ace5d09cd4e391))
- **lang:** translations update from Weblate ([#1313](https://github.com/sct/overseerr/issues/1313)) ([18ce349](https://github.com/sct/overseerr/commit/18ce349faac6ee560b9c92374039954f2365a8d1))
- **logs:** add copy to clipboard button to logs page ([e2b8745](https://github.com/sct/overseerr/commit/e2b8745fdc192f3d49872625652184005a760885))
- **notif:** include requested season numbers in notifications ([#1211](https://github.com/sct/overseerr/issues/1211)) ([4ee78ab](https://github.com/sct/overseerr/commit/4ee78ab2fe0359df6baa58f0986687f05a8392a2))
- **requests:** add request quotas ([#1277](https://github.com/sct/overseerr/issues/1277)) ([6c75c88](https://github.com/sct/overseerr/commit/6c75c8822842514ffd31864992e8d3ce686fea1b))
- **settings:** logs viewer ([#997](https://github.com/sct/overseerr/issues/997)) ([54429bb](https://github.com/sct/overseerr/commit/54429bbc1d765d0e50486a42749f9bbd4e5b3386))
- **ui:** add movie/series genre list pages ([#1194](https://github.com/sct/overseerr/issues/1194)) ([6f1a31d](https://github.com/sct/overseerr/commit/6f1a31de473d1a25bc77e0961a52b07050b64c51))
- **ui:** add option to only allow complete series requests ([#1164](https://github.com/sct/overseerr/issues/1164)) ([36c00fd](https://github.com/sct/overseerr/commit/36c00fde273799a56ec42ce6177ff44fed0904c3))
- **ui:** Add user requests page ([#936](https://github.com/sct/overseerr/issues/936)) ([a9461f7](https://github.com/sct/overseerr/commit/a9461f760d8112f2ae16183e796f706d3392f8ec))
- **ui:** allow any value 1-100 for quota limit/days ([#1337](https://github.com/sct/overseerr/issues/1337)) ([f4bed9a](https://github.com/sct/overseerr/commit/f4bed9a63b6b856ebedca9eb7662cd00038d7f7c))
- **ui:** display movie/series original title ([#1240](https://github.com/sct/overseerr/issues/1240)) ([7230915](https://github.com/sct/overseerr/commit/723091509414465e98d870b3dc943f41b9ac590d))
- **ui:** experimental status bar style change for ios pwa app ([958cdf9](https://github.com/sct/overseerr/commit/958cdf98fd1cb7c1bdb33aebb6c061750e9ab331))
- **ui:** store sort order and page size of userlist in localstorage ([#1262](https://github.com/sct/overseerr/issues/1262)) ([f5f8269](https://github.com/sct/overseerr/commit/f5f8269cd28ee792120060f4f38ef09d571fb8d5))
- add option to cache images locally ([#1213](https://github.com/sct/overseerr/issues/1213)) ([0ca3d43](https://github.com/sct/overseerr/commit/0ca3d4374942b54b59a19d017ab4ae14ba7019c1))
- genre sliders (experiment) ([#1182](https://github.com/sct/overseerr/issues/1182)) ([1c4515a](https://github.com/sct/overseerr/commit/1c4515a1ae6097f3948aaa0d0ed210831581fd98))

### Reverts

- **ui:** remove local image cache option from settings page ([911faef](https://github.com/sct/overseerr/commit/911faeff562b737a2d18a395fcd90bf354af0cc4))
- remove experimental tailwind jit compiler until title card hover is fixed ([1df67ba](https://github.com/sct/overseerr/commit/1df67baf9e7cdabc4045a0c115735797e8081bca))
- **deps:** revert react-intl to 5.13.5 ([e16277c](https://github.com/sct/overseerr/commit/e16277c07d58ddbb749f4a60bc05924f4a5af146))

## [1.21.1](https://github.com/sct/overseerr/compare/v1.21.0...v1.21.1) (2021-03-15)

### Bug Fixes

- **lang:** translations update from Weblate ([#1155](https://github.com/sct/overseerr/issues/1155)) ([ebc285c](https://github.com/sct/overseerr/commit/ebc285c758f69846e4a5cb74bb42ca5924d166d4))

# [1.21.0](https://github.com/sct/overseerr/compare/v1.20.1...v1.21.0) (2021-03-15)

### Bug Fixes

- do not allow editing of user settings under certain conditions ([#1168](https://github.com/sct/overseerr/issues/1168)) ([001dcd3](https://github.com/sct/overseerr/commit/001dcd328c8d3b1c417fd7c7ee2aa20183b08eef))
- **frontend:** check for ID instead of email after initial setup Plex login ([#1097](https://github.com/sct/overseerr/issues/1097)) ([778dda6](https://github.com/sct/overseerr/commit/778dda67d54df87347dd79577ef1bdc88d3c1d3f))
- **frontend:** check if swr is validating to determine if we should fetch new data ([e5f5bdb](https://github.com/sct/overseerr/commit/e5f5bdb95c62eba31a3321a7457d354f0226bf85)), closes [#719](https://github.com/sct/overseerr/issues/719)
- **frontend:** never hide available content in search results ([d48edeb](https://github.com/sct/overseerr/commit/d48edeb5a9bd8e2edce8bca0fea50e300bb7a1ae))
- **lang:** add missing i18n strings ([6072e8a](https://github.com/sct/overseerr/commit/6072e8aa9a0f84e50c44a92af303aad15b5f3021))
- **lang:** edit new Telegram-related strings to conform to style guide ([#1093](https://github.com/sct/overseerr/issues/1093)) ([bdf67e7](https://github.com/sct/overseerr/commit/bdf67e732b6c77cbae768a25edfc9a663ef0108b))
- **notif:** loosen input validation on Pushover settings ([#1166](https://github.com/sct/overseerr/issues/1166)) ([3148d31](https://github.com/sct/overseerr/commit/3148d312141248653c5d1e42cd2882a67a339163))
- **notif:** set URL for Discord embeds rather than adding a field for the link ([#1167](https://github.com/sct/overseerr/issues/1167)) ([0bd0912](https://github.com/sct/overseerr/commit/0bd0912613f0db24bd0da4ec956b5119133e35d4))
- correctly send auto-approval notifictions for series ([8634081](https://github.com/sct/overseerr/commit/8634081c869a2078793ecf06b1b7e249bba0a2f8))
- **lang:** fix singular form of season count ([#1080](https://github.com/sct/overseerr/issues/1080)) ([b57645d](https://github.com/sct/overseerr/commit/b57645d382361c856281e7a74295afe16c5390f2))
- **requests:** add plex url to request item ([#1088](https://github.com/sct/overseerr/issues/1088)) ([420038d](https://github.com/sct/overseerr/commit/420038d5ffdd4070df03e5c5cb6ef8d6208fddb5))
- **sonarr:** correctly search when updating existing sonarr series ([ed0a7fb](https://github.com/sct/overseerr/commit/ed0a7fbdf5122a26fa936e83b76a97c55781782d)), closes [#588](https://github.com/sct/overseerr/issues/588)
- **ui:** add alt prop to studio/network logos & fix blinking text cursor ([#1095](https://github.com/sct/overseerr/issues/1095)) ([0c4637f](https://github.com/sct/overseerr/commit/0c4637f779d8904037b9cbd5fe9166cf05a891c5))
- **ui:** add link to poster image on request items ([7289872](https://github.com/sct/overseerr/commit/7289872937d5bb94d027424760ee1ceb94095604))
- **ui:** correct language usage re: "sync" vs. "scan" ([#1079](https://github.com/sct/overseerr/issues/1079)) ([e98f2b9](https://github.com/sct/overseerr/commit/e98f2b96058fb9c5af77be2e8a1bd07fb8fcca06))
- **ui:** display "Season" vs. "Seasons" as appropriate, and fix request block "Seasons" formatting ([#1127](https://github.com/sct/overseerr/issues/1127)) ([45886cc](https://github.com/sct/overseerr/commit/45886ccef1bee57dc555060a491834567e45b59c))
- **ui:** request list button sizes ([#1152](https://github.com/sct/overseerr/issues/1152)) ([fc73592](https://github.com/sct/overseerr/commit/fc73592b69c38191f91a68a020868b8e5ec2e2e2))
- fix language filter link on movie detail pages ([#1142](https://github.com/sct/overseerr/issues/1142)) ([60d453b](https://github.com/sct/overseerr/commit/60d453b0bbba5e2060f72f40d1dde85ec6b05af4))
- remove language/region filtering on studio/network results ([#1129](https://github.com/sct/overseerr/issues/1129)) ([109aca8](https://github.com/sct/overseerr/commit/109aca8229dc7b81cac314d84591f1c04c12ac2e))
- **api:** check correct permissions for auto approve when requests are created ([3c1a72b](https://github.com/sct/overseerr/commit/3c1a72b038fd178b4be4dc082cd1496474148d7e))
- **frontend:** status, requested by, and modified alignment fix ([#1109](https://github.com/sct/overseerr/issues/1109)) ([1a7dc1a](https://github.com/sct/overseerr/commit/1a7dc1acf57888d3d0285b58c1c97a824a232216))
- **ui:** don't show "Password" user settings tab if current user lacks perms to modify the password ([#1063](https://github.com/sct/overseerr/issues/1063)) ([b146d11](https://github.com/sct/overseerr/commit/b146d11e2ffecedae76472b0491a4662ca4a4a4e))
- **ui:** fix Radarr logo alignment ([#1068](https://github.com/sct/overseerr/issues/1068)) ([0fa005a](https://github.com/sct/overseerr/commit/0fa005a99cd868b5a235ae9ce65b4c64b05d0f47))
- **ui:** fix request list UI behavior when season list is too long ([#1106](https://github.com/sct/overseerr/issues/1106)) ([8507691](https://github.com/sct/overseerr/commit/85076919c6ccbf052699b7d5f4ba8b6e5e5af74d))
- **ui:** improve responsive design on new request list UI ([#1105](https://github.com/sct/overseerr/issues/1105)) ([1f8b03f](https://github.com/sct/overseerr/commit/1f8b03ff6f67ce76051667de05166da54ed3dc89))
- **ui:** list all movie studios instead of just the first result ([#1110](https://github.com/sct/overseerr/issues/1110)) ([239202d](https://github.com/sct/overseerr/commit/239202d9c11f27410b0fa084bcc4c824b7136081))
- add correct permission checks to modifying user password/permissions ([ddfc5e6](https://github.com/sct/overseerr/commit/ddfc5e6aa8fc636931f495d6f23d56367466e3b5))

### Features

- add tagline, episode runtime, genres list to media details & clean/refactor CSS into globals ([#1160](https://github.com/sct/overseerr/issues/1160)) ([2f2e002](https://github.com/sct/overseerr/commit/2f2e00237d43bdab85bfadc3c4f2fbcdde4c2e90))
- **docker:** add tini to docker image ([#1017](https://github.com/sct/overseerr/issues/1017)) ([1629d02](https://github.com/sct/overseerr/commit/1629d02f3d8368bfd5f6fed05382974ae6fce51f))
- **email:** add pgp support ([#1138](https://github.com/sct/overseerr/issues/1138)) ([9e5adeb](https://github.com/sct/overseerr/commit/9e5adeb610bdc4800ff536412d0ae8a11fb4338d))
- **frontend:** add loading bar indicator ([#1170](https://github.com/sct/overseerr/issues/1170)) ([3d6b343](https://github.com/sct/overseerr/commit/3d6b3434138fec49c58f2bf74f781d5e2fc2911f))
- **lang:** localize job names ([#1043](https://github.com/sct/overseerr/issues/1043)) ([594aad9](https://github.com/sct/overseerr/commit/594aad9d3ae9b323677f3af8c434d7664526593d))
- **lang:** translations update from Weblate ([#1051](https://github.com/sct/overseerr/issues/1051)) ([69bf817](https://github.com/sct/overseerr/commit/69bf817f598babed99964f073259f827b60bd014))
- **lang:** Translations update from Weblate ([#1131](https://github.com/sct/overseerr/issues/1131)) ([e4686d6](https://github.com/sct/overseerr/commit/e4686d664b52448e32488ff1c4236f72e01e9a29))
- **notif:** add "Media Automatically Approved" notification type ([#1137](https://github.com/sct/overseerr/issues/1137)) ([f7d2723](https://github.com/sct/overseerr/commit/f7d2723fab2c30564fd23945709cd39b178a6eef))
- **notif:** add settings for Discord bot username & avatar URL ([#1113](https://github.com/sct/overseerr/issues/1113)) ([3384eb1](https://github.com/sct/overseerr/commit/3384eb1c479114c0246cb22f9a933aa79fb95fcf))
- **notif:** include poster image in Telegram notifications ([#1112](https://github.com/sct/overseerr/issues/1112)) ([48387e5](https://github.com/sct/overseerr/commit/48387e5b2f26c0c33acd436c6e1cf902d6c32101))
- **scan:** add support for new plex tv agent ([#1144](https://github.com/sct/overseerr/issues/1144)) ([a51d2a2](https://github.com/sct/overseerr/commit/a51d2a24d51d092a0c6da608e3322f19a37c2d28))
- **ui:** add user ID to profile header ([6e95c8b](https://github.com/sct/overseerr/commit/6e95c8b7a10e3467bfd2c3df84ccf886fe01ca5c))
- add genre/studio/network view to Discover results ([#1067](https://github.com/sct/overseerr/issues/1067)) ([f28112f](https://github.com/sct/overseerr/commit/f28112f057df2589f31ae0d0b14e8b50e479fdb7))
- add language-filtered Discover pages ([#1111](https://github.com/sct/overseerr/issues/1111)) ([7501161](https://github.com/sct/overseerr/commit/75011610e57f03098c8be9375d0c9ba1e3647e9b))
- add studio/network sliders to discover ([1c6914f](https://github.com/sct/overseerr/commit/1c6914f5ce5c0d171c4609813915b50233a8e3ad))
- **telegram:** add support for individual chat notifications ([#1027](https://github.com/sct/overseerr/issues/1027)) ([f6d00d8](https://github.com/sct/overseerr/commit/f6d00d8d1559879189f83739193c6e2acafde51d))
- **ui:** display "Owner" role instead of "Admin" for user ID 1 ([#1050](https://github.com/sct/overseerr/issues/1050)) ([1b55d2d](https://github.com/sct/overseerr/commit/1b55d2dfbc06d900e7370a4ddfd81789a25bf00c))
- **ui:** display season count on TV details page ([#1078](https://github.com/sct/overseerr/issues/1078)) ([4365231](https://github.com/sct/overseerr/commit/436523139e8f1594c352b17032734b4498d3994f))
- **ui:** in Settings > Services, make Radarr/Sonarr server names and logos clickable links ([#1008](https://github.com/sct/overseerr/issues/1008)) ([6a1e389](https://github.com/sct/overseerr/commit/6a1e3891aa5f84b6adb1e475a6658a8cd4e34c22))
- **ui:** request list redesign ([#1099](https://github.com/sct/overseerr/issues/1099)) ([cd21865](https://github.com/sct/overseerr/commit/cd21865c4d5be00c13c372e0b7a058f61ec855a2))

## [1.20.1](https://github.com/sct/overseerr/compare/v1.20.0...v1.20.1) (2021-02-28)

### Bug Fixes

- **notif:** escape application title in Telegram notifications ([#1012](https://github.com/sct/overseerr/issues/1012)) ([5560abf](https://github.com/sct/overseerr/commit/5560abf459b0350ff30b5e71d4208418fc8f3b3e))
- **notif:** fixed typo in pushover hint ([#1029](https://github.com/sct/overseerr/issues/1029)) ([e9f2fe9](https://github.com/sct/overseerr/commit/e9f2fe910d72fa41bc27673ed43291211c3cac65))
- **notifications:** correctly send tv auto approval notifications ([537850f](https://github.com/sct/overseerr/commit/537850f414a88df24c78794a2fd68e1e24ff73d1)), closes [#1041](https://github.com/sct/overseerr/issues/1041)
- **plex-sync:** no longer incorrectly sets 4k availability when there isnt any ([3f9a116](https://github.com/sct/overseerr/commit/3f9a116b17d78eeb04f0f125a4f3af6f907c83dd)), closes [#990](https://github.com/sct/overseerr/issues/990)
- **ui:** for server default options, display "All" region/language option instead of empty string ([#1042](https://github.com/sct/overseerr/issues/1042)) ([3fed26c](https://github.com/sct/overseerr/commit/3fed26cfbe74cb662ca531fd37b69f159a051ac1))
- **ui:** show translated string on sonarr sucesss/failure toast messages ([#1035](https://github.com/sct/overseerr/issues/1035)) ([eefcbcd](https://github.com/sct/overseerr/commit/eefcbcd3ddfa5258ee24dbbbd79de5bf50310f27))
- **ui:** use country-flag-icons instead of country-flag-emoji for RegionSelector ([#1011](https://github.com/sct/overseerr/issues/1011)) ([abcd7c9](https://github.com/sct/overseerr/commit/abcd7c997584c1310bd8b313ac38f30e335af8d7))
- add missing default value for settings context ([084917f](https://github.com/sct/overseerr/commit/084917f02d399e2d29bb9927e033c2e6533f586c))
- added missing language default for ssr context defaults ([9ce88ab](https://github.com/sct/overseerr/commit/9ce88abcc85d744d77172cd2357fdb4ff60dc5e4))
- allow users to override language/region settings ([69294a7](https://github.com/sct/overseerr/commit/69294a7c4c5bbe55c5cd276786cdfd48ddbff889)), closes [#1013](https://github.com/sct/overseerr/issues/1013)

# [1.20.0](https://github.com/sct/overseerr/compare/v1.19.1...v1.20.0) (2021-02-23)

### Bug Fixes

- **api:** add isAuthenticated middleware to base user route ([8a27c70](https://github.com/sct/overseerr/commit/8a27c7062599ea23dca115e6e6e95a594e1b219a))
- **api:** sort users requests by most recent ([1798383](https://github.com/sct/overseerr/commit/17983837fc10661a59d29fc1531530fca0d77825))
- **api:** Use POST instead of GET for API endpoints that mutate state ([#877](https://github.com/sct/overseerr/issues/877)) ([ff0b5ed](https://github.com/sct/overseerr/commit/ff0b5ed44132cc5a0cd178035796d042ba735a8d))
- **auth:** handle sign-in attempts from emails with no password ([#933](https://github.com/sct/overseerr/issues/933)) ([5e37a96](https://github.com/sct/overseerr/commit/5e37a96bc017471f8dc4cbdd57f2e8c3568bd97f))
- **frontend:** changed plex, request, and cog buttons to align properly on smaller mobile UIs ([#928](https://github.com/sct/overseerr/issues/928)) ([f1c3358](https://github.com/sct/overseerr/commit/f1c335815f2f17465cdd36ceb223e78a58149b3b))
- **frontend:** check for id instead of email after logging in ([c4af4c4](https://github.com/sct/overseerr/commit/c4af4c42ab00f1a63a2f5326c9cd8b26c19f4f14))
- **frontend:** Do not allow user w/ ID 1 to disable 'Admin' permission ([#965](https://github.com/sct/overseerr/issues/965)) ([77b2d9e](https://github.com/sct/overseerr/commit/77b2d9ea22a2f70cff58ac9421f3f6231bc93059))
- **frontend:** handle empty array of media attributes ([#922](https://github.com/sct/overseerr/issues/922)) ([04fa9f7](https://github.com/sct/overseerr/commit/04fa9f79e2ec90082b3fa15590dd170f7d68ad52))
- **frontend:** request and cog button would be misaligned without play on plex/watch trailer button ([#956](https://github.com/sct/overseerr/issues/956)) ([e28dfad](https://github.com/sct/overseerr/commit/e28dfadaf57d47887013c31dc5006332473156e3))
- **frontend:** Update AdvancedRequester to reflect new /user API response ([#970](https://github.com/sct/overseerr/issues/970)) ([b4bac6a](https://github.com/sct/overseerr/commit/b4bac6a9157119a4f234933245944e133c127bd0))
- **frontend:** use region settings instead of hardcoded 'US' value for movie/TV ratings ([#1006](https://github.com/sct/overseerr/issues/1006)) ([6ecd202](https://github.com/sct/overseerr/commit/6ecd202607cb48d559440da810ecc585e740542b))
- **lang:** formatMessage should not use an object spread ([8a7fa00](https://github.com/sct/overseerr/commit/8a7fa00164fd5c5501da525baa29be97bac7e7c4))
- **lang:** Remove unused strings and correct spelling of 'canceling'/'canceled' ([#981](https://github.com/sct/overseerr/issues/981)) ([5b64655](https://github.com/sct/overseerr/commit/5b646557765d1ad75e44e1c0e60e0291313c7746))
- **login:** fix the gap when 'use your overseer account' was selected ([#870](https://github.com/sct/overseerr/issues/870)) ([d163e29](https://github.com/sct/overseerr/commit/d163e294599c4bd9bdc0a148db15c8e8541410d8))
- **notif:** Do not HTML-escape email subjects ([#931](https://github.com/sct/overseerr/issues/931)) ([019622a](https://github.com/sct/overseerr/commit/019622aab1b94cc4d71cacbf0dc5cf64b62c8623))
- **notif:** Remove extra newlines from Telegram notifications ([#973](https://github.com/sct/overseerr/issues/973)) ([bbea522](https://github.com/sct/overseerr/commit/bbea52249950eb98a8d3886f2bd7648a7d669bf4))
- **plex:** Check Plex server access on user import ([#955](https://github.com/sct/overseerr/issues/955)) ([bdb3cb2](https://github.com/sct/overseerr/commit/bdb3cb202550e34d8951ac2b5015f97f6a5c1ebf))
- **plex-sync:** get correct Plex metadata for Hama movie items ([#901](https://github.com/sct/overseerr/issues/901)) ([03cecb3](https://github.com/sct/overseerr/commit/03cecb33559e27199c5a174fc86de0c4550fe666)), closes [#898](https://github.com/sct/overseerr/issues/898)
- **requests:** correctly filter requests out for users without view requests permission ([e118501](https://github.com/sct/overseerr/commit/e118501bf1dfa8dada2c57090e62631de620f3dd))
- **requests:** correctly handle when tvdbid is missing ([#891](https://github.com/sct/overseerr/issues/891)) ([e037ba4](https://github.com/sct/overseerr/commit/e037ba48f173c06b0c9c8b03085edf832d770c06))
- **search:** Handle search errors and escape \* ([#893](https://github.com/sct/overseerr/issues/893)) ([034968e](https://github.com/sct/overseerr/commit/034968e4370eaea726c94730274349c083856813))
- **services:** update all radarr/sonarr endpoints to use v3 ([da5ca02](https://github.com/sct/overseerr/commit/da5ca02f81fe91070afbda3e1ebc8d869fe39a8f))
- **sonarr:** use qualityProfileId instad of profileId when adding series ([552a7e3](https://github.com/sct/overseerr/commit/552a7e30da5fc2cc0bd43b5aef79a0225c75d233))
- **sync:** fix sonarr/plex sync fighting over availability ([9b73423](https://github.com/sct/overseerr/commit/9b73423d49e1e799cd82764a9ade8c75d92a28a2)), closes [#872](https://github.com/sct/overseerr/issues/872)
- **ui:** add fallback for region display name ([f9c83e1](https://github.com/sct/overseerr/commit/f9c83e14e52a57d6865307b3324a61c04a77a541))
- **ui:** add missing string for default Discover Language & edit string for default Discover Region ([#1004](https://github.com/sct/overseerr/issues/1004)) ([0acad8e](https://github.com/sct/overseerr/commit/0acad8e9fa65a9de6cecac9b6a4a5b2313ba8f06))
- **ui:** Add tip & validation for Discord ID input ([#966](https://github.com/sct/overseerr/issues/966)) ([e70a4ec](https://github.com/sct/overseerr/commit/e70a4ecae613e045977e262fd7f9643f30985ab7))
- **ui:** also allow 17 digit discord ids ([57c00c1](https://github.com/sct/overseerr/commit/57c00c1ea71c1229d5a59e1b8dadd84a646772b9)), closes [#971](https://github.com/sct/overseerr/issues/971)
- **ui:** Automatically disable and uncheck user permissions with unmet requirements ([#941](https://github.com/sct/overseerr/issues/941)) ([c9a150b](https://github.com/sct/overseerr/commit/c9a150b1db2adbb305cf1a448489d7a8c14cf1cb))
- **ui:** change font size in request list/user list dropdowns to prevent zoom on mobile ([fb9c878](https://github.com/sct/overseerr/commit/fb9c878db49c01d13773e8d2f94c93f840be0b82))
- **ui:** Display 4K download status on 4K status badge ([#988](https://github.com/sct/overseerr/issues/988)) ([40b07c3](https://github.com/sct/overseerr/commit/40b07c35d40c03039e4bfa5ed1e73af7e8aa6a7d))
- **ui:** Fix card sizes on person detail pages ([#881](https://github.com/sct/overseerr/issues/881)) ([a3042f8](https://github.com/sct/overseerr/commit/a3042f8e1b05a91d98f48a4aecb08e831a48fc56))
- **ui:** Fix settings navigation horizontal scroll issues ([#987](https://github.com/sct/overseerr/issues/987)) ([8701fb2](https://github.com/sct/overseerr/commit/8701fb20d07773f4cc32e857b68575a813cf7e21))
- **ui:** fix webhook URL validation regex ([baad19a](https://github.com/sct/overseerr/commit/baad19a2c94728313ee996fe1a0ffc64fbd9aaa3))
- **ui:** fixed anime language profile typo ([#879](https://github.com/sct/overseerr/issues/879)) ([ee50761](https://github.com/sct/overseerr/commit/ee5076146ef3c5e8baba197a5b397d3c3f575262))
- **ui:** Handle missing movie/series data ([#862](https://github.com/sct/overseerr/issues/862)) ([7c0ddad](https://github.com/sct/overseerr/commit/7c0ddad653393327226a877692f046d8693ddc66))
- **ui:** Notification-related string/UI edits and field validation ([#985](https://github.com/sct/overseerr/issues/985)) ([c88fcb2](https://github.com/sct/overseerr/commit/c88fcb2e2d1c4b84527844a80680c15337626e72))
- **ui:** rename global group class to form-group ([8056187](https://github.com/sct/overseerr/commit/8056187c3c0ea464a8f751aa6347ea1d35c01aac))
- **ui:** Size cards appropriately based on base font size ([#871](https://github.com/sct/overseerr/issues/871)) ([282f28f](https://github.com/sct/overseerr/commit/282f28f2b9d0cc8c9105d01b43d4e1f730320b8b))
- **ui/notif:** Custom application title in password-related emails and UI messages ([#979](https://github.com/sct/overseerr/issues/979)) ([4e2706b](https://github.com/sct/overseerr/commit/4e2706b4211b06f364910c327d84c2ceb45b2fe3))

### Features

- **lang:** translated using Weblate (French) ([#1007](https://github.com/sct/overseerr/issues/1007)) ([970da66](https://github.com/sct/overseerr/commit/970da664b2700b8cd9ad8dce0cbca1d37820eceb))
- **lang:** translations update from Weblate ([#853](https://github.com/sct/overseerr/issues/853)) ([e156acc](https://github.com/sct/overseerr/commit/e156acc1ae2fa86b4441faacc0b58e1e993e0edc))
- **lang:** translations update from Weblate ([#986](https://github.com/sct/overseerr/issues/986)) ([4296765](https://github.com/sct/overseerr/commit/4296765ad61bac09c2317b71b763366d328733e4))
- **notif:** Add Pushbullet notification agent ([#950](https://github.com/sct/overseerr/issues/950)) ([29b97ef](https://github.com/sct/overseerr/commit/29b97ef6d85bbea31dd59b7ad857b0d8ab30bff0))
- **notif:** Notification improvements ([#914](https://github.com/sct/overseerr/issues/914)) ([2768155](https://github.com/sct/overseerr/commit/2768155bbabe121a4c51fc1472461cd5114c4300))
- **regions:** add region/original language setting for filtering Discover ([#732](https://github.com/sct/overseerr/issues/732)) ([#942](https://github.com/sct/overseerr/issues/942)) ([b557c06](https://github.com/sct/overseerr/commit/b557c06b0a78f5df5f64a05dc1e4511dae72df4f))
- **requests:** add language profile support ([#860](https://github.com/sct/overseerr/issues/860)) ([53f6f59](https://github.com/sct/overseerr/commit/53f6f59798fa7e3f95959990a3df555db3c1c51e))
- **ui:** Add 'Available' filter to request list and remove unused MediaRequestStatus.AVAILABLE enum value ([#905](https://github.com/sct/overseerr/issues/905)) ([9757e3a](https://github.com/sct/overseerr/commit/9757e3ae0c572fb46177e25154b29e0ceced665f))
- **ui:** Add 'Page Size' setting for request/user list pages ([#957](https://github.com/sct/overseerr/issues/957)) ([621db89](https://github.com/sct/overseerr/commit/621db893281f0280fe773ac7dbdc44434895242c))
- **ui:** Add separate permissions for 4K auto approval ([#908](https://github.com/sct/overseerr/issues/908)) ([53b7425](https://github.com/sct/overseerr/commit/53b7425f6711e250935e7bb024c38ff6c62e07d9))
- **ui:** Add sort options to user list ([#913](https://github.com/sct/overseerr/issues/913)) ([ef5d019](https://github.com/sct/overseerr/commit/ef5d019c18d7f6cdbbb1e1b7f8ff7816ed9b117b))
- **ui:** Add support for requesting collections in 4K ([#968](https://github.com/sct/overseerr/issues/968)) ([139341b](https://github.com/sct/overseerr/commit/139341b0434b41e7c31af36baacd8d65566a6a0c))
- user profile/settings pages ([#958](https://github.com/sct/overseerr/issues/958)) ([bbb683e](https://github.com/sct/overseerr/commit/bbb683e637386ad8bbeb44dca97aac9cdaf11349))
- **ui:** added content ratings for tv shows and movie ratings ([#878](https://github.com/sct/overseerr/issues/878)) ([c8b2a57](https://github.com/sct/overseerr/commit/c8b2a57721a51adcc7f90ec1acb48b127991d467))
- **users:** add reset password flow ([#772](https://github.com/sct/overseerr/issues/772)) ([e5966bd](https://github.com/sct/overseerr/commit/e5966bd3fbfe172f264f4e986ad2aecf29ae1510))

## [1.19.1](https://github.com/sct/overseerr/compare/v1.19.0...v1.19.1) (2021-02-06)

### Bug Fixes

- **ui:** Fix webhook URL validation regex ([#864](https://github.com/sct/overseerr/issues/864)) ([726f62b](https://github.com/sct/overseerr/commit/726f62b9b69b5078e718f129e26abdf358f5cb06))

# [1.19.0](https://github.com/sct/overseerr/compare/v1.18.0...v1.19.0) (2021-02-05)

### Bug Fixes

- **api:** filter out adult content from combined credits ([3052f12](https://github.com/sct/overseerr/commit/3052f12c91b3ce86128324e3698fff61bbce3f2a))
- **cache:** use formatted numbers for displaying cache counts ([6c437c5](https://github.com/sct/overseerr/commit/6c437c515fc01b9fe4461968875e23542bae7542))
- **email:** make image a link to the action url in request template ([ee0a7bd](https://github.com/sct/overseerr/commit/ee0a7bd8c0b3a79c292b0abceb2f780f3889e49f)), closes [#834](https://github.com/sct/overseerr/issues/834)
- **frontend:** add github sponsor link to about page ([7c192d5](https://github.com/sct/overseerr/commit/7c192d54f422a5f2b55750535d2382e313f1d011))
- **frontend:** correctly show 4k download tracker activity ([a7314f8](https://github.com/sct/overseerr/commit/a7314f876ea528fdec0fb0a2adaa36a01afcdf38))
- **frontend:** fix possible division by zero in download status ([#839](https://github.com/sct/overseerr/issues/839)) ([c97c96a](https://github.com/sct/overseerr/commit/c97c96a30c50db7735f06c6d2d2f6193fb7da55e))
- **frontend:** match request button color on titlecards to other request buttons ([5b39911](https://github.com/sct/overseerr/commit/5b39911e024513fab7a62948e653cee08fd166c7))
- **frontend:** set 4k status on RequestItem when request is for 4k ([a3b00c3](https://github.com/sct/overseerr/commit/a3b00c3458b868506d4158fb24f0369fa5daefc5))
- **frontend:** use consistent spinner style on TitleCard/Plex Presets ([cf7ebc4](https://github.com/sct/overseerr/commit/cf7ebc488db33725444c428b4244d780ab9d123b))
- **html:** th elements should be nested under tr, not directly under thead ([#801](https://github.com/sct/overseerr/issues/801)) ([6e9ac27](https://github.com/sct/overseerr/commit/6e9ac275e19d56de8c7a366db970c7321f26fc8a))
- **lang:** Add missing source strings & remove local user sign-in setting tip ([#828](https://github.com/sct/overseerr/issues/828)) ([c0769d4](https://github.com/sct/overseerr/commit/c0769d4f8f2bad88e4638d8c3cbcc0414b3ef6fb))
- **lang:** Edit English language strings ([#820](https://github.com/sct/overseerr/issues/820)) ([f54df21](https://github.com/sct/overseerr/commit/f54df214af86d90ea8d7cfcd4e39022215c3568c))
- **lang:** translate language names & change zh-Hant language code to zh-TW ([#793](https://github.com/sct/overseerr/issues/793)) ([3c5ae36](https://github.com/sct/overseerr/commit/3c5ae360fd179d794a78cc918fe97a09216ca6b2))
- **notif/ui:** Use custom application title in notifications & sign-in page ([#849](https://github.com/sct/overseerr/issues/849)) ([38c76b5](https://github.com/sct/overseerr/commit/38c76b55e0039c489cb6a4a0a298aa6385406db4))
- **radarr:** correctly set requested status after sending to radarr (with auto approve) ([ec44841](https://github.com/sct/overseerr/commit/ec448413569ddc2f24bb856d29084169979f9f05))
- **sonarr-sync:** sonarr sync will no longer set shows with no episodes to partially available ([d20bd53](https://github.com/sct/overseerr/commit/d20bd530edaadc5887b0361358da80153e36505c)), closes [#796](https://github.com/sct/overseerr/issues/796)
- **ui:** Add additional URL & email input validation ([#843](https://github.com/sct/overseerr/issues/843)) ([3f9bfeb](https://github.com/sct/overseerr/commit/3f9bfeb01a67b2b587c7548b02ee826722e65c0f))
- **ui:** Don't display empty dropdown when no trailer available ([#804](https://github.com/sct/overseerr/issues/804)) ([95c2a21](https://github.com/sct/overseerr/commit/95c2a2169799d96413b47ab24506b330435643eb))
- **ui:** dont show bulk edit options on user list if there is only one user ([b658ddf](https://github.com/sct/overseerr/commit/b658ddf5cf61b2bb9b93cb1a4ca716cd75e18bb4))
- **ui:** Dynamically generate path to config in warning message ([#851](https://github.com/sct/overseerr/issues/851)) ([b531a64](https://github.com/sct/overseerr/commit/b531a642f601f4ef9bf39c2f5915402157e55372))
- **ui:** fix tables extending outside viewport in mobile formats ([e270999](https://github.com/sct/overseerr/commit/e270999745f97c2860f6a5b84e897dc6da8d6001))
- **ui:** Hide 'Mark 4k as Available' button if 4k not enabled ([#833](https://github.com/sct/overseerr/issues/833)) ([e4a50c3](https://github.com/sct/overseerr/commit/e4a50c33f105b440243885d72a9e96595a525447))
- **ui:** Limit max width of forms & lists ([#845](https://github.com/sct/overseerr/issues/845)) ([b9d14a9](https://github.com/sct/overseerr/commit/b9d14a9fd0f3c94d8267755147a87fe3b77fa2c3))
- **ui:** prevent names from getting squished in AdvancedRequester user selector ([06e9411](https://github.com/sct/overseerr/commit/06e941171a1d019fbb178624167c026f6df5271c))
- **ui:** remove yup validation from display name on user edit page ([63d7e2b](https://github.com/sct/overseerr/commit/63d7e2b39858fcb1cc0819a680eebccded7f4451))
- **ui:** Restore original port input size ([#814](https://github.com/sct/overseerr/issues/814)) ([1ccafc0](https://github.com/sct/overseerr/commit/1ccafc0ebd368d798f9571b83910336efa317e37))
- **ui:** show request as option even if there are no radarr/sonarr servers ([b116281](https://github.com/sct/overseerr/commit/b116281196c264b4ec35b07f1b4ffa717e50ade5))
- **ui:** uniform-size checkboxes, vertically-aligned form labels, and fixes for other UI imperfections/inconsistencies ([#737](https://github.com/sct/overseerr/issues/737)) ([e34fbf7](https://github.com/sct/overseerr/commit/e34fbf72fda34d69b9f25563fa81f88b3c20912a))
- **ui:** Use minimum char validation message ([#850](https://github.com/sct/overseerr/issues/850)) ([7456bea](https://github.com/sct/overseerr/commit/7456bea2ae600a28cb933278ffb310b63a474d6a))
- **ui:** validate application url and service external urls ([026795d](https://github.com/sct/overseerr/commit/026795d4c940cb4797d3e68089456a4c3defbb21))
- **ui:** when PersonCard has no profilePath, correctly position name/role content ([3ffd5ab](https://github.com/sct/overseerr/commit/3ffd5ab0ee8ffa63199d1428e37206f9b59fb7a5))

### Features

- **cache:** add cache table and flush cache option to settings ([996bd9f](https://github.com/sct/overseerr/commit/996bd9f14ed0f56767892c169b071be4f0f628d0))
- **cache:** external API cache ([#786](https://github.com/sct/overseerr/issues/786)) ([20289b5](https://github.com/sct/overseerr/commit/20289b5960a93545cdff9331a1a7b613f382e702))
- **docker:** Check for /app/config volume mount during setup ([#826](https://github.com/sct/overseerr/issues/826)) ([1e5f88f](https://github.com/sct/overseerr/commit/1e5f88f462b0c69db5f6ab8e0249a5905bc6952a))
- **frontend:** add TheTVDB external link ([#800](https://github.com/sct/overseerr/issues/800)) ([72cffd7](https://github.com/sct/overseerr/commit/72cffd74a75984ba98c456c0ec006ec378a8dcec))
- **lang:** add support for Hungarian language ([cfacb15](https://github.com/sct/overseerr/commit/cfacb151b52d08e19d2fcd603fb4bbcd78707cdf))
- **lang:** translations update from Weblate ([#791](https://github.com/sct/overseerr/issues/791)) ([42295e0](https://github.com/sct/overseerr/commit/42295e076a7579b226d57407a20cb0ba044e9ec1))
- **lang:** translations update from Weblate ([#819](https://github.com/sct/overseerr/issues/819)) ([9e5e4c2](https://github.com/sct/overseerr/commit/9e5e4c22f5b25df96f47875d599ed8685791382a))
- **lang:** translations update from Weblate ([#841](https://github.com/sct/overseerr/issues/841)) ([e4f9b8a](https://github.com/sct/overseerr/commit/e4f9b8a9848f3af00e86fc7108c823ed0584609f))
- **lang:** translations update from Weblate ([#852](https://github.com/sct/overseerr/issues/852)) ([c5be00e](https://github.com/sct/overseerr/commit/c5be00eebfd2b0e65295edbe282cbba22fffa660))
- **ui:** Add local login setting ([#817](https://github.com/sct/overseerr/issues/817)) ([9d0d5b8](https://github.com/sct/overseerr/commit/9d0d5b86aae025e4647bb664c6412d42192e2fe7))
- **ui:** added next airing date to TV Shows ([#842](https://github.com/sct/overseerr/issues/842)) ([4eae02a](https://github.com/sct/overseerr/commit/4eae02a7e14e377fd69ddd4a43774cb7e3d1855b))
- new permission to allow users to see other users requests ([033ba9d](https://github.com/sct/overseerr/commit/033ba9d41bddf6dc1c4512d8404f747e57923bca)), closes [#840](https://github.com/sct/overseerr/issues/840)
- request as another user ([59150f9](https://github.com/sct/overseerr/commit/59150f955f7003672ef19eb9d37156e93b79c97d))
- **tv:** show cast for the entire show instead of only the last season ([#778](https://github.com/sct/overseerr/issues/778)) ([b239598](https://github.com/sct/overseerr/commit/b239598e64d33b78dc5d7972878840149aff360a)), closes [#775](https://github.com/sct/overseerr/issues/775)
- **ui:** Add custom title functionality ([#825](https://github.com/sct/overseerr/issues/825)) ([35c6bfc](https://github.com/sct/overseerr/commit/35c6bfc0216bf879353b3ee546b439a06c8e6121))

# [1.18.0](https://github.com/sct/overseerr/compare/v1.17.2...v1.18.0) (2021-01-30)

### Bug Fixes

- **api:** prevent duplicate movie requests ([421f4c1](https://github.com/sct/overseerr/commit/421f4c17f0f206bbe7bfcbf2819014b8c7f55b6a)), closes [#705](https://github.com/sct/overseerr/issues/705)
- **build:** fix sqlite3 build error ([#691](https://github.com/sct/overseerr/issues/691)) ([3a1f6d5](https://github.com/sct/overseerr/commit/3a1f6d5706c8fc100e88425f3d89a26a0325af79))
- **frontend:** add poster not found image to request card and request list item ([ae9a1b3](https://github.com/sct/overseerr/commit/ae9a1b3e940ac2abf6e842d91f458daab3dd0f0d))
- **frontend:** add poster not found image to tv details page ([0b05545](https://github.com/sct/overseerr/commit/0b055458d0ddbfd4c87ebf9b0562f161fa3445a3))
- **frontend:** dont show external links unless slug is set ([946bd2d](https://github.com/sct/overseerr/commit/946bd2db5ecde0748b2e9bc5edfe7ca6000ec3d5))
- **frontend:** fix server name position on plex settings page ([86efcd8](https://github.com/sct/overseerr/commit/86efcd82c34ad6490f2899ebf6f84cdd1bffc498))
- **frontend:** fixed mismatched rounded sizing on new login ([5e352c2](https://github.com/sct/overseerr/commit/5e352c201fc2f731ca5f713ecb6901527ef354da)), closes [#721](https://github.com/sct/overseerr/issues/721)
- **ip logging:** add env var for proxy to fix ip logging on failed logins ([#756](https://github.com/sct/overseerr/issues/756)) ([9342a40](https://github.com/sct/overseerr/commit/9342a40bbc03f7fdda23e3876b3a4a81ea8532c0))
- **lang:** add missing i18n strings for notification settings ([2f75c4c](https://github.com/sct/overseerr/commit/2f75c4c6aed42a15bb47d3652272de8f852ec79f))
- **notifications:** only send a single notification when standard media becomes available ([b5fd1d5](https://github.com/sct/overseerr/commit/b5fd1d520cd2a7be6e6356a25129e93af1caf542)), closes [#770](https://github.com/sct/overseerr/issues/770)
- **permissions:** use default user permissions when creating a local user ([#713](https://github.com/sct/overseerr/issues/713)) ([660ada0](https://github.com/sct/overseerr/commit/660ada0b2025eb2c06d9054fd0a7b5a632af6af2))
- **radarr:** fix request bug which made it unable to be added to radarr ([#760](https://github.com/sct/overseerr/issues/760)) ([45a2779](https://github.com/sct/overseerr/commit/45a277964b0c39346d7216873812e0ebe505cb79))
- **radarr:** return the updated data when updating radarr request ([#765](https://github.com/sct/overseerr/issues/765)) ([0c6d478](https://github.com/sct/overseerr/commit/0c6d4780c355ffe1a951268fb6949491d435bbf1))
- **requests:** handle when tvdbid is null ([#657](https://github.com/sct/overseerr/issues/657)) ([2da0da8](https://github.com/sct/overseerr/commit/2da0da826ae1d73467bc8a671fda7cc5ca1f14c9))
- **sonarr-sync:** correctly set series with no seasons to requested status ([3812989](https://github.com/sct/overseerr/commit/3812989a1ce1e07d4af09149008043a6e2e94060)), closes [#762](https://github.com/sct/overseerr/issues/762)
- **sync:** do not update series status if already available and no new seasons ([136d874](https://github.com/sct/overseerr/commit/136d874cba37babf9c0670844b002871710e6d99)), closes [#777](https://github.com/sct/overseerr/issues/777)
- **ui:** Capitalization, punctuation, and grammar inconsistences & errors ([#731](https://github.com/sct/overseerr/issues/731)) ([f05d4a0](https://github.com/sct/overseerr/commit/f05d4a0d0b42905fcaee49b2471bb1f4ee77fffe))
- lookup movie by imdbid if tmdbid does not exits for plex movie agent ([#711](https://github.com/sct/overseerr/issues/711)) ([e972288](https://github.com/sct/overseerr/commit/e97228899a5936b2525c8060abfa14b5ce31658d))
- show recently added series even if they are not complete ([d0c830e](https://github.com/sct/overseerr/commit/d0c830e80d389f9e0f48a9b83659331f54630d03))

### Features

- **lang:** translated using Weblate (Dutch) ([059995e](https://github.com/sct/overseerr/commit/059995e0ef3370a3192bd386fa6875ca0f58690a))
- **lang:** translated using Weblate (French) ([4789583](https://github.com/sct/overseerr/commit/4789583d66305ac7b3d393659b2f3604c0acc576))
- **lang:** translations update from Weblate ([#727](https://github.com/sct/overseerr/issues/727)) ([71875ef](https://github.com/sct/overseerr/commit/71875efb48246dbb0139ad15a4261a5661fcfe17))
- **lang:** update languages and fix merge conflict ([083a74a](https://github.com/sct/overseerr/commit/083a74a686d202cce5775bf9752caaa9a626cf45))
- **ui:** Move PROXY setting to UI ([#782](https://github.com/sct/overseerr/issues/782)) ([f1dd5e7](https://github.com/sct/overseerr/commit/f1dd5e7e12c1f602449c4769173dbce71e3569d0))
- add manual availability buttons to manage slideover ([67f8aef](https://github.com/sct/overseerr/commit/67f8aef00d98c834b60cb6152ccd5cb7b5709d12)), closes [#672](https://github.com/sct/overseerr/issues/672)
- **media:** add link to the item on plex ([#735](https://github.com/sct/overseerr/issues/735)) ([1d7150c](https://github.com/sct/overseerr/commit/1d7150c24ec5ad347093889bfceab61b664900d5))
- Radarr & Sonarr Sync ([#734](https://github.com/sct/overseerr/issues/734)) ([ec5fb83](https://github.com/sct/overseerr/commit/ec5fb836785855eb4846fd33b49faeb94c40506a))
- **frontend:** add option to hide all available items from discovery ([#699](https://github.com/sct/overseerr/issues/699)) ([6c1742e](https://github.com/sct/overseerr/commit/6c1742e94ccfc6c13cf1d25fd9e893ee1f431aae))
- **lang:** add support for Portuguese (Portugal) language ([e044146](https://github.com/sct/overseerr/commit/e044146aa55109a1eccfde9650b26beb0d5ec9a6))
- **lang:** translated using Weblate (Dutch) ([6d0f7d4](https://github.com/sct/overseerr/commit/6d0f7d4b50370c420c1017f32d48313074543743))
- **lang:** translated using Weblate (Italian) ([9aa5c12](https://github.com/sct/overseerr/commit/9aa5c121644518c1fbb308a487c26d8998bb5a36))
- **lang:** translated using Weblate (Portuguese (Portugal)) ([f001fb3](https://github.com/sct/overseerr/commit/f001fb3b33d4fb749acb70c45b8a55a5bbef570c))
- **lang:** translated using Weblate (Spanish) ([4f94d22](https://github.com/sct/overseerr/commit/4f94d227fc3096bcb8a1e5cf12fe9222d6c6b711))
- **login:** add request ip to the failed request log ([#714](https://github.com/sct/overseerr/issues/714)) ([2d31ea9](https://github.com/sct/overseerr/commit/2d31ea940ac0a1a84d2150743798b41ff6490317))
- **users:** add editable usernames ([#715](https://github.com/sct/overseerr/issues/715)) ([20ca3f2](https://github.com/sct/overseerr/commit/20ca3f2f5fcf4a9eb0d6a8be671bb4fb1f5e6178))
- pre-populate server info from plex.tv API ([#563](https://github.com/sct/overseerr/issues/563)) ([82ac76b](https://github.com/sct/overseerr/commit/82ac76b0540ba1133cb5384744d2499c2488a4e8))
- **auth:** Add optional CSRF protection ([#697](https://github.com/sct/overseerr/issues/697)) ([6e25891](https://github.com/sct/overseerr/commit/6e2589178b99f8f32f0ded9a7cfd9921c33e9b60))
- ability to edit user settings in bulk ([#597](https://github.com/sct/overseerr/issues/597)) ([4b0241c](https://github.com/sct/overseerr/commit/4b0241c3b34d4229f928c21defb10a1c051264d1))
- **lang:** translated using Weblate (English) ([9bb11af](https://github.com/sct/overseerr/commit/9bb11afc6b4a109ae1e14d41c9fe2b71f19c470a))
- **lang:** translated using Weblate (German) ([c2a3e8e](https://github.com/sct/overseerr/commit/c2a3e8ed5243925dce991ec7995ae831702dbc7b))
- **lang:** translated using Weblate (Portuguese (Brazil)) ([32f4916](https://github.com/sct/overseerr/commit/32f4916c4a926097f31ed472aee031536b847bb7))
- **lang:** translated using Weblate (Portuguese (Brazil)) ([98570c9](https://github.com/sct/overseerr/commit/98570c920e4904a594bb7464161b985094958f84))
- **notifications:** add option to send notifications for auto-approved requests ([21db367](https://github.com/sct/overseerr/commit/21db3676d1464b63384b04c0c2926cb2a6252e9b)), closes [#267](https://github.com/sct/overseerr/issues/267)

## [1.17.2](https://github.com/sct/overseerr/compare/v1.17.1...v1.17.2) (2021-01-20)

### Bug Fixes

- **requests:** allow declined season requests to be re-requested ([e1032ff](https://github.com/sct/overseerr/commit/e1032ff5dfac4a8c9d4da9cf2788c19822343ad9)), closes [#690](https://github.com/sct/overseerr/issues/690)
- **requests:** update requests to approved when parent media is set as available ([78444a9](https://github.com/sct/overseerr/commit/78444a9e643829823162389dee60cca70da56bff)), closes [#688](https://github.com/sct/overseerr/issues/688)

## [1.17.1](https://github.com/sct/overseerr/compare/v1.17.0...v1.17.1) (2021-01-19)

### Bug Fixes

- **frontend:** show auto approval on series request modal only with correct permissions ([8927c6d](https://github.com/sct/overseerr/commit/8927c6d2e39dbda2b1121095a7273f5cab1c9b74)), closes [#687](https://github.com/sct/overseerr/issues/687)

# [1.17.0](https://github.com/sct/overseerr/compare/v1.16.0...v1.17.0) (2021-01-19)

### Bug Fixes

- **api:** improve rottentomatoes rating matching for movies ([7db62ab](https://github.com/sct/overseerr/commit/7db62ab824eefc42e6db16e42d52f4266b136f82)), closes [#494](https://github.com/sct/overseerr/issues/494)
- **build:** remove cross import from client to server for UserType ([23624bd](https://github.com/sct/overseerr/commit/23624bd144af5df4c31995b68ce48105b95b20f6))
- **frontend:** clarify which fields are required in radarr/sonarr modals ([860d71e](https://github.com/sct/overseerr/commit/860d71ed69a69a1a3f74b79290ef471e04f57a6b)), closes [#575](https://github.com/sct/overseerr/issues/575)
- **frontend:** do not show failed media status on request list for declined requests ([00944b1](https://github.com/sct/overseerr/commit/00944b1ec2db8ddc5742448f6448f7364c473a98)), closes [#664](https://github.com/sct/overseerr/issues/664)
- **frontend:** fix button styling on details page on small screen sizes ([d9e0c90](https://github.com/sct/overseerr/commit/d9e0c90e76d80aef0c67318e00e997804805f46e))
- **frontend:** fix request button height ([a262727](https://github.com/sct/overseerr/commit/a2627270784bdef8644875fa5c5a7349a0b7fd81))
- **frontend:** request dropdown menu now properly shows up over collection button ([b491be1](https://github.com/sct/overseerr/commit/b491be1b1e7f6aa588274230e695e4c5302b961e))
- **frontend:** show correct request status on request cards for 4k requests ([1aa0005](https://github.com/sct/overseerr/commit/1aa0005b4298fc1af9c1d0bf1f357738c0fa2673))
- **lang:** add missing see more i18n string for SeeMoreCard ([d9919ab](https://github.com/sct/overseerr/commit/d9919abb8998d28558ddec35b8e60ab2af75d5b7))
- **lang:** change email auth user/pass strings to SMTP Username/Password ([a77a2aa](https://github.com/sct/overseerr/commit/a77a2aa3ebb1be353d534db5b07647ac26c60e15))
- **notifications:** correctly compare seasons before sending series notifications ([f17fa2a](https://github.com/sct/overseerr/commit/f17fa2a2db8144bac89936f588627e8dd37bf54a))
- **notifications:** only send one available notification for standard media ([fc6f7cc](https://github.com/sct/overseerr/commit/fc6f7ccea586165a30022b6d5554911c66ece6df))
- **notifications:** send media declined email ([eb6fc8a](https://github.com/sct/overseerr/commit/eb6fc8a19099469794d471db0b48a258c2866633)), closes [#679](https://github.com/sct/overseerr/issues/679)
- **plex-sync:** improve plex sync error handling. add session id to fix stuck runs ([a740b07](https://github.com/sct/overseerr/commit/a740b07f06f892b72a651b928af28ce71cb495ee))
- **plex-sync:** store plex added date and sort recently added by it ([d688a96](https://github.com/sct/overseerr/commit/d688a967596afcba9799b8133089bebb5add27cf))
- **requests:** select the correct radarr/sonarr server when sending request to service ([e0d9f89](https://github.com/sct/overseerr/commit/e0d9f891e797c3839f976b75a871903b6f2e55f1))
- **server:** support absolute paths for CONFIG_DIRECTORY ([51d8fba](https://github.com/sct/overseerr/commit/51d8fba9162b9e148a35ced69e7e035438c8b0f1))
- **user edit:** fix user edit not being able to be saved ([#651](https://github.com/sct/overseerr/issues/651)) ([b04d00e](https://github.com/sct/overseerr/commit/b04d00ef509d6f13c1f9677b3f318331782c0086))

### Features

- **api:** /request/count endpoint ([#682](https://github.com/sct/overseerr/issues/682)) ([192cfd8](https://github.com/sct/overseerr/commit/192cfd8a8ea9ab942d5bb265d42050917a2f5a04))
- **frontend:** add see more card to media sliders ([587e8db](https://github.com/sct/overseerr/commit/587e8db15e9c19b4c58406e3e4215d8bf87d8762))
- **frontend:** add template variable help button to custom webhook settings page ([29c5bc4](https://github.com/sct/overseerr/commit/29c5bc40975e7ab0a2e08bb77294f164f0c60769))
- **lang:** add support for Chinese (Traditional) language ([686c4f7](https://github.com/sct/overseerr/commit/686c4f71bf930625af082ac5e14dc5f79f5c42eb))
- **lang:** Translations update from Weblate ([#604](https://github.com/sct/overseerr/issues/604)) ([801e765](https://github.com/sct/overseerr/commit/801e76524d6ea0887249f1630402e9c3a3430b44))
- **login:** add local users functionality ([#591](https://github.com/sct/overseerr/issues/591)) ([492e19d](https://github.com/sct/overseerr/commit/492e19df4014e67dc6a2de5903a33c25e13fcf45))
- **notifications:** add notification for declined requests ([2f97f61](https://github.com/sct/overseerr/commit/2f97f61a6e8846975774aa16950a39ada2b1a016)), closes [#663](https://github.com/sct/overseerr/issues/663)
- **notifications:** Webhook Notifications ([#632](https://github.com/sct/overseerr/issues/632)) ([a7cc7c5](https://github.com/sct/overseerr/commit/a7cc7c59753dd9649b2ec37eb9d46fe4fa8e1e1c))
- **requests:** Request Overrides & Request Editing ([#653](https://github.com/sct/overseerr/issues/653)) ([bdb3372](https://github.com/sct/overseerr/commit/bdb33722e6df09dd6d8caa36b104b61c6b8dc00d))
- **server:** add CONFIG_DIRECTORY env var to control config directory location ([fa8f112](https://github.com/sct/overseerr/commit/fa8f112c31ccb5ee6244f776bc97e76d81958539))
- 4K Requests ([#559](https://github.com/sct/overseerr/issues/559)) ([6b2df24](https://github.com/sct/overseerr/commit/6b2df24a2e8f96dd2277a814d7e02015d1f80cdc))
- map AniDB IDs from Hama agent to tvdb/tmdb/imdb IDs ([#538](https://github.com/sct/overseerr/issues/538)) ([0600ac7](https://github.com/sct/overseerr/commit/0600ac7c3a1bc0cdd906634d5f77ea3e99b10e94)), closes [#453](https://github.com/sct/overseerr/issues/453)

### Reverts

- **deps:** revert back to next@10.0.3 until sharp optional dependency bug is fixed ([7962964](https://github.com/sct/overseerr/commit/79629645aacc1a042919834da79bff0c1f69c9d6))

# [1.16.0](https://github.com/sct/overseerr/compare/v1.15.0...v1.16.0) (2021-01-07)

### Bug Fixes

- **frontend:** adjust titlecard badge styling ([effc809](https://github.com/sct/overseerr/commit/effc80977a4ed732092254248f82363e52233171))
- **frontend:** apply same titlecard hover effect to personcard ([67f2b57](https://github.com/sct/overseerr/commit/67f2b57f00216ded3b34965629d6fdd2f16bc25f))
- **frontend:** only animate titlecard when showDetail is true ([0ab4c3c](https://github.com/sct/overseerr/commit/0ab4c3c36fe2c1ded142b6931111516f7f990a41))
- **frontend:** use hardware acceleration for titlecard scale ([88810bf](https://github.com/sct/overseerr/commit/88810bf0a4ef74299f6541b60fa91cea3610f99c))
- **plex-sync:** do not run plex sync if no admin exists ([493d82b](https://github.com/sct/overseerr/commit/493d82b6b066d77609cf66e005fd1f1472b8e011))

### Features

- **lang:** translations update from Weblate ([#495](https://github.com/sct/overseerr/issues/495)) ([b04eda6](https://github.com/sct/overseerr/commit/b04eda6c8a3bfcaa2a14b8a29612fdf690c9fba0))
- **lang:** Translations update from Weblate ([#580](https://github.com/sct/overseerr/issues/580)) ([2bfe0f2](https://github.com/sct/overseerr/commit/2bfe0f2bf66956763ab26d5c54f26e6c456f59f7))
- **notifications:** add pushover integration ([#574](https://github.com/sct/overseerr/issues/574)) ([ee5d018](https://github.com/sct/overseerr/commit/ee5d0181fc9a673b27aefd1d09b0a78c3d2e4f55))

# [1.15.0](https://github.com/sct/overseerr/compare/v1.14.1...v1.15.0) (2021-01-04)

### Bug Fixes

- **api:** return 202 when same seasons are requested again ([5c84702](https://github.com/sct/overseerr/commit/5c847026aad79fcac4d020786ded9f867696c226))
- **build:** fixes build to include commit tag for app build step ([289864a](https://github.com/sct/overseerr/commit/289864af1a995ce04834bf8a220cc238e1954d19))
- **docs:** fix typo in build instructions ([#503](https://github.com/sct/overseerr/issues/503)) ([2b27a71](https://github.com/sct/overseerr/commit/2b27a715b07c27200ba1e5e9623629a34389276d))
- **frontend:** add i18n for request text on titlecard ([a524b9c](https://github.com/sct/overseerr/commit/a524b9c4c8968f6823d33eb270dc26069fe4a725))
- **frontend:** add localized strings for status checker ([2dcda39](https://github.com/sct/overseerr/commit/2dcda39d40d820419e098bd6f1101eb820e5b42d))
- **frontend:** center text in movie auto-approve modal on small screens ([#510](https://github.com/sct/overseerr/issues/510)) ([1438b08](https://github.com/sct/overseerr/commit/1438b08cf0b358d79c6688c64be99f1718ec2d23)), closes [#507](https://github.com/sct/overseerr/issues/507)
- **frontend:** change titlecard to only have a request button ([b5a3a7a](https://github.com/sct/overseerr/commit/b5a3a7a89fcaf86dd794dc419711677b53646577))
- **frontend:** combine duplicate credits on a persons detail page ([d188f6f](https://github.com/sct/overseerr/commit/d188f6ffadff1564c47d5f33138e35498bed29fd)), closes [#504](https://github.com/sct/overseerr/issues/504)
- **frontend:** disable pointer-events on titlecard badges ([ce06879](https://github.com/sct/overseerr/commit/ce0687922a94588b3492e8ddf2e84f54dd1a0d4e))
- **frontend:** fix count of requests in request list ([f124d73](https://github.com/sct/overseerr/commit/f124d732a2911abdccb5abc11471efe61cc20f7a))
- **frontend:** fix sliders overflowing on firefox ([67ac9e0](https://github.com/sct/overseerr/commit/67ac9e075f0ca1cfe7e4766d9168815d7ab600fa)), closes [#566](https://github.com/sct/overseerr/issues/566)
- **frontend:** full season request modal fits on a smaller mobile UI ([#535](https://github.com/sct/overseerr/issues/535)) ([12db7a0](https://github.com/sct/overseerr/commit/12db7a065ad566b47d46de4b949343290894f153))
- **frontend:** handle currentLibrary possibly being null on first manual sync ([93b57a7](https://github.com/sct/overseerr/commit/93b57a76f10a823615ca11ff59f523b67aa30fad))
- **frontend:** increase titlecard status badge size on larger screens ([ba106c4](https://github.com/sct/overseerr/commit/ba106c447d76db2f9ac70a60c5b38cc60ab554fe))
- **frontend:** search clear button now correctly triggers routing ([343f466](https://github.com/sct/overseerr/commit/343f466788abc308b91a414ef61bba816ac8875c))
- **frontend:** set locale cookie expiration to be much longer ([fae4818](https://github.com/sct/overseerr/commit/fae481895736eab81d52eb93788beb00669fb355))
- **frontend:** show movie/series badges always ([8cbf39a](https://github.com/sct/overseerr/commit/8cbf39a9d12eaee7720fa4721c350c1ef9dee856))
- **frontend:** update login/setup images ([058fb65](https://github.com/sct/overseerr/commit/058fb65495baa08a0bd4c9e0aef320c6fc7d017b))
- **holiday:** remove special holiday slider ([8c09033](https://github.com/sct/overseerr/commit/8c0903393cf2cb2a929ba70a8ab6ddcc4cba0574))
- correctly deal with tmdb id duplicates between movies/series ([721ed9a](https://github.com/sct/overseerr/commit/721ed9a93087a57ae749388bddcacf26022e3df6)), closes [#526](https://github.com/sct/overseerr/issues/526)
- use new commit tag file for app version as well ([d00e470](https://github.com/sct/overseerr/commit/d00e470b55327489b49d770144b7cfdb24045be6))

### Features

- **email:** add sendername to email notification ([#506](https://github.com/sct/overseerr/issues/506)) ([0185bb1](https://github.com/sct/overseerr/commit/0185bb1a7084c1faeb61fb1c63e34e26732711c8))
- **frontend:** add clear-field-icon to search field ([#498](https://github.com/sct/overseerr/issues/498)) ([7434a26](https://github.com/sct/overseerr/commit/7434a26f76b5e9f74918f3e1a34443d20ecfcbe4))
- **frontend:** add documentation link to about page ([c034496](https://github.com/sct/overseerr/commit/c034496f557a031aed35cd28dc7221d8cdf36643))
- **frontend:** add telegram integration ([#491](https://github.com/sct/overseerr/issues/491)) ([c8d4d67](https://github.com/sct/overseerr/commit/c8d4d674f412082ad9e9da09abd79660365cf728))
- **frontend:** filter/sorting for request list ([5add44c](https://github.com/sct/overseerr/commit/5add44cfb0379aa6fed7c3b867230292feacc684)), closes [#431](https://github.com/sct/overseerr/issues/431)
- **notifications:** control notifcation types per agent ([8af6a1f](https://github.com/sct/overseerr/commit/8af6a1f566769c583af7dd9e18d162717835b7cc)), closes [#513](https://github.com/sct/overseerr/issues/513)
- status checker to prompt users to reload their frontend when app version changes ([75a4264](https://github.com/sct/overseerr/commit/75a426437a4182e21da13684066966dd5bf8fc5e))

## [1.14.1](https://github.com/sct/overseerr/compare/v1.14.0...v1.14.1) (2021-01-02)

### Bug Fixes

- **holiday:** remove special holiday slider ([22f2037](https://github.com/sct/overseerr/commit/22f2037ea6c5a0ba2ffa4d69f2b7cf42bdcf8575))

# [1.14.0](https://github.com/sct/overseerr/compare/v1.13.0...v1.14.0) (2020-12-25)

### Bug Fixes

- **frontend:** add margin to ButtonWithDropdown component on movie/tv details page ([06fc98b](https://github.com/sct/overseerr/commit/06fc98b6b958221fa180f57f702c348f15b31f1c))
- **frontend:** correctly position title card hover section ([#486](https://github.com/sct/overseerr/issues/486)) ([4b7af86](https://github.com/sct/overseerr/commit/4b7af86111a0300e1a137f23fa4ad1639fa55feb))
- **frontend:** fix missing styles for alert component ([de3d288](https://github.com/sct/overseerr/commit/de3d288949b60d3a3af889d69a62bea2bc799ed7))
- **frontend:** fix mobile dropdown in notifications settings ([6353cda](https://github.com/sct/overseerr/commit/6353cda5825f442dd539886c7b9ba437edf27ac4))
- **frontend:** fix scaling titlecard content position ([bd94740](https://github.com/sct/overseerr/commit/bd947409e6e8ff313011b77adc76ccd5f9112c78))
- **frontend:** improve flex header on movie/tv details page ([d7b1c28](https://github.com/sct/overseerr/commit/d7b1c2840690c144ebf29a360defcbd6fdb21354))
- **frontend:** invalid dom-nesting title card fix ([#482](https://github.com/sct/overseerr/issues/482)) ([f2ebba7](https://github.com/sct/overseerr/commit/f2ebba7b1df775d33d2af6abc3ee2c9de5f2e57a)), closes [#476](https://github.com/sct/overseerr/issues/476)
- **frontend:** remove vote permission for now ([5d06a34](https://github.com/sct/overseerr/commit/5d06a347311bd10c05d8f58068ca7104e265dcca))
- **frontend:** sort person detail credits by tmdb votes ([17518db](https://github.com/sct/overseerr/commit/17518dbe7f545100770a892d03d1f8508adc3650))
- **frontend:** status badge Unavailable renamed to Requested ([ed94a0f](https://github.com/sct/overseerr/commit/ed94a0f335c59de526dd812aea7616313fe002fd)), closes [#374](https://github.com/sct/overseerr/issues/374)
- **frontend:** update titlecard status badge to new requested colors ([8f292d5](https://github.com/sct/overseerr/commit/8f292d538b937ea133175089979ef02599f6fef4))
- **logs:** rotate logs on a daily basis instead of incrementing log filename ([395cbb2](https://github.com/sct/overseerr/commit/395cbb2be6c62f1d7573593e49a93615eaf22853))
- improve apple-touch-icon and android app icons ([329a814](https://github.com/sct/overseerr/commit/329a814a8fb791122266c0b04b05848c71d68ba1))

### Features

- **lang:** translations update from Weblate ([#479](https://github.com/sct/overseerr/issues/479)) ([c8c74b0](https://github.com/sct/overseerr/commit/c8c74b0ae54fcc524aa8b2edf5a5c5e5db6c1638))
- **notifications:** add slack notification agent ([1163e81](https://github.com/sct/overseerr/commit/1163e81adc7da1e8334155ebee5b4672a22143db)), closes [#365](https://github.com/sct/overseerr/issues/365)
- add collections ([#484](https://github.com/sct/overseerr/issues/484)) ([a333a09](https://github.com/sct/overseerr/commit/a333a095820ce3f10857026ba4770a2fffeed7cb)), closes [#418](https://github.com/sct/overseerr/issues/418)
- add separate auto approve permissions for Movies/Series ([4809257](https://github.com/sct/overseerr/commit/480925781691de456abc427fbbba161be11a3a8a)), closes [#268](https://github.com/sct/overseerr/issues/268)
- simple failed request handling ([#474](https://github.com/sct/overseerr/issues/474)) ([02969d5](https://github.com/sct/overseerr/commit/02969d5426245062a2f53475d83c4a8639632c9d))
- YouTube Movie/TV Trailers ([#454](https://github.com/sct/overseerr/issues/454)) ([e88dc83](https://github.com/sct/overseerr/commit/e88dc83aeba0475e3ad421d5ab130cea4fc9a806))

# [1.13.0](https://github.com/sct/overseerr/compare/v1.12.1...v1.13.0) (2020-12-23)

### Bug Fixes

- **api:** correctly return firstAirDate for series in search endpoints ([32b4c99](https://github.com/sct/overseerr/commit/32b4c99950659d9e1da2ffa93c22383c54d0d904)), closes [#462](https://github.com/sct/overseerr/issues/462)
- **email:** correctly log errors when emails fail to send ([0980fa5](https://github.com/sct/overseerr/commit/0980fa54f9fc3bdfae6c57fa5a20ce3b2a88a677))
- **frontend:** added new Radarr v3 logo ([#471](https://github.com/sct/overseerr/issues/471)) ([3bbc716](https://github.com/sct/overseerr/commit/3bbc716434dc04bfe6b55de9898eb2c0ecb03baa))
- **frontend:** approve and decline button (in manage panel) will now fit on mobile ([#441](https://github.com/sct/overseerr/issues/441)) ([66ef72d](https://github.com/sct/overseerr/commit/66ef72dd42912d83ea8f86aabb75fbee547f8de9))
- **frontend:** filter out undefined backdrop paths for person details page ([2e0e4d5](https://github.com/sct/overseerr/commit/2e0e4d5129ed4912415f61eb8d1da41e88ddcaff))
- **frontend:** show backdrops instead of posters for new person detail design ([9f5f920](https://github.com/sct/overseerr/commit/9f5f920c23007363aa7f53ebef0b61236d4f53ea))
- clarify full sync runs every 24 hours ([0c8a180](https://github.com/sct/overseerr/commit/0c8a180189b2610bab2fa977d458743d8a60343e))
- **plex-sync:** match correct tmdb format for movies ([4205e32](https://github.com/sct/overseerr/commit/4205e32ae71bc18c07209f1c82e6af1cb5f01335))

### Features

- **email:** option to allow self signed certificates ([6898357](https://github.com/sct/overseerr/commit/6898357b13a6aa53a55709ea95819c2b3df6784c))
- **frontend:** adjust person details design and add improved truncate ([1fb7ea7](https://github.com/sct/overseerr/commit/1fb7ea72589d2908ae80a2a688881d4eb3c050e5))
- **frontend:** first air date added to TV details page ([#470](https://github.com/sct/overseerr/issues/470)) ([a7db01f](https://github.com/sct/overseerr/commit/a7db01fba483ca633a6eb9d39eb085ab9939d4d2))
- **lang:** translations update from Weblate ([#410](https://github.com/sct/overseerr/issues/410)) ([941fe19](https://github.com/sct/overseerr/commit/941fe1990454439cf05b48ef92bd3493432f8ed8))
- **logs:** rotate log files if they reach 20MB in size ([22002ab](https://github.com/sct/overseerr/commit/22002ab4c76aace2bb202ac58da605b7a6f75d6d)), closes [#438](https://github.com/sct/overseerr/issues/438)
- **notifications:** include direct links to media in notifications ([659fa50](https://github.com/sct/overseerr/commit/659fa505f0db32262ad0041cddb4daea893e6d65)), closes [#437](https://github.com/sct/overseerr/issues/437)
- **plex-sync:** add support for hama guid's ([ffe9e19](https://github.com/sct/overseerr/commit/ffe9e19c3b99de6af1185900e292da641ff44320)), closes [#453](https://github.com/sct/overseerr/issues/453)

## [1.12.1](https://github.com/sct/overseerr/compare/v1.12.0...v1.12.1) (2020-12-22)

### Bug Fixes

- **migration:** fixes issue migrating away from the unique imdbId constraint ([69fd7a5](https://github.com/sct/overseerr/commit/69fd7a5511215674a5c22ba48627f221da900229))

# [1.12.0](https://github.com/sct/overseerr/compare/v1.11.0...v1.12.0) (2020-12-22)

### Bug Fixes

- **api:** fix cross-imported type crashing build ([f35dae5](https://github.com/sct/overseerr/commit/f35dae56a583a5545375318fa5be994ae1f2557f))
- **api:** prevent checking first admin account for plex server access ([22006e9](https://github.com/sct/overseerr/commit/22006e9dbde82609440f89bde9a40887b4742682))
- **frontend:** add name, short_name and start_url to manifest ([#424](https://github.com/sct/overseerr/issues/424)) ([c6836e0](https://github.com/sct/overseerr/commit/c6836e02c810e8adb12c3a4b110f9604cf5b7b81))
- **frontend:** adjust person card layout to deal with overflowing content ([4891298](https://github.com/sct/overseerr/commit/48912988915ae40606a900a6f1dd23fc25ed567f)), closes [#416](https://github.com/sct/overseerr/issues/416)
- **frontend:** allow more special characters in search input ([5deb64a](https://github.com/sct/overseerr/commit/5deb64a87fd70e97da27a025ad11fb8ace0e0b57)), closes [#430](https://github.com/sct/overseerr/issues/430)
- **logs:** improve logging when adding to sonarr/radarr ([4b50522](https://github.com/sct/overseerr/commit/4b505223b881a750007e3fbc7d4bcb9677d4d412))
- only run migrations in production ([ab9cef3](https://github.com/sct/overseerr/commit/ab9cef3624b5db1ec03507553a69d33b87857e29))
- **notifications:** always update the media table when seasons become available ([0916b58](https://github.com/sct/overseerr/commit/0916b58594a00db98c6701fdcaee4f3c3e08904e))
- **plex-sync:** fixes processing movies using TMDB agent ([764db94](https://github.com/sct/overseerr/commit/764db94f1bd7866309684d5bd56033b21cbc2e0c)), closes [#363](https://github.com/sct/overseerr/issues/363)

### Features

- **frontend:** add crew related movies/shows to person details page ([12127a7](https://github.com/sct/overseerr/commit/12127a77633f0e92ae88cbafd49581296f559c33))
- **frontend:** add full crew page for movies/shows ([604ba2a](https://github.com/sct/overseerr/commit/604ba2a92f1d59489e7fc6dfc011347f8595c123))
- default user permissions added to settings ([e7ee85c](https://github.com/sct/overseerr/commit/e7ee85c29b5d25c6bff58717eae5e62de4dcef0c)), closes [#388](https://github.com/sct/overseerr/issues/388)
- import users from plex ([#428](https://github.com/sct/overseerr/issues/428)) ([7e8f361](https://github.com/sct/overseerr/commit/7e8f361af711001cfc4dcc06a384b76f9846f90f)), closes [#281](https://github.com/sct/overseerr/issues/281)
- **frontend:** add prioritized crew under overview ([6753d9d](https://github.com/sct/overseerr/commit/6753d9daaafb18672f14fd86f2c1675dcec39b13)), closes [#406](https://github.com/sct/overseerr/issues/406)
- **notifications:** added ability to send test notifications ([44a3054](https://github.com/sct/overseerr/commit/44a305426f3e9829c167a4a73095d0d248641f47)), closes [#309](https://github.com/sct/overseerr/issues/309)

### Reverts

- **deps:** revert react-use-clipboard to 1.0.2 ([7083ddf](https://github.com/sct/overseerr/commit/7083ddf18121716e3442acab3506c395fdc351ac))

# [1.11.0](https://github.com/sct/overseerr/compare/v1.10.0...v1.11.0) (2020-12-20)

### Features

- **frontend:** add language picker to setup/login ([ff2ab29](https://github.com/sct/overseerr/commit/ff2ab29491a80c421525b9a394d6fbbf54914dc2))
- **frontend:** add support overseerr block to about page ([c128898](https://github.com/sct/overseerr/commit/c128898206d6cbb482de4d8dca53f70b87e4911a))
- **frontend:** releases added to about page ([b7f5739](https://github.com/sct/overseerr/commit/b7f573903500cc8a62e39afd787bc1da8c09d88b)), closes [#303](https://github.com/sct/overseerr/issues/303)
- **lang:** add support for Italian, Portuguese (Brazil) and Serbian ([108dfc4](https://github.com/sct/overseerr/commit/108dfc4afd31388cb6c9e07deccd168ade8b1574))
- **lang:** add support for swedish language ([c9fe6cb](https://github.com/sct/overseerr/commit/c9fe6cb0b7ea984d8e4e1cb3f284935c9da7cc2b))
- **lang:** translations update from Weblate ([#400](https://github.com/sct/overseerr/issues/400)) ([1bd0e64](https://github.com/sct/overseerr/commit/1bd0e646e313ddf77ef331e818e03401fbf64a72))
- **lang:** translations update from Weblate ([#403](https://github.com/sct/overseerr/issues/403)) ([3778ad8](https://github.com/sct/overseerr/commit/3778ad829c0897de178212b3bde4c0d3b5089161))

# [1.10.0](https://github.com/sct/overseerr/compare/v1.9.1...v1.10.0) (2020-12-19)

### Bug Fixes

- **email:** fix link to Overseerr in email templates ([816fec1](https://github.com/sct/overseerr/commit/816fec1a83a53edb3b65c3e5e7d0e6e1bd49726d)), closes [#392](https://github.com/sct/overseerr/issues/392)
- **frontend:** adjust padding of search box so placeholder text fits on mobile ([3601d44](https://github.com/sct/overseerr/commit/3601d442db32d3f98f7b050365c11ea8ef9bc4ae)), closes [#393](https://github.com/sct/overseerr/issues/393)
- **frontend:** changed request block for slideover on mobile UI ([#387](https://github.com/sct/overseerr/issues/387)) ([549567a](https://github.com/sct/overseerr/commit/549567a7e9db01933546d9970fc06f17218dfab1))
- **frontend:** hide Request More button if all current seasons are available ([2a4dd52](https://github.com/sct/overseerr/commit/2a4dd52275007e48f946c3b9e29f1d78da57bdaa)), closes [#343](https://github.com/sct/overseerr/issues/343)
- **frontend:** try not to render broken rottentomatoes data ([a0c5608](https://github.com/sct/overseerr/commit/a0c5608aa0b6c7a4294300589efa9a662163ce48))

### Features

- **lang:** translations update from Weblate ([#391](https://github.com/sct/overseerr/issues/391)) ([5f71fb7](https://github.com/sct/overseerr/commit/5f71fb7ee280714275d2ac045c472fcdddd5a2ea))
- add missing tzdata package to image ([53bede6](https://github.com/sct/overseerr/commit/53bede692d4f0e940dededa63015fe1908129914)), closes [#394](https://github.com/sct/overseerr/issues/394)
- **frontend:** add external links to movie and tv detail pages ([a0024a0](https://github.com/sct/overseerr/commit/a0024a0cbe717d78f53413bb78644c829f143c4d))
- **lang:** translations update from Weblate ([#380](https://github.com/sct/overseerr/issues/380)) ([8408e19](https://github.com/sct/overseerr/commit/8408e19568b2f239c57e11e2946c75f193d1c22e))

## [1.9.1](https://github.com/sct/overseerr/compare/v1.9.0...v1.9.1) (2020-12-18)

### Bug Fixes

- change default internal port to 5055 ([#389](https://github.com/sct/overseerr/issues/389)) ([5e5ba40](https://github.com/sct/overseerr/commit/5e5ba4050563f07bff367d2fb31ed7e7fca4291e))

# [1.9.0](https://github.com/sct/overseerr/compare/v1.8.0...v1.9.0) (2020-12-18)

### Features

- api key regeneration ([6beac73](https://github.com/sct/overseerr/commit/6beac736efcf7b9102e02e43b75d91a9a158cd22))
- **api:** add movie keyword search ([f88c4a6](https://github.com/sct/overseerr/commit/f88c4a6d4a49f8f3451ba6c85153677f33b7f5f6))
- **frontend:** add studio/networks to movie/tv details ([4b6ad8a](https://github.com/sct/overseerr/commit/4b6ad8a3871957db4192b603abf38404250cea5d)), closes [#370](https://github.com/sct/overseerr/issues/370)
- **frontend:** added user deletion to the user list ([727fa06](https://github.com/sct/overseerr/commit/727fa06c18febb2a97ca219cc6bf0277ff462acd)), closes [#348](https://github.com/sct/overseerr/issues/348)
- **holiday:** special seasonal slider added to discover :) ([908f635](https://github.com/sct/overseerr/commit/908f63557ca03a1da8b16809ffa2c3acd782d94e))
- allow to listen server on specific host interface ([#381](https://github.com/sct/overseerr/issues/381)) ([086183b](https://github.com/sct/overseerr/commit/086183b5636aa8d075d01fe59492c3eab0d1345b)), closes [#273](https://github.com/sct/overseerr/issues/273)
- anime profile support ([#384](https://github.com/sct/overseerr/issues/384)) ([0972f40](https://github.com/sct/overseerr/commit/0972f40a4e1fb3b5f02b07ae46b997d71aab9bfb)), closes [#266](https://github.com/sct/overseerr/issues/266)

# [1.8.0](https://github.com/sct/overseerr/compare/v1.7.0...v1.8.0) (2020-12-17)

### Features

- **lang:** translations update from Weblate ([#336](https://github.com/sct/overseerr/issues/336)) ([ee84f74](https://github.com/sct/overseerr/commit/ee84f74f8a3558875b41daa539f42d00b949898a))

# [1.7.0](https://github.com/sct/overseerr/compare/v1.6.0...v1.7.0) (2020-12-17)

### Bug Fixes

- **email:** do not pass auth object to transport if no auth data present ([d5eb4d8](https://github.com/sct/overseerr/commit/d5eb4d8d438a159266b2de66b6bcdd9440a0c8ef)), closes [#312](https://github.com/sct/overseerr/issues/312)
- **frontend:** add http/https prefix to hostname fields for plex/radarr/sonarr ([ce0266f](https://github.com/sct/overseerr/commit/ce0266f74ea3979b291ff962271a928682892788)), closes [#357](https://github.com/sct/overseerr/issues/357)
- **frontend:** clarify that radarr/sonnarr servers must be tested before profiles/folders appear ([fc12ab8](https://github.com/sct/overseerr/commit/fc12ab84d9482eb3a11f117f8cab6fd48a9401cd)), closes [#326](https://github.com/sct/overseerr/issues/326) [#328](https://github.com/sct/overseerr/issues/328)
- **frontend:** correctly show an unauthorized error when a user fails to login ([18925de](https://github.com/sct/overseerr/commit/18925decafdac518f52a354c594cc378d2529022)), closes [#322](https://github.com/sct/overseerr/issues/322)
- **frontend:** fix tv shows failing to open when firstAirDate is undefined ([c21fa5b](https://github.com/sct/overseerr/commit/c21fa5b5350abdd8e03c077fde7246fa398e176e)), closes [#347](https://github.com/sct/overseerr/issues/347)
- **frontend:** make minimum availability required for Radarr servers ([2fe53ec](https://github.com/sct/overseerr/commit/2fe53ec5a8534e75c7d0cef31a8b46065111e0a7)), closes [#345](https://github.com/sct/overseerr/issues/345)
- **plex-sync:** bundle duplicate ratingKeys to speed up recently added sync ([67146c3](https://github.com/sct/overseerr/commit/67146c33ef7f28d520ba2c50b32673d43f4525c8)), closes [#360](https://github.com/sct/overseerr/issues/360)
- **sonarr.ts, mediarequest.ts:** add missing seasonFolder option ([#358](https://github.com/sct/overseerr/issues/358)) ([e9c899c](https://github.com/sct/overseerr/commit/e9c899ce419d149dde2ad9a0f7d5a2f2545b3ebf))

### Features

- **frontend:** show alert when there are no default radarr/sonarr servers ([0d088e0](https://github.com/sct/overseerr/commit/0d088e085e68d39455fda21d1fd08ebcaef2c06b)), closes [#344](https://github.com/sct/overseerr/issues/344)

# [1.6.0](https://github.com/sct/overseerr/compare/v1.5.0...v1.6.0) (2020-12-16)

### Bug Fixes

- **api:** accept the api key to perform actions on the api with X-API-Key header ([33f8831](https://github.com/sct/overseerr/commit/33f8831e880dc7fd3f69d951246cada5c6c0ffe7))
- **api:** filter out libraries that do not have any metadata agent or are not movie/show ([01c179f](https://github.com/sct/overseerr/commit/01c179f762e686a1e5a3d4dab3a5bea53425b575))
- **api:** only run recently added sync on enabled libraries ([e08fa35](https://github.com/sct/overseerr/commit/e08fa35548bb8644afa8df3124e6f9cc3a2c8f4a)), closes [#259](https://github.com/sct/overseerr/issues/259)
- **api:** set plex libraries to disabled if the name changes ([675060b](https://github.com/sct/overseerr/commit/675060bcdf23acbfd4de2900a65f95e74f4966a5)), closes [#324](https://github.com/sct/overseerr/issues/324)
- **frontend:** adds a tip to plex setup to clarify that syncing runs in the background ([df4ac83](https://github.com/sct/overseerr/commit/df4ac8361f82971ee845f3be217408a9123a0bf3)), closes [#325](https://github.com/sct/overseerr/issues/325)
- **frontend:** aligned movie and tv details ([#331](https://github.com/sct/overseerr/issues/331)) ([db0a5c4](https://github.com/sct/overseerr/commit/db0a5c44f678e76eee7f5582381016306d1f46a2))
- **frontend:** close sidebar when clicking outside ([#333](https://github.com/sct/overseerr/issues/333)) ([6d7907e](https://github.com/sct/overseerr/commit/6d7907e844a909993d185759d660632f55aeaa35))
- spelling mistake on the word 'requested' fixed ([#319](https://github.com/sct/overseerr/issues/319)) ([961d110](https://github.com/sct/overseerr/commit/961d1107208069a6fc820a1ba97ffda7336677cb))

### Features

- add version to startup logs ([2948f93](https://github.com/sct/overseerr/commit/2948f9360eb484d1d6c0740a840135ca97e7240a))
- **frontend:** temporary logs page to clear up confusion about it 404ing ([d9788c4](https://github.com/sct/overseerr/commit/d9788c4aa9f87e2eda3f7e3f1adc985f16039552)), closes [#272](https://github.com/sct/overseerr/issues/272)
- **lang:** add support for Spanish language ([6cd2049](https://github.com/sct/overseerr/commit/6cd20491d2a0ceb995c4744eeb92a6e2f57a4893))
- **lang:** Translations update from Weblate ([#291](https://github.com/sct/overseerr/issues/291)) ([fddbb3c](https://github.com/sct/overseerr/commit/fddbb3cdfe3d50b2835c248556139c769dc2b805))

# [1.5.0](https://github.com/sct/overseerr/compare/v1.4.0...v1.5.0) (2020-12-15)

### Bug Fixes

- **api:** require package.json directly so typescript doesnt compile it into dist folder ([b9faa64](https://github.com/sct/overseerr/commit/b9faa6486b35aa865019aa8af9d307531054bc1d))
- **frontend:** add validation for Radarr/Sonarr server name ([b5988f9](https://github.com/sct/overseerr/commit/b5988f9a5ff274e97f208c2726abe76c22c858ee))
- **frontend:** only show alpha notice to admins ([ff61895](https://github.com/sct/overseerr/commit/ff618956b5d9cf933d867ea979b612c3d8a6f30b))
- add support for ssl when connecting to plex ([3ba09d0](https://github.com/sct/overseerr/commit/3ba09d07eb0367c41603cd55e7ff41c66fb641c4)), closes [#275](https://github.com/sct/overseerr/issues/275)
- **services:** improve logging for when Radarr movie already exists ([#285](https://github.com/sct/overseerr/issues/285)) ([f998873](https://github.com/sct/overseerr/commit/f998873fc5669a547901f2733c9c785d744d27ca)), closes [#260](https://github.com/sct/overseerr/issues/260)

### Features

- **lang:** add i18n strings for new about page ([900827b](https://github.com/sct/overseerr/commit/900827be97845688e4bea72a8c5d9611a3e9d069))
- about page initial version ([3f2a04c](https://github.com/sct/overseerr/commit/3f2a04c881bf06b73a952181fa463af84454b0dd))

# [1.4.0](https://github.com/sct/overseerr/compare/v1.3.2...v1.4.0) (2020-12-15)

### Bug Fixes

- changing parameter name to use correct 'port' [#276](https://github.com/sct/overseerr/issues/276) ([#277](https://github.com/sct/overseerr/issues/277)) ([6d08b10](https://github.com/sct/overseerr/commit/6d08b108200177ca3068c852e60a0df75ce2232a))
- **services:** include radarr/sonarr baseUrl when adding media ([78af1a3](https://github.com/sct/overseerr/commit/78af1a3e6d00a5645a05e7bf3cf56a59439b6cc9))

### Features

- **lang:** Translations update from Weblate ([#240](https://github.com/sct/overseerr/issues/240)) ([e17c637](https://github.com/sct/overseerr/commit/e17c63748362b6a480693e003ef5eec614dcec43))

## [1.3.2](https://github.com/sct/overseerr/compare/v1.3.1...v1.3.2) (2020-12-14)

### Bug Fixes

- **frontend:** convert plex port to a number before posting to the api ([8cb05c4](https://github.com/sct/overseerr/commit/8cb05c413a15a4b74e37ece5e24367d115995b32))
- **frontend:** converts email smtp port to a number before posting to the api ([2098a2d](https://github.com/sct/overseerr/commit/2098a2d3d2981fd2ae54392aec3ef81327f2858e)), closes [#251](https://github.com/sct/overseerr/issues/251)
- **frontend:** encode special characters in search input to prevent crashing router ([15013d6](https://github.com/sct/overseerr/commit/15013d6c5dbff15704c7c30d261d68a265e7f2d7)), closes [#252](https://github.com/sct/overseerr/issues/252)
- **plex sync:** catch errors that occur during processMovie ([edbbccf](https://github.com/sct/overseerr/commit/edbbccf3ae623430294f1a5c3fd2728dbd42e555)), closes [#244](https://github.com/sct/overseerr/issues/244) [#246](https://github.com/sct/overseerr/issues/246) [#250](https://github.com/sct/overseerr/issues/250)
- **services:** improve logging for adding movies to Radarr ([6c1ee83](https://github.com/sct/overseerr/commit/6c1ee830a183f89bb1fe96a181a7d61684e23b22))
- **services:** radarr/sonarr will use the correct default server ([0658b79](https://github.com/sct/overseerr/commit/0658b7943e1ab25816db9da34d4c9ea808d9203d))

## [1.3.1](https://github.com/sct/overseerr/compare/v1.3.0...v1.3.1) (2020-12-14)

### Bug Fixes

- **frontend:** also convert activeProfileId to a number for radarr/sonarr submissions ([7bf924f](https://github.com/sct/overseerr/commit/7bf924f7e94a0e0834f41b4ec067ed277c652766))
- **frontend:** also convert ports to numbers when saving radarr/sonarr servers ([c53dc3b](https://github.com/sct/overseerr/commit/c53dc3b15da522c6e6ab76bbc9d15008a8a9fb9d))
- **frontend:** new radarr/sonarr ports will be converted to a number before posting ([92c9001](https://github.com/sct/overseerr/commit/92c9001c9d1f2cbd272a5897ea1157d2cadbce2d))

# [1.3.0](https://github.com/sct/overseerr/compare/v1.2.0...v1.3.0) (2020-12-14)

### Bug Fixes

- **api:** correctly generate clientId on first startup ([5f09e83](https://github.com/sct/overseerr/commit/5f09e83ed870336638d3e9d94fcf55ead928e737))

### Features

- **frontend:** add full cast page for movies and series ([051f1b3](https://github.com/sct/overseerr/commit/051f1b3e899bf749e632743e5c8d45a02b621998))
- **lang:** translated using Weblate (Dutch) ([1ab3a4b](https://github.com/sct/overseerr/commit/1ab3a4b80a081d7e4a201f1290cd270ed5b38ac7))
- **lang:** translated using Weblate (English) ([0949c9b](https://github.com/sct/overseerr/commit/0949c9b334b3a4b6c342517a157a9e2b7596f2f0))
- **lang:** translated using Weblate (French) ([f943701](https://github.com/sct/overseerr/commit/f943701e13c7f0de5a711302597858cc898b16e2))
- **lang:** translated using Weblate (French) ([30d04ce](https://github.com/sct/overseerr/commit/30d04ce35adc21070cce37ab10384154afda191b))
- **lang:** translated using Weblate (German) ([7bf9add](https://github.com/sct/overseerr/commit/7bf9addd13a707aac23b64ef3f1733e491d40a4e))
- **lang:** translated using Weblate (German) ([b6e60a4](https://github.com/sct/overseerr/commit/b6e60a412b30907aea751a4cf1ce0cc8230f9814))
- **lang:** translated using Weblate (Japanese) ([08e968f](https://github.com/sct/overseerr/commit/08e968fd0097ec7b2a65de064ed5b07e7c49ef39))
- **lang:** translated using Weblate (Norwegian Bokmål) ([83efb0e](https://github.com/sct/overseerr/commit/83efb0e3d4d96b6a2d2ebdd85d36c9d78c1717b2))
- **lang:** translated using Weblate (Russian) ([0d8e0d0](https://github.com/sct/overseerr/commit/0d8e0d0352f72fdb65ee8f054371eae08c39fe33))

# [1.2.0](https://github.com/sct/overseerr/compare/v1.1.0...v1.2.0) (2020-12-11)

### Bug Fixes

- **frontend:** person cards now show correctly in ListView's ([ccb9855](https://github.com/sct/overseerr/commit/ccb98553f104c1aebd33796b7090cc9bbe964bd7))
- **frontend:** properly remove site overlay when closing modals ([3fa7ff9](https://github.com/sct/overseerr/commit/3fa7ff9858d14d132151f3329164d55d74638f53))
- **frontend:** switch to using Transition component for modals ([b16fbaf](https://github.com/sct/overseerr/commit/b16fbafa1f3d5e105c0a4ba6f1d66aa064019636)), closes [#220](https://github.com/sct/overseerr/issues/220)
- fix missing personid in Discover ([d8060af](https://github.com/sct/overseerr/commit/d8060afe02574337f51b88cab0a0f824976ac721))
- missing personId in ListView component ([6502feb](https://github.com/sct/overseerr/commit/6502feb1a5be3c6daab33230814fe74632c87f7e))
- **frontend:** update overflow issues with seasons + email ([#217](https://github.com/sct/overseerr/issues/217)) ([2d0afb2](https://github.com/sct/overseerr/commit/2d0afb29d37798a626e3f182571ccce43d80063c)), closes [#216](https://github.com/sct/overseerr/issues/216)
- **lang:** fix missing i18n string for agent enabled in email notification page ([42788ad](https://github.com/sct/overseerr/commit/42788adb75f7d23e68327688b1c542dd047e9609))

### Features

- **lang:** update language files ([8cd067b](https://github.com/sct/overseerr/commit/8cd067b6e9df1a3c8f4056789436a31177703986))
- person details page ([d6eb3ae](https://github.com/sct/overseerr/commit/d6eb3ae64ef46bd62145010d3029e272676487c3))
- **lang:** add nb-NO and de language support to app ([d38b28d](https://github.com/sct/overseerr/commit/d38b28d2061b38366989ff412957a5dee5766c6f))
- **lang:** add support for dutch language ([df94db0](https://github.com/sct/overseerr/commit/df94db050bf68a925118e0ce865d27178b702f9e))
- **lang:** add support for russian languge ([8d8e750](https://github.com/sct/overseerr/commit/8d8e7509826514eebc859374d2e1ab212cc442d1))
- **lang:** added translation using Weblate (Russian) ([887f5dd](https://github.com/sct/overseerr/commit/887f5dd487b61676029652d99cbc5b40213aa22e))
- **lang:** translated using Weblate (French) ([30a8934](https://github.com/sct/overseerr/commit/30a8934626fa2d47e95b5925d7e4227a0d0aa728))
- **lang:** translated using Weblate (German) ([44dbb74](https://github.com/sct/overseerr/commit/44dbb745b6216ce19fab4740520785c6414cf367))
- **lang:** translated using Weblate (Japanese) ([a494507](https://github.com/sct/overseerr/commit/a494507dfeafb0cfd2bd66fb01138522e0e80737))
- **lang:** translated using Weblate (Russian) ([86cadb8](https://github.com/sct/overseerr/commit/86cadb8283fcab8745b4c09f8429fd9e46708813))
- **lang:** translations update from Weblate ([#201](https://github.com/sct/overseerr/issues/201)) ([b0c663b](https://github.com/sct/overseerr/commit/b0c663baccd994e234b4d41d86486c3af4906344))

# [1.1.0](https://github.com/sct/overseerr/compare/v1.0.0...v1.1.0) (2020-12-08)

### Bug Fixes

- fix a few misc unused imports and useless assignments/conditionals ([8e6daf7](https://github.com/sct/overseerr/commit/8e6daf7bd271ce5bebf4a00f5bb1144bd6b60aa5))
- **frontend:** dont show delete button in request list for users without correct permission ([83fde46](https://github.com/sct/overseerr/commit/83fde46a59c6f1910806a6106b5526b8adbc386c))
- **frontend:** push updated i18n locale files ([b4002d7](https://github.com/sct/overseerr/commit/b4002d71323a04e7991198cedc263660e872df8d))

### Features

- generate real api key ([a839370](https://github.com/sct/overseerr/commit/a8393707fec85a9262af5ba8c03d205190b2235b))
- **frontend:** add i18n strings for request list and request item ([6c4022f](https://github.com/sct/overseerr/commit/6c4022fb236583ad20d4c4c6693c1339e165b4af))
- **frontend:** initial version of the requests page (no filtering/sorting) ([1ba027b](https://github.com/sct/overseerr/commit/1ba027b4357e078c3f177d9d07208049f0c1ce65))
- **frontend:** only load request/tmdb cards when in the browser view ([2d51efd](https://github.com/sct/overseerr/commit/2d51efd71612ec969b83c62d6aa0dac6df9391a3))

# 1.0.0 (2020-12-06)

### Bug Fixes

- **api:** fix scheduling for plex full sync (maybe) ([7287a6a](https://github.com/sct/overseerr/commit/7287a6a95703b23acc0c4f6eb3beb9ec2295e33f))
- **frontend:** always show request modal option for tv ([2b46268](https://github.com/sct/overseerr/commit/2b462688243531b4be620a942f59defd4e0534d0))
- **frontend:** canceled movie request should set parent movie status back to unknown ([#198](https://github.com/sct/overseerr/issues/198)) ([139871f](https://github.com/sct/overseerr/commit/139871f218812a15f742aa66408db12704e0b9b5))
- **frontend:** close request modals when complete ([85ae499](https://github.com/sct/overseerr/commit/85ae4998f0ba8d4869b9b244f2c440b9df1310d2))
- **frontend:** dont show runtime if there is no runtime data ([e0c39ae](https://github.com/sct/overseerr/commit/e0c39aeca119b822f2a54ff05a97f91780ddd052))
- **frontend:** fix missing data for request modal title i18n ([a56fd16](https://github.com/sct/overseerr/commit/a56fd16ab6638d4649fe9f8b9d75e7cae7742f73))
- **frontend:** fix missing import for ReactNode type in Slider ([b26a234](https://github.com/sct/overseerr/commit/b26a2347e7b0f7ff8720a204d9faefd501ba886c))
- **frontend:** fix modal design and rename some text for adding servers ([46d99b0](https://github.com/sct/overseerr/commit/46d99b02b1c992c7b8dde2150217ed9ce326b7a5))
- **frontend:** fix opening popups on safari ([364d9d1](https://github.com/sct/overseerr/commit/364d9d105ca3690fcd5f635485d7c025353bb9f1))
- **frontend:** fix request card placeholder sizes for mobile ([ef62c67](https://github.com/sct/overseerr/commit/ef62c67480ed52d753ea6db8205f035b2e9da272))
- **frontend:** show a badge on requestcard for partially available status ([59056c4](https://github.com/sct/overseerr/commit/59056c44f942a37df536ff947b5faccc27f32246))
- dont cross import SyncStatus type ([e032e38](https://github.com/sct/overseerr/commit/e032e385a5253d215490255c676f42ee48f39428))
- fix type import from server side crashing build process ([89be56d](https://github.com/sct/overseerr/commit/89be56d8403ebc60c411e7cb357593edd9c79bb2))
- **frontend:** fix title detail background image to be centered ([b92f64f](https://github.com/sct/overseerr/commit/b92f64fa6e167bc89168d8f5c0f2eb12efa0b6f0))
- **frontend:** fixed similar/recommendations showing when empty ([#180](https://github.com/sct/overseerr/issues/180)) ([a3ca9b4](https://github.com/sct/overseerr/commit/a3ca9b40c552e6cc5effc2f57f7562ff6f723e42))
- **frontend:** have tvDetail use the new RequestModal ([6aca826](https://github.com/sct/overseerr/commit/6aca82607b97d4a4ad74e2ea843d52fba4689e6a))
- **frontend:** reinitalize plex form after data loads ([97e3036](https://github.com/sct/overseerr/commit/97e30367fb5d2d27efc42c1d76b0d051b6f1da76))
- **frontend:** remove requestId from tilecard request modal component ([61b6152](https://github.com/sct/overseerr/commit/61b6152e8915c99585b944756a61d33b8c8a0307))
- **frontend:** run initial props for children components after getting the user ([fdf9f38](https://github.com/sct/overseerr/commit/fdf9f38776b6d4c08b3505c03b354639cebb011f))
- **frontend:** when there were no results in the list view, it would call fetch more infinitely ([c0ce87b](https://github.com/sct/overseerr/commit/c0ce87b6f65bf0ab1301c7ca61090d779709529f))
- fixed an issue with eslint-prettier on windows ([#32](https://github.com/sct/overseerr/issues/32)) ([b673ea1](https://github.com/sct/overseerr/commit/b673ea1b18ca0f432996bb9e4e5d148af0247170))
- fixes next.js build to not include server files ([de8ee9b](https://github.com/sct/overseerr/commit/de8ee9ba85e0160b0b472cab44f92c01796efec8))

### Features

- add migration for delete cascades on season requests/seasons ([c688cf6](https://github.com/sct/overseerr/commit/c688cf60c710f0cf0b2da5ba6b0c18a2d137e7f9))
- **api:** email notification agent ([0962392](https://github.com/sct/overseerr/commit/0962392e3930c7fdcb3164b9143cc8faca38bdfa))
- **frontend:** add french language file ([cd6d8a8](https://github.com/sct/overseerr/commit/cd6d8a8216e7ae183b046d26cd22f3c1dc1d2b35))
- **frontend:** add translatable strings for request card ([0d2f360](https://github.com/sct/overseerr/commit/0d2f360c22cd9bb50ae04f00a25e5fcc6c21bcdd))
- **frontend:** added more localized strings ([659a601](https://github.com/sct/overseerr/commit/659a6018777718f7a90141307678d8dadcfd77f8))
- actually include email templates in built server files ([a28a8b3](https://github.com/sct/overseerr/commit/a28a8b37b0afc79583e4a7191a91f73ff6d3adad))
- add application url config to main settings ui ([a359672](https://github.com/sct/overseerr/commit/a359672ebafffef742858814f0faa918e0341aa3))
- add filtering for requests api ([cb9ae25](https://github.com/sct/overseerr/commit/cb9ae25d94f21e97113dfea3ca45c7002089e344))
- add trending to discover page ([ff8b9d8](https://github.com/sct/overseerr/commit/ff8b9d8e7ed228a153c2da4d237f7a4f99a79321))
- force setup if app is not initialized ([a99705f](https://github.com/sct/overseerr/commit/a99705f6a5674b436ae28cbc558f4ee6e99ac910))
- initial user list (no edit/delete yet) and job schedules ([24a0423](https://github.com/sct/overseerr/commit/24a0423f3b14303cfb0e83aef6e9e3bb273c5ba9))
- manage series slideover added (and approve/decline/delete hooked up) ([236c4e5](https://github.com/sct/overseerr/commit/236c4e5e6126d2424a4badc08b7f7e6d1d70f401))
- media delete option in manage media slideover ([250f484](https://github.com/sct/overseerr/commit/250f48492c95d74e40d95d3f026d2952157bc6e1))
- other email notifications for approved/available ([0d73d88](https://github.com/sct/overseerr/commit/0d73d88f35b03e993f305873dc72672003c7d9e5))
- radarr edit/create modal/backend functionality ([c4ac357](https://github.com/sct/overseerr/commit/c4ac357ef4cdd7a2c610260db46a4f0c325cd785))
- season creation migration ([978f92a](https://github.com/sct/overseerr/commit/978f92a1c589ac404a3cb1103a68a8a5ffb0dd7d))
- sonarr edit/delete modal ([3204326](https://github.com/sct/overseerr/commit/320432657e6ccf4d255238098e03590f28267bdb))
- throw 404 when movie/tv show doesnt exist ([0601b44](https://github.com/sct/overseerr/commit/0601b446873e2eaf042044dd6a995b713586b0cc))
- **api:** sonarr api wrapper / send to sonarr ([9385592](https://github.com/sct/overseerr/commit/9385592362eeba1dba05c5aa8fc7a2de1d054d74))
- **frontend:** add header styling to movie/tv recommendation and similar list views ([f5f2545](https://github.com/sct/overseerr/commit/f5f2545520a43daa23e1276d24ff60d794ebbc6e))
- **frontend:** add links to detail pages from new request card ([6ad3384](https://github.com/sct/overseerr/commit/6ad3384a78f7bcb03f409cce8b35cc61d634d6b2))
- **frontend:** new design for request card ([93738e1](https://github.com/sct/overseerr/commit/93738e154c41fd11d5c6cf3d35573daf54ead471))
- **frontend:** update favicon ([886389a](https://github.com/sct/overseerr/commit/886389a361da54c616da3bdfeee9a85e9d12bcf3))
- notification framework ([d8e542e](https://github.com/sct/overseerr/commit/d8e542e5fe2ed76dcb20fb6dfc5f59430cd4245d))
- notifications for media_available and media_approved ([a6c5e65](https://github.com/sct/overseerr/commit/a6c5e65bbfc196545471e99fe2e5b7194f9dd387))
- rotten tomatoes scores on movie/tv details pages ([1694f60](https://github.com/sct/overseerr/commit/1694f60e8aa475ceeb7f170a783ec0ba70bd4bce))
- upcoming movies on discover ([67290dd](https://github.com/sct/overseerr/commit/67290dd502571a22dcf8559ac07f42e855275bd0))
- upcoming/trending list views and larger title cards ([94eaaf9](https://github.com/sct/overseerr/commit/94eaaf96b4302a832c52ccb72009b3593452c779))
- upgrade tailwindcss to 2.0.1 ([fb5c791](https://github.com/sct/overseerr/commit/fb5c791b0b6b7593a472bf01713999a001f92dc7))
- user edit functionality (managing permissions) ([185ac26](https://github.com/sct/overseerr/commit/185ac2648fd21c4bf9692ac5ac055e9c740065ca))
- **api:** plex tv sync and recently added sync ([1390cc1](https://github.com/sct/overseerr/commit/1390cc1f130bb3975996e84b12ac833f55f2f753))
- **frontend:** allow permission check for showing nav items ([0b239f0](https://github.com/sct/overseerr/commit/0b239f0bdfb1394897bce5c50b0d112abfbb4ad7))
- **frontend:** alpha notice ([33da7e9](https://github.com/sct/overseerr/commit/33da7e9df3a2546b0f208bd3b1d1f268e343cead))
- **frontend:** buttonWithDropdown component added (no hookups yet) ([4975841](https://github.com/sct/overseerr/commit/4975841b5d4ba4ed1ba8cacaa5a063eeb3b8c311))
- **frontend:** cancel movie request modal ([1f9cbbf](https://github.com/sct/overseerr/commit/1f9cbbfdf1ac98e54de5b8777c52c7bfc69c7e20))
- **frontend:** improved settings menu design for mobile ([16221a4](https://github.com/sct/overseerr/commit/16221a46a7d57c77f53aa0186263aa27267d9863))
- **frontend:** initial Settings design ([8742da0](https://github.com/sct/overseerr/commit/8742da0ebb92d2f78309a998de0f67e788e14376))
- **frontend:** plex library scan ([1bc3f7b](https://github.com/sct/overseerr/commit/1bc3f7be4b07211563a1e254c28ce51e1bc337a2))
- **frontend:** plex settings page ([47714b6](https://github.com/sct/overseerr/commit/47714b698cf4351c1ee38bdf0b672d9f0baed03a))
- **frontend:** radarr delete modal ([877a518](https://github.com/sct/overseerr/commit/877a5184158fb4aa371fa2ea2107032543c9aa37))
- **frontend:** recently added on discover ([06dc606](https://github.com/sct/overseerr/commit/06dc606bcfeb50b7be1c35ac180c10738bade458))
- **frontend:** slideover initial work ([14b9cb6](https://github.com/sct/overseerr/commit/14b9cb610c0dcfef939ebec328f371e1cdfb689d))
- tv request modal status hookup ([5f8114f](https://github.com/sct/overseerr/commit/5f8114f730b067eb710704952824057e7b5b8fbf))
- **.editorconfig:** add .editorconfig ([b982066](https://github.com/sct/overseerr/commit/b982066327525156f8dd0d32818d3fe7cb28f9c8))
- **api:** add external ids to movie/tv response ([4aa7431](https://github.com/sct/overseerr/commit/4aa74319e0adcc19041239e57a00bc40fb127826))
- **api:** add movie details endpoint ([b176148](https://github.com/sct/overseerr/commit/b1761484cb2861329763d51a868f37dd3098760d))
- **api:** add tmdb discover api wrapper ([#67](https://github.com/sct/overseerr/issues/67)) ([839448f](https://github.com/sct/overseerr/commit/839448fcc8cc14ea83092af82e2ba3d0d92c9b73))
- **api:** allow plex logins from users who have access to the server ([5147140](https://github.com/sct/overseerr/commit/514714071dfe4be04e607fe6412f5b3f0ef74dd4))
- **api:** decouple media requests from media info ([8577db1](https://github.com/sct/overseerr/commit/8577db1be16f099d92c6649bbfb15f15e09a2f73))
- **api:** discover endpoint for movie/tv ([#73](https://github.com/sct/overseerr/issues/73)) ([258bb93](https://github.com/sct/overseerr/commit/258bb93be2acc2ca32eaaefb617a5c326c5943ba))
- **api:** initial implementation of the auth system ([#30](https://github.com/sct/overseerr/issues/30)) ([5343f35](https://github.com/sct/overseerr/commit/5343f35e5b572fe366a8712b24bd735de30e6170))
- **api:** plex Sync (Movies) ([1be8b18](https://github.com/sct/overseerr/commit/1be8b183617c3a44ab8d4454a64b43dfe1d877fe))
- **api:** public settings route ([#57](https://github.com/sct/overseerr/issues/57)) ([c0166e7](https://github.com/sct/overseerr/commit/c0166e7ecb5df110a4167f33338ed6406bf47f41))
- **api:** radarr api wrapper / send to radarr when requests approved ([#93](https://github.com/sct/overseerr/issues/93)) ([48d62c3](https://github.com/sct/overseerr/commit/48d62c3178488d0d51831155ddd35cc31867db2b))
- **api:** request api ([#80](https://github.com/sct/overseerr/issues/80)) ([f4c2c47](https://github.com/sct/overseerr/commit/f4c2c47e569e7faea7f99664966cb98b321ce952))
- **api:** tmdb api wrapper / multi search route ([#62](https://github.com/sct/overseerr/issues/62)) ([c702c17](https://github.com/sct/overseerr/commit/c702c17cee00a52b23f685206e2d5d0c2eddf5a2))
- **api:** tmdb trending api wrapper ([#68](https://github.com/sct/overseerr/issues/68)) ([ba34e54](https://github.com/sct/overseerr/commit/ba34e54d77d142d211df58d6ce9f53b6e673e004))
- **api:** tv details endpoint ([a3beeed](https://github.com/sct/overseerr/commit/a3beeede7e72e99c7595673a27e38611ca4bb0cd))
- **api:** validate plex when settings are saved ([8f6247d](https://github.com/sct/overseerr/commit/8f6247d82160704a3cfb76262696957b27641e87))
- **api-user:** add basic User Entity and basic routing to fetch all users ([d902ef7](https://github.com/sct/overseerr/commit/d902ef72770712f2f71f33c09bca9ba99a30fc64))
- **components/plexloginbutton:** added PlexLoginButton ([0abf743](https://github.com/sct/overseerr/commit/0abf743b17c664b58da18bdbf176f4a55ddc4179))
- **extensions.json:** added recommended extensions for VSCode ([5dc9b51](https://github.com/sct/overseerr/commit/5dc9b510b8049516ad889c9d76a2f84daa0d2718))
- **frontend:** add cancel request modal for titlecards ([f22f8c5](https://github.com/sct/overseerr/commit/f22f8c5d734be5cc0b1dcca869458a7321cd43a2))
- **frontend:** approve/decline request well added to movie detail ([8f21358](https://github.com/sct/overseerr/commit/8f21358f797ed55923d90ba43acf1126856e9dfd))
- **frontend:** basic discover page (only movies) ([#74](https://github.com/sct/overseerr/issues/74)) ([bbfe349](https://github.com/sct/overseerr/commit/bbfe349b52d308620796b37aaf986a0ed1ff0006))
- **frontend:** design updates for responsive titlecards ([31809d9](https://github.com/sct/overseerr/commit/31809d952c8bafde3f63e2c1d952cc013149940e))
- **frontend:** discover tv/movies full page ([be0003a](https://github.com/sct/overseerr/commit/be0003a85dc4e91799e85019aeb1110bd524a026))
- **frontend:** initial search functionality ([#78](https://github.com/sct/overseerr/issues/78)) ([342d1a3](https://github.com/sct/overseerr/commit/342d1a3c75b32b172a51ca7d82fdfde8510abedf))
- **frontend:** loading spinner ([de84658](https://github.com/sct/overseerr/commit/de84658b48985e24b0f92a1690387f6d59d0bc16))
- **frontend:** logo updates ([5a43ec5](https://github.com/sct/overseerr/commit/5a43ec5405855deb244e8085484a9d2b743caba6))
- **frontend:** modal component and basic request hookup ([#91](https://github.com/sct/overseerr/issues/91)) ([626099a](https://github.com/sct/overseerr/commit/626099a2c98fb30d0cb53d8ccf79a6bf75a00059))
- **frontend:** new dashboard concept ([#82](https://github.com/sct/overseerr/issues/82)) ([eae38bb](https://github.com/sct/overseerr/commit/eae38bb9ec8588856f319387d2f262d7ee3f7e9c))
- **frontend:** refresh indicator for titlecards / toasts ([4638fae](https://github.com/sct/overseerr/commit/4638fae336edc62a539796b3f55277a238683603))
- **frontend:** request card / recent requests ([371e433](https://github.com/sct/overseerr/commit/371e43356d2c057e52368c32ffe2af1744311d91))
- **frontend:** title detail (movie) initial version ([73ce24a](https://github.com/sct/overseerr/commit/73ce24a37bda3713e8cedc44e1ed065bdbc4ee4f))
- **frontend/api:** beginning of new request modal ([2bf7e10](https://github.com/sct/overseerr/commit/2bf7e10e32718b36799be2feb0a7f9ff54d85744))
- **frontend/api:** cast included with movie request and cast list on detail page ([04252f8](https://github.com/sct/overseerr/commit/04252f88bbdf51949923586feda582f86ac668ce))
- **frontend/api:** i18n support ([9131254](https://github.com/sct/overseerr/commit/9131254f3371f12a17de44b6fa8f9bfb0e5c002e))
- **frontend/api:** movie recommendations/similar request and frontend detail page update ([6398e36](https://github.com/sct/overseerr/commit/6398e3645a1e4ddbb9de9f4fda0a0659b4cac4d0))
- **frontend/api:** tv details page ([02cbb5b](https://github.com/sct/overseerr/commit/02cbb5b030a3af5d62ab6c4cafdd4d800b4f61f4))
- **frontend/api:** tv request modal (no status. only request) ([608b966](https://github.com/sct/overseerr/commit/608b96600a926adf16331b36e77789afa5d67069))
- logout route/sign out button ([#54](https://github.com/sct/overseerr/issues/54)) ([cb9098f](https://github.com/sct/overseerr/commit/cb9098f457f79b71734959fd924b6c72ca77d61d))
- user avatars from plex ([#53](https://github.com/sct/overseerr/issues/53)) ([e6349c1](https://github.com/sct/overseerr/commit/e6349c13a0eb0489289aa7663fcc64fa7d2906e6))
- **layout:** created Layout component ([1f497e8](https://github.com/sct/overseerr/commit/1f497e8913146ceb9748d667e638141b2ca4612a))
- **login component/route:** add: Login Component and Route ([6e47be2](https://github.com/sct/overseerr/commit/6e47be2fa865bcd51582ce30ebee6fd820c5f9dd))
- **login route conditional:** on login route, do not display layout ([7d179ae](https://github.com/sct/overseerr/commit/7d179ae3b42d8ffae5e1b6e266038793260f1bbe))
- **pass pageprops to loginpage:** pass page props to loginPage ([1597188](https://github.com/sct/overseerr/commit/159718891fb363001c650ac8b7e1446a1520ce4a))
- **plex/utils:** added Plex OAuth class ([72f9624](https://github.com/sct/overseerr/commit/72f9624f1db721fe0324b7be9f0f811d2ae02389))
- bootstrap the basic app structure ([89a6017](https://github.com/sct/overseerr/commit/89a6017c7f6f7637fe249ac0d667a652f44e02bb))
