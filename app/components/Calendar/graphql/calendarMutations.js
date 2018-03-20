import gql from 'graphql-tag'

export const createCalendarSlotMutation = gql`
mutation createCalendarSlot($input: CreateCalendarSlotInput!) {
  createCalendarSlot(input: $input) {
    calendarSlot {
      id
      day
      time
      type
      evergreen
      category {
        id
        name
      }
      socialProfile {
        id
        name
      }
      contentSchedules {
        id
        type
        publishAt
      }
    }
  }
}`

export const updateCalendarSlotMutation = gql`
mutation editCalendarSlot($input: EditCalendarSlotInput!) {
  editCalendarSlot(input: $input) {
    calendarSlot {
      id
      day
      time
      type
      evergreen
      category {
        id
        name
      }
      socialProfile {
        id
        name
      }
      contentSchedules {
        id
        type
        publishAt
      }
    }
  }
}`

export const deleteCalendarSlotMutation = gql`
mutation deleteCalendarSlot($input: DeleteInput!) {
  deleteCalendarSlot(input: $input)
}`

export const editCalendarRowTimeMutation = gql`
mutation editCalendarRowTime($input: EditCalendarRowTimeInput!) {
  editCalendarRowTime(input: $input)
}`
