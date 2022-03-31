# Webhooks

Webhooks let you post a custom JSON payload to any endpoint you like. You can also set an authorization header for security purposes.

## Configuration

The following configuration options are available:

### Webhook URL (required)

The URL you would like to post notifications to. Your JSON will be sent as the body of the request.

### Authorization Header

Custom authorization header. Anything entered for this will be sent as an `Authorization` header.

### JSON Payload (required)

Customize the JSON payload to suit your needs. Overseerr provides several [template variables](./webhooks.md#template-variables) for use in the payload, which will be replaced with the relevant data when the notifications are triggered.

## Template Variables

### General

- `{{notification_type}}` The type of notification. (Ex. `MEDIA_PENDING` or `MEDIA_APPROVED`)
- `{{subject}}` The notification subject message. (For request notifications, this is the media title)
- `{{message}}` Notification message body. (For request notifications, this is the media's overview/synopsis)
- `{{image}}` Associated image with the request. (For request notifications, this is the media's poster)

### User

These variables are usually the target user of the notification.

- `{{notifyuser_username}}` Target user's username.
- `{{notifyuser_email}}` Target user's email.
- `{{notifyuser_avatar}}` Target user's avatar.
- `{{notifyuser_settings_discordId}}` Target user's discord ID (if one is set).

### Media

These variables are only included in media related notifications, such as requests.

- `{{media_type}}` Media type. Either `movie` or `tv`.
- `{{media_tmdbid}}` Media's TMDb ID.
- `{{media_imdbid}}` Media's IMDb ID.
- `{{media_tvdbid}}` Media's TVDB ID.
- `{{media_status}}` Media's availability status (e.g., `AVAILABLE` or `PENDING`).
- `{{media_status4k}}` Media's 4K availability status (e.g., `AVAILABLE` or `PENDING`).

### Special

The following variables must be used as a key in the JSON payload (e.g., `"{{extra}}": []`).

- `{{request}}` This object will be `null` if there is no relevant request object for the notification.
- `{{media}}` This object will be `null` if there is no relevant media object for the notification.
- `{{extra}}` This object will contain the "extra" array of additional data for certain notifications.
