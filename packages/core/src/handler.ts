import type { Handler, UninitializedHandler } from './types'
import type { AnyHttpMethod } from './http/methods'
import type { inferParser } from './parser/types'
import type { Context } from './server/context'
import type { Overwrite } from './utils'

/**
 * request handler builder
 */
export class HandlerBuilder<THandler extends Handler=UninitializedHandler> {
  _method: THandler['_method']
  _path: THandler['_path']
  _ctx: THandler['_ctx']
  _schema: THandler['_schema']
  _input: THandler['_input']
  _output: THandler['_output']
  _preResolver: THandler['_preResolver']
  _parser: THandler['_parser']
  _resolver: THandler['_resolver']
  _postResolver: THandler['_postResolver']

  constructor(args: Partial<Handler>={}) {
    this._method = args._method
    this._path = args._path
    this._ctx = args._ctx
    this._schema = args._schema
    this._input = args._input
    this._output = args._output
    this._preResolver = args._preResolver
    this._parser = args._parser
    this._resolver = args._resolver
    this._postResolver = args._postResolver
  }

  /**
   * set HTTP method and path (URL) for the handler
   * TODO for TypeScript 5.0: add const modifier to generics
   */
  route<TMethod extends AnyHttpMethod, TPath extends string>
        (_method: TMethod, _path?: TPath): 
          HandlerBuilder<Overwrite<THandler, { _method: TMethod, _path: TPath }>> {
    return new HandlerBuilder({ ...this, _method, _path })
  }

  /**
   * define the context
   */
  context<T>(_ctx?: Context<T>) {
    return new HandlerBuilder<Overwrite<THandler, { _ctx: T }>>({ ...this, _ctx })
  }

  /**
   * set the input parser for the handler
   */
  input<T>(_input?: T) {
    return new HandlerBuilder<Overwrite<THandler, { _input: inferParser<T> }>>({ ...this, _input })
  }

  /**
   * set the pre-resolver function
   */
  preResolve<T>(_preResolver: T) {
    return new HandlerBuilder<Overwrite<THandler, { _preResolver: T }>>({ ...this, _preResolver })
  }

  /**
   * set the parser
   */
  parse<T>(_parser: T) {
    return new HandlerBuilder<Overwrite<THandler, { _parser: T }>>({ ...this, _parser })
  }

  /**
   * set the resolver function
   */
  resolve<T>(_resolver: (args: { input: THandler['_input'], ctx: THandler['_ctx'] }) => T) {
    return new HandlerBuilder<Overwrite<THandler, { _resolver: typeof _resolver, _output: T }>> ({ ...this, _resolver })
  }

  /**
   * set the post-resolver function
   */
  postResolve<T>(_postResolver: T) {
    return new HandlerBuilder({ ...this, _postResolver })
  }
}
