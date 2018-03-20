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

export const deleteContentMutation = gql`
mutation deleteContent($input: DeleteInput!) {
  deleteContent(input: $input)
}`

export const updateContentMutation = gql`
mutation editContent($input: EditContentInput!) {
  editContent(input: $input) {
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

export const createContentScheduleMutation = gql`
mutation createContentSchedule($input: CreateContentScheduleInput!) {
  createContentSchedule(input: $input) {
    contentSchedule {
      id
      type
      moderationStatus
      publishAt
      socialProfile {
        id
        name
      }
      content {
        id
        text
        media {
          id
          url
        }
      }
      calendarSlot {
        id
        day
        time
        type
      }
    }
  }
}`

export const updateContentScheduleMutation = gql`
mutation editContentSchedule($input: EditContentScheduleInput!) {
  editContentSchedule(input: $input) {
    contentSchedule {
      id
      type
      moderationStatus
      publishAt
      socialProfile {
        id
        name
      }
      content {
        id
        text
        media {
          id
          url
        }
      }
      calendarSlot {
        id
        day
        time
        type
      }
    }
  }
}`

export const editContentAddMediaMutation = gql`
mutation editContentAddMedia($input: EditContentMediaInput!) {
  editContentAddMedia(input: $input) {
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

export const editContentRemoveMediaMutation = gql`
mutation editContentRemoveMedia($input: EditContentMediaInput!) {
  editContentRemoveMedia(input: $input) {
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
      }
    }
  }
}`
