import React, { useEffect } from 'react';
import useClipboard from 'react-use-clipboard';
import { useToasts } from 'react-toast-notifications';
import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  copied: 'Copied API key to clipboard.',
});

const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
  const intl = useIntl();
  const [isCopied, setCopied] = useClipboard(textToCopy, {
    successDuration: 1000,
  });
  const { addToast } = useToasts();

  useEffect(() => {
    if (isCopied) {
      addToast(intl.formatMessage(messages.copied), {
        appearance: 'info',
        autoDismiss: true,
      });
    }
  }, [isCopied, addToast, intl]);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        setCopied();
      }}
      className="-ml-px relative inline-flex items-center px-4 py-2 border border-gray-500 text-sm leading-5 font-medium text-white bg-indigo-600  hover:bg-indigo-500 focus:outline-none focus:ring-blue focus:border-blue-300 active:bg-gray-100 active:text-gray-700 transition ease-in-out duration-150"
    >
      <svg
        className="w-5 h-5 text-white"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
        <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
      </svg>
    </button>
  );
};

export default CopyButton;
