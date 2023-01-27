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
  (path: string, method: Method, result: any) => 
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

interface DefaultProcedure {
  _method: undefined
  _input: undefined
  _ctx: undefined
  _output: undefined
  _parser: undefined
  _resolver: undefined
  _fetch: undefined
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
      _input: undefined
      _ctx: T
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
  build<T extends ProcedureRecord>(record: T): T {
    return record
  }
}

/**
 * does nothing
 */
function noop() {
}

/**
 * async noop
 */
async function asyncNoop(args?: any) {
  return {
    json: async () => args
  }
}

export class ProcedureBuilder<TProcedure extends Procedure=DefaultProcedure> implements Procedure {
  _method: TProcedure['_method']
  _input: TProcedure['_input']
  _ctx: TProcedure['_ctx']
  _output: TProcedure['_output']
  _parser: TProcedure['_parser']
  _resolver: (input?: TProcedure['_input'], ctx?: TProcedure['_ctx']) => MaybePromise<TProcedure['_output']>

  /**
   * @public client-side strongly typed fetch
   */
  _fetch: TProcedure['_fetch']

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

  input<$Parser extends Parser>(schema?: $Parser) {
    const _input: inferParser<$Parser>['out'] = schema && 'parse' in schema ? schema.parse : schema?._input
    const _ctx: TProcedure['_ctx'] = this._ctx

    /**
     * create a new procedure builder where the args have been narrowed accordingly
     */
    const pb = new ProcedureBuilder<{
      _method: TProcedure['_method']
      _ctx: typeof _ctx
      _input: typeof _input
      _output: TProcedure['_output']
      _parser: TProcedure['_parser']
      _resolver: TProcedure['_resolver']
      _fetch: TProcedure['_fetch']
    }>({ _input, _ctx })
    return pb
  }

  /**
   * create procedure with a defined resolver and fetcher for a GET request
   */
  GET<Output>(_resolver: (input: TProcedure['_input'], ctx: TProcedure['_ctx']) => MaybePromise<Output>) {
    const _fetch = createTestFetch('path', 'GET', 123)
    const pb = new ProcedureBuilder<{
      _method: TProcedure['_method']
      _input: TProcedure['_input']
      _ctx: TProcedure['_ctx']
      _output: Output
      _parser: TProcedure['_parser']
      _resolver: TProcedure['_resolver']
      _fetch: TProcedure['_input'] extends undefined ? (init?: RequestInit) => Promise<TypedResponse<Output>> : (input: TProcedure['_input'], init?: RequestInit) => Promise<TypedResponse<Output>>
    }>({ _resolver, _fetch })
    return pb
  }

  /**
   * create procedure with a defined resolver and fetcher for a GET request
   */
  POST<Output>(_resolver: (input: TProcedure['_input'], ctx: TProcedure['_ctx']) => MaybePromise<Output>) {
    const _fetch = createTestFetch('path', 'POST', 'post 123')
    const pb = new ProcedureBuilder<{
      _method: TProcedure['_method']
      _input: TProcedure['_input']
      _ctx: TProcedure['_ctx']
      _output: Output
      _parser: TProcedure['_parser']
      _resolver: TProcedure['_resolver']
      _fetch: TProcedure['_input'] extends undefined ? (init?: RequestInit) => Promise<TypedResponse<Output>> : (input: TProcedure['_input'], init?: RequestInit) => Promise<TypedResponse<Output>>
    }>({ _resolver, _fetch })
    return pb
  }
}

// TODO map a procedure to a flattened structure that can be routed with middleware

/**
 * recursively transform the type of a procedure depending on its method
 */
export type Transform<PRecord extends Record<any, any>> = {
  [k in keyof PRecord]: 
    PRecord[k] extends Procedure ?
      PRecord[k]['method'] extends 'GET'    ? 'Get Signature'   :
      PRecord[k]['method'] extends 'PATCH'  ? 'Patch Signature' :
      PRecord[k]['method'] extends 'HEAD'   ? 'Head Signature'  :
      PRecord[k]['method'] extends 'POST'   ? 'Post Signature'  : never
    : Transform<PRecord[k]>
}

export interface Procedure {
  _method: any
  _parser: any
  _input: any
  _ctx: any
  _output: any
  _resolver: any
  _fetch: any
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

type KeysOfType<T, SelectedType> = {
  [key in keyof T]: SelectedType extends T[key] ? key : never;
}[keyof T];

type Optional<T> = Partial<Pick<T, KeysOfType<T, undefined>>>;

type Required<T> = Omit<T, KeysOfType<T, undefined>>;

export type UndefinedOptional<T> = Optional<T> & Required<T>;
