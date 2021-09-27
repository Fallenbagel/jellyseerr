import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Permission, User } from '../../hooks/useUser';
import PermissionOption, { PermissionItem } from '../PermissionOption';

export const messages = defineMessages({
  admin: 'Admin',
  adminDescription:
    'Full administrator access. Bypasses all other permission checks.',
  users: 'Manage Users',
  usersDescription:
    'Grant permission to manage Overseerr users. Users with this permission cannot modify users with or grant the Admin privilege.',
  settings: 'Manage Settings',
  settingsDescription:
    'Grant permission to modify Overseerr settings. A user must have this permission to grant it to others.',
  managerequests: 'Manage Requests',
  managerequestsDescription:
    'Grant permission to manage Overseerr requests. All requests made by a user with this permission will be automatically approved.',
  request: 'Request',
  requestDescription: 'Grant permission to request non-4K media.',
  requestMovies: 'Request Movies',
  requestMoviesDescription: 'Grant permission to request non-4K movies.',
  requestTv: 'Request Series',
  requestTvDescription: 'Grant permission to request non-4K series.',
  autoapprove: 'Auto-Approve',
  autoapproveDescription: 'Grant automatic approval for all non-4K requests.',
  autoapproveMovies: 'Auto-Approve Movies',
  autoapproveMoviesDescription:
    'Grant automatic approval for non-4K movie requests.',
  autoapproveSeries: 'Auto-Approve Series',
  autoapproveSeriesDescription:
    'Grant automatic approval for non-4K series requests.',
  autoapprove4k: 'Auto-Approve 4K',
  autoapprove4kDescription: 'Grant automatic approval for all 4K requests.',
  autoapprove4kMovies: 'Auto-Approve 4K Movies',
  autoapprove4kMoviesDescription:
    'Grant automatic approval for 4K movie requests.',
  autoapprove4kSeries: 'Auto-Approve 4K Series',
  autoapprove4kSeriesDescription:
    'Grant automatic approval for 4K series requests.',
  request4k: 'Request 4K',
  request4kDescription: 'Grant permission to request 4K media.',
  request4kMovies: 'Request 4K Movies',
  request4kMoviesDescription: 'Grant permission to request 4K movies.',
  request4kTv: 'Request 4K Series',
  request4kTvDescription: 'Grant permission to request 4K series.',
  advancedrequest: 'Advanced Requests',
  advancedrequestDescription:
    'Grant permission to use advanced request options.',
  viewrequests: 'View Requests',
  viewrequestsDescription: "Grant permission to view other users' requests.",
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
      children: [
        {
          id: 'request-movies',
          name: intl.formatMessage(messages.requestMovies),
          description: intl.formatMessage(messages.requestMoviesDescription),
          permission: Permission.REQUEST_MOVIE,
        },
        {
          id: 'request-tv',
          name: intl.formatMessage(messages.requestTv),
          description: intl.formatMessage(messages.requestTvDescription),
          permission: Permission.REQUEST_TV,
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
          requires: [
            {
              permissions: [Permission.REQUEST, Permission.REQUEST_MOVIE],
              type: 'or',
            },
          ],
        },
        {
          id: 'autoapprovetv',
          name: intl.formatMessage(messages.autoapproveSeries),
          description: intl.formatMessage(
            messages.autoapproveSeriesDescription
          ),
          permission: Permission.AUTO_APPROVE_TV,
          requires: [
            {
              permissions: [Permission.REQUEST, Permission.REQUEST_TV],
              type: 'or',
            },
          ],
        },
      ],
    },
    {
      id: 'request4k',
      name: intl.formatMessage(messages.request4k),
      description: intl.formatMessage(messages.request4kDescription),
      permission: Permission.REQUEST_4K,
      children: [
        {
          id: 'request4k-movies',
          name: intl.formatMessage(messages.request4kMovies),
          description: intl.formatMessage(messages.request4kMoviesDescription),
          permission: Permission.REQUEST_4K_MOVIE,
        },
        {
          id: 'request4k-tv',
          name: intl.formatMessage(messages.request4kTv),
          description: intl.formatMessage(messages.request4kTvDescription),
          permission: Permission.REQUEST_4K_TV,
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
          permissions: [Permission.REQUEST_4K],
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
