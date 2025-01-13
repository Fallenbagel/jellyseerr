---
title: Backups
description: Understand which data you should back up.
sidebar_position: 1
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
sqlite3 db/db.sqlite3 ".backup '/tmp/db/db.sqlite3.bak'"
```  

Then, copy the `/tmp/db/db.sqlite3.bak` file to your desired backup location.

### PostgreSQL

You can back up the `config` folder and dump the PostgreSQL database without stopping the Jellyseerr application.

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

After restoring the PostgreSQL database, the `config` folder structure should look like this:

```
.
├── cache            <-- Optional
├── logs             <-- Optional
├── lost+found       <-- Optional
└── settings.json    <-- Optional (required if you want to avoid reconfiguring Jellyseerr)
```

Restore the PostgreSQL database and, optionally, the `settings.json` file. Then start the Jellyseerr application.
