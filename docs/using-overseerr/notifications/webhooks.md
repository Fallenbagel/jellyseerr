# Webhook

The webhook notification agent enables you to send a custom JSON payload to any endpoint for specific notification events.

## Configuration

### Webhook URL

The URL you would like to post notifications to. Your JSON will be sent as the body of the request.

### Authorization Header (optional)

{% hint style="info" %}
This is typically not needed. Please refer to your webhook provider's documentation for details.
{% endhint %}

This value will be sent as an `Authorization` HTTP header.

### JSON Payload

Customize the JSON payload to suit your needs. Overseerr provides several [template variables](#template-variables) for use in the payload, which will be replaced with the relevant data when the notifications are triggered.

## Template Variables

### General

- `{{notification_type}}` The type of notification. (Ex. `MEDIA_PENDING` or `MEDIA_APPROVED`)
- `{{subject}}` The notification subject message. (For request notifications, this is the media title)
- `{{message}}` Notification message body. (For request notifications, this is the media's overview/synopsis)
- `{{image}}` Associated image with the request. (For request notifications, this is the media's poster)

### User

These variables are for the target recipient of the notification.

- `{{notifyuser_username}}` Target user's username.
- `{{notifyuser_email}}` Target user's email address.
- `{{notifyuser_avatar}}` Target user's avatar URL.
- `{{notifyuser_settings_discordId}}` Target user's Discord ID (if one is set).
- `{{notifyuser_settings_telegramChatId}}` Target user's Telegram Chat ID (if one is set).

{% hint style="info" %}
The `notifyuser` variables are not set for the following notification types, as they are intended for application administrators rather than end users:

- Media Requested
- Media Automatically Approved
- Media Failed

On the other hand, the `notifyuser` variables _will_ be replaced with the requesting user's information for the below notification types:

- Media Approved
- Media Declined
- Media Available

If you would like to use the requesting user's information in your webhook, please instead include the relevant variables from the [Request](#request) section below.
{% endhint %}

### Special

The following variables must be used as a key in the JSON payload (e.g., `"{{extra}}": []`).

- `{{request}}` This object will be `null` if there is no relevant request object for the notification.
- `{{media}}` This object will be `null` if there is no relevant media object for the notification.
- `{{extra}}` This object will contain the "extra" array of additional data for certain notifications.

#### Media

These `{{media}}` special variables are only included in media-related notifications, such as requests.

- `{{media_type}}` Media type (`movie` or `tv`).
- `{{media_tmdbid}}` Media's TMDb ID.
- `{{media_imdbid}}` Media's IMDb ID.
- `{{media_tvdbid}}` Media's TVDB ID.
- `{{media_status}}` Media's availability status (`UNKNOWN`, `PENDING`, `PROCESSING`, `PARTIALLY_AVAILABLE`, or `AVAILABLE`).
- `{{media_status4k}}` Media's 4K availability status (`UNKNOWN`, `PENDING`, `PROCESSING`, `PARTIALLY_AVAILABLE`, or `AVAILABLE`)

#### Request

The `{{request}}` special variables are only included in request-related notifications.

- `{{request_id}}` Request ID.
- `{{requestedBy_username}}` Requesting user's username.
- `{{requestedBy_email}}` Requesting user's email address.
- `{{requestedBy_avatar}}` Requesting user's avatar URL.
- `{{requestedBy_settings_discordId}}` Requesting user's Discord ID (if set).
- `{{requestedBy_settings_telegramChatId}}` Requesting user's Telegram Chat ID (if set).
