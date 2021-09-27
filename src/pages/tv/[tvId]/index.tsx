import axios from 'axios';
import { NextPage } from 'next';
import React from 'react';
import type { TvDetails as TvDetailsType } from '../../../../server/models/Tv';
import TvDetails from '../../../components/TvDetails';

interface TvPageProps {
  tv?: TvDetailsType;
}

const TvPage: NextPage<TvPageProps> = ({ tv }) => {
  return <TvDetails tv={tv} />;
};

TvPage.getInitialProps = async (ctx) => {
  if (ctx.req) {
    const response = await axios.get<TvDetailsType>(
      `http://localhost:${process.env.PORT || 5055}/api/v1/tv/${
        ctx.query.tvId
      }`,
      {
        headers: ctx.req?.headers?.cookie
          ? { cookie: ctx.req.headers.cookie }
          : undefined,
      }
    );

    return {
      tv: response.data,
    };
  }

  return {};
};

export default TvPage;
