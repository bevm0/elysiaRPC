import { createResolver } from './createResolver'
import type { Handler } from '../types'
import type { Flatten } from '../utils'
import type { HandlerBuilder } from '../handler'

/**
 * internal server hooks
 */
export type InternalServerHooks<TRouter> = {
  [k in keyof Flatten<TRouter, HandlerBuilder<Handler>>]: 
    Flatten<TRouter, HandlerBuilder<Handler>>[k] extends HandlerBuilder<Handler> ? 
      Flatten<TRouter, HandlerBuilder<Handler>>[k]['_resolver'] : 
      never
}

/**
 * public server hooks
 */
export type PublicServerHooks<T> = {
  [k in keyof T]: T[k] extends HandlerBuilder<Handler> ? T[k]['_resolver'] : PublicServerHooks<T>
}

/**
 * all hooks generated for the server
 */
interface ServerHooks<T extends Record<any, any>> {
  internal: InternalServerHooks<T>
  hooks: PublicServerHooks<T>
}

/**
 * server options
 */
interface ServerOpts {
}

/**
 * create server hooks
 */
export function createServerHooks<T extends Record<any, any>> (current: T, opts?: ServerOpts): ServerHooks<T> {
  return createInnerServerHooks(current, '', opts)
}

/**
 * create server hooks
 */
export function createInnerServerHooks<T extends Record<any, any>> (current: T, base='', opts?: ServerOpts): ServerHooks<T> {
  let internal: any = {}
  let hooks: any = {}
  let recursiveHooks: any = {}
  let resolver: any
  let key = ''

  for (key in current) {
    if ('_path' in current[key]) {
      resolver = createResolver(current[key])
      internal[`${base}${key}`] = resolver
      hooks[key] = resolver
    }
    else {
      recursiveHooks = createServerHooks(current[key], `${base}${key}`)
      internal = { ...internal, ...recursiveHooks.internal }
      hooks[key] = recursiveHooks.hooks
    }
  }
  return {
    internal,
    hooks
  }
}
