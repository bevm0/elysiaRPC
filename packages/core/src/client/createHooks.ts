import { createFetch } from './fetch'
import type { FetchOpts, TypedResponse } from './fetch'
import type { Handler } from '../types'
import type { Flatten } from '../utils'
import type { HandlerBuilder } from '../handler'

/**
 * fetch signature
 * @remarks function requires input parameter if it's defined, otherwise excluded
 */
type FetchSignature<THandler extends Handler> = 
  THandler['_input'] extends undefined ? 
    (init?: RequestInit) => Promise<TypedResponse<THandler['_output']>> : 
    (input: THandler['_input'], init?: RequestInit) => Promise<TypedResponse<THandler['_output']>>

/**
 * internal client hooks
 */
export type InternalClientHooks<TRouter> = {
  [k in keyof Flatten<TRouter, HandlerBuilder<Handler>>]: 
    Flatten<TRouter, HandlerBuilder<Handler>>[k] extends HandlerBuilder<Handler> ? 
      FetchSignature<Flatten<TRouter, HandlerBuilder<Handler>>[k]> : never
}

/**
 * public client hooks
 */
export type PublicClientHooks<T> = {
  [k in keyof T]: T[k] extends HandlerBuilder<Handler> ? FetchSignature<T[k]> : PublicClientHooks<T[k]>
}

/**
 * hooks generated for the client
 */
interface ClientHooks<T> {
  internal: InternalClientHooks<T>
  hooks: PublicClientHooks<T>
}

/**
 * internal fetch hooks are used to create the fetch functions
 * user doesn't need to pass base
 */
export function createClientHooks<T extends Record<any, any>> (current: T, opts?: FetchOpts): ClientHooks<T> {
  return createInnerClientHooks(current, '', opts)
}

/**
 * internal fetch hooks are used to create the fetch functions
 */
function createInnerClientHooks<T extends Record<any, any>> (current: T, base='', opts?: FetchOpts): ClientHooks<T> {
  let internal: any = {}
  let hooks: any = {}
  let recursiveHooks: any = {}
  let fetcher: any
  let path = ''
  let key = ''

  for (key in current) {
    if ('_path' in current[key]) {
      path = `${base}${key}`
      fetcher = createFetch(current[key], path, opts)
      internal[path] = fetcher
      hooks[key] = fetcher
    }
    else {
      recursiveHooks = createInnerClientHooks(current[key], `${base}${key}`, opts)
      internal = { ...internal, ...recursiveHooks.internal }
      hooks[key] = recursiveHooks.hooks
    }
  }
  return {
    internal,
    hooks
  }
}
