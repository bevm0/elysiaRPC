import { createClientHooks } from '@elysiaRPC/core'
import { routerRecord } from '.'

const { internal: internalClient, hooks: clientHooks } = createClientHooks(routerRecord, '')
const x = internalClient['ab'](Infinity)
const y = clientHooks.a.b(123)
console.log({ x, y })
