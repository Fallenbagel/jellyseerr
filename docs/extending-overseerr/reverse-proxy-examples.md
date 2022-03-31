# Reverse Proxy Examples

{% hint style="warning" %}
Base URLs cannot be configured in Overseerr. With this limitation, only subdomain configurations are supported.
{% endhint %}

## [SWAG (Secure Web Application Gateway, formerly known as `letsencrypt`)](https://github.com/linuxserver/docker-swag)

A sample proxy configuration is included in SWAG. However, this page is still the only source of truth, so the SWAG sample configuration is not guaranteed to be up-to-date. If you find an inconsistency, please [report it to the LinuxServer team](https://github.com/linuxserver/reverse-proxy-confs/issues/new) or [submit a pull request to update it](https://github.com/linuxserver/reverse-proxy-confs/pulls).

To use the bundled configuration file, simply rename `overseerr.subdomain.conf.sample` in the `proxy-confs` folder to `overseerr.subdomain.conf`. Alternatively, create a new file `overseerr.subdomain.conf` in `proxy-confs` with the following configuration:

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

## Traefik \(v2\)

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

For more information, see the Traefik documentation for a [basic example](https://doc.traefik.io/traefik/user-guides/docker-compose/basic-example/).

## `nginx`

Add the following configuration to a new file `/etc/nginx/sites-available/overseerr.example.com.conf`:

```text
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
    real_ip_header CF-Connecting-IP;
    # Control the behavior of the Referer header (Referrer-Policy)
    add_header Referrer-Policy "no-referrer";
    # HTTP Strict Transport Security
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;
    # Reduce XSS risks (Content-Security-Policy) - uncomment to use and add URLs whenever necessary
    # add_header Content-Security-Policy "default-src 'self'; connect-src 'self' https://plex.tv; style-src 'self' 'unsafe-inline' https://rsms.me/inter/inter.css; script-src 'self' 'unsafe-inline'; img-src 'self' data: https://plex.tv https://assets.plex.tv https://gravatar.com https://secure.gravatar.com https://i2.wp.com https://image.tmdb.org; font-src 'self' https://rsms.me/inter/font-files/" always;
    # Prevent some categories of XSS attacks (X-XSS-Protection)
    add_header X-XSS-Protection "1; mode=block" always;
    # Provide clickjacking protection (X-Frame-Options)
    add_header X-Frame-Options "SAMEORIGIN" always;
    # Prevent Sniff Mimetype (X-Content-Type-Options)
    add_header X-Content-Type-Options "nosniff" always;
    # Tell crawling bots to not index the site
    add_header X-Robots-Tag "noindex, nofollow" always;

    access_log /var/log/nginx/overseerr.example.com-access.log;
    error_log /var/log/nginx/overseerr.example.com-error.log;

    location / {
        proxy_pass http://127.0.0.1:5055;
    }
}
```

Then, create a symlink to `/etc/nginx/sites-enabled`:

```bash
sudo ln -s /etc/nginx/sites-available/overseerr.example.com.conf /etc/nginx/sites-enabled/overseerr.example.com.conf
```

Next, test the configuration:

```bash
sudo nginx -t
```

Finally, reload `nginx` for the new configuration to take effect:

```bash
sudo systemctl reload nginx
```
