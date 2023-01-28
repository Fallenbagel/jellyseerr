import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import PR from 'pulltorefreshjs';
import { useEffect } from 'react';
import ReactDOMServer from 'react-dom/server';

const PullToRefresh = () => {
  const router = useRouter();

  useEffect(() => {
    PR.init({
      mainElement: '#pull-to-refresh',
      onRefresh() {
        router.reload();
      },
      iconArrow: ReactDOMServer.renderToString(
        <div className="p-2">
          <ArrowPathIcon className="z-50 m-auto h-9 w-9 rounded-full border-4 border-gray-800 bg-gray-800 text-indigo-500 ring-1 ring-gray-700" />
        </div>
      ),
      iconRefreshing: ReactDOMServer.renderToString(
        <div
          className="animate-spin p-2"
          style={{ animationDirection: 'reverse' }}
        >
          <ArrowPathIcon className="z-50 m-auto h-9 w-9 rounded-full border-4 border-gray-800 bg-gray-800 text-indigo-500 ring-1 ring-gray-700" />
        </div>
      ),
      instructionsPullToRefresh: ReactDOMServer.renderToString(<div />),
      instructionsReleaseToRefresh: ReactDOMServer.renderToString(<div />),
      instructionsRefreshing: ReactDOMServer.renderToString(<div />),
      distReload: 60,
      distIgnore: 15,
      shouldPullToRefresh: () =>
        !window.scrollY && document.body.style.overflow !== 'hidden',
    });
    return () => {
      PR.destroyAll();
    };
  }, [router]);

  return <div id="pull-to-refresh"></div>;
};

export default PullToRefresh;
