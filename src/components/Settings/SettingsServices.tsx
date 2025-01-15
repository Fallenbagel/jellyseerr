import LidarrLogo from '@app/assets/services/lidarr.svg';
import RadarrLogo from '@app/assets/services/radarr.svg';
import SonarrLogo from '@app/assets/services/sonarr.svg';
import Alert from '@app/components/Common/Alert';
import Badge from '@app/components/Common/Badge';
import Button from '@app/components/Common/Button';
import LoadingSpinner from '@app/components/Common/LoadingSpinner';
import Modal from '@app/components/Common/Modal';
import PageTitle from '@app/components/Common/PageTitle';
import LidarrModal from '@app/components/Settings/LidarrModal';
import OverrideRuleModal from '@app/components/Settings/OverrideRule/OverrideRuleModal';
import RadarrModal from '@app/components/Settings/RadarrModal';
import SonarrModal from '@app/components/Settings/SonarrModal';
import globalMessages from '@app/i18n/globalMessages';
import defineMessages from '@app/utils/defineMessages';
import { Transition } from '@headlessui/react';
import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/solid';
import type OverrideRule from '@server/entity/OverrideRule';
import type {
  LidarrSettings,
  RadarrSettings,
  SonarrSettings,
} from '@server/lib/settings';
import { Fragment, useState } from 'react';
import { useIntl } from 'react-intl';
import useSWR, { mutate } from 'swr';

const messages = defineMessages('components.Settings', {
  services: 'Services',
  radarrsettings: 'Radarr Settings',
  sonarrsettings: 'Sonarr Settings',
  lidarrsettings: 'Lidarr Settings',
  videoServiceSettingsDescription:
    'Configure your {serverType} server(s) below. You can connect multiple {serverType} servers, but only two of them can be marked as defaults (one non-4K and one 4K). Administrators are able to override the server used to process new requests prior to approval.',
  musicServiceSettingsDescription:
    'Configure your {serverType} server(s) below. You can connect multiple {serverType} servers, but only one of them can be marked as default. Administrators are able to override the server used to process new requests prior to approval.',
  deleteserverconfirm: 'Are you sure you want to delete this server?',
  ssl: 'SSL',
  default: 'Default',
  default4k: 'Default 4K',
  is4k: '4K',
  address: 'Address',
  activeProfile: 'Active Profile',
  addradarr: 'Add Radarr Server',
  addsonarr: 'Add Sonarr Server',
  addlidarr: 'Add Lidarr Server',
  noDefaultServer:
    'At least one {serverType} server must be marked as default in order for {mediaType} requests to be processed.',
  noDefaultNon4kServer:
    'If you only have a single {serverType} server for both non-4K and 4K content (or if you only download 4K content), your {serverType} server should <strong>NOT</strong> be designated as a 4K server.',
  noDefault4kServer:
    'A 4K {serverType} server must be marked as default in order to enable users to submit 4K {mediaType} requests.',
  mediaTypeMovie: 'movie',
  mediaTypeSeries: 'series',
  mediaTypeMusic: 'music',
  deleteServer: 'Delete {serverType} Server',
});

interface ServerInstanceProps {
  name: string;
  isDefault?: boolean;
  is4k?: boolean;
  hostname: string;
  port: number;
  isSSL?: boolean;
  externalUrl?: string;
  profileName: string;
  isSonarr?: boolean;
  isLidarr?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export interface DVRTestResponse {
  profiles: {
    id: number;
    name: string;
  }[];
  rootFolders: {
    id: number;
    path: string;
  }[];
  tags: {
    id: number;
    label: string;
  }[];
  urlBase?: string;
}

export type RadarrTestResponse = DVRTestResponse;

export type SonarrTestResponse = DVRTestResponse & {
  languageProfiles:
    | {
        id: number;
        name: string;
      }[]
    | null;
};

const ServerInstance = ({
  name,
  hostname,
  port,
  profileName,
  is4k = false,
  isDefault = false,
  isSSL = false,
  isSonarr = false,
  isLidarr = false,
  externalUrl,
  onEdit,
  onDelete,
}: ServerInstanceProps) => {
  const intl = useIntl();

  const internalUrl =
    (isSSL ? 'https://' : 'http://') + hostname + ':' + String(port);
  const serviceUrl = externalUrl ?? internalUrl;

  return (
    <li className="col-span-1 rounded-lg bg-gray-800 shadow ring-1 ring-gray-500">
      <div className="flex w-full items-center justify-between space-x-6 p-6">
        <div className="flex-1 truncate">
          <div className="mb-2 flex items-center space-x-2">
            <h3 className="truncate font-medium leading-5 text-white">
              <a
                href={serviceUrl}
                className="transition duration-300 hover:text-white hover:underline"
              >
                {name}
              </a>
            </h3>
            {isDefault && !is4k && (
              <Badge>{intl.formatMessage(messages.default)}</Badge>
            )}
            {isDefault && is4k && (
              <Badge>{intl.formatMessage(messages.default4k)}</Badge>
            )}
            {!isDefault && is4k && (
              <Badge badgeType="warning">
                {intl.formatMessage(messages.is4k)}
              </Badge>
            )}
            {isSSL && (
              <Badge badgeType="success">
                {intl.formatMessage(messages.ssl)}
              </Badge>
            )}
          </div>
          <p className="mt-1 truncate text-sm leading-5 text-gray-300">
            <span className="mr-2 font-bold">
              {intl.formatMessage(messages.address)}
            </span>
            <a
              href={internalUrl}
              className="transition duration-300 hover:text-white hover:underline"
            >
              {internalUrl}
            </a>
          </p>
          <p className="mt-1 truncate text-sm leading-5 text-gray-300">
            <span className="mr-2 font-bold">
              {intl.formatMessage(messages.activeProfile)}
            </span>
            {profileName}
          </p>
        </div>
        <a href={serviceUrl} className="opacity-50 hover:opacity-100">
          {isSonarr ? (
            <SonarrLogo className="h-10 w-10 flex-shrink-0" />
          ) : isLidarr ? (
            <LidarrLogo className="h-10 w-10 flex-shrink-0" />
          ) : (
            <RadarrLogo className="h-10 w-10 flex-shrink-0" />
          )}
        </a>
      </div>
      <div className="border-t border-gray-500">
        <div className="-mt-px flex">
          <div className="flex w-0 flex-1 border-r border-gray-500">
            <button
              onClick={() => onEdit()}
              className="focus:ring-blue relative -mr-px inline-flex w-0 flex-1 items-center justify-center rounded-bl-lg border border-transparent py-4 text-sm font-medium leading-5 text-gray-200 transition duration-150 ease-in-out hover:text-white focus:z-10 focus:border-gray-500 focus:outline-none"
            >
              <PencilIcon className="mr-2 h-5 w-5" />
              <span>{intl.formatMessage(globalMessages.edit)}</span>
            </button>
          </div>
          <div className="-ml-px flex w-0 flex-1">
            <button
              onClick={() => onDelete()}
              className="focus:ring-blue relative inline-flex w-0 flex-1 items-center justify-center rounded-br-lg border border-transparent py-4 text-sm font-medium leading-5 text-gray-200 transition duration-150 ease-in-out hover:text-white focus:z-10 focus:border-gray-500 focus:outline-none"
            >
              <TrashIcon className="mr-2 h-5 w-5" />
              <span>{intl.formatMessage(globalMessages.delete)}</span>
            </button>
          </div>
        </div>
      </div>
    </li>
  );
};

const SettingsServices = () => {
  const intl = useIntl();
  const {
    data: radarrData,
    error: radarrError,
    mutate: revalidateRadarr,
  } = useSWR<RadarrSettings[]>('/api/v1/settings/radarr');
  const {
    data: sonarrData,
    error: sonarrError,
    mutate: revalidateSonarr,
  } = useSWR<SonarrSettings[]>('/api/v1/settings/sonarr');
  const {
    data: lidarrData,
    error: lidarrError,
    mutate: revalidateLidarr,
  } = useSWR<LidarrSettings[]>('/api/v1/settings/lidarr');
  const [editRadarrModal, setEditRadarrModal] = useState<{
    open: boolean;
    radarr: RadarrSettings | null;
  }>({
    open: false,
    radarr: null,
  });
  const [editSonarrModal, setEditSonarrModal] = useState<{
    open: boolean;
    sonarr: SonarrSettings | null;
  }>({
    open: false,
    sonarr: null,
  });
  const [editLidarrModal, setEditLidarrModal] = useState<{
    open: boolean;
    lidarr: LidarrSettings | null;
  }>({
    open: false,
    lidarr: null,
  });
  const [deleteServerModal, setDeleteServerModal] = useState<{
    open: boolean;
    type: 'radarr' | 'sonarr' | 'lidarr';
    serverId: number | null;
  }>({
    open: false,
    type: 'radarr',
    serverId: null,
  });
  const [overrideRuleModal, setOverrideRuleModal] = useState<{
    open: boolean;
    rule: OverrideRule | null;
    testResponse: DVRTestResponse | null;
  }>({
    open: false,
    rule: null,
    testResponse: null,
  });

  const deleteServer = async () => {
    const res = await fetch(
      `/api/v1/settings/${deleteServerModal.type}/${deleteServerModal.serverId}`,
      {
        method: 'DELETE',
      }
    );
    if (!res.ok) throw new Error();

    setDeleteServerModal({ open: false, serverId: null, type: 'radarr' });
    revalidateRadarr();
    revalidateSonarr();
    mutate('/api/v1/settings/public');
  };

  return (
    <>
      <PageTitle
        title={[
          intl.formatMessage(messages.services),
          intl.formatMessage(globalMessages.settings),
        ]}
      />
      <div className="mb-6">
        <h3 className="heading">
          {intl.formatMessage(messages.radarrsettings)}
        </h3>
        <p className="description">
          {intl.formatMessage(messages.videoServiceSettingsDescription, {
            serverType: 'Radarr',
          })}
        </p>
      </div>
      {overrideRuleModal.open && overrideRuleModal.testResponse && (
        <OverrideRuleModal
          rule={overrideRuleModal.rule}
          onClose={() =>
            setOverrideRuleModal({
              open: false,
              rule: null,
              testResponse: null,
            })
          }
          testResponse={overrideRuleModal.testResponse}
          radarrId={editRadarrModal.radarr?.id}
          sonarrId={editSonarrModal.sonarr?.id}
        />
      )}
      {editRadarrModal.open && (
        <RadarrModal
          radarr={editRadarrModal.radarr}
          onClose={() => {
            if (!overrideRuleModal.open)
              setEditRadarrModal({ open: false, radarr: null });
          }}
          onSave={() => {
            revalidateRadarr();
            mutate('/api/v1/settings/public');
            setEditRadarrModal({ open: false, radarr: null });
          }}
          overrideRuleModal={overrideRuleModal}
          setOverrideRuleModal={setOverrideRuleModal}
        />
      )}
      {editSonarrModal.open && (
        <SonarrModal
          sonarr={editSonarrModal.sonarr}
          onClose={() => {
            if (!overrideRuleModal.open)
              setEditSonarrModal({ open: false, sonarr: null });
          }}
          onSave={() => {
            revalidateSonarr();
            mutate('/api/v1/settings/public');
            setEditSonarrModal({ open: false, sonarr: null });
          }}
          overrideRuleModal={overrideRuleModal}
          setOverrideRuleModal={setOverrideRuleModal}
        />
      )}
      {editLidarrModal.open && (
        <LidarrModal
          lidarr={editLidarrModal.lidarr}
          onClose={() => setEditLidarrModal({ open: false, lidarr: null })}
          onSave={() => {
            revalidateLidarr();
            mutate('/api/v1/settings/public');
            setEditLidarrModal({ open: false, lidarr: null });
          }}
        />
      )}
      <Transition
        as={Fragment}
        show={deleteServerModal.open}
        enter="transition-opacity ease-in-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity ease-in-out duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <Modal
          okText={intl.formatMessage(globalMessages.delete)}
          okButtonType="danger"
          onOk={() => deleteServer()}
          onCancel={() =>
            setDeleteServerModal({
              open: false,
              serverId: null,
              type: 'radarr',
            })
          }
          title={intl.formatMessage(messages.deleteServer, {
            serverType:
              deleteServerModal.type === 'radarr'
                ? 'Radarr'
                : deleteServerModal.type === 'sonarr'
                ? 'Sonarr'
                : 'Lidarr',
          })}
        >
          {intl.formatMessage(messages.deleteserverconfirm)}
        </Modal>
      </Transition>
      <div className="section">
        {!radarrData && !radarrError && <LoadingSpinner />}
        {radarrData && !radarrError && (
          <>
            {radarrData.length > 0 &&
              (!radarrData.some((radarr) => radarr.isDefault) ? (
                <Alert
                  title={intl.formatMessage(messages.noDefaultServer, {
                    serverType: 'Radarr',
                    mediaType: intl.formatMessage(messages.mediaTypeMovie),
                  })}
                />
              ) : !radarrData.some(
                  (radarr) => radarr.isDefault && !radarr.is4k
                ) ? (
                <Alert
                  title={intl.formatMessage(messages.noDefaultNon4kServer, {
                    serverType: 'Radarr',
                    strong: (msg: React.ReactNode) => (
                      <strong className="font-semibold text-white">
                        {msg}
                      </strong>
                    ),
                  })}
                />
              ) : (
                radarrData.some((radarr) => radarr.is4k) &&
                !radarrData.some(
                  (radarr) => radarr.isDefault && radarr.is4k
                ) && (
                  <Alert
                    title={intl.formatMessage(messages.noDefault4kServer, {
                      serverType: 'Radarr',
                      mediaType: intl.formatMessage(messages.mediaTypeMovie),
                    })}
                  />
                )
              ))}
            <ul className="grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {radarrData.map((radarr) => (
                <ServerInstance
                  key={`radarr-config-${radarr.id}`}
                  name={radarr.name}
                  hostname={radarr.hostname}
                  port={radarr.port}
                  profileName={radarr.activeProfileName}
                  isSSL={radarr.useSsl}
                  isDefault={radarr.isDefault}
                  is4k={radarr.is4k}
                  externalUrl={radarr.externalUrl}
                  onEdit={() => setEditRadarrModal({ open: true, radarr })}
                  onDelete={() =>
                    setDeleteServerModal({
                      open: true,
                      serverId: radarr.id,
                      type: 'radarr',
                    })
                  }
                />
              ))}
              <li className="col-span-1 h-32 rounded-lg border-2 border-dashed border-gray-400 shadow sm:h-44">
                <div className="flex h-full w-full items-center justify-center">
                  <Button
                    buttonType="ghost"
                    className="mt-3 mb-3"
                    onClick={() =>
                      setEditRadarrModal({ open: true, radarr: null })
                    }
                  >
                    <PlusIcon />
                    <span>{intl.formatMessage(messages.addradarr)}</span>
                  </Button>
                </div>
              </li>
            </ul>
          </>
        )}
      </div>
      <div className="mt-10 mb-6">
        <h3 className="heading">
          {intl.formatMessage(messages.sonarrsettings)}
        </h3>
        <p className="description">
          {intl.formatMessage(messages.videoServiceSettingsDescription, {
            serverType: 'Sonarr',
          })}
        </p>
      </div>
      <div className="section">
        {!sonarrData && !sonarrError && <LoadingSpinner />}
        {sonarrData && !sonarrError && (
          <>
            {sonarrData.length > 0 &&
              (!sonarrData.some((sonarr) => sonarr.isDefault) ? (
                <Alert
                  title={intl.formatMessage(messages.noDefaultServer, {
                    serverType: 'Sonarr',
                    mediaType: intl.formatMessage(messages.mediaTypeSeries),
                  })}
                />
              ) : !sonarrData.some(
                  (sonarr) => sonarr.isDefault && !sonarr.is4k
                ) ? (
                <Alert
                  title={intl.formatMessage(messages.noDefaultNon4kServer, {
                    serverType: 'Sonarr',
                    strong: (msg: React.ReactNode) => (
                      <strong className="font-semibold text-white">
                        {msg}
                      </strong>
                    ),
                  })}
                />
              ) : (
                sonarrData.some((sonarr) => sonarr.is4k) &&
                !sonarrData.some(
                  (sonarr) => sonarr.isDefault && sonarr.is4k
                ) && (
                  <Alert
                    title={intl.formatMessage(messages.noDefault4kServer, {
                      serverType: 'Sonarr',
                      mediaType: intl.formatMessage(messages.mediaTypeSeries),
                    })}
                  />
                )
              ))}
            <ul className="grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {sonarrData.map((sonarr) => (
                <ServerInstance
                  key={`sonarr-config-${sonarr.id}`}
                  name={sonarr.name}
                  hostname={sonarr.hostname}
                  port={sonarr.port}
                  profileName={sonarr.activeProfileName}
                  isSSL={sonarr.useSsl}
                  isSonarr
                  isDefault={sonarr.isDefault}
                  is4k={sonarr.is4k}
                  externalUrl={sonarr.externalUrl}
                  onEdit={() => setEditSonarrModal({ open: true, sonarr })}
                  onDelete={() =>
                    setDeleteServerModal({
                      open: true,
                      serverId: sonarr.id,
                      type: 'sonarr',
                    })
                  }
                />
              ))}
              <li className="col-span-1 h-32 rounded-lg border-2 border-dashed border-gray-400 shadow sm:h-44">
                <div className="flex h-full w-full items-center justify-center">
                  <Button
                    buttonType="ghost"
                    onClick={() =>
                      setEditSonarrModal({ open: true, sonarr: null })
                    }
                  >
                    <PlusIcon />
                    <span>{intl.formatMessage(messages.addsonarr)}</span>
                  </Button>
                </div>
              </li>
            </ul>
          </>
        )}
      </div>
      <div className="mt-10 mb-6">
        <h3 className="heading">
          {intl.formatMessage(messages.lidarrsettings)}
        </h3>
        <p className="description">
          {intl.formatMessage(messages.musicServiceSettingsDescription, {
            serverType: 'Lidarr',
          })}
        </p>
      </div>
      <div className="section">
        {!lidarrData && !lidarrError && <LoadingSpinner />}
        {lidarrData && !lidarrError && (
          <>
            {lidarrData.length > 0 &&
              (!lidarrData.some((lidarr) => lidarr.isDefault) ? (
                <Alert
                  title={intl.formatMessage(messages.noDefaultServer, {
                    serverType: 'Lidarr',
                    mediaType: intl.formatMessage(messages.mediaTypeSeries),
                  })}
                />
              ) : null)}
            <ul className="grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {lidarrData.map((lidarr) => (
                <ServerInstance
                  key={`lidarr-config-${lidarr.id}`}
                  name={lidarr.name}
                  hostname={lidarr.hostname}
                  port={lidarr.port}
                  profileName={lidarr.activeProfileName}
                  isSSL={lidarr.useSsl}
                  isLidarr={true}
                  isDefault={lidarr.isDefault}
                  externalUrl={lidarr.externalUrl}
                  onEdit={() => setEditLidarrModal({ open: true, lidarr })}
                  onDelete={() =>
                    setDeleteServerModal({
                      open: true,
                      serverId: lidarr.id,
                      type: 'lidarr',
                    })
                  }
                />
              ))}
              <li className="col-span-1 h-32 rounded-lg border-2 border-dashed border-gray-400 shadow sm:h-44">
                <div className="flex h-full w-full items-center justify-center">
                  <Button
                    buttonType="ghost"
                    onClick={() =>
                      setEditLidarrModal({ open: true, lidarr: null })
                    }
                  >
                    <PlusIcon />
                    <span>{intl.formatMessage(messages.addlidarr)}</span>
                  </Button>
                </div>
              </li>
            </ul>
          </>
        )}
      </div>
    </>
  );
};

export default SettingsServices;
