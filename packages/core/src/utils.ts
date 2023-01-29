/**
 * overwrite properties in T with corresponding ones in U
 */
export type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U

/**
 * removes undefined properties from an object
 */
export type CleanType<T extends object> = {
  [P in keyof T as T[P] extends undefined ? never : P]: T[P]
}

/**
 * helper interface for explode
 */
export type Entry = { key: any, value: any, optional: boolean };

/** 
 * @see {@link https://stackoverflow.com/questions/69095054/how-to-deep-flatten-a-typescript-interface-with-union-types-and-keep-the-full-ob}
 */
export type Explode<T, TObj, Key extends keyof TObj> =
    T extends TObj ? {
      key: T[Key],
      value: T,
      optional: false
    } : { 
      [K in keyof T]: 
        K extends string ? Explode<T[K], TObj, Key> extends infer E ? E extends Entry ?
        {
            key: `${K}${E['key']}`,
            value: E['value'],
            optional: E['key'] extends "" ? {} extends Pick<T, K> ? true : false : E['optional']
        }
        : never : never : never
  }[keyof T] 

/**
 * helper type for flatten
 */
export type Collapse<T extends Entry> = (
    { 
      [E in Extract<T, { optional: false }> as E['key']]: E['value'] 
    } 
    & 
    Partial<
    { 
      [E in Extract<T, { optional: true }> as E['key']]: E['value'] 
    }
    >) extends infer O ? { [K in keyof O]: O[K] } : never

/**
 * flattens an object
 */
export type Flatten<T, TObj, Key extends keyof TObj> = Collapse<Explode<T, TObj, Key>>

/**
 * transform all values of an object to a key
 */
export type Transform<PRecord extends Record<any, any>, TObject, Key extends keyof TObject, Key2 extends keyof TObject> = {
  [k in keyof PRecord as PRecord[k] extends TObject ? k extends string ? `${k}${PRecord[k][Key2]}` : k : k]: 
    PRecord[k] extends TObject ? PRecord[k][Key] : Transform<PRecord[k], TObject, Key, Key2>
}
