# Docker build arguments
ARG NODEJS_VERSION=20

# Build image
FROM node:${NODEJS_VERSION}-alpine AS BUILD_IMAGE

ARG SOURCE_DIR=/app
WORKDIR ${SOURCE_DIR}

ARG TARGETPLATFORM
ENV TARGETPLATFORM=${TARGETPLATFORM:-linux/amd64}

ENV LANG='en_US.UTF-8' \
    LC_ALL='en_US.UTF-8' \
    LANGUAGE='en_US:en'

# Install OS dependencies
RUN case "${TARGETPLATFORM}" in \
    'linux/arm64' | 'linux/arm/v7') \
    apk update \
 && apk add --no-cache \
    python3 \
    make \
    g++ \
    gcc \
    libc6-compat \
    bash \
 && npm install --global node-gyp \
    ;; \
    esac

# Install npm dependencies
RUN npm install --global pnpm

COPY package.json pnpm-lock.yaml ./
RUN CYPRESS_INSTALL_BINARY=0 pnpm install --frozen-lockfile

COPY . ./

# Git commit tag
ARG COMMIT_TAG
ENV COMMIT_TAG=${COMMIT_TAG}

RUN pnpm build

# Remove development dependencies
RUN pnpm prune --prod --ignore-scripts

RUN rm -rf src server .next/cache

RUN touch config/DOCKER

RUN echo "{\"commitTag\": \"${COMMIT_TAG}\"}" > committag.json

# Runtime image
FROM node:${NODEJS_VERSION}-alpine AS RUNTIME_IMAGE

# Metadata for Github Package Registry
LABEL org.opencontainers.image.source="https://github.com/Fallenbagel/jellyseerr"

WORKDIR ${SOURCE_DIR}

# Add other dependencies and clean-up
RUN apk add --no-cache \
    tzdata \
    tini \
 && apk cache clean \
 && rm -rf /tmp/* /var/cache/apk/*

# Copy from build image
COPY --from=BUILD_IMAGE ${SOURCE_DIR} ./

# opencontainers.image labels
LABEL "org.opencontainers.image.source"="https://github.com/Fallenbagel/jellyseerr"
LABEL "org.opencontainers.image.title"="Jellyseerr"
LABEL "org.opencontainers.image.description"="Fork of Overseerr for Jellyfin support"

EXPOSE 5055
ENTRYPOINT [ "/sbin/tini", "--" ]
CMD [ "pnpm", "start" ]
