# Frequently Asked Questions (FAQ)

{% hint style="info" %}
If you can't find the solution to your problem here, please read [Need Help?](./need-help.md) and reach out to us on [Discord](https://discord.gg/overseerr).

_Please do not post questions or support requests on the GitHub issue tracker!_
{% endhint %}

## General

### How do I keep Overseerr up-to-date?

Use a third-party update mechanism (such as [Watchtower](https://github.com/containrrr/watchtower), [Ouroboros](https://github.com/pyouroboros/ouroboros), or [Pullio](https://hotio.dev/pullio)) to keep Overseerr up-to-date automatically.

### How can I access Overseerr outside of my home network?

The easiest but least secure method is to simply forward an external port (e.g., `5055`) on your router to the internal port used by Overseerr (default is TCP `5055`). Visit [Port Forward](http://portforward.com/) for instructions for your particular router. You would then be able to access Overseerr via `http://EXTERNAL-IP-ADDRESS:5055`.

A more advanced, user-friendly, and secure (if using SSL) method is to set up a web server and use a reverse proxy to access Overseerr. Please refer to our [reverse proxy examples](../extending-overseerr/reverse-proxy.md) for more information.

The most secure method (but also the most inconvenient method) is to set up a VPN tunnel to your home server. You would then be able to access Overseerr as if you were on your local network, via `http://LOCAL-IP-ADDRESS:5055`.

### Overseerr is amazing! But it is not translated in my language yet! Can I help with translations?

You sure can! We are using [Weblate](https://hosted.weblate.org/engage/overseerr/) for translations. If your language is not listed, please [open a feature request on GitHub](https://github.com/sct/overseerr/issues/new/choose).

### Where can I find the changelog?

You can find the changelog for your version (stable/`latest`,s or `develop`) in the **Settings &rarr; About** page in your Overseerr instance.

You can alternatively review the [stable release history](https://github.com/sct/overseerr/releases) and [`develop` branch commit history](https://github.com/sct/overseerr/commits/develop) on GitHub.

### Some media is missing from Overseerr that I know is in Plex!

Overseerr currently supports the following agents:

- New Plex Movie
- Legacy Plex Movie
- New Plex TV
- Legacy Plex TV
- TheTVDB
- TMDb
- [HAMA](https://github.com/ZeroQI/Hama.bundle)

Please verify that your library is using one of the agents previously listed.

When changing agents, a full metadata refresh of your Plex library is required. (Caution: This can take a long time depending on the size of your library.)

#### Troubleshooting Steps

First, check the Overseerr logs for media items that are missing. The logs will contain an error as to why that item could not be matched.

1. Verify that you are using one of the agents mentioned above.
2. Refresh the metadata for just that item.
3. Run a full scan in Overseerr to see if that item is now matched properly.
4. If the item is now seen by Overseerr then repeat step 2 for each missing item. If you have a large amount of items missing then a full metadata refresh is recommended for that library.
5. Run a full scan on Overseerr after refreshing all unmatched items.

You can also perform the following to verify the media item has a GUID Overseerr can match:

1. Go to the media item in Plex and **"Get info"** and click on **"View XML"**.
2. Verify that the media item's GUID follows one of the below formats:

   1. TMDb agent `guid="com.plexapp.agents.themoviedb://1705"`
   2. New Plex Movie agent `<Guid id="tmdb://464052"/>`
   3. TheTVDB agent `guid="com.plexapp.agents.thetvdb://78874/1/1"`
   4. Legacy Plex Movie agent `guid="com.plexapp.agents.imdb://tt0765446"`

### Where can I find the log files?

Please see [these instructions on how to locate and share your logs](./need-help.md#how-can-i-share-my-logs).

## Users

### Why can't I see all of my Plex users?

Please see the [documentation for importing users from Plex](../using-overseerr/users/README.md#importing-users-from-plex).

### Can I create local users in Overseerr?

Yes! Please see the [documentation for creating local users](../using-overseerr/users/README.md#creating-local-users).

### Is is possible to set user roles in Overseerr?

Permissions can be configured for each user via the **User List** or their **User Settings** page. The list of assignable permissions is still growing, so if you have any suggestions, [submit a feature request](https://github.com/sct/overseerr/issues/new/choose)!

## Requests

### I receive 409 or 400 errors when requesting a movie or TV series!

Verify you are running v3 of both Radarr and Sonarr. Overseerr is not backwards-compatible with previous versions.

### Can I allow users to submit 4K requests?

Yes! If you keep both non-4K and 4K content in your media libraries, you can link separate 4K Radarr/Sonarr servers to allow users to submit 4K requests. (You must configure default non-4K **and** default 4K Radarr/Sonarr servers.)

Please see the [Services documentation](../using-overseerr/settings/README.md#services) for details on how to configure your Radarr and/or Sonarr servers.

Note that users must also have the **Request 4K**, **Request 4K Movies**, and/or **Request 4K Series** permissions in order to submit requests for 4K content.

### I approved a requested movie and Radarr didn't search for it!

Check the minimum availability setting in your Radarr server. If a movie does not meet the minimum availability requirement, no search will be performed. Also verify that Radarr did not perform a search, by checking the Radarr logs. Lastly, verify that the item was not already being monitored by Radarr prior to approving the request.

### Help! My request still shows "requested" even though it is in Plex!

See "[Some media is missing from Overseerr that I know is in Plex!](#some-media-is-missing-from-overseerr-that-i-know-is-in-plex)" for troubleshooting steps.

### Series requests keep failing!

If you configured a URL base in Sonarr, make sure you have also configured the [URL Base](../using-overseerr/settings/README.md#url-base) setting for your Sonarr server in Overseerr.

Also, check that you are using Sonarr v3 and that you have configured a default language profile in Overseerr.

Language profile support for Sonarr was added in [v1.20.0](https://github.com/sct/overseerr/releases/tag/v1.20.0) along with a new, _required_ **Language Profile** setting. If series requests are failing, make sure that you have a default language profile configured for each of your Sonarr servers in **Settings &rarr; Services**.

## Notifications

### I am getting "Username and Password not accepted" when attempting to send email notifications via Gmail!

If you have 2-Step Verification enabled on your account, you will need to create an [app password](https://support.google.com/mail/answer/185833).
