import type { Handler, HandlerBuilder } from '../'

/**
 * overwrite properties in T with corresponding ones in U
 */
export type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U

/**
 * exclude undefined args from a functions parameter list
 */
export type TrimmedFunction<InputFunction, Output> = 
  InputFunction extends (...args: [...infer A]) => Output ? 
    (...args: NoUndefinedArray<A>) => Output :
      never

/**
 * given an array of function args and its return type, construct a trimmed function
 */
export type ToTrimmedFunction<Args, Output> = (...args: NoUndefinedArray<Args>) => Output

/**
 * recursively removes undefined types from an array
 */
export type NoUndefinedArray<T> = 
  T extends [boolean, ...infer BoolTail] ?
    [boolean, ...NoUndefinedArray<BoolTail>] :
      T extends [infer Head, ...infer Tail] ? 
        Head extends undefined ? 
          [...NoUndefinedArray<Tail>] : 
            [Head, ...NoUndefinedArray<Tail>] :
              []

/**
 * removes undefined properties from an object
 */
export type CleanType<T extends object> = {
  [P in keyof T as T[P] extends undefined ? never : P]: T[P]
}

/**
 * helper interface for explode
 */
export type Entry = { key: string, value: any, optional: boolean };

/** 
 * @see {@link https://stackoverflow.com/questions/69095054/how-to-deep-flatten-a-typescript-interface-with-union-types-and-keep-the-full-ob}
 */
export type Explode<T> =
    T extends HandlerBuilder<Handler> ? 
    {
      key: T['_path'],
      value: T,
      optional: false
    }
    :
    { 
      [K in keyof T]-?: 
        K extends string ? Explode<T[K]> extends infer E ? E extends Entry ?
        {
            key: `${K}${E['key'] extends "" ? "" : `.`}${E['key']}`,
            value: E['value'],
            optional: E['key'] extends "" ? {} extends Pick<T, K> ? true : false : E['optional']
        }
        : never : never : never
    }[keyof T] 

/**
 */
export type Collapse<T extends Entry> = ({ [E in Extract<T, { optional: false }> as E['key']]: E['value'] } & Partial<{ [E in Extract<T, { optional: true }> as E['key']]: E['value'] }>) extends infer O ? { [K in keyof O]: O[K] } : never

/**
 */
export type Flatten<T> = Collapse<Explode<T>>

export type Transform<PRecord extends Record<any, any>> = {
  [k in keyof PRecord]: 
    PRecord[k] extends HandlerBuilder<Handler> ? PRecord[k]['fetch'] : Transform<PRecord[k]>
}

export type GetParams<T> = 
  T extends `:${infer Param}/${infer Route}` ? 
  [Param, ...GetParams<Route>] : 
  T extends `:${infer Param}` ? 
  [Param] : 
  T extends `${string}/${infer SubRoute}` ? 
  GetParams<SubRoute> :
  []

type ParamBefore<Route extends string, Param extends string> = `:${Param}/${Route}`
type ParamAfter<Route extends string, Param extends string> = `${Route}/:${Param}`
type NormalRoute<Left extends string, Right extends string> = `${Left}/${Right}`

/**
 * converts a string, like `user/:id`, to a template literal type, like `user/${string}`
 */
export type GetRoute<T extends string> = 
  T extends ParamBefore<infer A, any> ? 
    `${string}/${GetRoute<A>}` : 
    T extends ParamAfter<infer B, infer C> ?
      C extends NormalRoute<any, infer D> ? 
        `${GetRoute<B>}/${string}${GetRoute<D>}` :
        `${GetRoute<B>}/${string}` : 
      `${T}`
