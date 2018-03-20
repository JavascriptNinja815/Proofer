import React from 'react'
import CircularProgressbar from 'react-circular-progressbar'

if (process.env.BROWSER) {
  require('./styles.scss')
}

class Freshness extends React.Component {
  onChangeFilter = (e, { value }) => {
    this.setState({ value })
  }

  classForPercentage = (percent) => {
    if (percent < 80) return 'green'
    if (percent < 50) return 'red'
    return 'green'
  }

  textForPercentage = (pct) => `${pct}`

  render () {
    const {percentage} = this.props
    return (<CircularProgressbar
      className='pr-progress'
      percentage={percentage}
      classForPercentage={this.classForPercentage}
      textForPercentage={this.textForPercentage}
    />)
  }
}

export default Freshness
