
import { ApolloClient, from, BatchHttpLink } from '@apollo/client'
import { RetryLink } from '@apollo/client/link/retry';
import { InMemoryCache } from 'apollo-cache-inmemory'

import resolvers, { defaults } from './types'
import typeDefs from './schema'

let client;

const baseSubgraphURL = 'https://api.thegraph.com/subgraphs/name/kibagateaux/xnhns';
const getSubgraphEndpoint = (networkName) => networkName ?? `${baseSubgraphURL}-${networkName}`;

export function getGraphQLAPI(network) {
  if (process.env.REACT_APP_GRAPH_NODE_URI) {
    return process.env.REACT_APP_GRAPH_NODE_URI;
  }

  if (network && network.name) {
    return getSubgraphEndpoint(network.name);
  }

  return getSubgraphEndpoint('eth');
}

export async function setupClient(network) {
  const httpLink = new BatchHttpLink({
    uri: getGraphQLAPI(network)
  });
  
  const retryLink = new RetryLink({
    delay: {
      initial: 300,
      max: 5000,
      jitter: true
    },
    attempts: {
      max: 5,
      retryIf: (error, _operation) => !!error
    }
  });
  // cache also allows creating and storing data locally through Apollo client
  // https://www.apollographql.com/docs/react/v2/data/local-state/
  const cache = new InMemoryCache({
    addTypename: true
  });

  const option = {
    resolvers,
    fetchOptions: {
      mode: 'no-cors'
    },
    cache,
    addTypename: true,
    link: from([retryLink, httpLink], cache)
  };

  client = new ApolloClient(option);
  return client;
}

export function getClient() {
  return client;
}
