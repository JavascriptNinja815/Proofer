import React from 'react'
import { Grid } from 'semantic-ui-react'
import { graphql } from 'react-apollo'

import Loader from '../Loader'
import CampaignsItems from './CampaignsItems'
import {fetchOneCategoryQuery} from './graphql/categoryQueries'

if (process.env.BROWSER) {
  require('./styles/react-search-input.scss')
}

const CampaignsItemsWrapper = ({ data, categoryId }) => {
  if (data.loading) {
    return <Loader />
  }

  if (data.error) {
    return (<div className='page-wrapper'>
      {data.error.message}
    </div>)
  }

  if (!data.category) {
    return (<Grid centered>
      There is no available contents
    </Grid>)
  }

  const items = data.category.contents.edges.map((e) => ({...e.node}))
  return (<div>
    <CampaignsItems
      hasNextPage={data.category.contents.pageInfo.hasNextPage}
      endCursor={data.category.contents.pageInfo.endCursor}
      categoryId={categoryId}
      items={items}
    />
  </div>)
}

export default graphql(fetchOneCategoryQuery, {
  options: (props) => ({
    variables: {
      id: props.categoryId
    }
  })
})(CampaignsItemsWrapper)
