import React from 'react';
import PermissionOption, { PermissionItem } from '../PermissionOption';
import { Permission, User } from '../../hooks/useUser';
import { useIntl, defineMessages } from 'react-intl';

export const messages = defineMessages({
  admin: 'Admin',
  adminDescription:
    'Full administrator access. Bypasses all other permission checks.',
  users: 'Manage Users',
  usersDescription:
    'Grants permission to manage Overseerr users. Users with this permission cannot modify users with or grant the Admin privilege.',
  settings: 'Manage Settings',
  settingsDescription:
    'Grants permission to modify all Overseerr settings. A user must have this permission to grant it to others.',
  managerequests: 'Manage Requests',
  managerequestsDescription:
    'Grants permission to manage Overseerr requests. This includes approving and denying requests. All requests made by a user with this permission will be automatically approved regardless of whether or not they have Auto-Approve permissions.',
  request: 'Request',
  requestDescription: 'Grants permission to request movies and series.',
  vote: 'Vote',
  voteDescription:
    'Grants permission to vote on requests (voting not yet implemented).',
  autoapprove: 'Auto-Approve',
  autoapproveDescription:
    'Grants automatic approval for all non-4K requests made by this user.',
  autoapproveMovies: 'Auto-Approve Movies',
  autoapproveMoviesDescription:
    'Grants automatic approval for non-4K movie requests made by this user.',
  autoapproveSeries: 'Auto-Approve Series',
  autoapproveSeriesDescription:
    'Grants automatic approval for non-4K series requests made by this user.',
  autoapprove4k: 'Auto-Approve 4K',
  autoapprove4kDescription:
    'Grants automatic approval for all 4K requests made by this user.',
  autoapprove4kMovies: 'Auto-Approve 4K Movies',
  autoapprove4kMoviesDescription:
    'Grants automatic approval for 4K movie requests made by this user.',
  autoapprove4kSeries: 'Auto-Approve 4K Series',
  autoapprove4kSeriesDescription:
    'Grants automatic approval for 4K series requests made by this user.',
  request4k: 'Request 4K',
  request4kDescription: 'Grants permission to request 4K movies and series.',
  request4kMovies: 'Request 4K Movies',
  request4kMoviesDescription: 'Grants permission to request 4K movies.',
  request4kTv: 'Request 4K Series',
  request4kTvDescription: 'Grants permission to request 4K Series.',
  advancedrequest: 'Advanced Requests',
  advancedrequestDescription:
    'Grants permission to use advanced request options (e.g., changing servers, profiles, or paths).',
  viewrequests: 'View Requests',
  viewrequestsDescription: "Grants permission to view other users' requests.",
});

interface PermissionEditProps {
  actingUser?: User;
  currentUser?: User;
  currentPermission: number;
  onUpdate: (newPermissions: number) => void;
}

export const PermissionEdit: React.FC<PermissionEditProps> = ({
  actingUser,
  currentUser,
  currentPermission,
  onUpdate,
}) => {
  const intl = useIntl();

  const permissionList: PermissionItem[] = [
    {
      id: 'admin',
      name: intl.formatMessage(messages.admin),
      description: intl.formatMessage(messages.adminDescription),
      permission: Permission.ADMIN,
    },
    {
      id: 'settings',
      name: intl.formatMessage(messages.settings),
      description: intl.formatMessage(messages.settingsDescription),
      permission: Permission.MANAGE_SETTINGS,
    },
    {
      id: 'users',
      name: intl.formatMessage(messages.users),
      description: intl.formatMessage(messages.usersDescription),
      permission: Permission.MANAGE_USERS,
    },
    {
      id: 'managerequest',
      name: intl.formatMessage(messages.managerequests),
      description: intl.formatMessage(messages.managerequestsDescription),
      permission: Permission.MANAGE_REQUESTS,
      children: [
        {
          id: 'advancedrequest',
          name: intl.formatMessage(messages.advancedrequest),
          description: intl.formatMessage(messages.advancedrequestDescription),
          permission: Permission.REQUEST_ADVANCED,
        },
        {
          id: 'viewrequests',
          name: intl.formatMessage(messages.viewrequests),
          description: intl.formatMessage(messages.viewrequestsDescription),
          permission: Permission.REQUEST_VIEW,
        },
      ],
    },
    {
      id: 'request',
      name: intl.formatMessage(messages.request),
      description: intl.formatMessage(messages.requestDescription),
      permission: Permission.REQUEST,
    },
    {
      id: 'request4k',
      name: intl.formatMessage(messages.request4k),
      description: intl.formatMessage(messages.request4kDescription),
      permission: Permission.REQUEST_4K,
      requires: [{ permissions: [Permission.REQUEST] }],
      children: [
        {
          id: 'request4k-movies',
          name: intl.formatMessage(messages.request4kMovies),
          description: intl.formatMessage(messages.request4kMoviesDescription),
          permission: Permission.REQUEST_4K_MOVIE,
          requires: [{ permissions: [Permission.REQUEST] }],
        },
        {
          id: 'request4k-tv',
          name: intl.formatMessage(messages.request4kTv),
          description: intl.formatMessage(messages.request4kTvDescription),
          permission: Permission.REQUEST_4K_TV,
          requires: [{ permissions: [Permission.REQUEST] }],
        },
      ],
    },
    {
      id: 'autoapprove',
      name: intl.formatMessage(messages.autoapprove),
      description: intl.formatMessage(messages.autoapproveDescription),
      permission: Permission.AUTO_APPROVE,
      requires: [{ permissions: [Permission.REQUEST] }],
      children: [
        {
          id: 'autoapprovemovies',
          name: intl.formatMessage(messages.autoapproveMovies),
          description: intl.formatMessage(
            messages.autoapproveMoviesDescription
          ),
          permission: Permission.AUTO_APPROVE_MOVIE,
          requires: [{ permissions: [Permission.REQUEST] }],
        },
        {
          id: 'autoapprovetv',
          name: intl.formatMessage(messages.autoapproveSeries),
          description: intl.formatMessage(
            messages.autoapproveSeriesDescription
          ),
          permission: Permission.AUTO_APPROVE_TV,
          requires: [{ permissions: [Permission.REQUEST] }],
        },
      ],
    },
    {
      id: 'autoapprove4k',
      name: intl.formatMessage(messages.autoapprove4k),
      description: intl.formatMessage(messages.autoapprove4kDescription),
      permission: Permission.AUTO_APPROVE_4K,
      requires: [
        {
          permissions: [Permission.REQUEST, Permission.REQUEST_4K],
          type: 'and',
        },
      ],
      children: [
        {
          id: 'autoapprove4k-movies',
          name: intl.formatMessage(messages.autoapprove4kMovies),
          description: intl.formatMessage(
            messages.autoapprove4kMoviesDescription
          ),
          permission: Permission.AUTO_APPROVE_4K_MOVIE,
          requires: [
            {
              permissions: [Permission.REQUEST],
            },
            {
              permissions: [Permission.REQUEST_4K, Permission.REQUEST_4K_MOVIE],
              type: 'or',
            },
          ],
        },
        {
          id: 'autoapprove4k-tv',
          name: intl.formatMessage(messages.autoapprove4kSeries),
          description: intl.formatMessage(
            messages.autoapprove4kSeriesDescription
          ),
          permission: Permission.AUTO_APPROVE_4K_TV,
          requires: [
            {
              permissions: [Permission.REQUEST],
            },
            {
              permissions: [Permission.REQUEST_4K, Permission.REQUEST_4K_TV],
              type: 'or',
            },
          ],
        },
      ],
    },
  ];

  return (
    <>
      {permissionList.map((permissionItem) => (
        <PermissionOption
          key={`permission-option-${permissionItem.id}`}
          option={permissionItem}
          actingUser={actingUser}
          currentUser={currentUser}
          currentPermission={currentPermission}
          onUpdate={(newPermission) => onUpdate(newPermission)}
        />
      ))}
    </>
  );
};

export default PermissionEdit;
