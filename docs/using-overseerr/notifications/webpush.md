# Web Push

The web push notification agent enables you and your users to receive Overseerr notifications in a supported browser.

This notification agent does not require any configuration, but is not enabled in Overseerr by default.

{% hint style="warning" %}
**The web push agent only works via HTTPS.** Refer to our [reverse proxy examples](../../extending-overseerr/reverse-proxy.md) for help on proxying Overseerr traffic via HTTPS.
{% endhint %}

To set up web push notifications, simply enable the agent in **Settings &rarr; Notifications &rarr; Web Push**. You and your users will then be prompted to allow notifications in your web browser.

Users can opt out of these notifications, or customize the notification types they would like to subscribe to, in their user settings.

{% hint style="info" %}
Web push notifications offer a native notification experience without the need to install an app. iOS devices do not have support for these notifications at this time, however.
{% endhint %}
