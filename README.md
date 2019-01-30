# <img src="https://raw.github.com/idiocc/mailru/master/docs/mailru.svg?sanitize=true" align="left"> @idio/mailru

[![npm version](https://badge.fury.io/js/%40idio%2Fmailru.svg)](https://npmjs.org/package/@idio/mailru)

`@idio/mailru` is Mail.Ru OAuth Routes For Idio Web Server.

```sh
yarn add -E @idio/mailru
```

## Table Of Contents

- [Table Of Contents](#table-of-contents)
- [API](#api)
- [`mailru(router: Router, config: Config)`](#mailrurouter-routerconfig-config-void)
  * [`Config`](#type-config)
- [Copyright](#copyright)

<p align="center"><a href="#table-of-contents"><img src=".documentary/section-breaks/0.svg?sanitize=true"></a></p>

## API

The package is available by importing its default function:

```js
import mailru from '@idio/mailru'
```

<p align="center"><a href="#table-of-contents"><img src=".documentary/section-breaks/1.svg?sanitize=true"></a></p>

## `mailru(`<br/>&nbsp;&nbsp;`router: Router,`<br/>&nbsp;&nbsp;`config: Config,`<br/>`): void`

Sets up the router to accept the `auth/mailru` and `auth/mailru/redirect` routes. Protects against man-in-the-middle attacks using a unique code for each session. Gets user details upon successful login.

`import('koa').Middleware` __<a name="type-middleware">`Middleware`</a>__

__<a name="type-config">`Config`</a>__: Options for the program.

|        Name        |                       Type                       |                                                                         Description                                                                          |         Default         |
| ------------------ | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------- |
| __client_id*__     | _string_                                         | The app's client id.                                                                                                                                         | -                       |
| __client_secret*__ | _string_                                         | The app's client secret.                                                                                                                                     | -                       |
| path               | _string_                                         | The server path to start the login flaw and use for redirect (`${path}/redirect`).                                                                           | `/auth/mailru`          |
| scope              | _string_                                         | The scope to ask permissions for. See https://api.mail.ru/docs/guides/restapi/#permissions.                                                                  | -                       |
| finish             | _(ctx, token, user) =&gt; {}_                    | The function to complete the authentication that receives the token and the data about the user, such as name and id. The default function redirects to `/`. | `setSession; redirect;` |
| error              | _(ctx, error, error_description, next) =&gt; {}_ | The function to be called in case of error. If not specified, the middleware will throw an internal server error.                                            | `throw;`                |
| session            | _[Middleware](#type-middleware)_                 | The configured session middleware in case the `session` property is not globally available on the context.                                                   | -                       |

```js
/* yarn example/ */
import dotenv from '@demimonde/dotenv'
import core from '@idio/core'
import mailru from '@idio/mailru'
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
```

<p align="center"><a href="#table-of-contents"><img src=".documentary/section-breaks/2.svg?sanitize=true"></a></p>

## Copyright

<table>
  <tr>
    <th>
      <a href="https://artd.eco">
        <img src="https://raw.githubusercontent.com/wrote/wrote/master/images/artdeco.png" alt="Art Deco" />
      </a>
    </th>
    <th>
      © <a href="https://artd.eco">Art Deco</a> for <a href="https://idio.cc">Idio</a>
      2019
    </th><th>
        <a href="https://idio.cc">
          <img src="https://avatars3.githubusercontent.com/u/40834161?s=100" width="100" alt="Idio" />
        </a>
      </th>
    <th>
      <a href="https://www.technation.sucks" title="Tech Nation Visa">
        <img src="https://raw.githubusercontent.com/artdecoweb/www.technation.sucks/master/anim.gif" alt="Tech Nation Visa" />
      </a>
    </th>
    <th>
      <a href="https://www.technation.sucks">Tech Nation Visa Sucks</a>
    </th>
  </tr>
</table>

<p align="center"><a href="#table-of-contents"><img src=".documentary/section-breaks/-1.svg?sanitize=true"></a></p>