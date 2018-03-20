import React, { Component } from 'react'
import { graphql, compose } from 'react-apollo'
import { Dropdown, Icon, Grid, Input, Menu, Statistic } from 'semantic-ui-react'
import Loader from '../Loader'

if (process.env.BROWSER) {
  require('./styles/top-header.scss')
}

const options = [
  { key: 'edit', text: 'Edit Post', value: 'edit' },
  { key: 'delete', text: 'Remove Post', value: 'delete' },
  { key: 'hide', text: 'Hide Post', value: 'hide' },
]

class TopHeader extends Component {
  constructor (props) {
    super(props)
  }

  onFilter = (value) => console.log(value);

  render () {
    return (<div>
    <Menu borderless fixed="top" className="page-wrapper top-bar">
      <Menu.Item position={'left'}>
        <Input
          icon='search'
          iconPosition='left'
          placeholder='Search ...'
          onChange={(event, {value}) => this.onFilter(value)}
        />
      </Menu.Item>

      <Statistic.Group size={'small'}>
        <Statistic>
          <Statistic.Value>
          <span>100</span>
          </Statistic.Value>
          <Statistic.Label>assets</Statistic.Label>
        </Statistic>
        <Statistic>
          <Statistic.Value>
          <span>80</span>
          </Statistic.Value>
          <Statistic.Label>images</Statistic.Label>
        </Statistic>
        <Statistic>
          <Statistic.Value>
          <span>80</span>
          </Statistic.Value>
          <Statistic.Label>gifs</Statistic.Label>
        </Statistic>
        <Statistic>
          <Statistic.Value>
          <span>80</span>
          </Statistic.Value>
          <Statistic.Label>videos</Statistic.Label>
        </Statistic>
        <Statistic>
          <Statistic.Value>
            <span>80</span>
            <div className="indicator">
              <Icon size={'small'} color={'red'} name="arrow down" />
              <span>5</span>
            </div>
          </Statistic.Value>
          <Statistic.Label>Freshness</Statistic.Label>
        </Statistic>
      </Statistic.Group>

      <Menu.Item position='right'>
        <Dropdown
          ref='dropdown'
          search
          selection
          options={options}
        >
        </Dropdown>
      </Menu.Item>
    </Menu>
      {/* <Grid columns={3}>
        <Grid.Column>
          <Input
            icon='search'
            iconPosition='left'
            placeholder='Search ...'
            onChange={(event, {value}) => this.onFilter(value)}
          />
        </Grid.Column>
        <Grid.Column>
          top header
        </Grid.Column>
        <Grid.Column floated={'right'}>
          <Dropdown
            ref='dropdown'
            search
            selection
            options={options}
          >
          </Dropdown>
        </Grid.Column>
      </Grid> */}
  </div>);
  }
}

export default TopHeader
