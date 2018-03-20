import PropTypes from 'prop-types'

let offlineInstalled = false

if (process.env.BROWSER) {
  require('./App.scss')
}

const App = ({ children }) => {
  if (process.env.OFFLINE_SUPPORT && process.browser && !offlineInstalled) {
    const OfflinePlugin = require('offline-plugin/runtime') // eslint-disable-line global-require

    OfflinePlugin.install({
      onUpdateReady () {
        OfflinePlugin.applyUpdate()
      },
      onUpdated () {
        window.location.reload()
      }
    })
    offlineInstalled = true
  }

  return (<div>{children}</div>)
}

App.propTypes = {
  children: PropTypes.array.isRequired
}

export default App
