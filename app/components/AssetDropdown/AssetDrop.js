import React from 'react'
import {Image, Button, Input} from 'semantic-ui-react'
import AddAssets from '../AssetBank/AddAssets'

if (process.env.BROWSER) {
  require('./dropdown.scss')
}

class AssetsDrop extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      allAssets: this.props.assets,
      assets: this.props.assets,
      allTags: this.props.tags,
      tags: this.props.tags,
      searchTerm: ''
    }
  }

  loadMore = () => {
    const assets = this.props.assetData.media_find.edges
    const tags = []
    assets.map(asset => asset.categories.map(cat => tags.push(cat)))
    this.setState({
      assets,
      tags
    })
  }

  onFilterAssetTag = (searchTerm) => {
    const assets = []
    this.state.allAssets.filter(item => {
      item.node.categories.map(cat => {
        if (cat.name.includes(searchTerm)) {
          assets.push(item)
        }
      })
    })
    const tags = this.state.allTags.filter(item => item.name.includes(searchTerm))
    this.setState({
      assets,
      tags,
      searchTerm
    })
  }

  onSelectAssetTag = (searchTerm) => {
    const assets = []
    this.state.allAssets.filter(item => {
      item.node.categories.map(cat => {
        if (cat.name === searchTerm) {
          assets.push(item)
        }
      })
    })
    const tags = this.state.allTags.filter(item => item.name === searchTerm)
    this.setState({
      assets,
      tags,
      searchTerm
    })
  }

  hexToRGB = (hex, opacity) => {
    hex = parseInt(hex.slice(1), 16)
    let r = hex >> 16
    let g = hex >> 8 & 0xFF
    let b = hex & 0xFF
    return `rgba(${r},${g},${b},${opacity})`
  }

  render () {
    const {onSelectAsset, socialId} = this.props
    const {assets, tags} = this.state

    return (
      <div className='add-assets-dropdown'>
        <div className='assets-search-upload'>
          <Input
            icon='search'
            iconPosition='left'
            placeholder='Type to filter by asset tag...'
            onChange={(event, {value}) => this.onFilterAssetTag(value)}
          />
          <AddAssets
            socialId={socialId}
          />
        </div>
        <div className='asset-tags'>
          {tags.map(tag => {
            const backColor = this.hexToRGB(tag.color, 0.25)
            const catColor = this.hexToRGB(tag.color, 1)
            return (<Button
              className='asset-button'
              onClick={() => this.onSelectAssetTag(tag.name)}
              style={{backgroundColor: backColor, color: catColor}}
            >
              {tag.name}
            </Button>)
          }
          )}
        </div>
        <div className='asset-list'>
          {assets.length > 0 ?
            assets.map(asset => {
              return (
                <div className='asset-item' onClick={() => onSelectAsset(asset.node)}>
                  <span className='asset-color-badge' style={{
                    zIndex: 10,
                    borderTop: `20px solid ${asset.node.categories[0] ? asset.node.categories[0].color : '#D6D6D6'}`,
                    borderBottom: '20px solid transparent',
                    borderRight: '20px solid transparent'
                  }}
                />
                  <Image src={asset.node.url} />
                </div>
              )
            })
            :
            <div className='no-assets'>
              Assets not found
            </div>
          }
        </div>
      </div>
    )
  }
}

export default AssetsDrop
