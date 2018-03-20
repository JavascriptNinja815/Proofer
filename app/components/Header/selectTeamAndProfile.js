import React, { Component } from 'react'
import {Icon, Image, Menu, Popup} from 'semantic-ui-react'
import persist from '../../libraries/persist'

class SelectTeamAndProfile extends Component {
  componentWillMount () {
    const { myTeams, teamId, socialId } = this.props
    if (!socialId && teamId && myTeams) {
      myTeams.edges.map((currentValue) => {
        const team = currentValue.node
        console.log(team.socialProfiles.edges)
        if (teamId === team.id && team.socialProfiles.edges.length !== 0) {
          this.props.useSocialProf(team.socialProfiles.edges[0].node.id)
        }
      })
    }
  }

  render () {
    const { myTeams, teamId, socialIds } = this.props

    let teams = []
    let profiles = []

    if (myTeams) {
      teams = myTeams.edges.map((currentValue) => {
        const team = currentValue.node
         if (teamId === team.id) {
          profiles = team.socialProfiles.edges.map((currentValue) => {
            const profile = currentValue.node
            if (profile) {
              let avatar
              if (profile.profilePicture) {
                avatar = (<Image size={'mini'} circular src={profile.profilePicture} />)
              } else {
                let icon = 'twitter'
                switch (profile.socialNetwork) {
                  case 'TWITTER':
                    icon = 'twitter'
                    break
                  case 'FACEBOOK':
                    icon = 'facebook f'
                    break
                  case 'LINKEDIN':
                    icon = 'linkedin '
                    break
                  default:
                    icon = 'user'
                }
                avatar = (<Icon className="social-icon" size={'large'} name={icon}/>)
              }

              return {
                key: profile.id,
                avatar: avatar,
                text: profile.name,
                value: profile.id,
              }
            }

            return {}
          })
        }

        return {
          key: team.id,
          text: team.name,
          value: team.id
        }
      })
    }

    if (!socialIds) {
      const socialProfiles = JSON.stringify(profiles.map(profile => profile.key.trim()))
      persist.willSetCurrentMultiSocialProfiles(socialProfiles)
    }

    return (
      <Menu.Item className="social-section">
        {/* <Dropdown placeholder='Use Team'
                  className='link item'
                  selection
                  value={teamId}
                  options={teams}
                  selectOnBlur={false}
                  onChange={(e, data) => this.props.useTeamId(data.value)}
        /> */}

        {profiles.map((profile, index)=> {
          const selected = (profile.value === this.props.socialId)
          return <div key={index}
          className={'social-profile ' + (selected ? ' selected' : '')}
          onClick={(e) => this.props.useSocialProf(profile.value)}>

            <Popup className='social_profile_popup'
              trigger={profile.avatar}
              content={profile.text}
              position={'right center'}
              size={'tiny'}
              inverted
            />
          </div>;
        })}

        {/* <Dropdown placeholder='Use social profile'
          className='link item select-social-profile'
          selection
          value={socialId}
          options={teamId ? profiles : []}
          selectOnBlur={false}
          onChange={(e, data) => this.props.useSocialProf(data.value)}
        /> */}
      </Menu.Item>
    )
  }
}

export default SelectTeamAndProfile
