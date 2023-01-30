import { createFetch } from './createFetch'
import type { FetchOpts, TypedResponse } from './createFetch'
import type { Handler } from '../types'
import type { Flatten } from '../utils'
import type { HandlerBuilder } from '../handler'
import { inferParser } from '../parser/types'

/**
 * fetch signature
 * @remarks function requires input parameter if it's defined, otherwise excluded
 */
type FetchSignature<T extends Handler> = 
  T['_input'] extends undefined ? 
    T['_schema'] extends undefined ?
      (init?: RequestInit) => Promise<TypedResponse<T['_output']>> : 
      (input: inferParser<T['_schema']>, init?: RequestInit) => Promise<TypedResponse<T['_output']>> :
    (input: T['_input'], init?: RequestInit) => Promise<TypedResponse<T['_output']>>

/**
 * internal client hooks
 */
export type InternalClientHooks<T> = {
  [k in keyof Flatten<T, HandlerBuilder<Handler>>]: 
    Flatten<T, HandlerBuilder<Handler>>[k] extends HandlerBuilder<Handler> ? 
      FetchSignature<Flatten<T, HandlerBuilder<Handler>>[k]> : never
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
 * client options
 */
interface ClientOpts extends FetchOpts {}

/**
 * internal fetch hooks are used to create the fetch functions
 */
function createInnerClientHooks<T extends Record<any, any>> (current: T, base='', opts?: ClientOpts): ClientHooks<T> {
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
