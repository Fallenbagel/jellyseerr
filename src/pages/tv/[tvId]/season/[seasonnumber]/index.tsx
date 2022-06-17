import { SeasonWithEpisodes } from '../../../../../../server/models/Tv';
import { NextPage } from 'next';
import axios from 'axios';
import SeasonDetails from '../../../../../components/SeasonDetails';
import React from 'react';

interface SeasonPageProps {
  season?: SeasonWithEpisodes;
}

const SeasonPage: NextPage<SeasonPageProps> = ({ season }) => {
  return <SeasonDetails season={season} />;
};

SeasonPage.getInitialProps = async (ctx) => {
  if (ctx.req) {
    const response = await axios.get<SeasonWithEpisodes>(
      `http://localhost:${process.env.PORT || 5055}/api/v1/tv/${
        ctx.query.tvId
      }/season/${ctx.query.seasonNumber}`,
      {
        headers: ctx.req?.headers?.cookie
          ? { cookie: ctx.req.headers.cookie }
          : undefined,
      }
    );

    return {
      season: response.data,
    };
  }

  return {};
};

export default SeasonPage;
