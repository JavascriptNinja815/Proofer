import gql from 'graphql-tag'

export const getCategorybySocialIdQuery =
gql`query socialProfile ($id: ID!) {
  socialProfile(id : $id) {
    id
    categories {
      edges {
        node {
          id
          name
          color
          media(last: 1) {
            edges {
              node {
                id
                url
              }
            }
          }
        }
      }
    }
  }
}`
