import React from 'react'
import { Grid, Dropdown } from 'semantic-ui-react'
import Campaigns from './Campaigns'
import CampaignsMulti from './CampaignsMulti'

if (process.env.BROWSER) {
  require('./styles/index.scss')
}

class CampaingsIndex extends React.Component {
  state = {
    value: ''
  }

  onChangeFilter = (e, { value }) => {
    this.setState({ value })
  }

  render () {
    const {id, width, tablet, computer, largeScreen, widescreen, isMulti} = this.props
    const {value} = this.state

    let style = {
      position: 'fixed',
      top: 48,
      right: 0,
      zIndex: 100,
      width: 'calc(50% - 284px)'
    }

    const options = [
      { key: 1, text: 'Popularity', value: 1 },
      { key: 2, text: 'A-Z', value: 2 },
      { key: 3, text: 'Z-A', value: 3 }
    ]

    return (<Grid.Column className='campaigns-panel' {...{width, tablet, computer, largeScreen, widescreen}}>
      <div id={id} style={style}>
        <div className='campaigns-header'>
          <div className='title'>Campaigns</div>
          <Dropdown
            onChange={this.handleChange}
            options={options}
            placeholder='Sort by'
            selection
            value={value}
          />
        </div>
        <div className='campaigns-content'>
          {isMulti ?
            <CampaignsMulti
              categoryId={this.props.categoryId}
              socialId={this.props.socialId}
              />
            :
            <Campaigns
              categoryId={this.props.categoryId}
            />
          }
        </div>
      </div>
    </Grid.Column>)
  }
}

export default CampaingsIndex
