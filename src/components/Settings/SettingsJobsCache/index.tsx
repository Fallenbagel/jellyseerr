import { PlayIcon, StopIcon, TrashIcon } from '@heroicons/react/outline';
import { PencilIcon } from '@heroicons/react/solid';
import axios from 'axios';
import React, { useState } from 'react';
import {
  defineMessages,
  FormattedRelativeTime,
  MessageDescriptor,
  useIntl,
} from 'react-intl';
import { useToasts } from 'react-toast-notifications';
import useSWR from 'swr';
import { MediaServerType } from '../../../../server/constants/server';
import { CacheItem } from '../../../../server/interfaces/api/settingsInterfaces';
import { JobId } from '../../../../server/lib/settings';
import Spinner from '../../../assets/spinner.svg';
import useSettings from '../../../hooks/useSettings';
import globalMessages from '../../../i18n/globalMessages';
import { formatBytes } from '../../../utils/numberHelpers';
import Badge from '../../Common/Badge';
import Button from '../../Common/Button';
import LoadingSpinner from '../../Common/LoadingSpinner';
import Modal from '../../Common/Modal';
import PageTitle from '../../Common/PageTitle';
import Table from '../../Common/Table';
import Transition from '../../Transition';

const messages: { [messageName: string]: MessageDescriptor } = defineMessages({
  jobsandcache: 'Jobs & Cache',
  jobs: 'Jobs',
  jobsDescription:
    'Overseerr performs certain maintenance tasks as regularly-scheduled jobs, but they can also be manually triggered below. Manually running a job will not alter its schedule.',
  jobname: 'Job Name',
  jobtype: 'Type',
  nextexecution: 'Next Execution',
  runnow: 'Run Now',
  canceljob: 'Cancel Job',
  jobstarted: '{jobname} started.',
  jobcancelled: '{jobname} canceled.',
  process: 'Process',
  command: 'Command',
  cache: 'Cache',
  cacheDescription:
    'Overseerr caches requests to external API endpoints to optimize performance and avoid making unnecessary API calls.',
  cacheflushed: '{cachename} cache flushed.',
  cachename: 'Cache Name',
  cachehits: 'Hits',
  cachemisses: 'Misses',
  cachekeys: 'Total Keys',
  cacheksize: 'Key Size',
  cachevsize: 'Value Size',
  flushcache: 'Flush Cache',
  unknownJob: 'Unknown Job',
  'plex-recently-added-scan': 'Plex Recently Added Scan',
  'plex-full-scan': 'Plex Full Library Scan',
  'jellyfin-recently-added-sync': 'Jellyfin Recently Added Scan',
  'jellyfin-full-sync': 'Jellyfin Full Library Scan',
  'radarr-scan': 'Radarr Scan',
  'sonarr-scan': 'Sonarr Scan',
  'download-sync': 'Download Sync',
  'download-sync-reset': 'Download Sync Reset',
  editJobSchedule: 'Modify Job',
  jobScheduleEditSaved: 'Job edited successfully!',
  jobScheduleEditFailed: 'Something went wrong while saving the job.',
  editJobSchedulePrompt: 'Frequency',
  editJobScheduleSelectorHours:
    'Every {jobScheduleHours, plural, one {hour} other {{jobScheduleHours} hours}}',
  editJobScheduleSelectorMinutes:
    'Every {jobScheduleMinutes, plural, one {minute} other {{jobScheduleMinutes} minutes}}',
});

interface Job {
  id: JobId;
  name: string;
  type: 'process' | 'command';
  interval: 'short' | 'long' | 'fixed';
  nextExecutionTime: string;
  running: boolean;
}

const SettingsJobs: React.FC = () => {
  const intl = useIntl();
  const { addToast } = useToasts();
  const {
    data,
    error,
    mutate: revalidate,
  } = useSWR<Job[]>('/api/v1/settings/jobs', {
    refreshInterval: 5000,
  });
  const { data: cacheData, mutate: cacheRevalidate } = useSWR<CacheItem[]>(
    '/api/v1/settings/cache',
    {
      refreshInterval: 10000,
    }
  );

  const [jobEditModal, setJobEditModal] = useState<{
    isOpen: boolean;
    job?: Job;
  }>({
    isOpen: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [jobScheduleMinutes, setJobScheduleMinutes] = useState(5);
  const [jobScheduleHours, setJobScheduleHours] = useState(1);
  const settings = useSettings();

  if (!data && !error) {
    return <LoadingSpinner />;
  }

  const runJob = async (job: Job) => {
    await axios.post(`/api/v1/settings/jobs/${job.id}/run`);
    addToast(
      intl.formatMessage(messages.jobstarted, {
        jobname: intl.formatMessage(messages[job.id] ?? messages.unknownJob),
      }),
      {
        appearance: 'success',
        autoDismiss: true,
      }
    );
    revalidate();
  };

  const cancelJob = async (job: Job) => {
    await axios.post(`/api/v1/settings/jobs/${job.id}/cancel`);
    addToast(
      intl.formatMessage(messages.jobcancelled, {
        jobname: intl.formatMessage(messages[job.id] ?? messages.unknownJob),
      }),
      {
        appearance: 'error',
        autoDismiss: true,
      }
    );
    revalidate();
  };

  const flushCache = async (cache: CacheItem) => {
    await axios.post(`/api/v1/settings/cache/${cache.id}/flush`);
    addToast(
      intl.formatMessage(messages.cacheflushed, { cachename: cache.name }),
      {
        appearance: 'success',
        autoDismiss: true,
      }
    );
    cacheRevalidate();
  };

  const scheduleJob = async () => {
    const jobScheduleCron = ['0', '0', '*', '*', '*', '*'];

    try {
      if (jobEditModal.job?.interval === 'short') {
        jobScheduleCron[1] = `*/${jobScheduleMinutes}`;
      } else if (jobEditModal.job?.interval === 'long') {
        jobScheduleCron[2] = `*/${jobScheduleHours}`;
      } else {
        // jobs with interval: fixed should not be editable
        throw new Error();
      }

      setIsSaving(true);
      await axios.post(
        `/api/v1/settings/jobs/${jobEditModal.job?.id}/schedule`,
        {
          schedule: jobScheduleCron.join(' '),
        }
      );
      addToast(intl.formatMessage(messages.jobScheduleEditSaved), {
        appearance: 'success',
        autoDismiss: true,
      });
      setJobEditModal({ isOpen: false });
      revalidate();
    } catch (e) {
      addToast(intl.formatMessage(messages.jobScheduleEditFailed), {
        appearance: 'error',
        autoDismiss: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <PageTitle
        title={[
          intl.formatMessage(messages.jobsandcache),
          intl.formatMessage(globalMessages.settings),
        ]}
      />
      <Transition
        enter="opacity-0 transition duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="opacity-100 transition duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        show={jobEditModal.isOpen}
      >
        <Modal
          title={intl.formatMessage(messages.editJobSchedule)}
          okText={
            isSaving
              ? intl.formatMessage(globalMessages.saving)
              : intl.formatMessage(globalMessages.save)
          }
          iconSvg={<PencilIcon />}
          onCancel={() => setJobEditModal({ isOpen: false })}
          okDisabled={isSaving}
          onOk={() => scheduleJob()}
        >
          <div className="section">
            <form>
              <div className="form-row pb-6">
                <label htmlFor="jobSchedule" className="text-label">
                  {intl.formatMessage(messages.editJobSchedulePrompt)}
                </label>
                <div className="form-input-area">
                  {jobEditModal.job?.interval === 'short' ? (
                    <select
                      name="jobScheduleMinutes"
                      className="inline"
                      value={jobScheduleMinutes}
                      onChange={(e) =>
                        setJobScheduleMinutes(Number(e.target.value))
                      }
                    >
                      {[5, 10, 15, 20, 30, 60].map((v) => (
                        <option value={v} key={`jobScheduleMinutes-${v}`}>
                          {intl.formatMessage(
                            messages.editJobScheduleSelectorMinutes,
                            {
                              jobScheduleMinutes: v,
                            }
                          )}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <select
                      name="jobScheduleHours"
                      className="inline"
                      value={jobScheduleHours}
                      onChange={(e) =>
                        setJobScheduleHours(Number(e.target.value))
                      }
                    >
                      {[1, 2, 3, 4, 6, 8, 12, 24, 48, 72].map((v) => (
                        <option value={v} key={`jobScheduleHours-${v}`}>
                          {intl.formatMessage(
                            messages.editJobScheduleSelectorHours,
                            {
                              jobScheduleHours: v,
                            }
                          )}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </form>
          </div>
        </Modal>
      </Transition>

      <div className="mb-6">
        <h3 className="heading">{intl.formatMessage(messages.jobs)}</h3>
        <p className="description">
          {intl.formatMessage(messages.jobsDescription)}
        </p>
      </div>
      <div className="section">
        <Table>
          <thead>
            <tr>
              <Table.TH>{intl.formatMessage(messages.jobname)}</Table.TH>
              <Table.TH>{intl.formatMessage(messages.jobtype)}</Table.TH>
              <Table.TH>{intl.formatMessage(messages.nextexecution)}</Table.TH>
              <Table.TH></Table.TH>
            </tr>
          </thead>
          <Table.TBody>
            {data?.map((job) => (
              <tr key={`job-list-${job.id}`}>
                <Table.TD>
                  <div className="flex items-center text-sm leading-5 text-white">
                    <span>
                      {intl.formatMessage(
                        messages[job.id] ?? messages.unknownJob
                      )}
                    </span>
                    {job.running && <Spinner className="ml-2 h-5 w-5" />}
                  </div>
                </Table.TD>
                <Table.TD>
                  <Badge
                    badgeType={job.type === 'process' ? 'primary' : 'warning'}
                    className="uppercase"
                  >
                    {job.type === 'process'
                      ? intl.formatMessage(messages.process)
                      : intl.formatMessage(messages.command)}
                  </Badge>
                </Table.TD>
                <Table.TD>
                  <div className="text-sm leading-5 text-white">
                    <FormattedRelativeTime
                      value={Math.floor(
                        (new Date(job.nextExecutionTime).getTime() -
                          Date.now()) /
                          1000
                      )}
                      updateIntervalInSeconds={1}
                      numeric="auto"
                    />
                  </div>
                </Table.TD>
                <Table.TD alignText="right">
                  {job.interval !== 'fixed' && (
                    <Button
                      className="mr-2"
                      buttonType="warning"
                      onClick={() =>
                        setJobEditModal({ isOpen: true, job: job })
                      }
                    >
                      <PencilIcon />
                      {intl.formatMessage(globalMessages.edit)}
                    </Button>
                  )}
                  {job.running ? (
                    <Button buttonType="danger" onClick={() => cancelJob(job)}>
                      <StopIcon />
                      <span>{intl.formatMessage(messages.canceljob)}</span>
                    </Button>
                  ) : (
                    <Button buttonType="primary" onClick={() => runJob(job)}>
                      <PlayIcon className="mr-1 h-5 w-5" />
                      <span>{intl.formatMessage(messages.runnow)}</span>
                    </Button>
                  )}
                </Table.TD>
              </tr>
            ))}
          </Table.TBody>
        </Table>
      </div>
      <div>
        <h3 className="heading">{intl.formatMessage(messages.cache)}</h3>
        <p className="description">
          {intl.formatMessage(messages.cacheDescription)}
        </p>
      </div>
      <div className="section">
        <Table>
          <thead>
            <tr>
              <Table.TH>{intl.formatMessage(messages.cachename)}</Table.TH>
              <Table.TH>{intl.formatMessage(messages.cachehits)}</Table.TH>
              <Table.TH>{intl.formatMessage(messages.cachemisses)}</Table.TH>
              <Table.TH>{intl.formatMessage(messages.cachekeys)}</Table.TH>
              <Table.TH>{intl.formatMessage(messages.cacheksize)}</Table.TH>
              <Table.TH>{intl.formatMessage(messages.cachevsize)}</Table.TH>
              <Table.TH></Table.TH>
            </tr>
          </thead>
          <Table.TBody>
            {cacheData
              ?.filter(
                (cache) =>
                  !(
                    settings.currentSettings.mediaServerType !==
                      MediaServerType.PLEX && cache.id === 'plexguid'
                  )
              )
              .map((cache) => (
                <tr key={`cache-list-${cache.id}`}>
                  <Table.TD>{cache.name}</Table.TD>
                  <Table.TD>{intl.formatNumber(cache.stats.hits)}</Table.TD>
                  <Table.TD>{intl.formatNumber(cache.stats.misses)}</Table.TD>
                  <Table.TD>{intl.formatNumber(cache.stats.keys)}</Table.TD>
                  <Table.TD>{formatBytes(cache.stats.ksize)}</Table.TD>
                  <Table.TD>{formatBytes(cache.stats.vsize)}</Table.TD>
                  <Table.TD alignText="right">
                    <Button
                      buttonType="danger"
                      onClick={() => flushCache(cache)}
                    >
                      <TrashIcon />
                      <span>{intl.formatMessage(messages.flushcache)}</span>
                    </Button>
                  </Table.TD>
                </tr>
              ))}
          </Table.TBody>
        </Table>
      </div>
    </>
  );
};

export default SettingsJobs;
