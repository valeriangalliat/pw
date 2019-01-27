const { docopt } = require('docopt')
const denodeify = require('es6-denodeify')()
const read = denodeify(require('read'))

const edit = require('./edit')
const get = require('./get')
const makeStore = require('./store')
const update = require('./update')

const pkg = require('../package')

const args = docopt(`
Usage:
  pw <name> [--2fa]
  pw -e | --edit
  pw -u | --update
  pw -h | --help
  pw --version

Options:
  -h --help     Show this screen.
  --version     Show version.
  -e, --edit    Edit store.
  -u, --update  Update store password.
  --2fa         Enable 2FA.
`, { version: pkg.version })

const storePath = process.env.PW_STORE || `${process.env.HOME}/.pw`

const getStore = () =>
  read({ prompt: 'Password:', silent: true })
    .then(pass => makeStore(storePath, pass))

if (args['--edit']) {
  getStore()
    .then(store => edit(store))
} else if (args['--update']) {
  update(storePath)
} else if (args['<name>']) {
  getStore()
    .then(store => get(store, args['<name>'], args['--2fa']))
}
