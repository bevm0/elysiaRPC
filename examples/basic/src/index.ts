import { HandlerBuilder } from '@elysiaRPC/core'
import { Type } from '@sinclair/typebox'

//-----------------------------------------------------------------------------------
// single source of truth for the server and client
//-----------------------------------------------------------------------------------
const router = new HandlerBuilder()

export const extendedRouter = {
  '/c': {
    '/d': router.route('POST', '/post').input(Type.Number()).resolve(({ input }) => `Hello, ${input}`),
  },
}

/**
 * has one POST route, /a/b/post, that requires number input, returns `Hello ${input}`
 */
export const routerRecord = {
  '': {
    '/a': {
      '/b': router.route('POST', '/post').input(Type.Number()).resolve(({ input }) => `Hello, ${input}`),
    },
  },
  ...extendedRouter
}
