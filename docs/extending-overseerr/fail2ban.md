# Fail2ban Filter

{% hint style="warning" %}
If you are running Overseerr behind a reverse proxy, make sure that the **Enable Proxy Support** setting is **enabled**.
{% endhint %}

To use Fail2ban with Overseerr, create a new file named `overseerr.local` in your Fail2ban `filter.d` directory with the following filter definition:

```
[Definition]
failregex = .*\[warn\]\[API\]\: Failed sign-in attempt.*"ip":"<HOST>"
```

You can then add a jail using this filter in `jail.local`. Please see the [Fail2ban documentation](https://www.fail2ban.org/wiki/index.php/MANUAL_0_8#Jails) for details on how to configure the jail.
