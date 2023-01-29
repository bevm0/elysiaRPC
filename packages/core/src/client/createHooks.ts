// import { createFetch } from './fetch'
import { HandlerBuilder, Handler } from '../handler'
import type { Transform, Flatten } from '../utils'

/**
 * strongly type the returned fetch hooks
 * @internal the actual flattened object returned by the internal fetch hooks
 */
export type InternalClientHooks<TRouter> = {
  [k in keyof Flatten<TRouter, HandlerBuilder<Handler>, '_path'>]: 
    Flatten<TRouter, HandlerBuilder<Handler>, '_path'>[k] extends HandlerBuilder<Handler> ? 
      Flatten<TRouter, HandlerBuilder<Handler>, '_path'>[k]['fetch'] : 
      never
}

/**
 * hooks generated for the client
 */
interface ClientHooks<T extends Record<any, any>> {
  internal: InternalClientHooks<T>
  hooks: Transform<T, HandlerBuilder<Handler>, 'fetch', '_path'>
}

/**
 * internal fetch hooks are used to create the fetch functions
 */
export function createClientHooks<T extends Record<any, any>> (current: T, base=''): ClientHooks<T> {
  let path: string
  let key: string
  let internal: any = {}
  let hooks: any = {}
  let x: any
  let f: any

  for (key in current) {
    if ('_path' in current[key]) {
      path = `${base}${key}${current[key]._path || ''}`
      internal[path] =  current[key].fetch
      hooks[key] = current[key].fetch
    }
    else {
      x = createClientHooks(current[key], `${base}${key}`)
      internal = { ...internal, ...x.internal }
      hooks[key] = x.client
    }
  }
  return {
    internal,
    hooks
  }
}
