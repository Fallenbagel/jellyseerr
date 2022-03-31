import React from 'react';
import { NextPage } from 'next';
import axios from 'axios';
import { parseCookies } from 'nookies';
import TvDetails from '../../../components/TvDetails';
import type { TvDetails as TvDetailsType } from '../../../../server/models/Tv';

interface TvPageProps {
  tv?: TvDetailsType;
}

const TvPage: NextPage<TvPageProps> = ({ tv }) => {
  return <TvDetails tv={tv} />;
};

TvPage.getInitialProps = async (ctx) => {
  if (ctx.req) {
    const cookies = parseCookies(ctx);
    const response = await axios.get<TvDetailsType>(
      `http://localhost:${process.env.PORT || 5055}/api/v1/tv/${
        ctx.query.tvId
      }${cookies.locale ? `?language=${cookies.locale}` : ''}`,
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
