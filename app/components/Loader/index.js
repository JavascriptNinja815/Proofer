import React from 'react'

if (process.env.BROWSER) {
  require('./styles.scss')
}

const Loader = () => (
  <div className='loader-wrapper'>
    <div className='loading' />
  </div>
)

export default Loader
