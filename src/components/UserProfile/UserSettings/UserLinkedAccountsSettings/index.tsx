import JellyfinLogo from '@app/assets/services/jellyfin-icon.svg';
import PlexLogo from '@app/assets/services/plex.svg';
import PageTitle from '@app/components/Common/PageTitle';
import { useUser } from '@app/hooks/useUser';
import globalMessages from '@app/i18n/globalMessages';
import defineMessages from '@app/utils/defineMessages';
import { useIntl } from 'react-intl';

const messages = defineMessages(
  'components.UserProfile.UserSettings.UserLinkedAccountsSettings',
  {
    linkedAccounts: 'Linked Accounts',
    linkedAccountsHint:
      'These external accounts are linked to your Jellyseerr account.',
    noLinkedAccounts:
      'You do not have any external accounts linked to your account.',
  }
);

const enum LinkedAccountType {
  Plex,
  Jellyfin,
}

type LinkedAccount = {
  type: LinkedAccountType;
  username: string;
};

const UserLinkedAccountsSettings = () => {
  const intl = useIntl();
  const { user } = useUser();

  const accounts: LinkedAccount[] = [
    ...(user?.plexUsername
      ? [{ type: LinkedAccountType.Plex, username: user?.plexUsername }]
      : []),
    ...(user?.jellyfinUsername
      ? [{ type: LinkedAccountType.Jellyfin, username: user?.jellyfinUsername }]
      : []),
  ];

  return (
    <>
      <PageTitle
        title={[
          intl.formatMessage(messages.linkedAccounts),
          intl.formatMessage(globalMessages.usersettings),
          user?.displayName,
        ]}
      />
      <div className="mb-6">
        <h3 className="heading">
          {intl.formatMessage(messages.linkedAccounts)}
        </h3>
        <h6 className="description">
          {intl.formatMessage(messages.linkedAccountsHint)}
        </h6>
      </div>
      {accounts.length ? (
        <ul className="space-y-4">
          {accounts.map((acct) => (
            <li className="flex items-center gap-4 overflow-hidden rounded-lg bg-gray-800 bg-opacity-50 px-4 py-5 shadow ring-1 ring-gray-700 sm:p-6">
              <div className="w-12">
                {acct.type == LinkedAccountType.Plex ? (
                  <div className="flex aspect-square h-full items-center justify-center rounded-full bg-neutral-800">
                    <PlexLogo className="w-9" />
                  </div>
                ) : (
                  <JellyfinLogo />
                )}
              </div>
              <div>
                <div className="truncate text-sm font-bold text-gray-300">
                  {acct.type == LinkedAccountType.Plex ? 'Plex' : 'Jellyfin'}
                </div>
                <div className="text-xl font-semibold text-white">
                  {acct.username}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4 text-center md:py-12">
          <h3 className="text-lg font-semibold text-gray-400">
            {intl.formatMessage(messages.noLinkedAccounts)}
          </h3>
        </div>
      )}
    </>
  );
};

export default UserLinkedAccountsSettings;
