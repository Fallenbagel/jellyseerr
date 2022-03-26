-- CreateTable
CREATE TABLE "media" (
    "id" SERIAL NOT NULL,
    "mediaType" TEXT NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "tvdbId" INTEGER,
    "imdbId" TEXT,
    "status" INTEGER NOT NULL DEFAULT 1,
    "status4k" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeasonChange" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mediaAddedAt" TIMESTAMP(3),
    "serviceId" INTEGER,
    "serviceId4k" INTEGER,
    "externalServiceId" INTEGER,
    "externalServiceId4k" INTEGER,
    "externalServiceSlug" TEXT,
    "externalServiceSlug4k" TEXT,
    "ratingKey" TEXT,
    "ratingKey4k" TEXT,
    "jellyfinMediaId" TEXT,
    "jellyfinMediaId4k" TEXT,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_request" (
    "id" SERIAL NOT NULL,
    "status" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "mediaId" INTEGER,
    "requestedById" INTEGER,
    "modifiedById" INTEGER,
    "is4k" BOOLEAN NOT NULL DEFAULT false,
    "serverId" INTEGER,
    "profileId" INTEGER,
    "rootFolder" TEXT,
    "languageProfileId" INTEGER,

    CONSTRAINT "media_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "migrations" (
    "id" SERIAL NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "migrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "season" (
    "id" SERIAL NOT NULL,
    "seasonNumber" INTEGER NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mediaId" INTEGER,
    "status4k" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "season_request" (
    "id" SERIAL NOT NULL,
    "seasonNumber" INTEGER NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestId" INTEGER,

    CONSTRAINT "season_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "expiredAt" BIGINT NOT NULL,
    "id" TEXT NOT NULL,
    "json" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "plexId" INTEGER,
    "plexToken" TEXT,
    "permissions" INTEGER NOT NULL DEFAULT 0,
    "avatar" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "password" TEXT,
    "userType" INTEGER NOT NULL DEFAULT 1,
    "plexUsername" TEXT,
    "resetPasswordGuid" TEXT,
    "recoveryLinkExpirationDate" TIMESTAMP(3),
    "jellyfinUsername" TEXT,
    "jellyfinAuthToken" TEXT,
    "jellyfinUserId" TEXT,
    "jellyfinDeviceId" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_settings" (
    "id" SERIAL NOT NULL,
    "enableNotifications" BOOLEAN NOT NULL DEFAULT true,
    "discordId" TEXT,
    "userId" INTEGER,
    "region" TEXT,
    "originalLanguage" TEXT,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sqlite_autoindex_media_1" ON "media"("tvdbId");

-- CreateIndex
CREATE INDEX "IDX_7ff2d11f6a83cb52386eaebe74" ON "media"("imdbId");

-- CreateIndex
CREATE INDEX "IDX_41a289eb1fa489c1bc6f38d9c3" ON "media"("tvdbId");

-- CreateIndex
CREATE INDEX "IDX_7157aad07c73f6a6ae3bbd5ef5" ON "media"("tmdbId");

-- CreateIndex
CREATE INDEX "IDX_28c5d1d16da7908c97c9bc2f74" ON "session"("expiredAt");

-- CreateIndex
CREATE UNIQUE INDEX "sqlite_autoindex_user_1" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sqlite_autoindex_user_settings_1" ON "user_settings"("userId");

-- AddForeignKey
ALTER TABLE "media_request" ADD CONSTRAINT "media_request_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "media_request" ADD CONSTRAINT "media_request_modifiedById_fkey" FOREIGN KEY ("modifiedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "media_request" ADD CONSTRAINT "media_request_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "season" ADD CONSTRAINT "season_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "season_request" ADD CONSTRAINT "season_request_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "media_request"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
