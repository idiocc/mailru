## API

The package is available by importing its default function:

```js
import mailru from '@idio/mailru'
```

%~%

```## mailru
[
  ["router", "Router"],
  ["config", "Config"]
]
```

Sets up the router to accept the `auth/mailru` and `auth/mailru/redirect` routes. Protects against man-in-the-middle attacks using a unique code for each session. Gets user details upon successful login.

%TYPEDEF types/index.xml%

%EXAMPLE: example/example.js, ../src => @idio/mailru%

%~%