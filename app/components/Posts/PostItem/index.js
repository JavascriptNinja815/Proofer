import React, { Component } from 'react'
// import LazyLoad from 'react-lazyload'
import {Tab} from 'semantic-ui-react'

// Post components
import LeftSide from './LeftSide'
import NormalState from './NormalState'
import SelectedState from './SelectedState'

if (process.env.BROWSER) {
  require('./styles.scss')
}

class PostItem extends Component {
  constructor (props) {
    super(props)
    const {text, media} = props.slotValue
    const savedAssets = []
    if (media.length > 0) {
      let mediaType = 'image'
      let mediaExt = ''
      media.map((item, index) => {
        mediaExt = item.url.slice(-4)
        if (mediaExt === '.jpg' || mediaExt === '.png' || mediaExt === '.jpeg' || mediaExt === '.gif') {
          mediaType = 'image'
        } else {
          mediaType = 'video'
        }

        const mediaItem = {
          id: item.id,
          type: mediaType,
          url: item.url,
          ext: mediaExt
        }
        savedAssets.push(mediaItem)
      })
    }

    const defaultTab = {
      text: text || '',
      savedAssets: savedAssets,
      assets: [],
      columnClass: 'post-item-wrapper',
      editEnabled: false,
      postModified: false,
      activeTab: false
    }

    this.state = {
      activeTabIndex: 0,
      dummy: defaultTab,
      twitter: {
        ...defaultTab,
        activeTab: true
      },
      facebook: defaultTab,
      instagram: defaultTab
    }
  }

  onFocus = (socialNetwork) => {
    const currState = this.state[socialNetwork]
    currState.columnClass = 'post-item-wrapper post-item-wrapper-focus'
    currState.editEnabled = true
    currState.activeTab = true
    this.setState({
      [socialNetwork]: currState
    })
  }

  onBlur = (socialNetwork) => {
    this.setState({
      activeTabIndex: 0,
      twitter: {
        columnClass: 'post-item-wrapper',
        editEnabled: false
      },
      facebook: {
        columnClass: 'post-item-wrapper',
        editEnabled: false
      },
      instagram: {
        columnClass: 'post-item-wrapper',
        editEnabled: false
      }
    })
  }

  onChange = (text, socialNetwork) => {
    const currState = this.state[socialNetwork]
    currState.text = text
    this.setState({
      [socialNetwork]: currState
    })
  }

  renderTabPane = (socialNetwork) => {
    const socialState = this.state[socialNetwork.toLowerCase()]
    const { slotValue, onShowCampaign, socialId } = this.props
    const { text, savedAssets, assets, editEnabled, activeTab } = socialState

    const medias = savedAssets.length > 0 ? savedAssets : assets

    if (editEnabled) {
      return (
        <SelectedState
          slotValue={slotValue}
          activeTab={activeTab}
          text={text}
          medias={medias}
          socialId={socialId}
          socialNetwork={socialNetwork.toLowerCase()}
          category={slotValue.category}
          onShowCampaign={onShowCampaign}
          onClick={this.onFocus}
          onChange={this.onChange}
        />
      )
    }

    return (
      <NormalState
        activeTab={activeTab}
        text={text}
        medias={medias}
        category={slotValue.category}
        contentId={slotValue.contentId}
        comments={slotValue.comments}
        date = {slotValue.date}
        socialId={socialId}
        socialNetwork={socialNetwork.toLowerCase()}
        onShowCampaign={onShowCampaign}
        onClick={this.onFocus}
      />
    )
  }

  onTabChange = (event, data) => {
    this.setState({
      activeTabIndex: data.activeIndex
    })
  }

  render () {
    const { slotValue } = this.props
    const { columnClass } = this.state[slotValue.socialNetwork.toLowerCase()]

    const panes = [
      { menuItem: { key: 'twitter', icon: 'twitter', content: '' }, render: () => this.renderTabPane('twitter') },
      { menuItem: { key: 'facebook', icon: 'facebook', content: '' }, render: () => this.renderTabPane('facebook') },
      { menuItem: { key: 'instagram', icon: 'instagram', content: '' }, render: () => this.renderTabPane('instagram') }
    ]
    // <LazyLoad height={150} offset={300} once>
    return (
      <div key={slotValue.id} className={columnClass}>
        <LeftSide
          slotValueTime={slotValue.time}
        />
        <div className='post-item-content'>
          <Tab
            grid={{paneWidth: 12, tabWidth: 5}}
            panes={panes}
            onTabChange={this.onTabChange}
            renderActiveOnly
          />
        </div>
      </div>
    )
  }
}

export default PostItem
