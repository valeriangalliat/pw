const clipboardy = require('clipboardy')
const pw = require('./pw')

module.exports = (store, name) =>
  store.get(name)
    .then(pass => pass || (
      (pass = pw()),
      store.set(name, pass)
        .then(() => pass)))
    .then(clipboardy.write)
    .then(() => console.log('Password copied to clipboard'))
