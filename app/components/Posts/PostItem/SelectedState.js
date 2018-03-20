import React from 'react'
import {Tab, Icon, Button, Image} from 'semantic-ui-react'

import { es6DateToDateTime } from '../../../libraries/helpers'
import Notification from '../../Notification'

import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'

import {
  createContentMutation, deleteContentMutation, updateContentMutation, createContentScheduleMutation, updateContentScheduleMutation, editContentAddMediaMutation, editContentRemoveMediaMutation
} from '../graphql/contentMutations'

import contentSchedulesGql from '../graphql/contentSchedules.gql'

import TextEditor from '../../TextEditor'
import AssetsDropdown from '../../AssetDropdown'

class SelectedState extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      assets: this.props.medias,
      assetValidation: '',
      showAssets: false
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
      }).catch((e) => {
        Notification.error('Saving error')
      })
    })
  }

  onEdit = (date, time, index, calendarSlotId, moderate = null) => {
    const markup = this.props.text
    const dateValue = es6DateToDateTime(date, time)
    const mediaIds = this.state.assets.map(item => item.id)
    const socialProfileId = this.props.socialId
    const contentId = this.props.slotValue.contentId
    const contentScheduleId = this.props.slotValue.scheduleId

    if (!this.validateAssets()) {
      return
    }

    this.onEditContent(markup, contentId, socialProfileId, dateValue, contentScheduleId, calendarSlotId, moderate)
    // this.uploadMedia(availableFiles).then((mediaIds) => {
    this.editMedia(contentId, mediaIds)
    // })
  }

  onEditContent = (contentText, contentId, socialProfileId, contentSchedulePublishAt, contentScheduleId, calendarSlotId, moderate) => {
    const {updateContent, updateContentSchedule, slotValue} = this.props
    let moderationStatus = moderate ? 'ACCEPTED' : 'WAITING'

    const doUpdateContentSchedule = (moderationStatus) => {
      updateContentSchedule({ contentId, socialProfileId, contentSchedulePublishAt, contentScheduleId, calendarSlotId, moderationStatus })
      .then(() => {
        Notification.success('Edited successfully.')
      }).catch((e) => {
        console.log(e)
        Notification.error('Editing error.')
      })
    }

    if ((contentText !== slotValue.text || this.state.assets.length) && !moderate) {
      moderationStatus = 'WAITING'
      updateContent({ contentText, contentId })
      .then(() => {
        doUpdateContentSchedule(moderationStatus)
      }).catch((e) => {
        Notification.error('Update content error.')
      })
    } else {
      doUpdateContentSchedule(moderationStatus)
    }
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

  render () {
    const {slotValue, onShowCampaign, text, activeTab, category, socialId, socialNetwork, onFocus, onClick} = this.props
    const {assets} = this.state
    let moderationStatusText
    let moderationStatusIcon
    let moderationStatusApprove
    switch (slotValue.moderationStatus) {
      case 'WAITING':
        moderationStatusText = 'Draft'
        moderationStatusIcon = 'pencil'
        moderationStatusApprove = true
        break
      case 'ACCEPTED':
        moderationStatusText = 'Approved'
        moderationStatusIcon = 'check'
        moderationStatusApprove = false
        break
      default:
        moderationStatusText = 'Draft'
        moderationStatusIcon = 'pencil'
        moderationStatusApprove = true
        break
    }

    const mediaFiles = assets.map((media, index) => this.renderMedia(media, index))

    return (<Tab.Pane className={activeTab ? 'post-item-pane active selected' : 'post-item-pane selected'} key={slotValue.id + socialNetwork}>
      <div
        className='post-item-content-wrapper active'
      >
        <div onClick={(e) => onClick(socialNetwork)}>
          <TextEditor
            key={slotValue.id}
            id='content-textarea'
            className='custom-form-control resize-none'
            defaultValue={text}
            onChange={(text) => this.props.onChange(text, socialNetwork)}
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
      </div>
      <div className='post-item-actions'>
        <Button className='category-button' style={{backgroundColor: !category.color ? '' : category.color}} onClick={() => onShowCampaign(category.id)}>
          {category.name}
        </Button>
        <div className='actions'>
          <div className='badge-status-wrapper'>
            {this.state.isEditing ?
              <Button className='success' onClick={() => this.onEdit(slotValue.date, slotValue.time, slotValue.id, moderationStatusApprove)}><Icon name={moderationStatusIcon} />{moderationStatusText}</Button>
              :
              <Button className='success' onClick={() => this.onSave(slotValue.date, slotValue.time, slotValue.id, [category.id], true)}><Icon name={moderationStatusIcon} />{moderationStatusText}</Button>
            }
          </div>
        </div>
      </div>
    </Tab.Pane>)
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
  graphql(deleteContentMutation, {
    props ({ ownProps, mutate }) {
      return {
        deleteContent ({id}) {
          return mutate({
            variables: {
              input: { id }
            }
          })
        }
      }
    }
  }),
  graphql(updateContentMutation, {
    props ({ ownProps, mutate }) {
      return {
        updateContent ({ contentText, contentId }) {
          return mutate({
            variables: {
              input: {
                contentText,
                contentId
              }
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
  }),
  graphql(updateContentScheduleMutation, {
    props ({ ownProps, mutate }) {
      return {
        updateContentSchedule ({contentId, socialProfileId, contentSchedulePublishAt, contentScheduleId, calendarSlotId, moderationStatus}) {
          return mutate({
            variables: {
              input: {
                contentId,
                socialProfileId,
                contentSchedulePublishAt,
                contentScheduleId,
                calendarSlotId,
                moderationStatus
              }
            },
            refetchQueries: [{
              query: contentSchedulesGql,
              variables: {
                profileIds: [ownProps.socialId]
              }
            }]
          })
        }
      }
    }
  }),
  graphql(editContentAddMediaMutation, {
    props ({ ownProps, mutate }) {
      return {
        editContentAddMedia ({contentId, mediaIds}) {
          return mutate({
            variables: {
              input: {
                contentId,
                mediaIds
              }
            },
            refetchQueries: [{
              query: contentSchedulesGql,
              variables: {
                profileIds: [ownProps.socialId]
              }
            }]
          })
        }
      }
    }
  }),
  graphql(editContentRemoveMediaMutation, {
    props ({ ownProps, mutate }) {
      return {
        editContentRemoveMedia ({contentId, mediaIds}) {
          return mutate({
            variables: {
              input: {
                contentId,
                mediaIds
              }
            },
            refetchQueries: [{
              query: contentSchedulesGql,
              variables: {
                profileIds: [ownProps.socialId]
              }
            }]
          })
        }
      }
    }
  })
)(SelectedState)
