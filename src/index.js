import rqt from 'rqt'
import { stringify } from 'querystring'
import { createHash } from 'crypto'

/**
 * The Mail.Ru OAuth Login Routes For The Idio Web Server.
 * @param {import('koa-router')} [router] The router instance.
 * @param {Config} [config] Options for the program.
 * @param {string} config.client_id The app's client id.
 * @param {string} config.client_secret The app's client secret.
 * @param {string} [config.path="/auth/mailru"] The server path to start the login flaw and use for redirect (`${path}/redirect`). Default `/auth/mailru`.
 * @param {string} [config.scope] The scope to ask permissions for. See https://api.mail.ru/docs/guides/restapi/#permissions.
 * @param {(ctx, token, user) => {}} [config.finish="setSession; redirect;"] The function to complete the authentication that receives the token and the data about the user, such as name and id. The default function redirects to `/`. Default `setSession; redirect;`.
 * @param {(ctx, error, error_description, next) => {}} [config.error="throw;"] The function to be called in case of error. If not specified, the middleware will throw an internal server error. Default `throw;`.
 * @param {Middleware} [config.session] The configured session middleware in case the `session` property is not globally available on the context.
 */
export default function mailru(router, config = {}) {
  const {
    client_id,
    client_secret,
    path = '/auth/mailru',
    scope,
    error = (ctx, err, description) => {
      throw new Error(description)
    },
    finish = /* async */ (ctx, token, user /* next */) => {
      ctx.session.token = token
      ctx.session.user = user
      ctx.redirect('/')
    },
    session,
  } = config

  if (!client_id) {
    console.warn('[mailru] No client id - the dialog won\'t work.')
  }
  if (!client_secret) {
    console.warn('[mailru] No client secret - the redirect won\'t work.')
  }

  const start = async (ctx) => {
    const state = Math.floor(Math.random() * 10000)
    ctx.session.state = state
    const redirect_uri = getRedirect(ctx, path, state)
    const u = mailruDialogUrl({
      redirect_uri,
      client_id,
      scope,
      state,
    })
    ctx.redirect(u)
  }
  const startMw = session ? [session, start] : [start]
  router.get(path, ...startMw)

  const redirect = async (ctx, next) => {
    const state = ctx.query.state
    if (state != ctx.session.state) {
      throw new Error('The state is incorrect.')
    }
    const redirect_uri = getRedirect(ctx, path, state)
    ctx.session.state = null
    if (ctx.query.error) {
      const { error: e, error_description } = ctx.query
      await error(ctx, e, error_description, next)
      return
    }
    if (!ctx.query.code) throw new Error('Code Not Found.')

    const token = await exchange({
      client_id,
      client_secret,
      code: ctx.query.code,
      redirect_uri,
    })
    const data = await getInfo(token, client_id, client_secret)
    await finish(ctx, token, data, next)
  }
  const redirectMw = session ? [session, redirect] : [redirect]
  router.get(`${path}/redirect`, ...redirectMw)
}

/**
 * Gets all available info.
 */
const getInfo = async ({
  access_token, x_mailru_vid,
}, appId, secretKey) => {
  return await query({
    appId,
    session_key: access_token,
    method: 'users.getInfo',
    secretKey,
    data: {
      uids: x_mailru_vid,
    },
  })
}

/**
 * Request data from LinkedIn API.
 */
export const query = async ({
  method, appId, session_key, data, secretKey,
}) => {
  const url = 'https://www.appsmail.ru/platform/api'
  const d = {
    app_id: appId,
    session_key,
    method,
    secure: 1,
    ...data,
  }
  const sorted = Object.keys(d).sort()
    .map(k => `${k}=${d[k]}`).join('')
  const sig = createHash('md5')
    .update(`${sorted}${secretKey}`)
    .digest('hex')
  const allData = { ...d, sig }
  const dd = stringify(allData)
  const res = await rqt(`${url}?${dd}`)
  const j = JSON.parse(res)
  if (j.error) {
    throw new Error(j.error.error_msg)
  }
  return j
}

const exchange = async ({
  code, client_id, client_secret, redirect_uri,
}) => {
  const data = {
    code,
    grant_type: 'authorization_code',
    redirect_uri,
    client_id,
    client_secret,
  }
  const res = await rqt('https://connect.mail.ru/oauth/token', {
    data,
    type: 'form',
  })
  const { error, access_token, x_mailru_vid } = JSON.parse(res)
  if (error) throw new Error(error)
  return { access_token, x_mailru_vid }
}

const mailruDialogUrl = ({
  redirect_uri,
  client_id,
  scope,
}) => {
  const s = stringify({
    client_id,
    response_type: 'code',
    redirect_uri,
    ...(scope ? { scope } : {}),
  })
  return `https://connect.mail.ru/oauth/authorize?${s}`
}

const getRedirect = ({ protocol, host }, path, state) => {
  const parts = [
    /\.ngrok\.io$/.test(host) ? 'https' : protocol,
    '://',
    host,
    path,
    `/redirect?state=${state}`,
  ]
  const p = parts.join('')
  return p
}

/* documentary types/index.xml */
/**
 * @typedef {import('koa').Middleware} Middleware
 *
 * @typedef {Object} Config Options for the program.
 * @prop {string} client_id The app's client id.
 * @prop {string} client_secret The app's client secret.
 * @prop {string} [path="/auth/mailru"] The server path to start the login flaw and use for redirect (`${path}/redirect`). Default `/auth/mailru`.
 * @prop {string} [scope] The scope to ask permissions for. See https://api.mail.ru/docs/guides/restapi/#permissions.
 * @prop {(ctx, token, user) => {}} [finish="setSession; redirect;"] The function to complete the authentication that receives the token and the data about the user, such as name and id. The default function redirects to `/`. Default `setSession; redirect;`.
 * @prop {(ctx, error, error_description, next) => {}} [error="throw;"] The function to be called in case of error. If not specified, the middleware will throw an internal server error. Default `throw;`.
 * @prop {Middleware} [session] The configured session middleware in case the `session` property is not globally available on the context.
 */
