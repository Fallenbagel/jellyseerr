import React from 'react';

// We will localize this file when the complete version is released.

const SettingsLogs: React.FC = () => {
  return (
    <>
      <div className="text-sm leading-loose text-gray-300">
        This page is still being built. For now, you can access your logs
        directly in <code>stdout</code> (container logs) or looking in{' '}
        <code>/app/config/logs/overseerr.log</code>.
      </div>
    </>
  );
};

export default SettingsLogs;
