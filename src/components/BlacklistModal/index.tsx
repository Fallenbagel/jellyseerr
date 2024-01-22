import Modal from '@app/components/Common/Modal';
import { Transition } from '@headlessui/react';

interface BlacklistModalProps {
  title: string;
  onComplete?: () => void;
  onCancel?: () => void;
}

const BlacklistModal = ({
  title,
  onComplete,
  onCancel,
}: BlacklistModalProps) => {
  return (
    <Transition
      as="div"
      enter="transition-opacity duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-300"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      show={true}
    >
      <Modal
        backgroundClickable
        title={`Blacklist ${title}`}
        subTitle="Are you sure you want to proceed?"
        onCancel={onCancel}
        onOk={onComplete}
      />
    </Transition>
  );
};

export default BlacklistModal;
