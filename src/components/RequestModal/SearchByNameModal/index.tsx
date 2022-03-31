import React from 'react';
import Alert from '../../Common/Alert';
import Modal from '../../Common/Modal';
import { SmallLoadingSpinner } from '../../Common/LoadingSpinner';
import useSWR from 'swr';
import { defineMessages, useIntl } from 'react-intl';
import { SonarrSeries } from '../../../../server/api/sonarr';

const messages = defineMessages({
  next: 'Next',
  notvdbid: 'Manual Match Required',
  notvdbiddescription:
    "We couldn't automatically match your request. Please select the correct match from the list below:",
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
      okText={intl.formatMessage(messages.next)}
      okDisabled={!tvdbId}
      okButtonType="primary"
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
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
      }
    >
      <Alert title={intl.formatMessage(messages.notvdbid)} type="info">
        {intl.formatMessage(messages.notvdbiddescription)}
      </Alert>
      {!data && !error && <SmallLoadingSpinner />}
      <div className="grid grid-cols-1 gap-4 pb-2 md:grid-cols-2">
        {data?.slice(0, 6).map((item) => (
          <button
            key={item.tvdbId}
            className="container flex flex-col items-center justify-center h-40 mx-auto space-y-4 transition scale-100 outline-none cursor-pointer focus:ring focus:ring-indigo-500 focus:ring-opacity-70 focus:outline-none rounded-xl transform-gpu hover:scale-105"
            onClick={() => handleClick(item.tvdbId)}
          >
            <div
              className={`bg-gray-600 h-40 overflow-hidden w-full flex items-center p-2 rounded-xl shadow transition ${
                tvdbId === item.tvdbId ? 'ring ring-indigo-500' : ''
              } `}
            >
              <div className="flex items-center flex-none w-24 space-x-4">
                <img
                  src={
                    item.remotePoster ??
                    '/images/overseerr_poster_not_found.png'
                  }
                  alt={item.title}
                  className="w-auto rounded-md h-100"
                />
              </div>
              <div className="self-start flex-grow p-3 text-left">
                <div className="text-sm font-medium text-grey-200">
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
