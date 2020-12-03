const { promisify } = require('util')
const read = promisify(require('read'))

const makeStore = require('./store')

module.exports = storePath =>
  read({ prompt: 'Old password:', silent: true })
    .then(pass => makeStore(storePath, pass))
    .then(store => store.read())
    .then(data => read({ prompt: 'New password:', silent: true })
      .then(pass => makeStore(storePath, pass))
      .then(store => store.write(data)))
