import { z } from 'zod'

/**
 * defined fetch methods @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods}
 */
type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS' | 'TRACE' | 'CONNECT'

/**
 * a procedure entry in the procedure record is either a nested procedure record or a procedure
 */
type ProcedureEntry = ProcedureRecord  | Procedure<any, any, any> 

/**
 * a procedure record maps strings and Methods to procedure entries
 */
type ProcedureRecord = { [k in Method]?: ProcedureEntry } & { [k: string]: ProcedureEntry }

/**
 * either a promise or the value itself
 */
type MaybePromise<T> = T | Promise<T>

/**
 * router entry point
 */
interface Router<TParams = undefined, TCtx = undefined> {
  /**
   * procedure builder to build out a procedure record
   */
  procedure: ProcedureBuilder<ProcedureParams<TParams, TCtx>>

  /**
   * provide a procedure record, e.g. by creating one from the procedure builder above
   */
  build<T extends ProcedureRecord>(record: T): T

  /**
   * create a sub-router with middleware
   */
  use <$NewTParams, $NewCtx>(resolver: () => any): Router<$NewTParams, $NewCtx>
}

/**
 * initialize a router
 */
let router: Router

export const myRouter = router.build({
  welcome: router.procedure.GET((_args) =>  'hello world'),
  sus: router.procedure.input(z.number()).POST(({ input }) => `goodbye ${input}`),
  add: router.procedure.input(z.number()).PATCH(({ input }) => `goodbye ${input}`),
  sub: {
    minus: router.procedure.input(z.number()).PATCH(({ input }) => `goodbye ${input}`),
    subsub: {
      minus: router.procedure.input(z.number()).PATCH(({ input }) => `goodbye ${input}`),
    }
  }
})

type GetFetch = () => void
type PatchFetch = () => void
type PostFetch = () => void

type ExtractRecursive<PRecord extends Record<any, any>> = {
  [k in keyof PRecord]: 
    PRecord[k] extends Procedure<any, any, any> ?
      PRecord[k]['_def']['type'] extends 'GET' ? GetFetch :
      PRecord[k]['_def']['type'] extends 'PATCH' ? PatchFetch :
      PRecord[k]['_def']['type'] extends 'POST' ? PostFetch
      : never
    : 
      ExtractRecursive<PRecord[k]>
}

function ParseProcedureRecord(p: ProcedureEntry) {
}

function ParseProcedure(p: Procedure<any, any, any>) {
  return p.input
}

Object.keys(myRouter).map(k => {
  let key = k as keyof myRouter
  let m = myRouter[key]
  if ('input' in m) {
    let y = m
  }
  const res = ParseProcedureRecord(m)
  return res
})

type FlattenObjectKeys<T extends Record<string, unknown>, Key = keyof T> = 
  Key extends string
  ? T[Key] extends Record<string, unknown>
    ? `${Key}.${FlattenObjectKeys<T[Key]>}`
    : `${Key}`
  : never

export type ExtractRecursiveType<TR extends Record<any, any>> = {
  [k in keyof TR]
}

export type myRouter = typeof myRouter

export type Extracted = ExtractRecursive<myRouter>
export type ExtractedKeys = FlattenObjectKeys<myRouter>


/**
 * default params for a procedure
 */
export interface ProcedureParams<TInput = any, TCtx = any> {
  input?: TInput
  ctx?: TCtx,
}

/**
 * built procedure
 */
export interface Procedure<TType extends Method, TParams extends ProcedureParams, TOutput> extends ProcedureBuilder<TParams> {
  type: TType
  _def: {
    type: TType
    params: TParams
    output: TOutput
  }
}

/**
 * a procedure builder
 */
export interface ProcedureBuilder<TParams extends ProcedureParams> extends MethodBuilder<TParams> {
  input<$Parser extends Parser>(schema?: $Parser): 
    ProcedureBuilder<{
      input: inferParser<$Parser>['out'],
      ctx: TParams['ctx']
    }>;
}

/**
 * a resolver is a generic function
 * @param opts options available to the resolver based on the server config
 * @returns the output generic type
 */
type Resolver<TParams extends ProcedureParams, $Output> = (opts?: TParams) => MaybePromise<$Output>

/**
 * procedure builder specifically to resolve a fetch method
 */
export type MethodBuilder<TParams extends ProcedureParams> = {
  // GET: <$Output>(resolver: Resolver<TParams, $Output>) => Procedure<'GET', TParams, $Output>
  [TMethod in Method]: <$Output>(resolver: Resolver<TParams, $Output>) => Procedure<TMethod, TParams, $Output>
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
