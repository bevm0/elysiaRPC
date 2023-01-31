/**
 * overwrite any mutual properties in Old with corresponding ones in New 
 */
export type Overwrite<Old, New> = Pick<Old, Exclude<keyof Old, keyof New>> & New

/**
 * helper interface for explode and collapse
 */
export type Entry = { key: any, value: any, optional: boolean };

/** 
 * helper for flatten
 */
export type Explode<T, TObj> =
    T extends TObj ? 
      { key: "", value: T, optional: false } : 
      { 
        [K in keyof T]: 
          K extends string ? 
            Explode<T[K], TObj> extends infer E ? 
              E extends Entry ?
                {
                    key: `${K}${E['key']}`,
                    value: E['value'],
                    optional: E['key'] extends "" ? {} extends Pick<T, K> ? true : false : E['optional']
                } : 
                never : 
              never : 
            never
      }[keyof T] 

/**
 * helper for flatten
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
 * @see {@link https://stackoverflow.com/questions/69095054/how-to-deep-flatten-a-typescript-interface-with-union-types-and-keep-the-full-ob}
 */
export type Flatten<T, TObj> = Collapse<Explode<T, TObj>>
