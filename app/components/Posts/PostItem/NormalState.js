import React from 'react'
import {Tab, Icon, Button, Popup, Label, Image} from 'semantic-ui-react'
import Logo from '../../../static/images/proofer-logo.svg'
import ContentComments from '../../Comments'

class NormalState extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      showComments: false
    }
  }

  onToggleComment = () => this.setState({showComments: !this.state.showComments})

  renderMedia = (media, index) => {
    return (<div key={index} className='content-media'>
      {media.type === 'image' ?
        <Image src={media.url} className='pull-right custom-image-style' />
        :
        <video width='500' height='340' controls>
          <source src={media.url} type={`video/${media.ext}`} />
          Your browser does not support the video tag.
        </video>
      }
    </div>)
  }

  render () {
    const {activeTab, text, medias, category, contentId, socialId, socialNetwork, comments, date, onShowCampaign, onFocus, onClick} = this.props
    const mediaFiles = medias.map((media, index) => this.renderMedia(media, index))

    return (<Tab.Pane className={activeTab ? 'post-item-pane active' : 'post-item-pane'} key={contentId + socialNetwork}>
      <div onClick={(e) => onClick(socialNetwork)}>
        <div className="post-item-body">{text || 'No content'}</div>
        {mediaFiles.length > 0 && <div className='post-item-media normal-state active'>
          {mediaFiles.length > 1 ?
            <div className={`image-grid col-${mediaFiles.length}`}>
              {mediaFiles}
            </div>
            :
            <div className={`image-grid col-1`}>
              {mediaFiles}
            </div>
          }
          </div>
        }
      </div>
      <div className='post-item-actions'>
        {
          date < new Date() &&
          <div className='post-short-stat'>
            <div className='social-stat'>
              <span><Icon name='heart' color='#E8363B' />10</span>
              <span><Icon name='retweet' color='#3B7ADB' />10</span>
              <span><Icon name='comment' color='#939191' />10</span>
            </div>
          </div>
        }
        <Button className='category-button' style={{backgroundColor: !category.color ? '' : category.color}} onClick={() => onShowCampaign(category.id)}>
          {category.name}
        </Button>
        <div className='actions'>
          { contentId &&
            <Popup
              trigger={
                <Button className='comments-btn warning'>
                  Feedback Recieved
                  {/* <Label size='mini' floating circular>{comments.length}</Label> */}
                </Button>
              }
              key={contentId}
              on='click'
              open={comments && this.state.showComments}
              onClose={this.onToggleComment}
              onOpen={this.onToggleComment}
              position='bottom right'
              flowing
            >
              <Popup.Header>Comments</Popup.Header>
              <Popup.Content>
                <ContentComments comments={comments} contentId={contentId} socialId={socialId} />
              </Popup.Content>
            </Popup>
          }
          <span className='status success bold'>Posted</span>
          <Logo width='14px' fill='#4ADB91' className='logo' viewBox='0 0 50 62' />
        </div>
      </div>
    </Tab.Pane>)
  }
}

export default NormalState
