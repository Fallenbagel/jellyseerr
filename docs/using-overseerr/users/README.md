# Users

## Owner Account

The user account created during Overseerr setup is the "Owner" account, which cannot be deleted or modified by other users. This account's credentials are used to authenticate with Plex.

## Adding Users

There are currently two methods to add users to Overseerr: importing Plex users and creating "local users." All new users are created with the [default permissions](../settings/README.md#default-permissions) defined in **Settings &rarr; Users**.

### Importing Plex Users

Clicking the **Import Plex Users** button on the **User List** page will fetch the list of users with access to the Plex server from [plex.tv](https://www.plex.tv/), and add them to Overseerr automatically.

Importing Plex users is not required, however. Any user with access to the Plex server can log in to Overseerr even if they have not been imported, and will be assigned the configured [default permissions](../settings/README.md#default-permissions) upon their first login.

### Creating Local Users

If you would like to grant Overseerr access to a user who doesn't have their own Plex account and/or access to the Plex server, you can manually add them by clicking the **Create Local User** button.

#### Email Address

Enter a valid email address at which the user can receive messages pertaining to their account and other notifications. The email address currently cannot be modified after the account is created.

#### Automatically Generate Password

If an [application URL](../settings/README.md#application-url) is set and [email notifications](../notifications/email.md) have been configured and enabled, Overseerr can automatically generate a password for the new user.

#### Password

If you would prefer to manually configure a password, enter a password here that is a minimum of 8 characters.

## Editing Users

From the **User List**, you can click the **Edit** button to modify a particular user's settings.

You can also click the check boxes and click the **Bulk Edit** button to set user permissions for multiple users at once.

### General

#### Display Name

You can optionally set a "friendly name" for any user. This name will be used in lieu of their Plex username (for users imported from Plex) or their email address (for manually-created local users).

#### Display Language

Users can override the [global display language](../settings/README.md#display-language) to use Overseerr in their preferred language.

#### Discover Region & Discover Language

Users can override the [global filter settings](../settings/README.md#discover-region-and-discover-language) to suit their own preferences.

#### Movie Request Limit & Series Request Limit

You can override the default settings and assign different request limits for specific users by checking the **Enable Override** box and selecting the desired request limit and time period.

Unless an override is configured, users are granted the global request limits.

Note that users with the **Manage Users** permission are exempt from request limits, since that permission also grants the ability to submit requests on behalf of other users.

Users are also unable to modify their own request limits.

### Password

All "local users" are assigned passwords upon creation, but users imported from Plex can also optionally configure passwords to enable sign-in using their email address.

Passwords must be a minimum of 8 characters long.

### Notifications

Users can configure their personal notification settings here. Please see [Notifications](../notifications/README.md) for details on configuring and enabling notifications.

### Permissions

Users cannot modify their own permissions. Users with the **Manage Users** permission can manage permissions of other users, except those of users with the **Admin** permission.

## Deleting Users

When users are deleted, all of their data and request history is also cleared from the database.
