import { HandlerBuilder } from '@elysiaRPC/core'
import { Type } from '@sinclair/typebox'

//-----------------------------------------------------------------------------------
// single source of truth for the server and client
//-----------------------------------------------------------------------------------
const handler = new HandlerBuilder()

export const r = handler
  .init({ _method: 'POST', _path: '/post', _ctx: 123, _schema: Type.Date() })
  .preResolve(k => k)
  .parse(k => k)
  .resolve(k => k)
  .postResolve(k => k)

export type a = typeof r['_method']
export type b = typeof r['_ctx']
export type c = typeof r['_input']
export type d = typeof r['_schema']
export type e = typeof r['_preResolver']
export type f = typeof r['_parser']
export type g = typeof r['_resolver']
export type h = typeof r['_postResolver']
export type i = typeof r['_output']

export const routerRecord = {
  '/a': {

    /**
     * maximal example
     */
    b: handler
      .init({ 
        _method: 'POST',
        _path: '/post',
        _ctx: 123,
        _schema: Type.Date()
      })
      .preResolve(() => ({ input: 123, ctx: 'no' }))
      .parse(k => {
        if (typeof k === 'boolean') {
          throw new Error('NO')
        }
        return k.toString()
      })
      .resolve(k => {
        const n = k.input + 10
        return n + 420 + 69
      })
      .postResolve(k => {
        return parseInt(k.ctx, 10)
      }),

    /**
     * minimal example
     */
    c: handler.init({ _method: 'CONNECT', _schema: Type.Uint8Array() }).resolve((k) => k.input)
  }
}

export type x = typeof routerRecord['/a']['b']['_output']
