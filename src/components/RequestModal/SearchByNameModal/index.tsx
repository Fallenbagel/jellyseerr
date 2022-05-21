import { DownloadIcon } from '@heroicons/react/outline';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import useSWR from 'swr';
import { SonarrSeries } from '../../../../server/api/servarr/sonarr';
import globalMessages from '../../../i18n/globalMessages';
import Alert from '../../Common/Alert';
import { SmallLoadingSpinner } from '../../Common/LoadingSpinner';
import Modal from '../../Common/Modal';

const messages = defineMessages({
  notvdbiddescription:
    "We couldn't automatically match your request. Please select the correct match from the list below.",
  nosummary: 'No summary for this title was found.',
});

interface SearchByNameModalProps {
  setTvdbId: (id: number) => void;
  tvdbId: number | undefined;
  loading: boolean;
  onCancel?: () => void;
  closeModal: () => void;
  modalTitle: string;
  tmdbId: number;
}

const SearchByNameModal: React.FC<SearchByNameModalProps> = ({
  setTvdbId,
  tvdbId,
  loading,
  onCancel,
  closeModal,
  modalTitle,
  tmdbId,
}) => {
  const intl = useIntl();
  const { data, error } = useSWR<SonarrSeries[]>(
    `/api/v1/service/sonarr/lookup/${tmdbId}`
  );

  const handleClick = (tvdbId: number) => {
    setTvdbId(tvdbId);
  };

  return (
    <Modal
      loading={loading && !error}
      backgroundClickable
      onCancel={onCancel}
      onOk={closeModal}
      title={modalTitle}
      okText={intl.formatMessage(globalMessages.next)}
      okDisabled={!tvdbId}
      okButtonType="primary"
      iconSvg={<DownloadIcon />}
    >
      <Alert
        title={intl.formatMessage(messages.notvdbiddescription)}
        type="info"
      />
      {!data && !error && <SmallLoadingSpinner />}
      <div className="grid grid-cols-1 gap-4 pb-2 md:grid-cols-2">
        {data?.slice(0, 6).map((item) => (
          <button
            key={item.tvdbId}
            className="container mx-auto flex h-40 scale-100 transform-gpu cursor-pointer flex-col items-center justify-center space-y-4 rounded-xl outline-none transition hover:scale-105 focus:outline-none focus:ring focus:ring-indigo-500 focus:ring-opacity-70"
            onClick={() => handleClick(item.tvdbId)}
          >
            <div
              className={`flex h-40 w-full items-center overflow-hidden rounded-xl bg-gray-600 p-2 shadow transition ${
                tvdbId === item.tvdbId ? 'ring ring-indigo-500' : ''
              } `}
            >
              <div className="flex w-24 flex-none items-center space-x-4">
                <img
                  src={
                    item.remotePoster ??
                    '/images/overseerr_poster_not_found.png'
                  }
                  alt={item.title}
                  className="h-100 w-auto rounded-md"
                />
              </div>
              <div className="flex-grow self-start p-3 text-left">
                <div className="text-grey-200 text-sm font-medium">
                  {item.title}
                </div>
                <div className="h-24 overflow-hidden text-sm text-gray-400">
                  {item.overview ?? intl.formatMessage(messages.nosummary)}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </Modal>
  );
};

export default SearchByNameModal;
