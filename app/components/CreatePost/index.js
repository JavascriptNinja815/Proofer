import React from 'react'
import {Tab, Modal, Icon, Button, Image} from 'semantic-ui-react'

import { es6DateToDateTime } from '../../libraries/helpers'
import Notification from '../Notification'

import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'

import { createContentMutation, createContentScheduleMutation } from './graphql/contentMutations'

import contentSchedulesGql from './graphql/contentSchedules.gql'

import TextEditor from '../TextEditor'
import AssetsDropdown from '../AssetDropdown'

if (process.env.BROWSER) {
  require('./styles.scss')
}

class CreatePost extends React.Component {
  constructor (props) {
    super(props)

    const defaultTab = {
      text: '',
      savedAssets: [],
      assets: [],
      showAssets: false,
      columnClass: 'post-item-wrapper',
      editEnabled: false,
      postModified: false,
      activeTab: false
    }

    this.state = {
      activeTabIndex: 0,
      activeSocialNetwork: 'twitter',
      dummy: defaultTab,
      twitter: {
        ...defaultTab,
        activeTab: true
      },
      facebook: defaultTab,
      instagram: defaultTab
    }
  }

  validateAssets = () => {
    const {slotValue} = this.props
    const {assets} = this.state

    if (slotValue.socialProfile.socialNetwork === 'TWITTER') {
      if (assets.length > 4) {
        Notification.error('You can not save more then 4 images for twitter.')
        return false
      } else {
        let video = 0
        let gif = 0
        let image = 0

        assets.map((item, index) => {
          let mediaExt = item.ext
          if (mediaExt === '.jpg' || mediaExt === '.png' || mediaExt === '.jpeg') {
            image += 1
          } else if (mediaExt === '.gif') {
            gif += 1
          } else {
            video += 1
          }
        })
        if ((assets.length > 1 && assets.length !== image)
          || (assets.length > 1 && (gif > 1 || video > 1))) {
          Notification.error('You can have a maximum of 4 images OR 1 gif OR 1 video for twitter.')
          return false
        }
      }
    } else if (slotValue.socialProfile.socialNetwork === 'FACEBOOK') {
      if (slotValue.socialProfile.facebookPageName === null && assets.length > 6) {
        Notification.error('you can not add more than 6 images or videos')
        return false
      } else if (slotValue.socialProfile.facebookPageName !== null && assets.length > 1) {
        Notification.error('you can not add more than 1 image, gif or video on facebook page')
        return false
      }
    } else if (assets.length > 6) {
      Notification.error('you can not add more than 6 images or videos')
      return false
    }
    return true
  }

  onSelectAsset = (asset) => {
    const assets = this.state.assets
    const newAsset = asset
    let mediaType = 'image'
    let mediaExt = ''
    mediaExt = newAsset.url.slice(-4)
    if (mediaExt === '.jpg' || mediaExt === '.png' || mediaExt === '.jpeg' || mediaExt === '.gif') {
      mediaType = 'image'
    } else {
      mediaType = 'video'
    }

    const media = {
      id: newAsset.id,
      type: mediaType,
      url: newAsset.url,
      ext: mediaExt
    }
    assets.push(media)
    this.setState({ assets })
  }

  onSave = (date, time, calendarSlotId, categoryIds, moderate = null) => {
    const markup = this.props.text
    const assets = this.state.assets
    if (assets.length === 0 && !markup && !this.validateAssets()) {
      return
    }

    const mediaIds = this.state.assets.map(item => item.id)

    this.onCreateContent(date, time, calendarSlotId, markup, mediaIds, categoryIds, moderate)
    this.setState({
      text: ''
    })
  }

  onCreateContent = (date, time, calendarSlotId, contentText, mediaIds, categoryIds, moderate) => {
    const {socialId, createContent, createContentSchedule} = this.props
    const socialProfilesIds = [socialId]

    createContent({ contentText, categoryIds, mediaIds, socialProfilesIds })
    .then((data) => {
      const contentId = data.data.createContent.content.id
      const socialProfileId = socialId
      const contentSchedulePublishAt = es6DateToDateTime(date, time)
      const moderationStatus = moderate ? 'ACCEPTED' : 'WAITING'

      createContentSchedule({ contentId, socialProfileId, contentSchedulePublishAt, calendarSlotId, moderationStatus })
      .then((data) => {
        this.setState({
          savedAssets: this.state.assets,
          assets: [],
          text: this.state.text,
          editEnabled: true
        })
        Notification.success('Saved successfully.')
        this.props.onCloseModal()
      }).catch((e) => {
        Notification.error('Saving error')
      })
    })
  }

  editMedia = (contentId, mediaIds) => {
    const { editContentAddMedia } = this.props
    if (mediaIds.length > 0) {
      editContentAddMedia({ contentId, mediaIds })
      .then((data) => {
        this.setState({
          savedAssets: this.state.assets
        })
        Notification.success('Edited successfully.')
      }).catch((e) => {
        Notification.error('Editing error.')
      })
    }
  }

  onDeleteMedia = (contentId, mediaId, index) => {
    if (this.state.assets.length > 0) {
      const assets = this.state.assets
      assets.splice(index, 1)
      this.setState({
        assets
      })
    } else {
      const { editContentRemoveMedia } = this.props
      let mediaIds = [mediaId]
      const savedAssets = this.state.savedAssets
      savedAssets.splice(index, 1)
      this.setState({
        savedAssets
      })

      editContentRemoveMedia({ contentId, mediaIds })
      .then((data) => {
        Notification.success('Deleted successfully.')
      }).catch((e) => {
        console.log(e)
        Notification.error('Deletion error.')
      })
    }
  }

  renderMedia =(media, index) => {
    return (<div key={index} className='content-media'>
      {media.type === 'image' ?
        <Image src={media.url} className='pull-right custom-image-style' />
        :
        <video width='500' height='340' controls>
          <source src={media.url} type={`video/${media.ext}`} />
          Your browser does not support the video tag.
        </video>
      }
      <span className='image-action remove' onClick={() => this.onDeleteMedia(this.props.slotValue.contentId, media.id, index)}><Icon name='close' /></span>
    </div>)
  }

  onChange = (text, socialNetwork) => {
    const currState = this.state[socialNetwork]
    currState.text = text
    this.setState({
      [socialNetwork]: currState
    })
  }

  renderTabPane = () => {
    const {socialId, selectDate, selectTime, selectId} = this.props
    const {activeSocialNetwork} = this.state
    const { assets, text, category } = this.state[activeSocialNetwork.toLowerCase()]

    const mediaFiles = assets.map((media, index) => this.renderMedia(media, index))

    return (<div className='post-item-pane'>
      <div
        className='post-item-content-wrapper active'
      >
        <TextEditor
          key={selectId}
          id='content-textarea'
          className='custom-form-control resize-none'
          defaultValue={text}
          onChange={(text) => this.onChange(text, activeSocialNetwork)}
          attachMediaIcon={mediaFiles.length === 0}
          onShowAttachAssets={() => this.setState({showAssets: !this.state.showAssets})}
        />
        <div className={mediaFiles.length > 0 ? 'post-item-media active' : 'post-item-media'}>
          {mediaFiles.length > 1 ?
            <div className={`image-grid col-${mediaFiles.length}`}>
              {mediaFiles}
              <span className='image-action edit' onClick={() => this.setState({showAssets: !this.state.showAssets})}><Icon name='plus circle' /></span>
            </div>
            :
            <div className={`image-grid col-1`}>
              {mediaFiles}
              <span className='image-action edit' onClick={() => this.setState({showAssets: !this.state.showAssets})}><Icon name='plus circle' /></span>
            </div>
          }
        </div>
        {this.state.showAssets && <div className='add-assets-wrapper'>
          <AssetsDropdown
            socialId={socialId}
            assets={this.state.assets}
            searchTerm={this.state.searchTerm}
            uploadAsset={this.onUploadAsset}
            onSelectAsset={this.onSelectAsset}
          />
        </div>
        }
      </div>
      <div className='post-item-actions'>
        <div className='actions'>
          <div className='badge-status-wrapper'>
            <Button className='success empty' onClick={() => this.props.onCloseModal()}>Cancel</Button>
            <Button className='success' onClick={() => this.onSave(selectDate, selectTime, selectId, [category.id], true)}>Add Post</Button>
          </div>
        </div>
      </div>
    </div>)
  }

  onTabChange = (event, data) => {
    let socialNetwork = 'twitter'
    if (data.activeIndex === 1) {
      socialNetwork = 'facebook'
    } else if (data.activeIndex === 2) {
      socialNetwork = 'instagram'
    }
    this.setState({
      activeTabIndex: data.activeIndex,
      activeSocialNetwork: socialNetwork
    })
  }

  render () {
    const {activeSocialNetwork} = this.state

    const { columnClass } = this.state[activeSocialNetwork.toLowerCase()]

    const panes = [
      { menuItem: { key: 'twitter', icon: 'twitter', content: '' }, render: () => this.renderTabPane('twitter') },
      { menuItem: { key: 'facebook', icon: 'facebook', content: '' }, render: () => this.renderTabPane('facebook') },
      { menuItem: { key: 'instagram', icon: 'instagram', content: '' }, render: () => this.renderTabPane('instagram') }
    ]

    return (<Modal
      open={this.props.modalOpen}
      onClose={this.props.onCloseModal}
      className='post-item-pane'
      size='small'
    >
      <Modal.Content scrolling>
        <div className={columnClass}>
          <div className='post-item-content'>
            <Tab
              grid={{paneWidth: 12, tabWidth: 5}}
              panes={panes}
              onTabChange={this.onTabChange}
              renderActiveOnly
            />
          </div>
        </div>
      </Modal.Content>
    </Modal>)
  }
}

export default compose(
  graphql(createContentMutation, {
    props ({ ownProps, mutate }) {
      return {
        createContent (vars) {
          return mutate({
            variables: {
              input: vars
            }
          })
        }
      }
    }
  }),
  graphql(createContentScheduleMutation, {
    props ({ ownProps, mutate }) {
      return {
        createContentSchedule ({contentId, socialProfileId, contentSchedulePublishAt, calendarSlotId, moderationStatus}) {
          return mutate({
            variables: {
              input: {
                contentId,
                socialProfileId,
                contentSchedulePublishAt,
                calendarSlotId,
                moderationStatus
              }
            },
            refetchQueries: [{
              query: gql`${contentSchedulesGql}`,
              variables: {
                profileIds: [ownProps.socialId]
              }
            }]
          })
        }
      }
    }
  })
)(CreatePost)
