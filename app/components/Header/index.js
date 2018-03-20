import React, { Component } from 'react'
import { graphql, withApollo } from 'react-apollo'
import { createApolloFetch } from 'apollo-fetch'
import gql from 'graphql-tag'
import Link from 'next/link'
import { Menu, Dropdown, Icon, Dimmer, Divider } from 'semantic-ui-react'
import Loader from '../Loader'
import persist from '../../libraries/persist'
import redirect from '../../libraries/redirect'
import SelectTeamAndProfile from './selectTeamAndProfile.js'
import fetchTeamId from './fetchTeamId.gql'
import Gravatar from 'react-gravatar'

if (process.env.BROWSER) {
  require('./styles.scss')
}

class Header extends Component {
  constructor (props) {
    super(props)
  }

  logOut = () => {
    // Force a reload of all the current queries now that the user is
    // logged in
    this.props.client.resetStore().then(() => {
      // Clear store data
      persist.willRemoveAccessToken()
      persist.willRemoveRefreshToken()
      persist.willRemoveEmail()
      persist.willRemoveTeamId()
      persist.willRemoveCurrentSocialProfile()
      persist.willRemoveCurrentMultiSocialProfiles()

      // Now redirect to the homepage
      redirect({}, '/app/login')
    })
  }

  useProfile = (event, data) => {
    const service = data.value
    const teamId = this.props.teamId
    const token = this.props.token
    const refreshToken = this.props.refreshToken
    const baseUrl = process.env.API_ENDPOINT_BASE
    const baseUrlConnect = baseUrl + '/connect/' + service
    let fullUrl = baseUrlConnect + '?bearer=' + this.props.token + '&teamGID=' + teamId

    const refreshOperation = {
      query: `mutation tokenRefresh($input: RefreshTokenInput!) {
        tokenRefresh(input: $input) {
          token
        }
      }`,
      variables: {
        input: {
          refreshToken: refreshToken
        }
      },
      context: {
        headers: {
          'authorization': `Bearer ${token}`,
          'X-Proof-TeamId': `${teamId}`
        }
      }
    }

    const options = {
      headers: new Headers({
        'authorization': `Bearer ${token}`,
        'X-Proof-TeamId': `${teamId}`
      })
    }

    fetch(fullUrl, options).then((res) => {
      return res.json()
    })
    .then((res) => {
      if (res.code === 401 && res.message === 'Expired JWT Token') {
        const apolloFetch = createApolloFetch({ uri: baseUrl })
        apolloFetch(refreshOperation)
          .then((refreshData) => {
            console.log(refreshData)
            if (refreshData.error) {
              console.log('Refresh error data')
              console.error(refreshData.error)
            } else {
              persist.willSetAccessToken(refreshData.data.tokenRefresh.token)
              fullUrl = baseUrlConnect + '?bearer=' + refreshData.data.tokenRefresh.token + '&teamGID=' + teamId
              redirect({}, fullUrl)
            }
          })
          .catch((error) => {
            console.log('Apollo fetch error data')
            console.log(error)
          })
      } else {
        redirect({}, fullUrl)
      }
    })
    .catch((error) => {
      console.error(error)
      if (error.message === 'Failed to fetch') redirect({}, fullUrl)
    })
  }

  render () {
    const { data, errors, token, teamId, socialId, socialIds } = this.props
    if (!token) {
      return (<Dimmer active={true} page>
        <Loader />
      </Dimmer>)
    }

    if (errors) {
      return (<div>Error {errors[0].message}</div>)
    }

    if (data.me === undefined) {
      return (<Dimmer active={true} page>
        <Loader />
      </Dimmer>)
    }

    const email = persist.willGetEmail()

    const profiles = [
      {key: 'twitter', icon: 'twitter', text: 'Twitter', value: 'twitter'},
      {key: 'facebook', icon: 'facebook f', text: 'Facebook', value: 'facebook'},
      //{key: 'linkedin', icon: 'linkedin', text: 'LinkedIn', value: 'linkedin'}
    ]

    return (
      <Menu className='custom-navbar' inverted size={'mini'} fixed={'left'} vertical>
        {/*
        <Menu.Item header>
          <Icon name='content' onClick={this.toggleButtonClicked} />
        </Menu.Item>
        */}
        <Dropdown
          className='item'
          icon={ false}
          pointing={'left'}
          trigger={
            <span><Gravatar email={email} size={40} default="identicon" className="ui mini circular image" /></span>
          }>
          <Dropdown.Menu>
            <Link prefetch href='/app/account'>
              <Dropdown.Item
                text='My Account'
              />
            </Link>
            <Link prefetch href='/app/manageteam'>
              <Dropdown.Item
                text='Manage Team'
              />
            </Link>
            <Dropdown.Item
              className='log-out'
              text='Log Out'
              onClick={this.logOut.bind(this)} />
          </Dropdown.Menu>
        </Dropdown>




        <SelectTeamAndProfile useTeamId={this.props.useTeamId} useSocialProf={this.props.useSocialProf} teamId={teamId} socialId={socialId} socialIds={socialIds} myTeams={data.me.teams} />
        <Dropdown trigger={
            <span><Icon name='plus circle' size={'large'} /></span>
          }
          icon={ false}
          className='item add-profile'
          options={profiles}
          selectOnBlur={false}
          onChange={this.useProfile}
          pointing={'left'}
        />

      </Menu>
    )
  }
}

const HeaderWithData = graphql(gql`${fetchTeamId}`)(Header)
export default withApollo(HeaderWithData)
