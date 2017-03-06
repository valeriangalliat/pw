const crypto = require('crypto-promise')
const denodeify = require('es6-denodeify')()
const fs = require('fs')

const readFile = denodeify(fs.readFile)
const writeFile = denodeify(fs.writeFile)

const code = (code, f) => err => {
  if (err.code === code) return f(err)
  throw err
}

module.exports = function makeStore (path, key) {
  const encrypt = crypto.cipher('aes256', key)
  const decrypt = crypto.decipher('aes256', key)

  function read () {
    return readFile(path)
      .then(decrypt)
      .then(JSON.parse)
      .catch(code('ENOENT', () => ({})))
  }

  function write (store) {
    return encrypt(JSON.stringify(store))
      .then(data => writeFile(path, data))
  }

  function get (name) {
    return read()
      .then(store => store[name])
  }

  function set (name, value) {
    return read()
      .then(store => ((store[name] = value), store)) // eslint-disable-line no-sequences
      .then(write)
  }

  return { read, write, get, set }
}
