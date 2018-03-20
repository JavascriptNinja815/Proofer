import React from 'react'
import { graphql, compose } from 'react-apollo'
import {getAssets} from './graphql/AssetQueries'

import Loader from '../Loader'
import AssetDrop from './AssetDrop'

if (process.env.BROWSER) {
  require('./dropdown.scss')
}

const AssetDropdown = ({socialId, uploadAsset, onSelectAsset, assetData}) => {
  if (assetData.loading) {
    return <Loader />
  }

  if (assetData.error) {
    return (<div className='page-wrapper'>
      {assetData.error.message}
    </div>)
  }
  const assets = assetData.media_find.edges
  const tags = []
  assets.map(asset => asset.node.categories.map(cat => tags.push(cat)))
  return (
    <AssetDrop
      assets={assets}
      tags={tags}
      socialId={socialId}
      onSelectAsset={onSelectAsset}
    />
  )
}

export default compose(
  graphql(getAssets, {
    options: (ownProps) => ({
      variables: {
        categoryIds: []
      }
    }),
    name: 'assetData'
  })
)(AssetDropdown)
