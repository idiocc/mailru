/* yarn example/ */
import mailru from '../src'

(async () => {
  const res = await mailru({
    text: 'example',
  })
  console.log(res)
})()