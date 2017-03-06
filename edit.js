const deepEqual = require('deep-equal')
const editor = require('external-editor')
const tmp = require('tmp')
const yaml = require('js-yaml')

const tmpNameSync = tmp.tmpNameSync
const tmpHook = () => (tmp.tmpNameSync = () => tmpNameSync({ postfix: '.yaml' }))
const removeTmpHook = () => (tmp.tmpNameSync = tmpNameSync)
const tap = f => x => (f(x), x) // eslint-disable-line no-sequences

module.exports = store =>
  store.read()
    .then(data => Promise.resolve(yaml.safeDump(data))
      .then(tap(tmpHook))
      .then(editor.edit)
      .then(tap(removeTmpHook))
      .then(yaml.safeLoad)
      .then(newData =>
        deepEqual(data, newData)
          ? console.log('Store did not change')
          : store.write(newData).then(() => console.log('Store updated'))))
