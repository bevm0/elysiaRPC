import { Static } from '@sinclair/typebox'
import { _fetch } from './fetch'
import type { TSchema } from '@sinclair/typebox/typebox'
import type { AnyHttpMethod } from './http/methods'
import type { CleanType, Overwrite } from './utils'
import type { Context } from './context'

/**
 * generic request handler
 */
export interface Handler {
  /**
   * type of HTTP request (custom allowed)
   */
  _method: any

  /**
   * prefix for URL
   */
  _basePath: any

  /**
   * URL for the request
   */
  _path: any

  /**
   * data shared between resolvers
   */
  _ctx: any

  /**
   * schema to parse the input
   */
  _schema: any

  /**
   * input to the resolver
   */
  _input: any

  /**
   * output of the resolver
   */
  _output: any

  /**
   * request resolver
   */
  _resolver: any
}

/**
 * uninitialized request handler
 */
export interface UninitializedHandler extends Handler{
  _method: undefined
  _basePath: ''
  _path: undefined
  _ctx: undefined
  _schema: undefined
  _input: undefined
  _output: undefined
  _resolver: undefined
}

/**
 * request handler builder
 */
export class HandlerBuilder<THandler extends Handler=UninitializedHandler> {
  _method: THandler['_method']
  _basePath: THandler['_basePath']
  _path: THandler['_path']
  _ctx: THandler['_ctx']
  _input: THandler['_input']
  _output: THandler['_output']
  _resolver: THandler['_resolver']
  _schema: THandler['_schema']

  constructor(args: Partial<Handler> = {}) {
    this._method = args._method
    this._basePath = args._basePath || ''
    this._path = args._path
    this._input = args._input
    this._resolver = args._resolver
    this._output = args._output
    this._ctx = args._ctx
    this._schema = args._schema
  }

  /**
   * set HTTP method and path (URL) for the handler
   */
  route<TMethod extends AnyHttpMethod, const TPath extends string>
        (_method: TMethod, _path: TPath): 
          HandlerBuilder<Overwrite<THandler, { _method: TMethod, _path: `${THandler['_basePath']}${TPath}` }>> {
    return new HandlerBuilder({ ...this, _method, _path })
  }

  /**
   * define the context
   */
  context<TContext>(_ctx?: Context<TContext>): HandlerBuilder<Overwrite<THandler, { _ctx: TContext }>> {
    return new HandlerBuilder({ ...this, _ctx })
  }

  /**
   * set the input parser for the handler
   * narrow the _input type for the new builder, but actually set the _schema property for parsing
   */
  input<TInput>(_schema?: TInput): HandlerBuilder<Overwrite<THandler, { _input: InputArgs<TInput> }>> {
    return new HandlerBuilder({ ...this, _schema })
  }

  /**
   * set the resolver function
   */
  resolve<Output>(_resolver: (args: ResolveArgs<THandler>) => Output):
      HandlerBuilder<Overwrite<THandler, { _resolver: typeof _resolver, _output: Output }>> {
    return new HandlerBuilder({ ...this, _resolver })
  }

  /**
   * server-side: handle a request
   * @param args inferred for the resolver
   * @returns the resolver's output
   */
  handle(args: ResolveArgs<THandler>): this['_output'] {
    return this._resolver(args)
  }

  /**
   * client-side: make a request
   * @param args the input for this handler
   * @returns fetch request to get the data
   */
  fetch: FetchSignature<THandler> = (...args: any[]) => {
    return _fetch(this._path, args[0], args[1])
  }

}

/**
 * fetch signature
 * @remarks function requires input parameter if it's defined, otherwise excluded
 */
type FetchSignature<THandler extends Handler> = 
  THandler['_input'] extends undefined ? 
    (init?: RequestInit) => Promise<THandler['_output']> : 
      (input: THandler['_input'], init?: RequestInit) => Promise<THandler['_output']>

/**
 * input validator can be 
 * - an instance of the type itself
 * - function to validate the input
 * - Typebox schema
 */
export type InputArgs<T> = T extends TSchema ? Static<T> : T extends (...args: any[]) => infer Output ? Output : T

/**
 * arguments to the resolve function
 * @remarks excludes input and/or ctx from the object if they're undefined
 */
type ResolveArgs<THandler extends Handler> = 
  CleanType<{ input: THandler['_input'], ctx: THandler['_ctx'] }>
