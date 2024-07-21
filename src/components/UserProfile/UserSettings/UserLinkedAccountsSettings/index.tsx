import JellyfinLogo from '@app/assets/services/jellyfin-icon.svg';
import PlexLogo from '@app/assets/services/plex.svg';
import Alert from '@app/components/Common/Alert';
import ConfirmButton from '@app/components/Common/ConfirmButton';
import Dropdown from '@app/components/Common/Dropdown';
import PageTitle from '@app/components/Common/PageTitle';
import useSettings from '@app/hooks/useSettings';
import { Permission, useUser } from '@app/hooks/useUser';
import globalMessages from '@app/i18n/globalMessages';
import { RequestError } from '@app/types/error';
import defineMessages from '@app/utils/defineMessages';
import PlexOAuth from '@app/utils/plex';
import { TrashIcon } from '@heroicons/react/24/solid';
import { MediaServerType } from '@server/constants/server';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import LinkJellyfinModal from './LinkJellyfinModal';

const messages = defineMessages(
  'components.UserProfile.UserSettings.UserLinkedAccountsSettings',
  {
    linkedAccounts: 'Linked Accounts',
    linkedAccountsHint:
      'These external accounts are linked to your Jellyseerr account.',
    noLinkedAccounts:
      'You do not have any external accounts linked to your account.',
    noPermissionDescription:
      "You do not have permission to modify this user's linked accounts.",
    plexErrorUnauthorized: 'Unable to connect to Plex using your credentials',
    plexErrorExists: 'This account is already linked to a Plex user',
    errorUnknown: 'An unknown error occurred',
    deleteFailed: 'Unable to delete linked account.',
  }
);

const plexOAuth = new PlexOAuth();

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
  const settings = useSettings();
  const router = useRouter();
  const { user: currentUser } = useUser();
  const {
    user,
    hasPermission,
    revalidate: revalidateUser,
  } = useUser({ id: Number(router.query.userId) });
  const [showJellyfinModal, setShowJellyfinModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accounts: LinkedAccount[] = [
    ...(user?.plexUsername
      ? [{ type: LinkedAccountType.Plex, username: user?.plexUsername }]
      : []),
    ...(user?.jellyfinUsername
      ? [{ type: LinkedAccountType.Jellyfin, username: user?.jellyfinUsername }]
      : []),
  ];

  const linkPlexAccount = async () => {
    setError(null);
    try {
      const authToken = await plexOAuth.login();
      const res = await fetch(
        `/api/v1/user/${user?.id}/settings/linked-accounts/plex`,
        {
          method: 'POST',
          body: JSON.stringify({ authToken }),
        }
      );
      if (!res.ok) {
        throw new RequestError(res);
      }

      await revalidateUser();
    } catch (e) {
      if (e instanceof RequestError && e.status == 401) {
        setError(intl.formatMessage(messages.plexErrorUnauthorized));
      } else if (e instanceof RequestError && e.status == 422) {
        setError(intl.formatMessage(messages.plexErrorExists));
      } else {
        setError(intl.formatMessage(messages.errorServer));
      }
    }
  };

  const linkable = [
    {
      name: 'Plex',
      action: () => {
        plexOAuth.preparePopup();
        setTimeout(() => linkPlexAccount(), 1500);
      },
      hide:
        settings.currentSettings.mediaServerType != MediaServerType.PLEX ||
        accounts.some((a) => a.type == LinkedAccountType.Plex),
    },
    {
      name: 'Jellyfin',
      action: () => setShowJellyfinModal(true),
      hide:
        settings.currentSettings.mediaServerType != MediaServerType.JELLYFIN ||
        accounts.some((a) => a.type == LinkedAccountType.Jellyfin),
    },
  ].filter((l) => !l.hide);

  const deleteRequest = async (account: string) => {
    try {
      const res = await fetch(
        `/api/v1/user/${user?.id}/settings/linked-accounts/${account}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error();
    } catch {
      setError(intl.formatMessage(messages.deleteFailed));
    }

    await revalidateUser();
  };

  if (
    currentUser?.id !== user?.id &&
    hasPermission(Permission.ADMIN) &&
    currentUser?.id !== 1
  ) {
    return (
      <>
        <div className="mb-6">
          <h3 className="heading">
            {intl.formatMessage(messages.linkedAccounts)}
          </h3>
        </div>
        <Alert
          title={intl.formatMessage(messages.nopermissionDescription)}
          type="error"
        />
      </>
    );
  }

  return (
    <>
      <PageTitle
        title={[
          intl.formatMessage(messages.linkedAccounts),
          intl.formatMessage(globalMessages.usersettings),
          user?.displayName,
        ]}
      />
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h3 className="heading">
            {intl.formatMessage(messages.linkedAccounts)}
          </h3>
          <h6 className="description">
            {intl.formatMessage(messages.linkedAccountsHint)}
          </h6>
        </div>
        {currentUser?.id == user?.id && !!linkable.length && (
          <div>
            <Dropdown text="Link Account" buttonType="ghost">
              {linkable.map(({ name, action }) => (
                <Dropdown.Item key={name} onClick={action}>
                  {name}
                </Dropdown.Item>
              ))}
            </Dropdown>
          </div>
        )}
      </div>
      {error && (
        <Alert title={intl.formatMessage(globalMessages.failed)} type="error">
          {error}
        </Alert>
      )}
      {accounts.length ? (
        <ul className="space-y-4">
          {accounts.map((acct, i) => (
            <li
              key={i}
              className="flex items-center gap-4 overflow-hidden rounded-lg bg-gray-800 bg-opacity-50 px-4 py-5 shadow ring-1 ring-gray-700 sm:p-6"
            >
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
              <div className="flex-grow" />
              <ConfirmButton
                onClick={() => {
                  deleteRequest(
                    acct.type == LinkedAccountType.Plex ? 'plex' : 'jellyfin'
                  );
                }}
                confirmText={intl.formatMessage(globalMessages.areyousure)}
              >
                <TrashIcon />
                <span>{intl.formatMessage(globalMessages.delete)}</span>
              </ConfirmButton>
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

      <LinkJellyfinModal
        show={showJellyfinModal}
        onClose={() => setShowJellyfinModal(false)}
        onSave={() => {
          setShowJellyfinModal(false);
          revalidateUser();
        }}
      />
    </>
  );
};

export default UserLinkedAccountsSettings;
