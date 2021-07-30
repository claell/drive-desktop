
const messages = {
  'pending': { 'line1': 'Syncing...' },
  'starting': { 'line1': 'Checking for updates...' },
  'complete': { 'line1': '' },
  'stop': { 'line1': 'Stopped' },
  'block': { 'line1': 'Sync blocked by other device' },
  'default': { 'line1': 'Click play to sync' },
  'error': { 'line1': 'Can\'t connect to internxt cloud' },
  'stopping': { 'line1': 'Stopping...' }
}

function getMessage(state) {
  return messages[state]
}

module.exports = getMessage

/*
const messages = {
  'pending': {
    'line1': 'Synchronizing your files',
    'line2': 'Status: pending...'
  },
  'starting': {
    'line1': 'Synchronizing your files',
    'line2': 'Status: starting'
  },
  'complete': {
    'line1': 'Sync Process',
    'line2': 'Status: Finished'
  },
  'stop': {
    'line1': 'Sync Process',
    'line2': 'Status: Stopped'
  },
  'block': {
    'line1': 'Sync blocked by other device',
    'line2': 'Please wait until no devices are syncing'
  },
  'default': {
    'line1': 'Sync your files',
    'line2': 'Start by clicking the Play button'
  },
  'error': {
    'line1': 'No access to internxt cloud',
    'line2': 'Check your internet connection and try again'
  },
  'stopping': {
    'line1': 'Sync Process',
    'line2': 'Status: Stopping'
  }
}
*/
