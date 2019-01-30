import { equal, ok } from 'zoroaster/assert'
import Context from '../context'
import mailru from '../../src'

/** @type {Object.<string, (c: Context)>} */
const T = {
  context: Context,
  'is a function'() {
    equal(typeof mailru, 'function')
  },
  async 'calls package without error'() {
    await mailru()
  },
  async 'gets a link to the fixture'({ FIXTURE }) {
    const res = await mailru({
      text: FIXTURE,
    })
    ok(res, FIXTURE)
  },
}

export default T