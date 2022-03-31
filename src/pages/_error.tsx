import React from 'react';
import type { NextPage } from 'next';
import Link from 'next/link';
import type { Undefinable } from '../utils/typeHelpers';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

interface ErrorProps {
  statusCode?: number;
}

const messages = defineMessages({
  internalServerError: '{statusCode} - Internal server error',
  serviceUnavailable: '{statusCode} - Service unavailable',
  somethingWentWrong: '{statusCode} - Something went wrong',
  oops: 'Oops',
  returnHome: 'Return Home',
});

const Error: NextPage<ErrorProps> = ({ statusCode }) => {
  const intl = useIntl();

  const getErrorMessage = (statusCode?: number) => {
    switch (statusCode) {
      case 500:
        return intl.formatMessage(messages.internalServerError, {
          statusCode: 500,
        });
      case 503:
        return intl.formatMessage(messages.serviceUnavailable, {
          statusCode: 503,
        });
      default:
        return intl.formatMessage(messages.somethingWentWrong, {
          statusCode: statusCode ?? intl.formatMessage(messages.oops),
        });
    }
  };
  return (
    <div className="error-message">
      <div className="text-4xl">{getErrorMessage(statusCode)}</div>
      <Link href="/">
        <a className="flex">
          <FormattedMessage {...messages.returnHome} />
          <svg
            className="w-6 h-6 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </a>
      </Link>
    </div>
  );
};

Error.getInitialProps = async ({ res, err }): Promise<ErrorProps> => {
  // Apologies for how gross ternary is but this is just temporary. Honestly,
  // blame the nextjs docs
  let statusCode: Undefinable<number>;
  if (res) {
    statusCode = res.statusCode;
  } else {
    statusCode = err ? err.statusCode : undefined;
  }

  return { statusCode };
};

export default Error;
