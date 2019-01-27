const crypto = require('crypto-promise')
const denodeify = require('es6-denodeify')()
const fs = require('fs')

const readFile = denodeify(fs.readFile)
const writeFile = denodeify(fs.writeFile)

const pbkdf2 = (pass, salt) =>
  crypto.pbkdf2(pass, salt, 10000, 512, 'sha512')

const code = (code, f) => err => {
  if (err.code === code) return f(err)
  throw err
}

function decrypt (pass, data) {
  if (!(data[0] === 42 && data[1] === 0)) {
    // Protocol not recognized, maybe older version with no PBKDF2.
    return crypto.decipher('aes256', pass)(data)
  }

  const saltLength = data[2]
  const salt = data.slice(3, 3 + saltLength)
  const encryptedData = data.slice(3 + saltLength)

  return pbkdf2(pass, salt)
    .then(key => crypto.decipher('aes256', key)(encryptedData))
}

function encrypt (pass, data) {
  return crypto.randomBytes(64)
    .then(salt => pbkdf2(pass, salt)
      .then(key => crypto.cipher('aes256', key)(data))
      .then(encryptedData => Buffer.concat([Buffer([42, 0, 64]), salt, encryptedData])))
}

module.exports = function makeStore (path, pass) {
  function read () {
    return readFile(path)
      .then(data => decrypt(pass, data))
      .then(JSON.parse)
      .catch(code('ENOENT', () => ({})))
  }

  function write (store) {
    return encrypt(pass, JSON.stringify(store))
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
