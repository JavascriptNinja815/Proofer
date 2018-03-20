import React, { Component } from 'react'
import { graphql, compose } from 'react-apollo'
import { 
  Card, 
  Segment, Grid, 
  Image, Header, 
  Icon, Button, 
  Label, Confirm, 
  Modal } from 'semantic-ui-react'
import Notification from '../Notification'
import { mediaUrl } from '../../libraries/constants'
import persist from '../../libraries/persist'
import {LightenDarkenColor} from '../../libraries/helpers'
import Loader from '../Loader'
import Freshness from '../Freshness';
import AddAssetsModal from './AddAssetsModal';
import {assetsByCategory ,deleteMedium} from './graphql/AssetQueries'


 class CategoryView extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false,
      deleteMediaId: null,
      confirmBox: false,
      addAssetBox: false
    }
  }
  
  renderMedia = (m) => {

    let isImage = m.url.match(/\.(jpeg|jpg|gif|png)$/) !== null

    return (
    <Grid.Column key={m.id}>
      <Card className="media-card">
        <Card.Content extra textAlign={'right'}>
          <Icon name='archive' />
          <Icon name='trash' onClick={() => this.onDeleteMedium(m.id)} />
        </Card.Content>

        {isImage ?
                <Image key={m.id} src={m.url} /> 
              : <video key={m.id} src={m.url} className='ui image' />}
        <Card.Content extra textAlign={'left'}>
          {m.categories.map(c => {
            return <Label key={c.id} style={{
              backgroundColor: (c.color)?LightenDarkenColor(c.color, 60) : LightenDarkenColor("#E84A47", 60),
              color: (c.color)? LightenDarkenColor(c.color, -40) : LightenDarkenColor("#E84A47", -40), 
              fontWeight: 900
              }}>
              {c.name}
            </Label>
          })}
          
        </Card.Content>
      </Card>
    </Grid.Column>)
  }

  toggleAssetModel = (addAssetBox) => this.setState({ addAssetBox })

  onDeleteMedium = (deleteMediaId) => {
    var confirmBox = true
    this.setState({deleteMediaId, confirmBox})
  }

  handleCancel = () => this.setState({ confirmBox: false, deleteMediaId: null })

  handleConfirm = () => {
    const { deleteMediaId } = this.state
    const { deleteMedium } = this.props

    this.setState({
      confirmBox: false,
      deleteMediaId: null
    })

    deleteMedium({ deleteMediaId })
    .then((data) => {
      Notification.success('Deleted successfully.')
    }).catch((e) => {
      Notification.error('Deletion error.')
    })
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

    const category = data.category;
    let mediaList = [];
    mediaList = category.media.edges.map(m => this.renderMedia(m.node));

    if(mediaList.length == 0){
      return (<div className='page-wrapper'>
        No Assets Available
      </div>)
    } 

    return [<Grid key={0}>
      <Grid.Row verticalAlign={'middle'}>
        <Grid.Column><Button circular basic icon='chevron left' className="back-btn light-green" 
        onClick={this.props.back}  /></Grid.Column>
        <Grid.Column width={6}>
          <Segment >
            <div className='assets-item'>
              <div className='category-title'>
              <div className='category-color' style={{backgroundColor: category.color || "#E84A47"}} />
                <Header as='h4'>{category.name}</Header> 
              </div>
              <div className='category-assets'>Total Assets <span className='thin-number'>{mediaList.length}</span></div>
              <div className='assets-freshness'><div className='category-assets'>Freshness</div><Freshness percentage={80} /></div>
            </div>
          </Segment>
        </Grid.Column>
        <Grid.Column  width={2} floated={'right'}>
          <Button fluid size={'mini'} className="light-green" onClick={(e) => this.toggleAssetModel(true)}>Add Asset</Button>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column width={15} floated={'right'}>
          <Grid columns="3" centered doubling stackable className="masonry">
            {mediaList}
          </Grid>
        </Grid.Column>
      </Grid.Row>
    </Grid>,
    <Confirm key={1}
      className='deleteConfirm'
      open={this.state.confirmBox}
      onCancel={this.handleCancel}
      onConfirm={this.handleConfirm}
      size='small'
    />,
    <Modal key={2} 
    className="add-asset-modal"
    closeIcon={true}
    closeOnDimmerClick={false}
    size='small'
    onClose={(e) => this.toggleAssetModel(false)}
    open={this.state.addAssetBox}> 
    <AddAssetsModal 
      socialId={this.props.socialId}
      selectedCategory={this.props.categoryId}
      closeModal={(e) => this.toggleAssetModel(false)}
    />
    </Modal>
  ];
  }
}


export default compose(
  graphql(assetsByCategory, {
    options: (ownProps) => ({
      variables: {
        id: ownProps.categoryId
      }
    })
  }),
  graphql(deleteMedium, {
    props ({ ownProps, mutate }) {
      return {
        deleteMedium ({deleteMediaId}) {
          return mutate({
            variables: {
              input: {
                id: deleteMediaId
              }
            },
            refetchQueries: [{
              query: assetsByCategory,
              variables: {
                id: ownProps.categoryId
              }
            }]
          })
        }
      }
    }
  })
)(CategoryView)
