# Build image
FROM node:20-alpine AS BUILD_IMAGE

WORKDIR /app

ARG TARGETPLATFORM
ENV TARGETPLATFORM=${TARGETPLATFORM:-linux/amd64}

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
FROM node:20-alpine AS RUNTIME_IMAGE

# Metadata for Github Package Registry
LABEL org.opencontainers.image.source="https://github.com/Fallenbagel/jellyseerr"
LABEL org.opencontainers.image.title="Jellyseerr"
LABEL org.opencontainers.image.description="Fork of Overseerr for Jellyfin support"

WORKDIR /app

# Add other dependencies and clean-up
RUN apk add --no-cache \
    tzdata \
    tini \
 && apk cache clean \
 && rm -rf /tmp/* /var/cache/apk/*

# Copy from build image
COPY --from=BUILD_IMAGE /app ./

EXPOSE 5055
ENTRYPOINT [ "/sbin/tini", "--" ]
CMD [ "pnpm", "start" ]
