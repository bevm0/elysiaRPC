import { createServerHooks } from '@elysiaRPC/core'
import { routerRecord } from '.'
import http from 'http'

async function start() {
  const { internal: internalServer, hooks: serverHooks } = createServerHooks(routerRecord, '')
  http.createServer(async (req, res) => {
    console.log(req.url)
    if (req.url && req.url in internalServer) {
      res.end(await (internalServer as any)[req.url]({ input: Infinity, ctx: undefined }))
    }
    else {
      res.end(`Not Found, available routes: ${Object.keys(internalServer).join(', ')}`)
    }
  }).listen(3000)
}
start()
