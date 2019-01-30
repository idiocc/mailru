import { makeTestSuite } from 'zoroaster'
import Context from '../context'
import mailru from '../../src'

const ts = makeTestSuite('test/result', {
  async getResults(input) {
    const res = await mailru({
      text: input,
    })
    return res
  },
  context: Context,
})

// export default ts
