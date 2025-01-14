---
title: Backups
description: Understand which data you should back up.
sidebar_position: 4
---

# Which data does Jellyseerr save and where?

## Settings  

All configurations from the **Settings** panel in the Jellyseerr web UI are saved, including integrations with Radarr, Sonarr, Jellyfin, Plex, and notification settings.  
These settings are stored in the `settings.json` file located in the Jellyseerr data folder.

## User Data  

Apart from the settings, all other data—including user accounts, media requests, blacklist etc. are stored in the database (either SQLite or PostgreSQL).

# Backup

### SQLite

If your backup system uses filesystem snapshots (such as Kubernetes with Volsync), you can directly back up the Jellyseerr data folder.  
Otherwise, you need to stop the Jellyseerr application and back up the `config` folder.

For advanced users, it's possible to back up the database without stopping the application by using the [SQLite CLI](https://www.sqlite.org/download.html). Run the following command to create a backup:  

```bash
sqlite3 db/db.sqlite3 ".backup '/tmp/jellyseerr_db.sqlite3.bak'"
```  

Then, copy the `/tmp/jellyseerr_dump.sqlite3.bak` file to your desired backup location.

### PostgreSQL

You can back up the `config` folder and dump the PostgreSQL database without stopping the Jellyseerr application.

Install [postgresql-client](https://www.postgresql.org/download/) and run the following command to create a backup (just replace the placeholders):

:::info
Depending on how your PostgreSQL instance is configured, you may need to add these options to the command below.

  -d, --dbname=DBNAME      database to dump

  -h, --host=HOSTNAME      database server host or socket directory
:::

```bash
pg_dump -U <database_user> -d <database_name> -f /tmp/jellyseerr_db.sql
```

# Restore

### SQLite

After restoring your `db/db.sqlite3` file and, optionally, the `settings.json` file, the `config` folder structure should look like this:

```
.
├── cache            <-- Optional
├── db
│   └── db.sqlite3
├── logs             <-- Optional
├── lost+found       <-- Optional
└── settings.json    <-- Optional (required if you want to avoid reconfiguring Jellyseerr)
```

Once the files are restored, start the Jellyseerr application.

### PostgreSQL

Install the [PostgreSQL client](https://www.postgresql.org/download/) and restore the PostgreSQL database using the following command (replace the placeholders accordingly):

:::info
Depending on how your PostgreSQL instance is configured, you may need to add these options to the command below.

  -d, --dbname=DBNAME      database to dump

  -h, --host=HOSTNAME      database server host or socket directory
:::

```bash
pg_restore -U <database_user> -d <database_name> /tmp/jellyseerr_db.sql
```

Optionally, restore the `settings.json` file. The `config` folder structure should look like this:

```
.
├── cache            <-- Optional
├── logs             <-- Optional
├── lost+found       <-- Optional
└── settings.json    <-- Optional (required if you want to avoid reconfiguring Jellyseerr)
```

Once the database and files are restored, start the Jellyseerr application.
