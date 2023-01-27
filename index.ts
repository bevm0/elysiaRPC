import { z } from 'zod'
/**
 * HTTP methods 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods}
 */
type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS' | 'TRACE' | 'CONNECT'

/**
 * procedure record maps strings to procedure entries
 */
type ProcedureRecord = { [k: string]: ProcedureEntry }

/**
 * procedure entry is either nested procedure record or procedure
 */
type ProcedureEntry = ProcedureRecord | Procedure<any, any, any> 

/**
 * either a promise or the value itself
 */
type MaybePromise<T> = T | Promise<T>

/**
 * create a pre-configured fetch call
 * @returns function that accepts additional options that returns a pre-configured fetch call
 */
const createFetch = (path: string, method: Method) => (init: RequestInit) => fetch(path, { method, ...init })

/**
 * strongly typed JSON response
 */
interface TypedResponse<T> extends Response {
  json(): Promise<T>
}

/**
 * router entry point
 */
export class Router<TParams = undefined, TCtx = undefined> {
  /**
   * use to define a procedure with internal metadata
   */
  procedure: ProcedureBuilder<ProcedureParams<TParams, TCtx>> = new ProcedureBuilder()

  /**
   * accepts a procedure record, i.e. to strongly type its keys
   */
  build<T extends ProcedureRecord>(record: T): T {
    return record
  }
}

/**
 * does nothing
 */
function noop() {}

export class ProcedureBuilderv2<TProcedure extends Procedurev2> implements Procedurev2 {
  _method: TProcedure['_method']
  _args: TProcedure['_args']
  _output: TProcedure['_output']
  _parser: TProcedure['_parser']
  _resolver: (args: TProcedure['_args']) => MaybePromise<TProcedure['_output']>

  /**
   * @public client-side strongly typed fetch
   */
  _fetch: (init?: RequestInit) => Promise<TypedResponse<TProcedure['_output']>>

  constructor(builder: Partial<Procedurev2> = {}) {
    const { _args, _resolver, _fetch } = builder
    this._method = 'GET'
    this._args = _args as TProcedure['_args']
    this._output = 0
    this._parser = 0
    this._resolver = _resolver || noop
    this._fetch = _fetch || noop
  }

  input<$Parser extends Parser>(schema?: $Parser) {
    const _input: inferParser<$Parser>['out'] = schema && 'parse' in schema ? schema.parse : schema?._input
    const _ctx: TProcedure['_args']['_ctx'] = this._args._ctx
    const _args = { _input, _ctx }

    /**
     * create a new procedure builder where the args have been narrowed accordingly
     */
    const p = new ProcedureBuilderv2<{
      _method: TProcedure['_method']
      _args: typeof _args
      _output: TProcedure['_output']
      _parser: TProcedure['_parser']
      _resolver: TProcedure['_resolver']
      _fetch: TProcedure['_fetch']
    }>({ _args })
    return p
  }

  /**
   * create procedure with a defined resolver and fetcher for a GET request
   */
  GET<Output>(_resolver: (args: TProcedure['_args']) => MaybePromise<Output>) {
    return new ProcedureBuilderv2<{
      _method: TProcedure['_method']
      _args: TProcedure['_args']
      _output: Output
      _parser: TProcedure['_parser']
      _resolver: TProcedure['_resolver']
      _fetch: TProcedure['_fetch']
    }>({ _resolver })
  }
}

const pp = new ProcedureBuilderv2()
export const hoo = pp.input(z.string()).GET(k => k._input)._resolver({ _input: 123, _ctx: null })
export const abc = pp.input(z.string()).GET(k => k._input)._fetch().then(k => k.json())

// export interface ProcedureBuilder<TParams extends ProcedureParams>{
// }

/**
 * procedure builder implementation
 */
export class ProcedureBuilder<TParams extends ProcedureParams> {
  /**
   * @internal metadata for the procedure
   */
  _def: Procedure<Method, TParams, any>['_def']

  /**
   * @public server-side handler that receives request and returns the output
   */
  resolve: (opts?: TParams) => MaybePromise<this['_def']['output']>

  /**
   * @public client-side strongly typed fetch
   */
  fetch: (init?: RequestInit) => Promise<TypedResponse<this['_def']['output']>>

  constructor(type: Method='GET', params?: TParams, resolve?: <Output>(opts?: TParams) => MaybePromise<Output>, fetch?: any) {
    this._def = { method: type, params: params as any, output: undefined }
    this.resolve = resolve || noop
    this.fetch = fetch
  }

  /**
   * create a procedure with a defined input
   */
  input<$Parser extends Parser>(schema?: $Parser) {
    const input: inferParser<$Parser>['out'] = schema && 'parse' in schema ? schema.parse : schema?._input
    const ctx: TParams['ctx'] = this._def.params?.ctx
    const params = { ctx, input }
    return new ProcedureBuilder('GET', params, this.resolve as any)
  }

  /**
   * create procedure with a defined resolver and fetcher for a GET request
   */
  GET<Output>(resolver: (opts: TParams) => MaybePromise<Output>): Procedure<Method, TParams, Output> {
    const params = { ctx: this._def.params?.ctx } as any
    return new ProcedureBuilder('GET', params, resolver as any, createFetch('/api', 'GET'))
  }

  /**
   * create procedure with a defined resolver and fetcher for a POST request
   */
  POST<Output>(resolver: (opts: TParams) => MaybePromise<Output>): Procedure<Method, TParams, Output> {
    const params = { ctx: this._def.params?.ctx } as any
    return new ProcedureBuilder('POST', params, resolver as any, createFetch('/api', 'POST'))
  }
}

// TODO map a procedure to a flattened structure that can be routed with middleware

/**
 * recursively transform the type of a procedure depending on its method
 */
export type Transform<PRecord extends Record<any, any>> = {
  [k in keyof PRecord]: 
    PRecord[k] extends Procedure<any, any, any> ?
      PRecord[k]['_def']['type'] extends 'GET'    ? 'Get Signature'   :
      PRecord[k]['_def']['type'] extends 'PATCH'  ? 'Patch Signature' :
      PRecord[k]['_def']['type'] extends 'HEAD'   ? 'Head Signature'  :
      PRecord[k]['_def']['type'] extends 'POST'   ? 'Post Signature'  : never
    : Transform<PRecord[k]>
}

/**
 * default params for a procedure
 */
export interface ProcedureParams<TInput=any, TCtx=any> {
  ctx: TCtx
  input?: TInput,
}

export interface Procedurev2 {
  _method: any
  _parser: any
  _args: {
    _input: any
    _ctx: any
  }
  _output: any
  _resolver: any
  _fetch: any
}

/**
 * built procedure
 */
export interface Procedure<TMethod extends Method, TParams extends ProcedureParams, TOutput> {
  /**
   * @internal metadata for the procedure
   */
  _def: {
    method: TMethod
    params: TParams
    output: TOutput
  }
}

//-----------------------------------------------------------------------------------
// handle parsing and casting the result to a type
//-----------------------------------------------------------------------------------

export type ParserZodWIthoutInput<TInput, TParsedInput> = {
  _input: TInput;
  _output: TParsedInput;
};

export type ParserZodWithInputOutput<TInput> = {
  parse: (input: any) => TInput;
};

export type ParserWithoutInput<TInput> = ParserZodWithInputOutput<TInput>;

export type ParserWithInputOutput<TInput, TParsedInput> = ParserZodWIthoutInput<TInput, TParsedInput>

export type Parser = ParserWithoutInput<any> | ParserWithInputOutput<any, any>;

export type inferParser<TParser extends Parser> =
  TParser extends ParserWithInputOutput<infer $TIn, infer $TOut>
    ? { in: $TIn; out: $TOut; }
    : TParser extends ParserWithoutInput<infer $InOut>
    ? { in: $InOut; out: $InOut; }
    : never;
