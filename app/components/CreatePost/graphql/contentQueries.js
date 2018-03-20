import gql from 'graphql-tag'

export const createContentMutation = gql`
mutation createContent($input: CreateContentInput!) {
  createContent(input: $input) {
    content {
      id
      text
      socialProfiles {
        id
        name
        socialNetwork
      }
      categories {
        id
        name
      }
      media {
        id
        url
      }
    }
  }
}`
