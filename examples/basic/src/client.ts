import { createClientHooks } from '@elysiaRPC/core'
import { routerRecord } from '.'

const { internal: internalClient, hooks: clientHooks } = createClientHooks(routerRecord, '')
const x = internalClient['/a/b/post'](Infinity)
const y = clientHooks['']['/a']['/b/post'](Infinity)
console.log({ x, y })
