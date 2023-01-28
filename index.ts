/**
 * HTTP methods 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods}
 */
const Methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'TRACE', 'CONNECT'] as const
type AnyString = string & {}
type Method = (typeof Methods)[number] | AnyString

/**
 */
export interface Procedure {
  _method: any
  _parser: any
  _input: any
  _ctx: any
  _output: any
  _resolver: any
  _fetch: any
}

/**
 */
interface DefaultProcedure {
  _method: undefined
  _ctx: undefined
  _input: undefined
  _output: undefined
  _parser: undefined
  _fetch: undefined
  _resolver: undefined
}

/**
 * procedure record maps strings to procedure entries
 */
type ProcedureRecord = { [k: string]: ProcedureEntry }

/**
 * procedure entry is either nested procedure record or procedure
 */
type ProcedureEntry = ProcedureRecord | Procedure

/**
 * either a promise or the value itself
 */
type MaybePromise<T> = T | Promise<T>

/**
 * create a pre-configured fetch call
 * @returns function that accepts additional options that returns a pre-configured fetch call
 */
// const createFetch = (path: string, method: Method) => (init: RequestInit) => fetch(path, { method, ...init })

const createTestFetch = 
  (path: string, method: any, result: any) => 
    async (init?: RequestInit) => ({
      async json() {
        return {
          path,
          method,
          result,
          init,
        }
      }
    })

/**
 * strongly typed JSON response
 */
interface TypedResponse<T> extends Response {
  json(): Promise<T>
}

/**
 * router entry point
 */
export class Router<TProcedure extends Procedure=DefaultProcedure> {
  constructor(args: Partial<TProcedure> = {}) {
    this.procedure = new ProcedureBuilder<TProcedure>(args)
  }

  context<T>() {
    return new Router<{
      _method: undefined
      _ctx: T
      _input: undefined
      _output: undefined
      _parser: undefined
      _resolver: undefined
      _fetch: undefined
    }>()
  }

  /**
   * use to define a procedure with internal metadata
   */
  procedure: ProcedureBuilder<TProcedure>

  /**
   * accepts a procedure record, i.e. to strongly type its keys
   */
  build<T extends ProcedureRecord>(record: T) {
    return record
  }
}

/**
 * does nothing
 */
function noop() {
}

type UnionContainsUndefined<T> = undefined extends T ? true : false
type x = undefined | string
export type y = UnionContainsUndefined<x>

/**
 * wraps around a procedure to provide metadata
 */
export class ProcedureBuilder<TProcedure extends Procedure=DefaultProcedure> implements Procedure {
  _method: TProcedure['_method']
  _ctx: TProcedure['_ctx']
  _input: TProcedure['_input']
  _output: TProcedure['_output']
  _parser: TProcedure['_parser']

  /**
   * @public client-side strongly typed fetch
   */
  _fetch: TProcedure['_fetch']

  /**
   * @public server-side resolver
   */
  _resolver: TProcedure['_resolver']

  constructor(builder: Partial<Procedure> = {}) {
    const { _input, _ctx, _resolver, _fetch, _method, _output, _parser } = builder
    this._method = _method
    this._input = _input
    this._ctx = _ctx
    this._output = _output
    this._parser = _parser
    this._resolver = _resolver || noop
    this._fetch = _fetch || noop
  }

  input<TParser extends Parser>(schema?: TParser) {
    const _input: inferParser<TParser>['out'] = schema && 'parse' in schema ? schema.parse : schema?._input
    const _ctx: TProcedure['_ctx'] = this._ctx

    /**
     * create a new procedure builder where the args have been narrowed accordingly
     */
    return new ProcedureBuilder<{
      _method: TProcedure['_method']
      _ctx: typeof _ctx
      _input: typeof _input
      _output: TProcedure['_output']
      _parser: TProcedure['_parser']
      _resolver: TProcedure['_resolver']
      _fetch: TProcedure['_fetch']
    }>({ _input, _ctx })
  }

  method<const TMethod extends Method, Output>(
    _method: TMethod | Method, 
    _resolver: 
      TProcedure['_input'] extends undefined ? 
        TProcedure['_ctx'] extends undefined ? 
          () => MaybePromise<Output> : 
        (ctx: TProcedure['_ctx']) => MaybePromise<Output> : 
      TProcedure['_ctx'] extends undefined ? 
          (input: TProcedure['_input']) => MaybePromise<Output> : 
      (input: TProcedure['_input'], ctx?: TProcedure['_ctx']) => MaybePromise<Output>
  ) {
    // TODO: fetch should be created by an external hook generator function
    const _fetch = createTestFetch('path', _method, 123)

    return new ProcedureBuilder<{
      _method: TMethod
      _input: TProcedure['_input']
      _ctx: TProcedure['_ctx']
      _output: Output
      _parser: TProcedure['_parser']
      _resolver: typeof _resolver
      _fetch: TProcedure['_input'] extends undefined ? (init?: RequestInit) => Promise<TypedResponse<Output>> : (input: TProcedure['_input'], init?: RequestInit) => Promise<TypedResponse<Output>>
    }>({ _resolver, _fetch, _method })
  }
}

// TODO map a procedure to a flattened structure that can be routed with middleware

/**
 * recursively transform the type of a procedure depending on its method
 */
export type Transform<PRecord extends Record<any, any>> = {
  [k in keyof PRecord]: 
    PRecord[k] extends Procedure ? PRecord[k]['_output'] : Transform<PRecord[k]>
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
