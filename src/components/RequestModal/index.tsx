import React from 'react';
import type { MediaStatus } from '../../../server/constants/media';
import { MediaRequest } from '../../../server/entity/MediaRequest';
import Transition from '../Transition';
import CollectionRequestModal from './CollectionRequestModal';
import MovieRequestModal from './MovieRequestModal';
import TvRequestModal from './TvRequestModal';

interface RequestModalProps {
  show: boolean;
  type: 'movie' | 'tv' | 'collection';
  tmdbId: number;
  is4k?: boolean;
  editRequest?: MediaRequest;
  onComplete?: (newStatus: MediaStatus) => void;
  onCancel?: () => void;
  onUpdating?: (isUpdating: boolean) => void;
}

const RequestModal: React.FC<RequestModalProps> = ({
  type,
  show,
  tmdbId,
  is4k,
  editRequest,
  onComplete,
  onUpdating,
  onCancel,
}) => {
  return (
    <Transition
      enter="transition opacity-0 duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition opacity-100 duration-300"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      show={show}
    >
      {type === 'movie' ? (
        <MovieRequestModal
          onComplete={onComplete}
          onCancel={onCancel}
          tmdbId={tmdbId}
          onUpdating={onUpdating}
          is4k={is4k}
          editRequest={editRequest}
        />
      ) : type === 'tv' ? (
        <TvRequestModal
          onComplete={onComplete}
          onCancel={onCancel}
          tmdbId={tmdbId}
          onUpdating={onUpdating}
          is4k={is4k}
          editRequest={editRequest}
        />
      ) : (
        <CollectionRequestModal
          onComplete={onComplete}
          onCancel={onCancel}
          tmdbId={tmdbId}
          onUpdating={onUpdating}
          is4k={is4k}
        />
      )}
    </Transition>
  );
};

export default RequestModal;
