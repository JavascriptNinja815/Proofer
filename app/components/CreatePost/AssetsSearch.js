import React from 'react'
import { graphql } from 'react-apollo'
import {createFilter} from 'react-search-input'
import { Grid, Icon, Image,Checkbox, Divider } from 'semantic-ui-react'
import { getCategorybySocialIdQuery } from './graphql/categoryQueries'
import Loader from '../Loader'

const KEYS_TO_FILTERS = ['name', 'url']

const AssetsSearch = ({ socialProfile, searchTerm, onAssetSelected, selectedAssetIds}) => {

  const fetchedArray = !socialProfile ? [] : socialProfile.categories
  if (fetchedArray.length === 0) {
    return <Loader />
  }

  const availableCategories = fetchedArray.edges.map((e) => ({...e.node}))
  let assets = [];

  availableCategories.map((category, index) => {
    let mediaList = category.contents.edges.map((e) => ({...e.node.media}));
    if(mediaList.length){
      mediaList.forEach(function(media) {
        let keys = Object.keys(media);
        for (let i=0; i< keys.length; i++){
          let m = media[i];
          let assetInfo = {
            id: m.id,
            name : [category.name],
            url : m.url
          }
          if(m.id in assets && assets[m.id]['name'].indexOf(category.name) === -1) {
            assets[m.id]['name'].push(category.name);
          } else {
            assets[m.id] = assetInfo;
          }
        }
      });
    }
  })
  let assetsArr = []
  Object.keys(assets).map(function(objectKey, index) {
    assets[objectKey]['name'] = assets[objectKey]['name'].join();
    assetsArr.push(assets[objectKey]);
  });

  const filteredAssets= assetsArr.filter(createFilter(searchTerm, KEYS_TO_FILTERS))

  return (<Grid className="asset search">
      <Grid.Row columns={2}>
        {filteredAssets.map((asset, index) => {
          const assetInfo = {
            name: asset.name,
            id: asset.id,
            url: asset.url,
            isPhoto: (/\.(jpe?g|png|gif|bmp)$/i.test(asset.url))? true: false,
            selected: selectedAssetIds.indexOf(asset.id) != -1 ? true : false,
            label: { as: 'a',  corner: 'right', icon: 'check' }
          }

          return (
          <Grid.Column width={8} key={assetInfo.id}  >
            <Checkbox 
                value={assetInfo.id}
                defaultChecked={assetInfo.selected} 
                onClick={onAssetSelected} 
                />
              {assetInfo.isPhoto ?
                <Image src={assetInfo.url} 
                  size={'small'}  spaced
                  label={assetInfo.selected && assetInfo.label}
                  shape={'rounded'}
                  className='no-padding with-checkbox'
                   />
                :
                <video src={assetInfo.url} className='show-video-control' />
              }
              <Divider />
          </Grid.Column >)
        })}
      </Grid.Row>
    </Grid> )
}

export default graphql(getCategorybySocialIdQuery, {
  options: (ownProps) => ({
    variables: {
      id: ownProps.socialId
    }
  }),
  props: ({data: { socialProfile }}) => ({ socialProfile })
})(AssetsSearch)
