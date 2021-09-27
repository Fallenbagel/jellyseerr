# Installation

{% hint style="danger" %}
**Overseerr is currently in BETA.** If you would like to help test the bleeding edge, please use the image **`sctx/overseerr:develop`**!
{% endhint %}

{% hint style="info" %}
After running Overseerr for the first time, configure it by visiting the web UI at `http://[address]:5055` and completing the setup steps.
{% endhint %}

## Docker

{% tabs %}
{% tab title="Basic" %}

```bash
docker run -d \
  --name overseerr \
  -e LOG_LEVEL=debug \
  -e TZ=Asia/Tokyo \
  -p 5055:5055 \
  -v /path/to/appdata/config:/app/config \
  --restart unless-stopped \
  sctx/overseerr
```

{% endtab %}

{% tab title="Compose" %}

**docker-compose.yml:**

```yaml
---
version: '3'

services:
  overseerr:
    image: sctx/overseerr:latest
    container_name: overseerr
    environment:
      - LOG_LEVEL=debug
      - TZ=Asia/Tokyo
    ports:
      - 5055:5055
    volumes:
      - /path/to/appdata/config:/app/config
    restart: unless-stopped
```

{% endtab %}

{% tab title="UID/GID" %}

```text
docker run -d \
  --name overseerr \
  --user=[ user | user:group | uid | uid:gid | user:gid | uid:group ] \
  -e LOG_LEVEL=debug \
  -e TZ=Asia/Tokyo \
  -p 5055:5055 \
  -v /path/to/appdata/config:/app/config \
  --restart unless-stopped \
   sctx/overseerr
```

{% endtab %}

{% tab title="Manual Update" %}

```bash
# Stop the Overseerr container
docker stop overseerr

# Remove the Overseerr container
docker rm overseerr

# Pull the latest update
docker pull sctx/overseerr

# Run the Overseerr container with the same parameters as before
docker run -d ...
```

{% endtab %}
{% endtabs %}

{% hint style="info" %}
Use a 3rd party updating mechanism such as [Watchtower](https://github.com/containrrr/watchtower) or [Ouroboros](https://github.com/pyouroboros/ouroboros) to keep Overseerr up-to-date automatically.
{% endhint %}

## Unraid

1. Ensure you have the **Community Applications** plugin installed.
2. Inside the **Community Applications** app store, search for **Overseerr**.
3. Click the **Install Button**.
4. On the following **Add Container** screen, make changes to the **Host Port** and **Host Path 1**\(Appdata\) as needed.
5. Click apply and access "Overseerr" at your `<ServerIP:HostPort>` in a web browser.

## Windows

Please refer to the [Docker Desktop for Windows user manual](https://docs.docker.com/docker-for-windows/) for details on how to install Docker on Windows. There is no need to install a Linux distro if using named volumes like in the example below.

{% hint style="danger" %}
**WSL2 will need to be installed to prevent DB corruption!** Please see the [Docker Desktop WSL 2 backend documentation](https://docs.docker.com/docker-for-windows/wsl/) for instructions on how to enable WSL2. The commands below will only work with WSL2 installed!
{% endhint %}

First, create a volume to store the configuration data for Overseerr using using either the Docker CLI:

```bash
docker volume create overseerr-data
```

or the Docker Desktop app:

1. Open the Docker Desktop app
2. Head to the Volumes tab
3. Click on the "New Volume" button near the top right
4. Enter a name for the volume (example: `overseerr-data`) and hit "Create"

Then, create and start the Overseerr container:

```bash
docker run -d -e LOG_LEVEL=debug -e TZ=Asia/Tokyo -p 5055:5055 -v "overseerr-data:/app/config" --restart unless-stopped sctx/overseerr
```

If using a named volume like above, you can safely ignore the warning about the `/app/config` folder being incorrectly mounted on the setup page.

To access the files inside the volume created above, navigate to `\\wsl$\docker-desktop-data\version-pack-data\community\docker\volumes\overseerr-data\_data` using File Explorer.

{% hint style="info" %}
Docker on Windows works differently than it does on Linux; it runs Docker inside of a stripped-down Linux VM. Volume mounts are exposed to Docker inside this VM via SMB mounts. While this is fine for media, it is unacceptable for the `/app/config` directory because SMB does not support file locking. This will eventually corrupt your database, which can lead to slow behavior and crashes.

**If you must run Docker on Windows, you should put the `/app/config` directory mount inside the VM and not on the Windows host.** (This also applies to other containers with SQLite databases.)

Named volumes, like in the example commands above, are automatically mounted inside the VM.
{% endhint %}

## Linux

{% hint style="info" %}
The [Overseerr snap](https://snapcraft.io/overseerr) is the only officially supported Linux install method aside from [Docker](#docker).

Currently, the listening port cannot be changed, so port `5055` will need to be available on your host. To install `snapd`, please refer to the [Snapcraft documentation](https://snapcraft.io/docs/installing-snapd).
{% endhint %}

**To install:**

```
sudo snap install overseerr
```

**Updating:**
Snap will keep Overseerr up-to-date automatically. You can force a refresh by using the following command.

```
sudo snap refresh
```

**To install the development build:**

```
sudo snap install overseerr --edge
```

{% hint style="danger" %}
This version can break any moment. Be prepared to troubleshoot any issues that arise!
{% endhint %}

## Third-Party

{% tabs %}

{% tab title="Gentoo" %}
Portage overlay [GitHub Repository](https://github.com/chriscpritchard/overseerr-overlay).

This is now included in the list of [Gentoo repositories](https://overlays.gentoo.org/), so can be easily enabled with `eselect repository`

Efforts will be made to keep up-to-date with the latest releases; however, this cannot be guaranteed.

**To enable:**
To enable using `eselect repository`, run:

```bash
eselect repository enable overseerr-overlay
```

**To install:**
Once complete, you can just run:

```bash
emerge www-apps/overseerr
```

**To install the development build:**
A live ebuild (`=www-apps/overseerr-9999`) is also available. To use this, you will need to modify accept_keywords for this package:

```bash
emerge --autounmask --autounmask-write "=www-apps/overseerr-9999"
```

Once installed, you will not be notified of updates, so you can update with:

```bash
emerge @live-rebuild
```

or use `app-portage/smart-live-rebuild`

{% hint style="danger" %}
This version can break any moment. Be prepared to troubleshoot any issues that arise!
{% endhint %}

{% endtab %}

{% tab title="Swizzin" %}

{% hint style="danger" %}
This implementation is not yet merged to master due to missing functionality. You can beta test the limited implementation or follow the status on [the pull request](https://github.com/swizzin/swizzin/pull/567).
{% endhint %}

The installation is not implemented via Docker, but barebones. The latest release version of Overseerr will be used.
Please see the [swizzin documentation](https://swizzin.ltd/applications/overseerr) for more information.

To install, run the following:

```bash
box install overseerr
```

To upgrade, run the following:

```bash
box upgrade overseerr
```

{% endtab %}

{% endtabs %}
