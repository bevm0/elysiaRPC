import type { Handler, UninitializedHandler } from './types'
import type { AnyHttpMethod } from './http/methods'
import type { inferParser } from './parser/types'
import type { Overwrite } from './utils'

/**
 * request handler builder
 */
export class HandlerBuilder<THandler extends Handler=UninitializedHandler> {
  readonly _method: THandler['_method']
  readonly _path: THandler['_path']
  readonly _ctx: THandler['_ctx']
  readonly _schema: THandler['_schema']
  readonly _input: THandler['_input']
  readonly _output: THandler['_output']
  readonly _preResolver: THandler['_preResolver']
  readonly _parser: THandler['_parser']
  readonly _resolver: THandler['_resolver']
  readonly _postResolver: THandler['_postResolver']

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
   * TODO for TypeScript 5.0: add const modifier to generics
   */
  init<
    Method extends AnyHttpMethod=THandler['_method'],
    Path=THandler['_path'],
    Ctx=THandler['_ctx'],
    Schema=THandler['_schema'],
    Input=THandler['_input'],
    >
    (args: { _method?: Method, _path?: Path, _ctx?: Ctx, _schema?: Schema, _input?: Input }={}) {
    return new HandlerBuilder<Overwrite<THandler, { _method: Method, _path: Path, _ctx: Ctx, _schema: Schema, _input: Input }>>({...this, ...args})
  }

  preResolve<T, C>(_preResolver: (...args: any[]) => { input: T, ctx: C }) {
    return new HandlerBuilder<Overwrite<THandler, { _preResolver: typeof _preResolver, _ctx: C }>>({...this, _preResolver})
  }

  parse<T>(_parser: THandler['_preResolver'] extends (...args: any[]) => G<infer I, any> ? (args: I) => T : (args: any) => T) {
    return new HandlerBuilder<Overwrite<THandler, { _parser: typeof _parser }>>({...this, _parser})
  }

  resolve<T>(_resolver: 
             THandler['_parser'] extends undefined ? 
             THandler['_preResolver'] extends undefined ?
             (args: { input: THandler['_schema'] extends undefined ? THandler['_input'] : inferParser<THandler['_schema']> }) => T : 
             (args: ReturnType<THandler['_preResolver']>) => T :
             (args: { input: ReturnType<THandler['_parser']>, ctx: THandler['_ctx']  }) => T) {
    return new HandlerBuilder<Overwrite<THandler, { _resolver: typeof _resolver, _output: T }>>({...this, _resolver})
  }

  postResolve<T>(_postResolver: (args: { input: ReturnType<THandler['_resolver']>, ctx: THandler['_ctx'] }) => T) {
    return new HandlerBuilder<Overwrite<THandler, { _postResolver: typeof _postResolver, _output: T }>>({...this, _postResolver})
  }
}

type G<T, U> = { input: T, ctx: U }
