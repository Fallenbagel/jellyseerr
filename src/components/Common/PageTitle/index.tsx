import React from 'react';
import useSettings from '../../../hooks/useSettings';
import Head from 'next/head';

interface PageTitleProps {
  title: string | (string | undefined)[];
}

const PageTitle: React.FC<PageTitleProps> = ({ title }) => {
  const settings = useSettings();

  return (
    <Head>
      <title>
        {Array.isArray(title) ? title.filter(Boolean).join(' - ') : title} -{' '}
        {settings.currentSettings.applicationTitle}
      </title>
    </Head>
  );
};

export default PageTitle;
