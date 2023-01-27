<p align="center">
<img src="./public/logo_full.svg" alt="Jellyseerr" style="margin: 20px 0;">
</p>
<p align="center">
<a href="https://discord.gg/ckbvBtDJgC"><img src="https://img.shields.io/badge/Discord-Chat-lightgrey" alt="Discord"></a>
<a href="https://hub.docker.com/r/fallenbagel/jellyseerr"><img src="https://img.shields.io/docker/pulls/fallenbagel/jellyseerr" alt="Docker pulls"></a>
<a href="https://github.com/fallenbagel/jellyseerr/blob/develop/LICENSE"><img alt="GitHub" src="https://img.shields.io/github/license/fallenbagel/jellyseerr"></a>
</p>

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

- Nodejs (atleast LTS version)
- Yarn
- Git

```bash
git clone https://github.com/Fallenbagel/jellyseerr.git && cd jellyseerr
git checkout main #if you want to run stable instead of develop
yarn install
yarn run build
yarn start
```

_Systemd-service:_

- assuming jellyseerr was cloned to `/opt/`
  and the environmentfile is located at `/etc/jellyseerr`

service:

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
ExecStart=/root/.nvm/versions/node/v18.7.0/bin/node dist/index.js

[Install]
WantedBy=multi-user.target
```

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

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://sct.dev"><img src="https://avatars1.githubusercontent.com/u/234213?v=4?s=100" width="100px;" alt="sct"/><br /><sub><b>sct</b></sub></a><br /><a href="https://github.com/sct/overseerr/commits?author=sct" title="Code">💻</a> <a href="#design-sct" title="Design">🎨</a> <a href="#ideas-sct" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/azoitos"><img src="https://avatars2.githubusercontent.com/u/26529049?v=4?s=100" width="100px;" alt="Alex Zoitos"/><br /><sub><b>Alex Zoitos</b></sub></a><br /><a href="https://github.com/sct/overseerr/commits?author=azoitos" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/OwsleyJr"><img src="https://avatars3.githubusercontent.com/u/8635678?v=4?s=100" width="100px;" alt="Brandon Cohen"/><br /><sub><b>Brandon Cohen</b></sub></a><br /><a href="https://github.com/sct/overseerr/commits?author=OwsleyJr" title="Code">💻</a> <a href="https://github.com/sct/overseerr/commits?author=OwsleyJr" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Ahreluth"><img src="https://avatars2.githubusercontent.com/u/75682440?v=4?s=100" width="100px;" alt="Ahreluth"/><br /><sub><b>Ahreluth</b></sub></a><br /><a href="#translation-Ahreluth" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/KovalevArtem"><img src="https://avatars0.githubusercontent.com/u/36500228?v=4?s=100" width="100px;" alt="KovalevArtem"/><br /><sub><b>KovalevArtem</b></sub></a><br /><a href="#translation-KovalevArtem" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/GiyomuWeb"><img src="https://avatars0.githubusercontent.com/u/62489209?v=4?s=100" width="100px;" alt="GiyomuWeb"/><br /><sub><b>GiyomuWeb</b></sub></a><br /><a href="#translation-GiyomuWeb" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/angrycuban13"><img src="https://avatars3.githubusercontent.com/u/39564898?v=4?s=100" width="100px;" alt="Angry Cuban"/><br /><sub><b>Angry Cuban</b></sub></a><br /><a href="https://github.com/sct/overseerr/commits?author=angrycuban13" title="Documentation">📖</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jvennik"><img src="https://avatars3.githubusercontent.com/u/6672637?v=4?s=100" width="100px;" alt="jvennik"/><br /><sub><b>jvennik</b></sub></a><br /><a href="#translation-jvennik" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/darknessgp"><img src="https://avatars0.githubusercontent.com/u/1521243?v=4?s=100" width="100px;" alt="darknessgp"/><br /><sub><b>darknessgp</b></sub></a><br /><a href="https://github.com/sct/overseerr/commits?author=darknessgp" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/saltydk"><img src="https://avatars1.githubusercontent.com/u/6587950?v=4?s=100" width="100px;" alt="salty"/><br /><sub><b>salty</b></sub></a><br /><a href="#infra-saltydk" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Shutruk"><img src="https://avatars2.githubusercontent.com/u/9198633?v=4?s=100" width="100px;" alt="Shutruk"/><br /><sub><b>Shutruk</b></sub></a><br /><a href="#translation-Shutruk" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/krystiancharubin"><img src="https://avatars2.githubusercontent.com/u/17775600?v=4?s=100" width="100px;" alt="Krystian Charubin"/><br /><sub><b>Krystian Charubin</b></sub></a><br /><a href="#design-krystiancharubin" title="Design">🎨</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/kieron"><img src="https://avatars2.githubusercontent.com/u/8655212?v=4?s=100" width="100px;" alt="Kieron Boswell"/><br /><sub><b>Kieron Boswell</b></sub></a><br /><a href="https://github.com/sct/overseerr/commits?author=kieron" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/samwiseg0"><img src="https://avatars1.githubusercontent.com/u/2241731?v=4?s=100" width="100px;" alt="samwiseg0"/><br /><sub><b>samwiseg0</b></sub></a><br /><a href="#question-samwiseg0" title="Answering Questions">💬</a> <a href="#infra-samwiseg0" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ecelebi29"><img src="https://avatars2.githubusercontent.com/u/8337120?v=4?s=100" width="100px;" alt="ecelebi29"/><br /><sub><b>ecelebi29</b></sub></a><br /><a href="https://github.com/sct/overseerr/commits?author=ecelebi29" title="Code">💻</a> <a href="https://github.com/sct/overseerr/commits?author=ecelebi29" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/mmozeiko"><img src="https://avatars3.githubusercontent.com/u/1665010?v=4?s=100" width="100px;" alt="Mārtiņš Možeiko"/><br /><sub><b>Mārtiņš Možeiko</b></sub></a><br /><a href="https://github.com/sct/overseerr/commits?author=mmozeiko" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/mazzetta86"><img src="https://avatars2.githubusercontent.com/u/45591560?v=4?s=100" width="100px;" alt="mazzetta86"/><br /><sub><b>mazzetta86</b></sub></a><br /><a href="#translation-mazzetta86" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Panzer1119"><img src="https://avatars1.githubusercontent.com/u/23016343?v=4?s=100" width="100px;" alt="Paul Hagedorn"/><br /><sub><b>Paul Hagedorn</b></sub></a><br /><a href="#translation-Panzer1119" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Shagon94"><img src="https://avatars3.githubusercontent.com/u/9140783?v=4?s=100" width="100px;" alt="Shagon94"/><br /><sub><b>Shagon94</b></sub></a><br /><a href="#translation-Shagon94" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/sebstrgg"><img src="https://avatars3.githubusercontent.com/u/27026694?v=4?s=100" width="100px;" alt="sebstrgg"/><br /><sub><b>sebstrgg</b></sub></a><br /><a href="#translation-sebstrgg" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/danshilm"><img src="https://avatars2.githubusercontent.com/u/20923978?v=4?s=100" width="100px;" alt="Danshil Mungur"/><br /><sub><b>Danshil Mungur</b></sub></a><br /><a href="https://github.com/sct/overseerr/commits?author=danshilm" title="Code">💻</a> <a href="https://github.com/sct/overseerr/commits?author=danshilm" title="Documentation">📖</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/doob187"><img src="https://avatars1.githubusercontent.com/u/60312740?v=4?s=100" width="100px;" alt="doob187"/><br /><sub><b>doob187</b></sub></a><br /><a href="#infra-doob187" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/johnpyp"><img src="https://avatars2.githubusercontent.com/u/20625636?v=4?s=100" width="100px;" alt="johnpyp"/><br /><sub><b>johnpyp</b></sub></a><br /><a href="https://github.com/sct/overseerr/commits?author=johnpyp" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ankarhem"><img src="https://avatars1.githubusercontent.com/u/14110063?v=4?s=100" width="100px;" alt="Jakob Ankarhem"/><br /><sub><b>Jakob Ankarhem</b></sub></a><br /><a href="https://github.com/sct/overseerr/commits?author=ankarhem" title="Documentation">📖</a> <a href="https://github.com/sct/overseerr/commits?author=ankarhem" title="Code">💻</a> <a href="#translation-ankarhem" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jayesh100"><img src="https://avatars1.githubusercontent.com/u/8022175?v=4?s=100" width="100px;" alt="Jayesh"/><br /><sub><b>Jayesh</b></sub></a><br /><a href="https://github.com/sct/overseerr/commits?author=jayesh100" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/flying-sausages"><img src="https://avatars1.githubusercontent.com/u/23618693?v=4?s=100" width="100px;" alt="flying-sausages"/><br /><sub><b>flying-sausages</b></sub></a><br /><a href="https://github.com/sct/overseerr/commits?author=flying-sausages" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/hirenshah"><img src="https://avatars2.githubusercontent.com/u/418112?v=4?s=100" width="100px;" alt="hirenshah"/><br /><sub><b>hirenshah</b></sub></a><br /><a href="https://github.com/sct/overseerr/commits?author=hirenshah" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/TheCatLady"><img src="https://avatars0.githubusercontent.com/u/52870424?v=4?s=100" width="100px;" alt="TheCatLady"/><br /><sub><b>TheCatLady</b></sub></a><br /><a href="https://github.com/sct/overseerr/commits?author=TheCatLady" title="Code">💻</a> <a href="#translation-TheCatLady" title="Translation">🌍</a> <a href="https://github.com/sct/overseerr/commits?author=TheCatLady" title="Documentation">📖</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/chriscpritchard"><img src="https://avatars1.githubusercontent.com/u/1839074?v=4?s=100" width="100px;" alt="Chris Pritchard"/><br /><sub><b>Chris Pritchard</b></sub></a><br /><a href="https://github.com/sct/overseerr/commits?author=chriscpritchard" title="Code">💻</a> <a href="https://github.com/sct/overseerr/commits?author=chriscpritchard" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Tamberlox"><img src="https://avatars3.githubusercontent.com/u/56069014?v=4?s=100" width="100px;" alt="Tamberlox"/><br /><sub><b>Tamberlox</b></sub></a><br /><a href="#translation-Tamberlox" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://hmnd.io"><img src="https://avatars.githubusercontent.com/u/12853597?v=4?s=100" width="100px;" alt="David"/><br /><sub><b>David</b></sub></a><br /><a href="https://github.com/sct/overseerr/commits?author=hmnd" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.douglas-parker.com"><img src="https://avatars.githubusercontent.com/u/18235822?v=4?s=100" width="100px;" alt="Douglas Parker"/><br /><sub><b>Douglas Parker</b></sub></a><br /><a href="https://github.com/sct/overseerr/commits?author=douglasparker" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/dancarter"><img src="https://avatars.githubusercontent.com/u/4387516?v=4?s=100" width="100px;" alt="Daniel Carter"/><br /><sub><b>Daniel Carter</b></sub></a><br /><a href="https://github.com/sct/overseerr/commits?author=dancarter" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://nuro.dev"><img src="https://avatars.githubusercontent.com/u/4991309?v=4?s=100" width="100px;" alt="nuro"/><br /><sub><b>nuro</b></sub></a><br /><a href="https://github.com/sct/overseerr/commits?author=NuroDev" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/onedr0p"><img src="https://avatars.githubusercontent.com/u/213795?v=4?s=100" width="100px;" alt="ᗪєνιη ᗷυнʟ"/><br /><sub><b>ᗪєνιη ᗷυнʟ</b></sub></a><br /><a href="#infra-onedr0p" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/JonnyWong16"><img src="https://avatars.githubusercontent.com/u/9099342?v=4?s=100" width="100px;" alt="JonnyWong16"/><br /><sub><b>JonnyWong16</b></sub></a><br /><a href="https://github.com/sct/overseerr/commits?author=JonnyWong16" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Roxedus"><img src="https://avatars.githubusercontent.com/u/7110194?v=4?s=100" width="100px;" alt="Roxedus"/><br /><sub><b>Roxedus</b></sub></a><br /><a href="https://github.com/sct/overseerr/commits?author=Roxedus" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/WoisWoi"><img src="https://avatars.githubusercontent.com/u/75491231?v=4?s=100" width="100px;" alt="WoisWoi"/><br /><sub><b>WoisWoi</b></sub></a><br /><a href="#translation-WoisWoi" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/HubDuck"><img src="https://avatars.githubusercontent.com/u/77843475?v=4?s=100" width="100px;" alt="HubDuck"/><br /><sub><b>HubDuck</b></sub></a><br /><a href="#translation-HubDuck" title="Translation">🌍</a> <a href="https://github.com/sct/overseerr/commits?author=HubDuck" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/costaht"><img src="https://avatars.githubusercontent.com/u/50637431?v=4?s=100" width="100px;" alt="costaht"/><br /><sub><b>costaht</b></sub></a><br /><a href="https://github.com/sct/overseerr/commits?author=costaht" title="Documentation">📖</a> <a href="#translation-costaht" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Shjosan"><img src="https://avatars.githubusercontent.com/u/20847626?v=4?s=100" width="100px;" alt="Shjosan"/><br /><sub><b>Shjosan</b></sub></a><br /><a href="#translation-Shjosan" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/kobaubarr"><img src="https://avatars.githubusercontent.com/u/28481522?v=4?s=100" width="100px;" alt="kobaubarr"/><br /><sub><b>kobaubarr</b></sub></a><br /><a href="#translation-kobaubarr" title="Translation">🌍</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/notorius28"><img src="https://avatars.githubusercontent.com/u/1621513?v=4?s=100" width="100px;" alt="Ricardo González"/><br /><sub><b>Ricardo González</b></sub></a><br /><a href="#translation-notorius28" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://torkili.uz"><img src="https://avatars.githubusercontent.com/u/460764?v=4?s=100" width="100px;" alt="Torkil"/><br /><sub><b>Torkil</b></sub></a><br /><a href="#translation-Torkiliuz" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.jagandeepbrar.io"><img src="https://avatars.githubusercontent.com/u/3048295?v=4?s=100" width="100px;" alt="Jagandeep Brar"/><br /><sub><b>Jagandeep Brar</b></sub></a><br /><a href="https://github.com/sct/overseerr/commits?author=JagandeepBrar" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://dtalens.com"><img src="https://avatars.githubusercontent.com/u/6631832?v=4?s=100" width="100px;" alt="dtalens"/><br /><sub><b>dtalens</b></sub></a><br /><a href="#translation-dtalens" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/acortelyou"><img src="https://avatars.githubusercontent.com/u/1689668?v=4?s=100" width="100px;" alt="Alex Cortelyou"/><br /><sub><b>Alex Cortelyou</b></sub></a><br /><a href="https://github.com/sct/overseerr/commits?author=acortelyou" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://nz.linkedin.com/in/jonocairns"><img src="https://avatars.githubusercontent.com/u/182836?v=4?s=100" width="100px;" alt="Jono Cairns"/><br /><sub><b>Jono Cairns</b></sub></a><br /><a href="https://github.com/sct/overseerr/commits?author=jonocairns" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://scias.net/"><img src="https://avatars.githubusercontent.com/u/439655?v=4?s=100" width="100px;" alt="DJScias"/><br /><sub><b>DJScias</b></sub></a><br /><a href="#translation-DJScias" title="Translation">🌍</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Dabu-dot"><img src="https://avatars.githubusercontent.com/u/52525576?v=4?s=100" width="100px;" alt="Dabu-dot"/><br /><sub><b>Dabu-dot</b></sub></a><br /><a href="#translation-Dabu-dot" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Jabster28"><img src="https://avatars.githubusercontent.com/u/29015942?v=4?s=100" width="100px;" alt="Jabster28"/><br /><sub><b>Jabster28</b></sub></a><br /><a href="https://github.com/sct/overseerr/commits?author=Jabster28" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/littlerooster"><img src="https://avatars.githubusercontent.com/u/83890654?v=4?s=100" width="100px;" alt="littlerooster"/><br /><sub><b>littlerooster</b></sub></a><br /><a href="#translation-littlerooster" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/dphildebrandt"><img src="https://avatars.githubusercontent.com/u/154459?v=4?s=100" width="100px;" alt="Dustin Hildebrandt"/><br /><sub><b>Dustin Hildebrandt</b></sub></a><br /><a href="https://github.com/sct/overseerr/commits?author=dphildebrandt" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Generator"><img src="https://avatars.githubusercontent.com/u/44146?v=4?s=100" width="100px;" alt="Bruno Guerreiro"/><br /><sub><b>Bruno Guerreiro</b></sub></a><br /><a href="#translation-Generator" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/iceHtwoO"><img src="https://avatars.githubusercontent.com/u/27020492?v=4?s=100" width="100px;" alt="Alexander Neuhäuser"/><br /><sub><b>Alexander Neuhäuser</b></sub></a><br /><a href="#translation-iceHtwoO" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://www.unext.co.jp"><img src="https://avatars.githubusercontent.com/u/37431541?v=4?s=100" width="100px;" alt="Livio"/><br /><sub><b>Livio</b></sub></a><br /><a href="#design-liviokanone" title="Design">🎨</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/tangentThought"><img src="https://avatars.githubusercontent.com/u/25516090?v=4?s=100" width="100px;" alt="tangentThought"/><br /><sub><b>tangentThought</b></sub></a><br /><a href="https://github.com/sct/overseerr/commits?author=tangentThought" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/nicospz"><img src="https://avatars.githubusercontent.com/u/31373060?v=4?s=100" width="100px;" alt="Nicolás Espinoza"/><br /><sub><b>Nicolás Espinoza</b></sub></a><br /><a href="https://github.com/sct/overseerr/commits?author=nicospz" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/sootylunatic"><img src="https://avatars.githubusercontent.com/u/36486087?v=4?s=100" width="100px;" alt="sootylunatic"/><br /><sub><b>sootylunatic</b></sub></a><br /><a href="#translation-sootylunatic" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/JoKerIsCraZy"><img src="https://avatars.githubusercontent.com/u/47474211?v=4?s=100" width="100px;" alt="JoKerIsCraZy"/><br /><sub><b>JoKerIsCraZy</b></sub></a><br /><a href="#translation-JoKerIsCraZy" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://daddie.dev"><img src="https://avatars.githubusercontent.com/u/33762262?v=4?s=100" width="100px;" alt="Daddie0"/><br /><sub><b>Daddie0</b></sub></a><br /><a href="#translation-GoByeBye" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://ungaro.me"><img src="https://avatars.githubusercontent.com/u/43807696?v=4?s=100" width="100px;" alt="Simone"/><br /><sub><b>Simone</b></sub></a><br /><a href="#translation-Simoneu01" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/adan89lion"><img src="https://avatars.githubusercontent.com/u/6585644?v=4?s=100" width="100px;" alt="Seohyun Joo"/><br /><sub><b>Seohyun Joo</b></sub></a><br /><a href="#translation-adan89lion" title="Translation">🌍</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ty4ko"><img src="https://avatars.githubusercontent.com/u/21213535?v=4?s=100" width="100px;" alt="Sergey"/><br /><sub><b>Sergey</b></sub></a><br /><a href="#translation-ty4ko" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/skafte1990"><img src="https://avatars.githubusercontent.com/u/31465453?v=4?s=100" width="100px;" alt="Shaaft"/><br /><sub><b>Shaaft</b></sub></a><br /><a href="#translation-skafte1990" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/sr093906"><img src="https://avatars.githubusercontent.com/u/8369201?v=4?s=100" width="100px;" alt="sr093906"/><br /><sub><b>sr093906</b></sub></a><br /><a href="#translation-sr093906" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Nackophilz"><img src="https://avatars.githubusercontent.com/u/61667226?v=4?s=100" width="100px;" alt="Nackophilz"/><br /><sub><b>Nackophilz</b></sub></a><br /><a href="#translation-Nackophilz" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/schambers"><img src="https://avatars.githubusercontent.com/u/31563?v=4?s=100" width="100px;" alt="Sean Chambers"/><br /><sub><b>Sean Chambers</b></sub></a><br /><a href="https://github.com/sct/overseerr/commits?author=schambers" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/deniscerri"><img src="https://avatars.githubusercontent.com/u/64997243?v=4?s=100" width="100px;" alt="deniscerri"/><br /><sub><b>deniscerri</b></sub></a><br /><a href="#translation-deniscerri" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/tomgacz"><img src="https://avatars.githubusercontent.com/u/14138209?v=4?s=100" width="100px;" alt="tomgacz"/><br /><sub><b>tomgacz</b></sub></a><br /><a href="#translation-tomgacz" title="Translation">🌍</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Andersborrits"><img src="https://avatars.githubusercontent.com/u/29452218?v=4?s=100" width="100px;" alt="Andersborrits"/><br /><sub><b>Andersborrits</b></sub></a><br /><a href="#translation-Andersborrits" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://maxentrouault.fr"><img src="https://avatars.githubusercontent.com/u/67283154?v=4?s=100" width="100px;" alt="Maxent"/><br /><sub><b>Maxent</b></sub></a><br /><a href="#translation-Maxentr" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/sambartik"><img src="https://avatars.githubusercontent.com/u/63553146?v=4?s=100" width="100px;" alt="Samuel Bartík"/><br /><sub><b>Samuel Bartík</b></sub></a><br /><a href="https://github.com/sct/overseerr/commits?author=sambartik" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/frank-cywong"><img src="https://avatars.githubusercontent.com/u/90653148?v=4?s=100" width="100px;" alt="Chun Yeung Wong"/><br /><sub><b>Chun Yeung Wong</b></sub></a><br /><a href="https://github.com/sct/overseerr/commits?author=frank-cywong" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/TheMeanCanEHdian"><img src="https://avatars.githubusercontent.com/u/16025103?v=4?s=100" width="100px;" alt="TheMeanCanEHdian"/><br /><sub><b>TheMeanCanEHdian</b></sub></a><br /><a href="https://github.com/sct/overseerr/commits?author=TheMeanCanEHdian" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Gylesie"><img src="https://avatars.githubusercontent.com/u/86306812?v=4?s=100" width="100px;" alt="Gylesie"/><br /><sub><b>Gylesie</b></sub></a><br /><a href="https://github.com/sct/overseerr/commits?author=Gylesie" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Fhd-pro"><img src="https://avatars.githubusercontent.com/u/82862079?v=4?s=100" width="100px;" alt="Fhd-pro"/><br /><sub><b>Fhd-pro</b></sub></a><br /><a href="#translation-Fhd-pro" title="Translation">🌍</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/PovilasID"><img src="https://avatars.githubusercontent.com/u/396243?v=4?s=100" width="100px;" alt="PovilasID"/><br /><sub><b>PovilasID</b></sub></a><br /><a href="#translation-PovilasID" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/byakurau"><img src="https://avatars.githubusercontent.com/u/1811683?v=4?s=100" width="100px;" alt="byakurau"/><br /><sub><b>byakurau</b></sub></a><br /><a href="#translation-byakurau" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/miknii"><img src="https://avatars.githubusercontent.com/u/109232569?v=4?s=100" width="100px;" alt="miknii"/><br /><sub><b>miknii</b></sub></a><br /><a href="#translation-miknii" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Eclipseop"><img src="https://avatars.githubusercontent.com/u/5846213?v=4?s=100" width="100px;" alt="Mackenzie"/><br /><sub><b>Mackenzie</b></sub></a><br /><a href="https://github.com/sct/overseerr/commits?author=Eclipseop" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/s0up4200"><img src="https://avatars.githubusercontent.com/u/18177310?v=4?s=100" width="100px;" alt="soup"/><br /><sub><b>soup</b></sub></a><br /><a href="https://github.com/sct/overseerr/commits?author=s0up4200" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ceptonit"><img src="https://avatars.githubusercontent.com/u/12678743?v=4?s=100" width="100px;" alt="ceptonit"/><br /><sub><b>ceptonit</b></sub></a><br /><a href="https://github.com/sct/overseerr/commits?author=ceptonit" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/aedelbro"><img src="https://avatars.githubusercontent.com/u/36162221?v=4?s=100" width="100px;" alt="aedelbro"/><br /><sub><b>aedelbro</b></sub></a><br /><a href="https://github.com/sct/overseerr/commits?author=aedelbro" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

> > > > > > > overseerr/develop
