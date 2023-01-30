import { HandlerBuilder } from '@elysiaRPC/core'
import { Type } from '@sinclair/typebox'

//-----------------------------------------------------------------------------------
// single source of truth for the server and client
//-----------------------------------------------------------------------------------
const { route } = new HandlerBuilder()

export const r = route('Welcome', 'rem').input(Type.Number()).resolve(({ input }) => input)
export type a = typeof r['_input']
export type b = typeof r['_output']
export type c = typeof r['_resolver']
export type d = typeof r['_method']
export type e = typeof r['_path']

export const routerRecord = {
  '/a': {
    b: route('POST').input(Type.Number()).resolve(({ input }) => `Hello, ${input}`),
    c: {
      d: {
        e: route('PATCH', '/post').input(Type.String()).resolve(({ input }) => `nested route, ${input}`),
        f: route('GET', '').resolve(({  }) => `nested route, `),
      }
    }
  },
}
