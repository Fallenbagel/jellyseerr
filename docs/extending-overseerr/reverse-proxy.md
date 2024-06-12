# Reverse Proxy

{% hint style="warning" %}
Base URLs cannot be configured in Overseerr. With this limitation, only subdomain configurations are supported.

A Nginx subfolder workaround configuration is provided below, but it is not officially supported.
{% endhint %}

## Nginx

{% tabs %}
{% tab title="SWAG" %}

A sample proxy configuration is included in [SWAG (Secure Web Application Gateway)](https://github.com/linuxserver/docker-swag).

However, this page is still the only source of truth, so the SWAG sample configuration is not guaranteed to be up-to-date. If you find an inconsistency, please [report it to the LinuxServer team](https://github.com/linuxserver/reverse-proxy-confs/issues/new) or [submit a pull request to update it](https://github.com/linuxserver/reverse-proxy-confs/pulls).

To use the bundled configuration file, simply rename `overseerr.subdomain.conf.sample` in the `proxy-confs` folder to `overseerr.subdomain.conf`.

Alternatively, you can create a new file `overseerr.subdomain.conf` in `proxy-confs` with the following configuration:

```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;

    server_name overseerr.*;

    include /config/nginx/ssl.conf;

    client_max_body_size 0;

    location / {
        include /config/nginx/proxy.conf;
        resolver 127.0.0.11 valid=30s;
        set $upstream_app overseerr;
        set $upstream_port 5055;
        set $upstream_proto http;
        proxy_pass $upstream_proto://$upstream_app:$upstream_port;
    }

}
```

{% endtab %}

{% tab title="Nginx Proxy Manager" %}

Add a new proxy host with the following settings:

### Details

- **Domain Names:** Your desired external Overseerr hostname; e.g., `overseerr.example.com`
- **Scheme:** `http`
- **Forward Hostname / IP:** Internal Overseerr hostname or IP
- **Forward Port:** `5055`
- **Cache Assets:** yes
- **Block Common Exploits:** yes

### SSL

- **SSL Certificate:** Select one of the options; if you are not sure, pick “Request a new SSL Certificate”
- **Force SSL:** yes
- **HTTP/2 Support:** yes

{% endtab %}

{% tab title="Subdomain" %}

Add the following configuration to a new file `/etc/nginx/sites-available/overseerr.example.com.conf`:

```nginx
server {
    listen 80;
    server_name overseerr.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name overseerr.example.com;

    ssl_certificate /etc/letsencrypt/live/overseerr.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/overseerr.example.com/privkey.pem;

    proxy_set_header Referer $http_referer;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Real-Port $remote_port;
    proxy_set_header X-Forwarded-Host $host:$remote_port;
    proxy_set_header X-Forwarded-Server $host;
    proxy_set_header X-Forwarded-Port $remote_port;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Ssl on;

    location / {
        proxy_pass http://127.0.0.1:5055;
    }
}
```

Then, create a symlink to `/etc/nginx/sites-enabled`:

```bash
sudo ln -s /etc/nginx/sites-available/overseerr.example.com.conf /etc/nginx/sites-enabled/overseerr.example.com.conf
```

{% endtab %}

{% tab title="Subfolder" %}

{% hint style="warning" %}
This Nginx subfolder reverse proxy is an unsupported workaround, and only provided as an example. The filters may stop working when Overseerr is updated.

If you encounter any issues with Overseerr while using this workaround, we may ask you to try to reproduce the problem without the Nginx proxy.
{% endhint %}

Add the following location block to your existing `nginx.conf` file.

```nginx
location ^~ /overseerr {
    set $app 'overseerr';

    # Remove /overseerr path to pass to the app
    rewrite ^/overseerr/?(.*)$ /$1 break;
    proxy_pass http://127.0.0.1:5055; # NO TRAILING SLASH

    # Redirect location headers
    proxy_redirect ^ /$app;
    proxy_redirect /setup /$app/setup;
    proxy_redirect /login /$app/login;

    # Sub filters to replace hardcoded paths
    proxy_set_header Accept-Encoding "";
    sub_filter_once off;
    sub_filter_types *;
    sub_filter 'href="/"' 'href="/$app"';
    sub_filter 'href="/login"' 'href="/$app/login"';
    sub_filter 'href:"/"' 'href:"/$app"';
    sub_filter '\/_next' '\/$app\/_next';
    sub_filter '/_next' '/$app/_next';
    sub_filter '/api/v1' '/$app/api/v1';
    sub_filter '/login/popup/loading' '/$app/login/popup/loading';
    sub_filter '/images/' '/$app/images/';
    sub_filter '/android-' '/$app/android-';
    sub_filter '/apple-' '/$app/apple-';
    sub_filter '/favicon' '/$app/favicon';
    sub_filter '/logo_' '/$app/logo_';
    sub_filter '/site.webmanifest' '/$app/site.webmanifest';
}
```

{% endtab %}
{% endtabs %}

## Traefik (v2)

Add the following labels to the Overseerr service in your `docker-compose.yml` file:

```text
labels:
  - "traefik.enable=true"
  ## HTTP Routers
  - "traefik.http.routers.overseerr-rtr.entrypoints=https"
  - "traefik.http.routers.overseerr-rtr.rule=Host(`overseerr.domain.com`)"
  - "traefik.http.routers.overseerr-rtr.tls=true"
  ## HTTP Services
  - "traefik.http.routers.overseerr-rtr.service=overseerr-svc"
  - "traefik.http.services.overseerr-svc.loadbalancer.server.port=5055"
```

For more information, please refer to the [Traefik documentation](https://doc.traefik.io/traefik/user-guides/docker-compose/basic-example/).
