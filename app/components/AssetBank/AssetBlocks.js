import React, { Component } from 'react'
import { graphql, compose } from 'react-apollo'
import { Card, Segment, Grid, Image, Header, Dimmer, Divider } from 'semantic-ui-react'
import Notification from '../Notification'
import { mediaUrl } from '../../libraries/constants'
import persist from '../../libraries/persist'
import Loader from '../Loader'
import Freshness from '../Freshness';
import {assetsBySocialProfile} from './graphql/AssetQueries'

 class AssetBlocks extends Component {
  constructor (props) {
    super(props)
  }
  
  renderCategory = (category) => {

    const medias = category.media.edges.map((m) => m.node);

    if(!medias.length) {
      return;
    }

    const content = (
      <div>
        <Header as='h2' inverted>{medias.length > 6 && '+ ' + (medias.length - 6)}</Header>
      </div>
    )
    const active = true;

    const mediaList = medias.slice(0, 6).map((m, i) => {
      let isImage = m.url.match(/\.(jpeg|jpg|gif|png)$/) !== null

      if(i > 4) {
        return <Dimmer.Dimmable as={Grid.Column} 
            dimmed={active}
            key={m.id}
            dimmed={active}
            className='ui image'
            >
            <Dimmer className='' active={active} onClick={() => this.props.selectCategory(category.id)}>
              <Header as='h2' inverted>{medias.length > 6 && '+ ' + (medias.length - 6)}</Header>
            </Dimmer>
            {isImage ?
              <Image src={m.url} />
              :
              <video src={m.url} className='ui image' />
            }
        </Dimmer.Dimmable>
      }


      return <Grid.Column key={m.id}>
        {isImage ? <Image src={m.url} /> : <video src={m.url} className='ui image' />}
        </Grid.Column>;
    })

    return (<Grid.Column key={category.id}>
      <Segment.Group>
        <Segment onClick={() => this.props.selectCategory(category.id)}>
          <div className='assets-item'>
            <div className='category-title'>
              <div className='category-color' style={{backgroundColor: category.color || "#E84A47"}} />
              <Header as='h4'>{category.name}</Header> 
            </div>
            <div className='category-assets'>Total Assets <span className='thin-number'>{medias.length}</span></div>
            {/* <div className='divider'/> */}
            <div className='assets-freshness'><div className='category-assets'>Freshness</div><Freshness percentage={80} /></div>
          </div>
        </Segment>
        <Grid columns={3} doubling stackable className="assets-images no-padding">
          {mediaList}
        </Grid>
      </Segment.Group>
    </Grid.Column>)
  }

  render () {
    const { data } = this.props;

    if (data.loading) {
      return <Loader />
    }
  
    if (data.error) {
      return (<div className='page-wrapper'>
        {data.error.message}
      </div>)
    }
    let categoriesBlocks = [];

    if(data.categories_bySocialProfile && data.categories_bySocialProfile.length > 0){
      categoriesBlocks = data.categories_bySocialProfile.map((c) => this.renderCategory(c));
    }

    categoriesBlocks = categoriesBlocks.filter(n => n)


    if(categoriesBlocks.length == 0){
      return (<div className='page-wrapper'>
        No Assets Found
      </div>)
    } 

    return <Grid columns={3} >
      {categoriesBlocks}
    </Grid>;
  }
}


export default compose(
  graphql(assetsBySocialProfile, {
    options: (ownProps) => ({
      variables: {
        id: ownProps.socialId
      }
    })
  })
)(AssetBlocks)
