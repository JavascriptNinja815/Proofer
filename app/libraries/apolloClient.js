import { ApolloClient } from 'react-apollo'
import { ApolloLink, SetContextLink, HttpLink } from 'apollo-link'
import JWTRefreshLink from './JWTRefreshLink'

import fetch from 'isomorphic-fetch'

let apolloClient = null

// Polyfill fetch() on the server (used by apollo-client)
if (!process.browser) {
  global.fetch = fetch
}

function create (initialState, { token, teamId, refreshToken }) {
  const uri = process.env.API_ENDPOINT_BASE + '/graphql/'
  const setContext = (context) => ({
    ...context,
    headers: {
      ...context.headers,
      'authorization': token ? `Bearer ${token}` : null,
      'X-Proof-TeamId': teamId ? `${teamId}` : `NONE`
    }
  })

  const linkOptions = {
    uri,
    token,
    teamId,
    refreshToken
  }

  const link = ApolloLink.from([
    new SetContextLink(setContext),
    new JWTRefreshLink(linkOptions),
    new HttpLink({ uri })
  ])

  return new ApolloClient({
    initialState,
    ssrMode: !process.browser, // Disables forceFetch on the server (so queries are only run once)
    networkInterface: link
  })
}

export default function initApollo (initialState, options) {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (!process.browser) {
    return create(initialState, options)
  }

  // Reuse client on the client-side
  if (!apolloClient || options.recreateApollo) {
    apolloClient = create(initialState, options)
  }

  return apolloClient
}
