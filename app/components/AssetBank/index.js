import {Component} from 'react'
import { graphql, compose } from 'react-apollo'
import { getAssets } from './graphql/AssetQueries'
import AssetBlocks from './AssetBlocks'
import CategoryView from './CategoryView'
import Loader from '../Loader'

if (process.env.BROWSER) {
  require('./styles/index.scss')
}

class AssetsBank extends Component {
  constructor (props) {
    super(props)
    this.state = {
      selectedCategoryId: null
    }
  }

  selectCategory = (selectedCategoryId)  => this.setState({selectedCategoryId})


  render() {
    const {sortOption, selectedCategory, data, searchTerm, isPanel, socialId} = this.props

    const {selectedCategoryId} = this.state

    if(selectedCategoryId != null) {
      return <div className='page-wrapper assets-page category-view'>
        <CategoryView 
          categoryId={selectedCategoryId} 
          socialId={socialId} 
          back={() => this.selectCategory(null)}
        />
      </div>
    }
  
    /* if (data.loading) {
      return <Loader />
    }

    if (data.error) {
      return (<div className='page-wrapper'>
        {data.error.message}
      </div>)
    } 

    const availableAssets = !data.media_find ? [] : data.media_find.edges

    if (availableAssets.length === 0) {
      return (<div className={isPanel ? 'assets-page scroll-page' : 'page-wrapper assets-page'}>
        <div className='no-content'>
          Assets not found
        </div>
      </div>)
    }

    const filteredAsset = []
    availableAssets.map(asset => {
      const item = asset.node
      if (sortOption) {
        const isImage = item.url.match(/\.(jpeg|jpg|png)$/) !== null
        const isGif = item.url.match(/\.(gif)$/) !== null
        const isVideo = item.url.match(/\.(mp4|ogg|webm)$/) !== null

        if (sortOption === 'image' && isImage) {
          filteredAsset.push(asset)
        }
        if (sortOption === 'gif' && isGif) {
          filteredAsset.push(asset)
        }
        if (sortOption === 'video' && isVideo) {
          filteredAsset.push(asset)
        }
      } else {
        filteredAsset.push(asset)
      }
    }) */

    return <div id={isPanel ? 'assets-sticky' : ''} className={isPanel ? 'assets-page scroll-page' : 'page-wrapper assets-page'}>
      <AssetBlocks
        isPanel={isPanel}
        selectedCategory={selectedCategory}
        selectCategory={this.selectCategory}
        socialId={socialId}
      />
    </div>

  }
}

export default AssetsBank;