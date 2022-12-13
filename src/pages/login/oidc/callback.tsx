import LoadingSpinner from '@app/components/Common/LoadingSpinner';
import { processCallback } from '@app/utils/oidc';
import { useEffect } from 'react';

const OidcCallback = () => {
  const login = async () => {
    const params = new URLSearchParams(window.location.search);
    const result = await processCallback(params);

    if (window.opener) {
      // send result to the opening window
      window.opener.postMessage(
        result,
        `${window.location.protocol}//${window.location.host}`
      );
      // close the popup
      window.close();
    }
  };

  useEffect(() => {
    login();
  }, []);

  return (
    <div>
      <LoadingSpinner />
    </div>
  );
};

export default OidcCallback;
