const denodeify = require('es6-denodeify')()
const read = denodeify(require('read'))

const makeStore = require('./store')

module.exports = storePath =>
  read({ prompt: 'Old password:', silent: true })
    .then(pass => makeStore(storePath, pass))
    .then(store => store.read())
    .then(data => read({ prompt: 'New password:', silent: true })
      .then(pass => makeStore(storePath, pass))
      .then(store => store.write(data)))
