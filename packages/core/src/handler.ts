import type { Handler, UninitializedHandler } from './types'
import type { AnyHttpMethod } from './http/methods'
import type { inferParser } from './parser/types'
import type { Context } from './server/context'

/**
 * request handler builder
 */
export class HandlerBuilder<T extends Handler=UninitializedHandler> {
  _method: T['_method']
  _path: T['_path']
  _ctx: T['_ctx']
  _schema: T['_schema']
  _input: T['_input']
  _output: T['_output']
  _preResolver: T['_preResolver']
  _parser: T['_parser']
  _resolver: T['_resolver']
  _postResolver: T['_postResolver']

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
  build<
    Method extends AnyHttpMethod=T['_method'],
    Path=T['_path'],
    Ctx=T['_ctx'],
    Schema=T['_schema'],
    Input=T['_input'],
    Output=T['_output'],
    PreResolver=T['_preResolver'],
    Parser=T['_parser'],
    PostResolver=T['_postResolver']
    >
    (args: {
      _method?: Method
      _path?: Path
      _ctx?: Ctx extends Context<infer I> ? I: Ctx
      _schema?: Schema
      _input?: Input
      _output?: Output
      _preResolver?: PreResolver
      _parser?: Parser
      _resolver?: (args: { input: Schema extends undefined ? Input : inferParser<Schema>, ctx: Context<Ctx> }) => Output 
      _postResolver?: PostResolver
    }={}) {
    return new HandlerBuilder<Required<typeof args>>(args)
  }
}
