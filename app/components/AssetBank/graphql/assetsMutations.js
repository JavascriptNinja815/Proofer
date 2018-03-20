import gql from 'graphql-tag'

export const createMediaTag = gql`
mutation createMediaTag($input: EditMediaCategoriesInput!) {
  editMediumAddCategories(input: $input) {
    media {
      id
      url
    }
  }
}`

export const removeMediaTag = gql`
mutation removeMediaTag($input: EditMediaCategoriesInput!) {
  editMediumRemoveCategories(input: $input) {
    media {
      id
      url
    }
  }
}`
