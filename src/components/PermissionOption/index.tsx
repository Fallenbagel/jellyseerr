import React from 'react';
import { hasPermission } from '../../../server/lib/permissions';
import { Permission, User } from '../../hooks/useUser';

export interface PermissionItem {
  id: string;
  name: string;
  description: string;
  permission: Permission;
  children?: PermissionItem[];
  requires?: PermissionRequirement[];
}

interface PermissionRequirement {
  permissions: Permission[];
  type?: 'and' | 'or';
}

interface PermissionOptionProps {
  option: PermissionItem;
  actingUser?: User;
  currentUser?: User;
  currentPermission: number;
  parent?: PermissionItem;
  onUpdate: (newPermissions: number) => void;
}

const PermissionOption: React.FC<PermissionOptionProps> = ({
  option,
  actingUser,
  currentUser,
  currentPermission,
  onUpdate,
  parent,
}) => {
  const autoApprovePermissions = [
    Permission.AUTO_APPROVE,
    Permission.AUTO_APPROVE_MOVIE,
    Permission.AUTO_APPROVE_TV,
    Permission.AUTO_APPROVE_4K,
    Permission.AUTO_APPROVE_4K_MOVIE,
    Permission.AUTO_APPROVE_4K_TV,
  ];

  return (
    <>
      <div
        className={`relative flex items-start first:mt-0 mt-4 ${
          (currentUser && currentUser.id === 1) ||
          (option.permission !== Permission.ADMIN &&
            hasPermission(Permission.ADMIN, currentPermission)) ||
          (autoApprovePermissions.includes(option.permission) &&
            hasPermission(Permission.MANAGE_REQUESTS, currentPermission)) ||
          (!!parent?.permission &&
            hasPermission(parent.permission, currentPermission)) ||
          (actingUser &&
            !hasPermission(Permission.ADMIN, actingUser.permissions) &&
            option.permission === Permission.ADMIN) ||
          (actingUser &&
            !hasPermission(
              Permission.MANAGE_SETTINGS,
              actingUser.permissions
            ) &&
            option.permission === Permission.MANAGE_SETTINGS) ||
          (option.requires &&
            !option.requires.every((requirement) =>
              hasPermission(requirement.permissions, currentPermission, {
                type: requirement.type ?? 'and',
              })
            ))
            ? 'opacity-50'
            : ''
        }`}
      >
        <div className="flex items-center h-6">
          <input
            id={option.id}
            name="permissions"
            type="checkbox"
            disabled={
              (currentUser && currentUser.id === 1) ||
              (option.permission !== Permission.ADMIN &&
                hasPermission(Permission.ADMIN, currentPermission)) ||
              (autoApprovePermissions.includes(option.permission) &&
                hasPermission(Permission.MANAGE_REQUESTS, currentPermission)) ||
              (!!parent?.permission &&
                hasPermission(parent.permission, currentPermission)) ||
              (actingUser &&
                !hasPermission(Permission.ADMIN, actingUser.permissions) &&
                option.permission === Permission.ADMIN) ||
              (actingUser &&
                !hasPermission(
                  Permission.MANAGE_SETTINGS,
                  actingUser.permissions
                ) &&
                option.permission === Permission.MANAGE_SETTINGS) ||
              (option.requires &&
                !option.requires.every((requirement) =>
                  hasPermission(requirement.permissions, currentPermission, {
                    type: requirement.type ?? 'and',
                  })
                ))
            }
            onChange={() => {
              onUpdate(
                hasPermission(option.permission, currentPermission)
                  ? currentPermission - option.permission
                  : currentPermission + option.permission
              );
            }}
            checked={
              (hasPermission(option.permission, currentPermission) ||
                (!!parent?.permission &&
                  hasPermission(parent.permission, currentPermission)) ||
                (autoApprovePermissions.includes(option.permission) &&
                  hasPermission(
                    Permission.MANAGE_REQUESTS,
                    currentPermission
                  ))) &&
              (!option.requires ||
                option.requires.every((requirement) =>
                  hasPermission(requirement.permissions, currentPermission, {
                    type: requirement.type ?? 'and',
                  })
                ))
            }
          />
        </div>
        <div className="ml-3 text-sm leading-6">
          <label htmlFor={option.id} className="block font-medium">
            <div className="flex flex-col">
              <span>{option.name}</span>
              <span className="text-gray-500">{option.description}</span>
            </div>
          </label>
        </div>
      </div>
      {(option.children ?? []).map((child) => (
        <div key={`permission-child-${child.id}`} className="pl-10 mt-4">
          <PermissionOption
            option={child}
            currentPermission={currentPermission}
            onUpdate={(newPermission) => onUpdate(newPermission)}
            parent={option}
          />
        </div>
      ))}
    </>
  );
};

export default PermissionOption;
