import gql from 'graphql-tag'

export const getAssets = gql`
query getAssets ($categoryIds: [ID], $after: String) {
  media_find (categoryIds: $categoryIds, first: 10, after: $after) {
    pageInfo {
      hasNextPage
      endCursor
    }
    edges {
      cursor
      node {
        id
        url
        categories {
          id
          name
          color
        }
      }
    }
  }
}`
