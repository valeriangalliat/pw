const crypto = require('crypto-promise')
const { stat, readFile, writeFile } = require('fs/promises')

const pbkdf2 = (pass, salt) =>
  crypto.pbkdf2(pass, salt, 10000, 32, 'sha512')

const code = (code, f) => err => {
  if (err.code === code) return f(err)
  throw err
}

function decrypt (pass, data) {
  const saltLength = data[2]
  const ivLength = data[3]
  const salt = data.slice(4, 4 + saltLength)
  const iv = data.slice(4 + saltLength, 4 + saltLength + ivLength)
  const encryptedData = data.slice(4 + saltLength + ivLength)

  return pbkdf2(pass, salt)
    .then(key => crypto.decipheriv('aes256', key, iv)(encryptedData))
}

async function encrypt (pass, data) {
  const [salt, iv] = await Promise.all([crypto.randomBytes(32), crypto.randomBytes(16)])
  const key = await pbkdf2(pass, salt)
  const encryptedData = await crypto.cipheriv('aes256', key, iv)(data)

  return Buffer.concat([Buffer.from([42, 0, 32, 16]), salt, iv, encryptedData])
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

  const store = { read, write, get, set }

  return stat(path)
    .then(stat => {
      if (stat.isDirectory()) {
        path = `${path}/pw`
      }

      return store
    })
}
