import { HandlerBuilder, Handler } from '../handler'
import type { Transform, Flatten } from '../utils'

/**
 * strongly type the returned fetch hooks
 * @internal the actual flattened object returned by the internal fetch hooks
 */
export type InternalServerHooks<TRouter> = {
  [k in keyof Flatten<TRouter, HandlerBuilder<Handler>, '_path'>]: 
    Flatten<TRouter, HandlerBuilder<Handler>, '_path'>[k] extends HandlerBuilder<Handler> ? 
      Flatten<TRouter, HandlerBuilder<Handler>, '_path'>[k]['handle'] : 
      never
}

/**
 * hooks generated for the client
 */
interface ServerHooks<T extends Record<any, any>> {
  internal: InternalServerHooks<T>
  hooks: Transform<T, HandlerBuilder<Handler>, 'handle'>
}

/**
 * internal fetch hooks are used to create the fetch functions
 */
export function createServerHooks<T extends Record<any, any>> (current: T, base=''): ServerHooks<T> {
  let key: string
  let internal: any = {}
  let hooks: any = {}
  let x: any

  for (key in current) {
    if ('_path' in current[key]) {
      internal[`${base}${key}${current[key]._path || ''}`] =  current[key].handle
      hooks[key] = current[key].handle
    }
    else {
      x = createServerHooks(current[key], `${base}${key}`)
      internal = { ...internal, ...x.internal }
      hooks[key] = x.client
    }
  }
  return {
    internal,
    hooks
  }
}
