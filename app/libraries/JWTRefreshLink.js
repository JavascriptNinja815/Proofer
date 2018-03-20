import ApolloLink, { Observable } from 'apollo-link'
import { createApolloFetch } from 'apollo-fetch'
import persist from './persist'

export default class JWTRefreshLink extends ApolloLink {
  constructor (params) {
    super()
    this.failed = false
    this.apolloFetch = createApolloFetch({ uri: params.uri })
    const authData = {
      token: params.token,
      teamId: params.teamId,
      refreshToken: params.refreshToken
    }
    this.refreshOperation = {
      query: `mutation tokenRefresh($input: RefreshTokenInput!) {
        tokenRefresh(input: $input) {
          token
        }
      }`,
      variables: {
        input: {
          refreshToken: authData.refreshToken
        }
      },
      context: {
        headers: {
          'authorization': authData.token ? `Bearer ${authData.token}` : null,
          'X-Proof-TeamId': authData.teamId ? `${authData.teamId}` : `NONE`
        }
      }
    }
  }

  request (operation, forward) {
    return new Observable(observer => {
      const subscriber = {
        next: data => {
          if (data.code === 401 && data.message === 'Expired JWT Token') {
            this.apolloFetch(this.refreshOperation)
              .then(refreshData => {
                if (refreshData.error) {
                  console.error(refreshData.error)
                } else {
                  persist.willSetAccessToken(refreshData.data.tokenRefresh.token)
                  operation.context.headers.authorization = `Bearer ${refreshData.data.tokenRefresh.token}`
                  const observable = forward(operation)
                  this.subscription = observable.subscribe(subscriber)
                }
              })
          } else {
            observer.next(data)
          }
        },
        error: error => {
          observer.error(error)
        },
        complete: () => {
        }
      }

      this.subscription = forward(operation).subscribe(subscriber)

      return () => {
        this.subscription.unsubscribe()
      }
    })
  }
}
