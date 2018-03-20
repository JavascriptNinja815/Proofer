import React from 'react'
import {Image} from 'semantic-ui-react'
import {getCorrectHours} from '../../../libraries/helpers'

const LeftSide = ({slotValueTime}) => {
  let sunIcon = '/static/images/sun.png'
  if (slotValueTime < 720) { // Before mid-day
    sunIcon = '/static/images/sunrise.png'
  }
  if (slotValueTime > 1080) { // After 6PM
    sunIcon = '/static/images/sunset.png'
  }

  return (
    <div className='post-item-datetime'>
      <Image inline src={sunIcon} />
      <div className='date-time-label'>
        {getCorrectHours(slotValueTime)}
      </div>
    </div>
  )
}

export default LeftSide
