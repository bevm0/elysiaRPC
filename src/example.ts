import { HandlerBuilder } from './handler'
import { createClientHooks } from './hooks/client'
import { createServerHooks } from './hooks/server'
import { Type } from '@sinclair/typebox'

//-----------------------------------------------------------------------------------
// server side setup: generate a router
//-----------------------------------------------------------------------------------
const router = new HandlerBuilder()

/**
 * has one route: /a/b/gPost, POST, number input, returns `Hello ${input}`
 */
const routerRecord = {
  '': {
    '/a': {
      '/b': router.route('POST', '/gPost').input(Type.Number()).resolve(({ input }) => `Hello, ${input}`),
    }
  }
}

//-----------------------------------------------------------------------------------
// server side usage: generate server hook
//-----------------------------------------------------------------------------------
const { internal: internalServer, hooks: serverHooks } = createServerHooks(routerRecord, '')
internalServer['/a/b/gPost']({ input: 123 })
serverHooks['']['/a']['/b']({ input: Infinity })

//-----------------------------------------------------------------------------------
// client side usage: import the defined router and generate fetch hooks
//-----------------------------------------------------------------------------------
const { internal: internalClient, hooks: clientHooks } = createClientHooks(routerRecord, '')

/**
 * returns a string
 */
const x = internalClient['/a/b/gPost']
const y = clientHooks['']['/a']['/b']

console.log({ internal: internalClient, client: clientHooks, x, y })
console.log(clientHooks['']['/a'])
