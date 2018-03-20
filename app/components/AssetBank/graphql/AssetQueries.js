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

export const deleteMedium = gql`
mutation deleteMedium($input: DeleteInput!) {
  deleteMedium(input: $input)
}`

export const getCategorybySocialIdQuery = gql`
query socialProfile ($id: ID!) {
  socialProfile(id : $id) {
    categories {
      edges {
        node {
          id
          name
          color
        }
      }
    }
  }
}`


export const assetsBySocialProfile = gql`
query assetsBySocialProfile ($id: ID!) {
  categories_bySocialProfile(socialProfileId: $id)
  {
    id
    name
    color
    media{
      edges{
        node{
          id
          url
        }
      }
    }
  } 
}`
export const assetsByCategory = gql`
query assetsByCategory ($id: ID!) {
  category(id: $id)
  {
    id
    name
    color
    media{
      edges{
        node{
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
  } 
}`


