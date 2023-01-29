import { z } from 'zod'
import { Router } from './'
import type { Procedure, ProcedureBuilder, Transform } from './'
import type { Request, Response } from 'express'
// import { Type } from '@sinclair/typebox'

interface ExpressCtx {
  req: Request
  res: Response
}

/**
 * initialize a router builder
 */
let router = new Router()

export const myRouter = router.build({
  a: {
    b: {
      c: router.procedure.input(z.boolean()).method('GET', (input) => input),
      d: router.procedure.input(z.number()).method('POST', (input) => input + 420),
      e: router.procedure.input().method('PATCH', (input) => input),
      f: router.procedure.method('REM', () => 'nice'),
      g: router.procedure.method('LETHAL', () => {}),
      h: router.procedure.method('Kiana', () => {})
    }
  },
  c: router.procedure.input(z.boolean()).method('GET', (input) => input),
  d: router.procedure.input(z.number()).method('POST', (input) => input + 420),
  e: router.procedure.input().method('PATCH', (input) => input),
  f: router.procedure.method('REM', () => 'nice'),
  g: router.procedure.method('LETHAL', () => {}),
  h: router.procedure.method('Kiana', () => {})
})

const CustomRouter = {
  a: '/id/:id',
  b: '/user/:id/:dob/:sex'
} as const


type TestRoute = ``

type GetParams<T> = 
  T extends `:${infer Param}/${infer Route}` ? [Param, ...GetParams<Route>] : 
    T extends `:${infer Param}` ? [Param] : 
      T extends `${string}/${infer SubRoute}` ? GetParams<SubRoute> :[]

export type RouteParams = GetParams<TestRoute>

export type CustomRouterParams = {
  [k in keyof typeof CustomRouter]: GetParams<typeof CustomRouter[k]>
}

export type GetOne = CustomRouterParams['b']

type Hehe<T> = 
  T extends `${infer Route}/:${infer Param}` ? 
  { route: `${Route}`, params: `${Param}` } :
  {}

export type HMM = Hehe<TestRoute>

export type myRouter = typeof myRouter

type mapKeys<T, Path extends string=``> = {
  [k in keyof T as T[k] extends ProcedureBuilder<Procedure> ? k extends string ? Path extends `` ? `${Path}${k}` : `${Path}.${k}` : never : k extends string ? `${k}` : never]: 
    T[k] extends ProcedureBuilder<Procedure> ? `${Path}`: k extends string ? mapKeys<T[k], k> : never
}

type Entry = { key: string, value: any, optional: boolean };

type Explode<T> =
    T extends ProcedureBuilder<Procedure> ? 
    {
      key: ``,
      value: T,
      optional: false
    }
    :
    T extends object ? 
      { 
        [K in keyof T]-?: 
          K extends string ? Explode<T[K]> extends infer E ? E extends Entry ?
          {
              key: `${K}${E['key'] extends "" ? "" : "."}${E['key']}`,
              value: E['value'],
              optional: E['key'] extends "" ? {} extends Pick<T, K> ? true : false : E['optional']
          }
          : never : never : never
      }[keyof T] 
    :
      { key: "", value: T, optional: false }

type Collapse<T extends Entry> = ( { [E in Extract<T, { optional: false }> as E['key']]: E['value'] } & Partial<{ [E in Extract<T, { optional: true }> as E['key']]: E['value'] }>) extends infer O ? { [K in keyof O]: O[K] } : never

type Flatten<T> = Collapse<Explode<T>>

export type ExplodedRouter = Explode<myRouter>['key']
export type FlattenedRouter = Flatten<myRouter>['a.b.c']['_input']

export type mappedRouter = mapKeys<myRouter>
export type TransformedRouter = Transform<myRouter>
export type C = TransformedRouter['a']['b']['c']
export type D = TransformedRouter['a']['b']['d']
export type E = TransformedRouter['a']['b']['e']
export type F = TransformedRouter['a']['b']['f']
export type G = TransformedRouter['a']['b']['g']

async function start() {
  const cFetch = await myRouter.a.b.c._fetch(false).then(res => res.json())
  const dFetch = await myRouter.a.b.d._fetch(123).then(res => res.json())
  const eFetch = await myRouter.a.b.e._fetch('hi').then(res => res.json())
  const fFetch = await myRouter.a.b.f._fetch().then(res => res.json())
  const gFetch = await myRouter.a.b.g._fetch().then(res => res.json())


  const cResolved = myRouter.a.b.c._resolver(true)
  const dResolved = myRouter.a.b.d._resolver(69)
  const eResolved = myRouter.a.b.e._resolver('hello')
  const fResolved = myRouter.a.b.f._resolver()
  const gResolved = myRouter.a.b.g._resolver()

  const all = {
    c: {
      fetch: cFetch,
      resolve: cResolved,
    },
    d: {
      fetch: dFetch,
      resolve: dResolved,
    },
    e: {
      fetch: eFetch,
      resolve: eResolved,
    },
    f: {
      fetch: fFetch,
      resolve: fResolved,
    },
    g: {
      fetch: gFetch,
      resolve: gResolved
    }
  } as const
  console.log(all)
}

start()

