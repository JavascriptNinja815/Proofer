import React, { Component } from 'react'
import { Icon } from 'semantic-ui-react'
import { withApollo } from 'react-apollo'
import { Draggable } from 'react-drag-and-drop'
import MasonryInfiniteScroller from 'react-masonry-infinite'

import Notification from '../Notification'
import Loader from '../Loader'
import {fetchOneCategoryQuery} from './graphql/categoryQueries'

if (process.env.BROWSER) {
  require('./styles/react-search-input.scss')
}

class CampaignsItems extends Component {
  constructor (props) {
    super(props)
    this.state = {
      hasMore: this.props.hasNextPage,
      endCursor: this.props.endCursor,
      oldEndCursor: '',
      loading: false,
      items: this.props.items
    }
  }

  loadMore = (pageNumber) => {
    const _items = this.state.items
    const { oldEndCursor, endCursor, loading } = this.state
    if (endCursor === oldEndCursor || loading) {
      return
    }
    console.log('=== Load More ===')
    this.setState({
      loading: true
    })
    this.props.client.query({
      query: fetchOneCategoryQuery, 
      variables: {
        id: this.props.categoryId,
        after: endCursor
      }
    }).then((graphQLResult) => {
      const { errors, data } = graphQLResult
      if (errors) {
        if (errors.length > 0) {
          Notification.error(errors[0].message)
        }
      } else {
        const availableContent = data.category.contents.edges.map((e) => ({...e.node}))
        this.setState({
          items: [..._items, ...availableContent],
          hasMore: data.category.contents.pageInfo.hasNextPage,
          endCursor: data.category.contents.pageInfo.endCursor,
          oldEndCursor: endCursor,
          loading: false
        })
      }
    }).catch((error) => {
      Notification.error(error.message)
    })
  }

  render () {
    const {items} = this.state

    if (items.length === 0) {
      return <div className='post-short-item'>
        No posts
      </div>
    }

    return (<div>{/*<MasonryInfiniteScroller
      className='categoryGrid'
      pageStart={0}
      loadMore={this.loadMore}
      sizes={[{ columns: 3, gutter: 10 }]}
      loader={<Loader />}
      pack
      packed='data-packed'
      hasMore={this.state.hasMore}
    >*/}
      {items.map((content, index) =>
        <div key={content.id} className='post-short-item'>
          <div className='post-short-content'>
            <div className='post-short-stat'>
              <div>
                <Icon name='twitter' />
                <Icon name='facebook' />
                <Icon name='instagram' />
              </div>
              <div className='social-stat'>
                <span><Icon name='heart' />10</span>
                <span><Icon name='refresh' />10</span>
                <span><Icon name='comment' />10</span>
              </div>
              <div>
                <b>Times posted:&nbsp;2</b>
              </div>
            </div>
            <div className='post-short-desc'>
              {content.text}
            </div>
          </div>
        </div>
      )}
    </div>)
  }
}

export default withApollo(CampaignsItems)
