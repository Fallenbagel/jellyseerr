import { useEffect, useState } from 'react';

function JellyseerrVersion() {
  const [version, setVersion] = useState<string | null>('0.0.0');

  useEffect(() => {
    async function fetchVersion() {
      try {
        const response = await fetch(
          'https://api.github.com/repos/Fallenbagel/jellyseerr/releases/latest'
        );
        const data = await response.json();
        const latestVersion = data.tag_name.replace('v', '');

        setVersion(latestVersion);
      } catch (error) {
        console.error('Failed to fetch version hash:', error);
        setVersion('Error fetching version hash');
      }
    }
    fetchVersion();
  }, []);

  return version;
}

export default JellyseerrVersion;
