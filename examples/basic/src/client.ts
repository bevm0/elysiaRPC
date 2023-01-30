import { createClientHooks } from '@elysiaRPC/core'
import { routerRecord } from '.'

async function start() {
  const { internal: internalClient, hooks: clientHooks } = createClientHooks(routerRecord, { baseUrl: 'http://localhost:3000' })
  const a = await clientHooks['/a'].c.d.e('you').then(res => res.json())
  const b = await clientHooks['/a'].c.d.f().then(res => res.json())
  const c = await clientHooks['/a'].b(69).then(res => res.json())
  console.log({ a, b, c })
}
start()
