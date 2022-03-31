import React, { useState } from 'react';
import useSWR from 'swr';
import ReactMarkdown from 'react-markdown';
import LoadingSpinner from '../../../Common/LoadingSpinner';
import Alert from '../../../Common/Alert';
import Badge from '../../../Common/Badge';
import Button from '../../../Common/Button';
import Modal from '../../../Common/Modal';
import Transition from '../../../Transition';
import { defineMessages, FormattedRelativeTime, useIntl } from 'react-intl';
import globalMessages from '../../../../i18n/globalMessages';

const messages = defineMessages({
  releases: 'Releases',
  releasedataMissing: 'Release data unavailable. Is GitHub down?',
  versionChangelog: 'Version Changelog',
  viewongithub: 'View on GitHub',
  latestversion: 'Latest',
  currentversion: 'Current Version',
  viewchangelog: 'View Changelog',
  runningDevelop: 'You are running a develop version of Overseerr!',
  runningDevelopMessage:
    'The changes in your version will not be available below. Please see the <GithubLink>GitHub repository</GithubLink> for latest updates.',
});

const REPO_RELEASE_API =
  'https://api.github.com/repos/sct/overseerr/releases?per_page=20';

interface GitHubRelease {
  url: string;
  assets_url: string;
  upload_url: string;
  html_url: string;
  id: number;
  node_id: string;
  tag_name: string;
  target_commitish: string;
  name: string;
  draft: boolean;
  prerelease: boolean;
  created_at: string;
  published_at: string;
  tarball_url: string;
  zipball_url: string;
  body: string;
}

interface ReleaseProps {
  release: GitHubRelease;
  isLatest: boolean;
  currentVersion: string;
}

const Release: React.FC<ReleaseProps> = ({
  currentVersion,
  release,
  isLatest,
}) => {
  const intl = useIntl();
  const [isModalOpen, setModalOpen] = useState(false);
  return (
    <div className="flex flex-col px-4 py-2 bg-gray-800 rounded-md sm:flex-row">
      <Transition
        enter="opacity-0 transition duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="opacity-100 transition duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        show={isModalOpen}
      >
        <Modal
          onCancel={() => setModalOpen(false)}
          iconSvg={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          }
          title={intl.formatMessage(messages.versionChangelog)}
          cancelText={intl.formatMessage(globalMessages.close)}
          okText={intl.formatMessage(messages.viewongithub)}
          onOk={() => {
            window.open(release.html_url, '_blank');
          }}
        >
          <div className="prose">
            <ReactMarkdown>{release.body}</ReactMarkdown>
          </div>
        </Modal>
      </Transition>
      <div className="flex items-center justify-center mb-4 sm:mb-0 sm:justify-start">
        <span className="mt-1 mr-2 text-xs">
          <FormattedRelativeTime
            value={Math.floor(
              (new Date(release.created_at).getTime() - Date.now()) / 1000
            )}
            updateIntervalInSeconds={1}
            numeric="always"
          />
        </span>
        <span className="text-lg">{release.name}</span>
        {isLatest && (
          <span className="ml-2 -mt-1">
            <Badge badgeType="primary">
              {intl.formatMessage(messages.latestversion)}
            </Badge>
          </span>
        )}
        {release.name.includes(currentVersion) && (
          <span className="ml-2 -mt-1">
            <Badge badgeType="success">
              {intl.formatMessage(messages.currentversion)}
            </Badge>
          </span>
        )}
      </div>
      <div className="flex-1 text-center sm:text-right">
        <Button buttonType="primary" onClick={() => setModalOpen(true)}>
          {intl.formatMessage(messages.viewchangelog)}
        </Button>
      </div>
    </div>
  );
};

interface ReleasesProps {
  currentVersion: string;
}

const Releases: React.FC<ReleasesProps> = ({ currentVersion }) => {
  const intl = useIntl();
  const { data, error } = useSWR<GitHubRelease[]>(REPO_RELEASE_API);

  if (!data && !error) {
    return <LoadingSpinner />;
  }

  if (!data) {
    return (
      <div className="text-gray-300">
        {intl.formatMessage(messages.releasedataMissing)}
      </div>
    );
  }

  return (
    <div>
      <h3 className="heading">{intl.formatMessage(messages.releases)}</h3>
      <div className="section">
        {currentVersion.startsWith('develop-') && (
          <Alert title={intl.formatMessage(messages.runningDevelop)}>
            {intl.formatMessage(messages.runningDevelopMessage, {
              GithubLink: function GithubLink(msg) {
                return (
                  <a
                    href="https://github.com/sct/overseerr"
                    target="_blank"
                    rel="noreferrer"
                    className="text-yellow-100 underline transition duration-300 hover:text-white"
                  >
                    {msg}
                  </a>
                );
              },
            })}
          </Alert>
        )}
        {data?.map((release, index) => {
          return (
            <div key={`release-${release.id}`} className="mb-2">
              <Release
                release={release}
                currentVersion={currentVersion}
                isLatest={index === 0}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Releases;
