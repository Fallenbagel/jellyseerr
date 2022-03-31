# Notifications

Overseerr already supports a good number of notification agents, such as **Discord**, **Slack** and **Pushover**. New agents are always considered for development, if there is enough demand for it.

## Currently Supported Notification Agents

- Discord
- Email
- Pushbullet
- Pushover
- Slack
- Telegram
- [Webhooks](./webhooks.md)

## Setting Up Notifications

Configuring your notifications is _very simple_. First, you will need to visit the **Settings** page and click **Notifications** in the menu. This will present you with all of the currently available notification agents. Click on each one individually to configure them.

You must configure which type of notifications you want to send _per agent_. If no types are selected, you will not receive notifications!

Some agents may have specific configuration "gotchas" covered in their documentation pages.

{% hint style="danger" %}
You will **not receive notifications** for any automatically approved requests unless the "Enable Notifications for Automatic Approvals" setting is enabled.
{% endhint %}

## Requesting New Notification Agents

If we do not currently support a notification agent you would like, feel free to request it on [GitHub](https://github.com/sct/overseerr/issues). However, please be sure to search first and confirm that there is not already an existing request for the agent!
