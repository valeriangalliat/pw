const generatePassword = require('password-generator')
const randomInt = require('random-int')

module.exports = () =>
  generatePassword(randomInt(16, 32), false)
