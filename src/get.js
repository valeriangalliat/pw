const clipboardy = require('clipboardy')
const { promisify } = require('util')
const read = promisify(require('read'))
const speakeasy = require('speakeasy')
const pw = require('./pw')

async function get (store, name, twoFactor) {
  let [pass, secret] = await Promise.all([store.get(name), store.get(`${name}.2fa`)])

  if (!pass) {
    const answer = await read({ prompt: 'No such password, generate? (y/n)' })

    if (answer !== 'y') {
      return
    }

    pass = pw()

    await store.set(name, pass)
  }

  if (twoFactor && !secret) {
    secret = await read({ prompt: '2FA secret:' })
    await store.set(`${name}.2fa`, secret)
  }

  await clipboardy.write(pass)
  console.log('Password copied to clipboard')

  if (secret) {
    const totp = speakeasy.totp({ secret, encoding: 'base32' })
    console.log(`Your 2FA PIN is ${totp}`)
  }
}

module.exports = get
