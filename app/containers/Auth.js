import React, {Component} from 'react'
import { Helmet } from 'react-helmet'
import { withApollo } from 'react-apollo'
import Notifications from 'react-notify-toast'
import PropTypes from 'prop-types'
import App from '../components/App'
import Header from '../components/Header'
import TopHeader from '../components/Header/TopHeader'
import Sidebar from '../components/Sidebar'
import persist from '../libraries/persist'

class Auth extends Component {
  constructor (props) {
    super(props)
    this.state = {
      sidebarOpen: true,
      token: this.props.token,
      refreshToken: this.props.refreshToken,
      teamId: this.props.teamId,
      socialId: this.props.socialId,
      socialIds: this.props.socialIds
    }
  }

  handleViewSidebar = () => {
    this.setState({
      sidebarOpen: !this.state.sidebarOpen
    })
  }

  useSocialProf = (socialId) => {
    persist.willSetCurrentSocialProfile(socialId)
    this.setState({
      socialId: socialId
    })
    //setTimeout(() => {
      this.props.client.resetStore()
    //}, 500)
  }

  useTeamId = (teamId) => {
    persist.willSetTeamId(teamId)
    persist.willSetCurrentSocialProfile('')
    this.setState({
      teamId: teamId,
      socialId: '',
    })
    // Force page refresh
    if (typeof window !== 'undefined') window.location.reload()
  }

  render () {
    const { title, url, children } = this.props
    const {sidebarOpen, token, refreshToken, socialId, socialIds, teamId} = this.state

    const childrenWithProps = React.Children.map(children,
     (child) => React.cloneElement(child, {
       token: token,
       socialId: socialId,
       socialIds: socialIds,
       teamId: teamId
     })
    )

    return (<App>
    <div className={!sidebarOpen ? "sidebar-compact" : ''}>
      <Helmet>
        <title>
          {title !== '' ? `${title} :: Proofer` : 'Proofer'}
        </title>
      </Helmet>
      <Notifications />
      <Header
        token={token}
        refreshToken={refreshToken}
        teamId={teamId}
        socialId={socialId}
        socialIds={socialIds}
        toggleSidebar={() => this.setState({ sidebarOpen: !this.state.sidebarOpen })}
        useSocialProf={this.useSocialProf}
        useTeamId={this.useTeamId}
        pathname={url.pathname}
      />
      <Sidebar
        activeItem={url.pathname}
        toggleSidebar={() => this.setState({ sidebarOpen: !this.state.sidebarOpen })}
        isOpen={this.state.sidebarOpen}
      />

      <TopHeader />
      {childrenWithProps}
    </div>
    </App>)
  }
}

Auth.propTypes = {
  title: PropTypes.string,
  url: PropTypes.object.isRequired,
  children: PropTypes.element.isRequired
}

Auth.defaultProps = {
  title: ''
}

export default withApollo(Auth)
