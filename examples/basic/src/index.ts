import { HandlerBuilder } from '@elysiaRPC/core'
import { Type } from '@sinclair/typebox'

//-----------------------------------------------------------------------------------
// single source of truth for the server and client
//-----------------------------------------------------------------------------------
const { build } = new HandlerBuilder()

export const r = build({
  _method: 'Welcome',
  _path: 'Rem',
  _schema: Type.Boolean(),
  _preResolver: () => {
    return 69
  },
  _parser: () => {
    return 123
  },
  _resolver(args) {
    return args.input
  },
})

export type a = typeof r['_method']
export type b = typeof r['_input']
export type c = typeof r['_schema']
export type d = typeof r['_output']
export type e = typeof r['_ctx']
export type f = typeof r['_resolver']
export type g = typeof r['_path']

export const routerRecord = {
  '/a': {
    b: build({
      _parser: () => {
        return {
          input: 'hi'
        }
      },
      _resolver: (args) => `Hello, ${args.input}`,
      _method: 'POST',
      _schema: Type.Number(),
    }),
    c: {
      d: {
        e: build({
          _method: 'PATCH',
          _schema: Type.String(),
          _resolver: (args) => `nested route: ${args.input}`,
        }),
        f: build({ _method: 'GET', _resolver: () => 12345 }),
        g: build({ _ctx: 69420, _input: 'super epic', _resolver: (args) => args.input })
      }
    }
  },
}
