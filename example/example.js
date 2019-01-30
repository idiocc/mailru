/* yarn example/ */
import dotenv from '@demimonde/dotenv'
import core from '@idio/core'
import mailru from '../src'
dotenv()

;(async () => {
  const { url, router, app, middleware: {
    session,
  } } = await core({
    session: { use: true, keys: [process.env.SESSION_KEY] },
  })
  mailru(router, {
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    session,
  })
  app.use(router.routes())
  console.log(`${url}/auth/mailru`)
})()