FROM node:16.14-alpine AS BUILD_IMAGE

ARG TARGETPLATFORM
ENV TARGETPLATFORM=${TARGETPLATFORM:-linux/amd64}

RUN \
  case "${TARGETPLATFORM}" in \
    'linux/arm64' | 'linux/arm/v7') \
      apk add --no-cache python3 make g++ && \
      ln -s /usr/bin/python3 /usr/bin/python \
      ;; \
  esac

ARG COMMIT_TAG
ENV COMMIT_TAG=${COMMIT_TAG}

COPY . /app
WORKDIR /app

RUN yarn --frozen-lockfile --network-timeout 1000000 && \
  yarn build

# remove development dependencies
RUN yarn install --production --ignore-scripts --prefer-offline

RUN rm -rf src && \
  rm -rf server

RUN touch config/DOCKER

RUN echo "{\"commitTag\": \"${COMMIT_TAG}\"}" > committag.json


FROM node:14.15-alpine

RUN apk add --no-cache tzdata

# copy from build image
COPY --from=BUILD_IMAGE /app /app
WORKDIR /app

CMD yarn start

EXPOSE 5055
