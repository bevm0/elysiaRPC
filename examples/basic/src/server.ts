import { createServerHooks } from '@elysiaRPC/core'
import { routerRecord } from '.'

const { internal: internalServer, hooks: serverHooks } = createServerHooks(routerRecord, '')
const x = internalServer['/a/b/post']({ input: Infinity })
const y = serverHooks['']['/a']['/b']({ input: Infinity })
console.log({ x, y })
