import { HandlerBuilder, Handler } from './handler'
import type { Transform, Flatten } from './utils'

const router = new HandlerBuilder()

const routerRecord = {
  a: router.route('PUT', 'aRoute').input(123).resolve(k => k.input),
  b: router.route('GET', 'bb').input('123').resolve(k => k.input),
  c: {
    d: router.input(false).resolve(k => k.input),
  }
}

type routerRecord = typeof routerRecord
export type TransformedRouterRecord = Transform<routerRecord, HandlerBuilder<Handler>, 'fetch'>['c']['d']
export type FlatRouterRecord = Flatten<routerRecord>
export type Hehe = {
  [k in keyof FlatRouterRecord]: FlatRouterRecord[k]['fetch']
}

/**
 * yeet
 */
function generateFetchHooks(current: any, copy: Map<any, any>=new Map(), base=''): Map<any, any> {
  let route: string
  for (const key in current) {
    route = base ? `${base}/${key}` : key
    if ('_path' in current[key]) {
      copy.set(route, current[key].fetch)
    }
    else {
      const lowerCopy = generateFetchHooks(current[key], new Map(), route)
      copy = new Map([...copy, ...lowerCopy])
    }
  }
  return copy
}

const fetchHooks = generateFetchHooks(routerRecord)
fetchHooks.get('a/aRoute')
console.log({ fetchHooks })
