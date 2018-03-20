import React, {Component} from 'react'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
// Graphql
import calendarSlotsGql from './graphql/calendarSlots.gql'

import Loader from '../Loader'
import PostList from './PostList'

class Posts extends Component {
  render () {
    const {calendarSlotsFind, loading, socialId, socialIds} = this.props
    if (!socialId) {
      return (
        <div className='page-wrapper'>
          Please select a social profile on the left, or click the + to connect a new one.
        </div>
      )
    }

    if (loading || !calendarSlotsFind) {
      return (
        <Loader />
      )
    }

    return (
      <div className='page-wrapper posts-page'>
        <PostList
          posts={calendarSlotsFind.edges}
          socialId={socialId}
          socialIds={socialIds}
        />
      </div>
    )
  }
}

export default graphql(gql`${calendarSlotsGql}`, {
  options: (props) => ({
    skip: !props.socialId,
    variables: {
      profileIds: [props.socialId],
      type: 'WEEKLY'
    }
  }),
  props: ({data: { calendarSlots_find, loading, error }}) => ({ calendarSlotsFind: calendarSlots_find, loading, error })
})(Posts)
