import gql from 'graphql-tag'

export const getCategorybySocialIdQuery =
gql`
query socialProfile ($id: ID!) {
  socialProfile(id : $id) {
    id
    categories {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          name
          color
          contents {
            edges {
              node {
                id
              }
            }
          }
        }
      }
    }
  }
}`
