import useSettings from '@app/hooks/useSettings';
import type { ImageProps } from 'next/image';
import Image from 'next/image';

/**
 * The CachedImage component should be used wherever
 * we want to offer the option to locally cache images.
 *
 * It uses the `next/image` Image component but overrides
 * the `unoptimized` prop based on the application setting `cacheImages`.
 **/
const CachedImage = (props: ImageProps) => {
  const { currentSettings } = useSettings();

  return <Image unoptimized={!currentSettings.cacheImages} {...props} />;
};

export default CachedImage;
