<p align="center">
<img src="./public/logo_full.svg" alt="Jellyseerr" style="margin: 20px 0;">
</p>
<p align="center">
<a href="https://discord.gg/ckbvBtDJgC"><img src="https://img.shields.io/badge/Discord-Chat-lightgrey" alt="Discord"></a>
<a href="https://hub.docker.com/r/fallenbagel/jellyseerr"><img src="https://img.shields.io/docker/pulls/fallenbagel/jellyseerr" alt="Docker pulls"></a>
<a href="https://github.com/fallenbagel/jellyseerr/blob/develop/LICENSE"><img alt="GitHub" src="https://img.shields.io/github/license/fallenbagel/jellyseerr"></a>

**Jellyseerr** is a free and open source software application for managing requests for your media library. It is a a fork of Overseerr built to bring support for Jellyfin & Emby media servers!

_The original Overseerr team have been busy and Jellyfin/Emby support aren't on their roadmap, so we started this project as we wanted to bring the Overseerr experience to the Jellyfin/Emby Community!_

## Current Features

- Full Jellyfin/Emby/Plex integration. Authenticate and manage user access with Jellyfin/Emby/Plex!
- Supports Movies, Shows, Mixed Libraries!
- Ability to change email addresses for smtp purposes
- Ability to import all jellyfin/emby users
- Easy integration with your existing services. Currently, Jellyseerr supports Sonarr and Radarr. More to come!
- Jellyfin/Emby/Plex library scan, to keep track of the titles which are already available.
- Customizable request system, which allows users to request individual seasons or movies in a friendly, easy-to-use interface.
- Incredibly simple request management UI. Don't dig through the app to simply approve recent requests!
- Granular permission system.
- Support for various notification agents.
- Mobile-friendly design, for when you need to approve requests on the go!

  (Upcoming Features include: Multiple Server Instances, Music Support, and much more!)

With more features on the way! Check out our [issue tracker](https://github.com/fallenbagel/jellyseerr/issues) to see the features which have already been requested.

## Getting Started

#### Pre-requisite (Important)

_*On Jellyfin/Emby, ensure the `settings > Home > Automatically group content from the following folders into views such as 'Movies', 'Music' and 'TV'` is turned off*_

### Launching Jellyseerr using Docker

Check out our dockerhub for instructions on how to install and run Jellyseerr:
https://hub.docker.com/r/fallenbagel/jellyseerr

### Launching Jellyseerr manually:

#### Windows

Pre-requisites:

- Nodejs (atleast LTS version)
- Yarn
- Download the source code from the github (Either develop branch or main for stable)

```bash
npm i -g win-node-env
yarn install
yarn run build
yarn start
```

#### Linux

Pre-requisites:

Package Manager:
- Git
- npm

npm:
- Nodejs (atleast LTS version)
- Yarn
  
```bash
npm install -g node yarn
```
```-g flag required for global install of packages```

Installation:

```bash
cd /opt #recommended folder for installation
git clone https://github.com/Fallenbagel/jellyseerr.git && cd jellyseerr
git checkout main #if you want to run stable instead of develop
yarn install
yarn run build
yarn start
```

Systemd Service:

Assuming:
- Jellyseerr was cloned to `/opt/`
- The environmentfile is located at `/etc/jellyseerr/jellyseerr.conf`
- node was installed with npm using `-g` flag

Lookup path for the node binary with `which node` it should return something like this: `/usr/bin/node`

Create new file at ```/etc/systemd/system/jellyseerr.service``` with the following text:

```
[Unit]
Description=Jellyseerr Service
Wants=network-online.target
After=network-online.target

[Service]
EnvironmentFile=/etc/jellyseerr/jellyseerr.conf
Environment=NODE_ENV=production
Type=exec
Restart=on-failure
WorkingDirectory=/opt/jellyseerr
ExecStart=/usr/bin/node dist/index.js

[Install]
WantedBy=multi-user.target
```

The node path in `ExecStart` needs to be changed to what you got from `which node`

Example:
`ExecStart=/usr/bin/node dist/index.js` or `ExecStart=/usr/local/bin/node dist/index.js`

`dist/index.js` is required.

Environmentfile:

```
# Jellyseerr's default port is 5055, if you want to use both, change this.
# specify on which port to listen
PORT=5055

# specify on which interface to listen, by default jellyseerr listens on all interfaces
#HOST=127.0.0.1

# Uncomment if your media server is emby instead of jellyfin.
# JELLYFIN_TYPE=emby
```

### Packages:

Archlinux: [AUR](https://aur.archlinux.org/packages/jellyseerr)

## Preview

<img src="./public/preview.jpg">

## Support

- You can get support on [Discord](https://discord.gg/ckbvBtDJgC).
- You can ask questions in the Help category of our [GitHub Discussions](https://github.com/fallenbagel/jellyseerr/discussions).
- Bug reports and feature requests can be submitted via [GitHub Issues](https://github.com/fallenbagel/jellyseerr/issues).

## API Documentation

You can access the API documentation from your local Jellyseerr install at http://localhost:5055/api-docs

## Community

You can ask questions, share ideas, and more in [GitHub Discussions](https://github.com/fallenbagel/jellyseerr/discussions).

If you would like to chat with other members of our growing community, [join the Jellyseerr Discord server](https://discord.gg/ckbvBtDJgC)!

Our [Code of Conduct](https://github.com/fallenbagel/jellyseerr/blob/develop/CODE_OF_CONDUCT.md) applies to all Jellyseerr community channels.

## Contributing

You can help improve Jellyseerr too! Check out our [Contribution Guide](https://github.com/fallenbagel/jellyseerr/blob/develop/CONTRIBUTING.md) to get started.

## Contributors ✨

Thanks goes to all wonderful people who contributed directly to Jellyseerr and Overseerr.
