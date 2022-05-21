import React from 'react';
import Transition from '../Transition';
import CreateIssueModal from './CreateIssueModal';

interface IssueModalProps {
  show?: boolean;
  onCancel: () => void;
  mediaType: 'movie' | 'tv';
  tmdbId: number;
  issueId?: never;
}

const IssueModal: React.FC<IssueModalProps> = ({
  show,
  mediaType,
  onCancel,
  tmdbId,
}) => (
  <Transition
    enter="transition opacity-0 duration-300"
    enterFrom="opacity-0"
    enterTo="opacity-100"
    leave="transition opacity-100 duration-300"
    leaveFrom="opacity-100"
    leaveTo="opacity-0"
    show={show}
  >
    <CreateIssueModal
      mediaType={mediaType}
      onCancel={onCancel}
      tmdbId={tmdbId}
    />
  </Transition>
);

export default IssueModal;
