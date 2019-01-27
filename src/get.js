const clipboardy = require('clipboardy')
const denodeify = require('es6-denodeify')()
const read = denodeify(require('read'))
const speakeasy = require('speakeasy')
const pw = require('./pw')

module.exports = (store, name, twoFactor) =>
  Promise.all([store.get(name), store.get(`${name}.2fa`)])
    .then(([pass, secret]) => {
      if (pass) {
        return [pass, secret]
      }

      pass = pw()

      return store.set(name, pass)
        .then(() => [pass, secret])
    })
    .then(([pass, secret]) => {
      if (secret || !twoFactor) {
        return [pass, secret]
      }

      return read({ prompt: '2FA secret:' })
        .then(secret => {
          return store.set(`${name}.2fa`, secret)
            .then(() => [pass, secret])
        })
    })
    .then(([pass, secret]) => {
      return clipboardy.write(pass)
        .then(() => [pass, secret])
    })
    .then(([pass, secret]) => {
      console.log('Password copied to clipboard')

      if (secret) {
        const totp = speakeasy.totp({ secret, encoding: 'base32' })
        console.log(`Your 2FA PIN is ${totp}`)
      }
    })
