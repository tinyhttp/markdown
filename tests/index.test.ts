import { suite } from 'uvu'
import expect from 'expect'
import path from 'path'
import { markdownStaticHandler } from '../src/index'
import { makeFetch } from 'supertest-fetch'
import * as http from 'http'

function describe(name: string, fn: (...args: any[]) => void) {
  const s = suite(name)
  fn(s)
  s.run()
}

function createServer(
  handler: (req: http.IncomingMessage, res: http.ServerResponse, next: () => void) => Promise<void>
) {
  const server = http.createServer((req, res) => {
    handler(req, res, () => {
      res.writeHead(404).end('Not Found')
    })
  })

  return { fetch: makeFetch(server) }
}

const STATIC_FOLDER = path.join(process.cwd(), 'tests/fixtures')

describe('Base dir', (it) => {
  it('should scan specified directory', async () => {
    const { fetch } = createServer(
      markdownStaticHandler(STATIC_FOLDER, {
        markedOptions: {
          headerIds: false
        }
      })
    )

    const res = await fetch('/page')

    expect((await res.text()).trim()).toContain(`<h1>Hello World</h1>`)

    expect(res.status).toBe(200)
  })
})

describe('Routing', (it) => {
  it('should send the file matched', async () => {
    const { fetch } = createServer(
      markdownStaticHandler(STATIC_FOLDER, {
        markedOptions: {
          headerIds: false
        }
      })
    )

    const res = await fetch('/page')

    expect((await res.text()).trim()).toContain(`<h1>Hello World</h1>`)

    expect(res.status).toBe(200)
  })
  it('content-type should be text/html', async () => {
    const { fetch } = createServer(markdownStaticHandler(STATIC_FOLDER, {}))

    await fetch('/page').expectHeader('content-type', 'text/html; charset=utf-8')
  })
  it('should send 404 if no such file is found', async () => {
    const { fetch } = createServer(markdownStaticHandler(STATIC_FOLDER, {}))

    await fetch('/non-existent-page').expect(404)
  })
})

describe('Handler options', () => {
  describe('prefix', (it) => {
    it('should strip prefix from paths', async () => {
      const { fetch } = createServer(
        markdownStaticHandler(STATIC_FOLDER, {
          prefix: '/a'
        })
      )

      await fetch('/a/page').expect(200)
    })
  })
  describe('stripExtension', (it) => {
    it('should send markdown files on paths with extension', async () => {
      const { fetch } = createServer(
        markdownStaticHandler(STATIC_FOLDER, {
          stripExtension: false
        })
      )

      await fetch('/page.md').expectStatus(200)
    })
    it('should strip extension', async () => {
      const { fetch } = createServer(
        markdownStaticHandler(STATIC_FOLDER, {
          stripExtension: true
        })
      )

      await fetch('/page').expectStatus(200)
    })
  })

  describe('Caching', (it) => {
    const maxAge = 3600 * 60 * 60
    it('should disable caching by default', async () => {
      const { fetch } = createServer(markdownStaticHandler(STATIC_FOLDER, {}))

      await fetch('/page').expectHeader('Cache-Control', null)
    })
    it('should set maxAge header', async () => {
      const { fetch } = createServer(
        markdownStaticHandler(STATIC_FOLDER, {
          caching: {
            maxAge
          }
        })
      )

      await fetch('/page').expectHeader('Cache-Control', `public,max-age=${maxAge}`)
    })
    it('should set immutable header', async () => {
      const { fetch } = createServer(
        markdownStaticHandler(STATIC_FOLDER, {
          caching: {
            maxAge,
            immutable: true
          }
        })
      )

      await fetch('/page').expectHeader('Cache-Control', `public,max-age=${maxAge},immutable`)
    })
    it('should add "must-revalidate" if maxAge is 0', async () => {
      const { fetch } = createServer(
        markdownStaticHandler(STATIC_FOLDER, {
          caching: {
            maxAge: 0
          }
        })
      )

      await fetch('/page').expectHeader('Cache-Control', `public,max-age=0,must-revalidate`)
    })
  })
})

describe('Index file', (it) => {
  it('should detect index.md', async () => {
    const { fetch } = createServer(markdownStaticHandler(`${STATIC_FOLDER}/index/md`))

    await fetch('/').expect(200)
  })
  it('should detect index.markdown', async () => {
    const { fetch } = createServer(markdownStaticHandler(`${STATIC_FOLDER}/index/markdown`))

    await fetch('/').expect(200)
  })
  it('should detect README.md', async () => {
    const { fetch } = createServer(markdownStaticHandler(`${STATIC_FOLDER}/readme/md`))

    await fetch('/').expect(200)
  })
})
