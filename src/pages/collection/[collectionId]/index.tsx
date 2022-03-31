import React from 'react';
import { GetServerSideProps, NextPage } from 'next';
import type { Collection } from '../../../../server/models/Collection';
import axios from 'axios';
import { parseCookies } from 'nookies';
import CollectionDetails from '../../../components/CollectionDetails';

interface CollectionPageProps {
  collection?: Collection;
}

const CollectionPage: NextPage<CollectionPageProps> = ({ collection }) => {
  return <CollectionDetails collection={collection} />;
};

export const getServerSideProps: GetServerSideProps<CollectionPageProps> = async (
  ctx
) => {
  const cookies = parseCookies(ctx);
  const response = await axios.get<Collection>(
    `http://localhost:${process.env.PORT || 5055}/api/v1/collection/${
      ctx.query.collectionId
    }${cookies.locale ? `?language=${cookies.locale}` : ''}`,
    {
      headers: ctx.req?.headers?.cookie
        ? { cookie: ctx.req.headers.cookie }
        : undefined,
    }
  );

  return {
    props: {
      collection: response.data,
    },
  };
};

export default CollectionPage;
