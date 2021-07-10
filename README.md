<div align="center">

# @tinyhttp/markdown

[![npm][npm-img]][npm-url] [![GitHub Workflow Status][gh-actions-img]][github-actions] [![Coverage][cov-img]][cov-url]

</div>

Static markdown middleware for Node.js.

## Install

```sh
pnpm i @tinyhttp/markdown
```

## API

### `markdownStaticHandler(dir, options)`

Handles static files and transforms markdown in HTML in a specified directory. It tries to assign root to `README.md` or `index.md` (and with `.markdown` extension too) in case any of them exists.

#### Options

- `prefix` - URL prefix to add to routes and remove from file paths
- `stripExtension` - remove `.md` (or `.markdown`) extension from markdown files. Enabled by defaults.
- `markedOptions` - initial [marked](https://github.com/markedjs/marked) options to be used by the handler.
- `caching` settings for `Cache-Control` header. Disabled by default.

## Example

```ts
import { App } from '@tinyhttp/app'
import { markdownStaticHandler as md } from '@tinyhttp/markdown'

new App()
  .use(
    md('docs', {
      prefix: '/docs',
      stripExtension: true,
      markedExtensions: [{ headerIds: true }]
    })
  )
  .listen(3000)
```

[npm-url]: https://npmjs.com/package/@tinyhttp/markdown
[github-actions]: https://github.com/tinyhttp/markdown/actions
[gh-actions-img]: https://img.shields.io/github/workflow/status/tinyhttp/markdown/CI?style=for-the-badge&logo=github&label=&color=hotpink
[cov-img]: https://img.shields.io/coveralls/github/tinyhttp/markdown?style=for-the-badge&color=hotpink
[cov-url]: https://coveralls.io/github/tinyhttp/markdown
[npm-img]: https://img.shields.io/npm/dt/@tinyhttp/markdown?style=for-the-badge&color=hotpink
