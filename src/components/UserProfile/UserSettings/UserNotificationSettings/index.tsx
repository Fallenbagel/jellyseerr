import { CloudIcon, MailIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import useSWR from 'swr';
import { UserSettingsNotificationsResponse } from '../../../../../server/interfaces/api/userSettingsInterfaces';
import DiscordLogo from '../../../../assets/extlogos/discord.svg';
import PushbulletLogo from '../../../../assets/extlogos/pushbullet.svg';
import PushoverLogo from '../../../../assets/extlogos/pushover.svg';
import TelegramLogo from '../../../../assets/extlogos/telegram.svg';
import { useUser } from '../../../../hooks/useUser';
import globalMessages from '../../../../i18n/globalMessages';
import Error from '../../../../pages/_error';
import LoadingSpinner from '../../../Common/LoadingSpinner';
import PageTitle from '../../../Common/PageTitle';
import SettingsTabs, { SettingsRoute } from '../../../Common/SettingsTabs';

const messages = defineMessages({
  notifications: 'Notifications',
  notificationsettings: 'Notification Settings',
  email: 'Email',
  webpush: 'Web Push',
});

const UserNotificationSettings: React.FC = ({ children }) => {
  const intl = useIntl();
  const router = useRouter();
  const { user } = useUser({ id: Number(router.query.userId) });
  const { data, error } = useSWR<UserSettingsNotificationsResponse>(
    user ? `/api/v1/user/${user?.id}/settings/notifications` : null
  );

  const settingsRoutes: SettingsRoute[] = [
    {
      text: intl.formatMessage(messages.email),
      content: (
        <span className="flex items-center">
          <MailIcon className="mr-2 h-4" />
          {intl.formatMessage(messages.email)}
        </span>
      ),
      route: '/settings/notifications/email',
      regex: /\/settings\/notifications\/email/,
      hidden: !data?.emailEnabled,
    },
    {
      text: intl.formatMessage(messages.webpush),
      content: (
        <span className="flex items-center">
          <CloudIcon className="mr-2 h-4" />
          {intl.formatMessage(messages.webpush)}
        </span>
      ),
      route: '/settings/notifications/webpush',
      regex: /\/settings\/notifications\/webpush/,
      hidden: !data?.webPushEnabled,
    },
    {
      text: 'Discord',
      content: (
        <span className="flex items-center">
          <DiscordLogo className="mr-2 h-4" />
          Discord
        </span>
      ),
      route: '/settings/notifications/discord',
      regex: /\/settings\/notifications\/discord/,
      hidden: !data?.discordEnabled,
    },
    {
      text: 'Pushbullet',
      content: (
        <span className="flex items-center">
          <PushbulletLogo className="mr-2 h-4" />
          Pushbullet
        </span>
      ),
      route: '/settings/notifications/pushbullet',
      regex: /\/settings\/notifications\/pushbullet/,
    },
    {
      text: 'Pushover',
      content: (
        <span className="flex items-center">
          <PushoverLogo className="mr-2 h-4" />
          Pushover
        </span>
      ),
      route: '/settings/notifications/pushover',
      regex: /\/settings\/notifications\/pushover/,
    },
    {
      text: 'Telegram',
      content: (
        <span className="flex items-center">
          <TelegramLogo className="mr-2 h-4" />
          Telegram
        </span>
      ),
      route: '/settings/notifications/telegram',
      regex: /\/settings\/notifications\/telegram/,
      hidden: !data?.telegramEnabled || !data?.telegramBotUsername,
    },
  ];

  settingsRoutes.forEach((settingsRoute) => {
    settingsRoute.route = router.asPath.includes('/profile')
      ? `/profile${settingsRoute.route}`
      : `/users/${user?.id}${settingsRoute.route}`;
  });

  if (!data && !error) {
    return <LoadingSpinner />;
  }

  if (!data) {
    return <Error statusCode={500} />;
  }

  return (
    <>
      <PageTitle
        title={[
          intl.formatMessage(messages.notifications),
          intl.formatMessage(globalMessages.usersettings),
          user?.displayName,
        ]}
      />
      <div className="mb-6">
        <h3 className="heading">
          {intl.formatMessage(messages.notificationsettings)}
        </h3>
      </div>
      <SettingsTabs tabType="button" settingsRoutes={settingsRoutes} />
      <div className="section">{children}</div>
    </>
  );
};

export default UserNotificationSettings;
