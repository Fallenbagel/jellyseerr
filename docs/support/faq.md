# Frequently Asked Questions (FAQ)

{% hint style="info" %}
If you can't find a solution here, please ask on [Discord](https://discord.gg/PkCWJSeCk7). Please do not post questions on the GitHub issues tracker.
{% endhint %}

## General

### I receive 409 or 400 errors when requesting a movie or TV series!

**A:** Verify you are running Radarr and Sonarr v3. Overseerr was developed for v3 and is not currently backwards-compatible with previous versions.

### How do I keep Overseerr up-to-date?

**A:** Use a 3rd party updating mechanism such as [Watchtower](https://github.com/containrrr/watchtower) or [Ouroboros](https://github.com/pyouroboros/ouroboros) to keep Overseerr up-to-date automatically.

### How can I access Overseerr outside my home network?

**A:** The easy and least secure method is to forward an external port \(`5055`\) on your router to the internal port used by Overseerr \(default is TCP `5055`\). Visit [Port Forward](http://portforward.com/) for instructions for your particular router. You will then be able to access Overseerr via `http://EXTERNAL-IP-ADDRESS:5055`.

The more advanced and most preferred method \(and more secure if you use SSL\) is to set up a web server with NGINX/Apache, and use a reverse proxy to access Overseerr. You can lookup many guides on the internet to find out how to do this. There are several reverse proxy config examples located [here](../extending-overseerr/reverse-proxy-examples.md).

The most secure method, but also the most inconvenient, is to set up a VPN tunnel to your home server, then you can access Overseerr as if it is on a local network via `http://LOCAL-IP-ADDRESS:5055`.

### Overseerr is amazing! But it is not translated in my language yet! Can I help with translations?

**A:** You sure can! We are using [Weblate](https://hosted.weblate.org/engage/overseerr/) for translations. If your language is not listed, please [open a feature request on GitHub](https://github.com/sct/overseerr/issues/new/choose).

### Where can I find the changelog?

**A:** You can find the changelog in the **Settings &rarr; About** page in your Overseerr instance. You can also find it on [GitHub](https://github.com/sct/overseerr/releases).

### Can I make 4K requests?

**A:** Yes! When adding your 4K Sonarr/Radarr server in **Settings &rarr; Services**, tick the `4K Server` checkbox. You also need to tick the `Default Server` checkbox if it is the default server you would like to use for 4K content requests. (To enable 4K requests, there need to be default Sonarr/Radarr servers for both 4K content **and** non-4K content.)

### Some media is missing from Overseerr that I know is in Plex!

**A:** Overseerr supports the new Plex Movie, legacy Plex Movie, TheTVDB, and TMDb agents. Please verify that your library is using one of the agents previously listed. If you are changing agents, a full metadata refresh will need to be performed. Caution, this can take a long time depending on how many items you have in your movie library.

**Troubleshooting Steps:**

First, check the Overseerr logs for media items that are missing. The logs will contain an error as to why that item could not be matched. One example might be `errorMessage":"SQLITE_CONSTRAINT: NOT NULL`. This means that the TMDb ID is missing from the Plex XML for that item.

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

### TV series requests are failing after I updated Overseerr!

**A:** Language profile support for Sonarr was added in [#860](https://github.com/sct/overseerr/pull/860), along with a new "Language Profile" required setting. If your TV series requests are failing, please make sure that you have a default language profile configured for each of your Sonarr servers in **Settings &rarr; Services**.

### Where can I find the logs?

**A:** The logs are located at `<Overseeerr-install-directory>/logs/overseerr.log`

## User management

### Why can't I see all my Plex users?

**A:** Navigate to your **User List** in Overseerr and click **Import Users from Plex** button. Don't forget to check the default user permissions in the **Settings &rarr; General Settings** page beforehand.

### Can I create local users in Overseerr?

**A:** Head to the **Users** page and hit **Create Local User**. Keep in mind that local user accounts need a valid email address.

### Is is possible to set user roles in Overseerr?

**A:** User roles can be set for each user on the **Users** page. The list of assignable permissions is one that is still growing, so if you have any suggestions, [make a feature request](https://github.com/sct/overseerr/issues/new/choose) on GitHub.

## Requests

### I approved a requested movie and Radarr didn't search for it!

**A:** Check the minimum availability setting in your Radarr server. If a movie does not meet the minimum availability requirement, no search will be performed. Also verify that Radarr did not perform a search, by checking the Radarr logs. Lastly, verify that the item was not already being monitored by Radarr prior to approving the request.

### Help! My request still shows "requested" even though it is in Plex!

**A:** See "[Some media is missing from Overseerr that I know is in Plex!](./faq.md#some-media-is-missing-from-overseerr-that-i-know-is-in-plex)" for troubleshooting steps.

## Notifications

### I am getting "Username and Password not accepted" when attempting to send email notifications via Gmail!

**A:** If you have 2-Step Verification enabled on your account, you will need to create an [app password](https://support.google.com/mail/answer/185833).
